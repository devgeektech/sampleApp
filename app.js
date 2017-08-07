var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var dbURL = 'mongodb://localhost:27017/sampleApp';






//connect to mongodb
var db = mongoose.connect(dbURL);


//var Schema = mongoose.Schema;

// create a user model
var User = new mongoose.Schema({
    oauthID: { type: Number, required: true },
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    created: { type: Date, required: true }
});


var Usermodel = db.model('User', User);

var routes = require('./routes/index');
var home = require('./routes/home');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));









/*loging with facebook*/

passport.use('facebook',new FacebookStrategy({
        clientID: 844565622366271,
        clientSecret: 'e83ea04ee6e6187b1066cb8c156121d1',
        callbackURL: "http://localhost:3000/auth/facebook/callback",
        profileFields: ['displayName','emails']
    },
    function(accessToken, refreshToken, profile, cb) {


        Usermodel.findOne({ oauthID: profile.id }, function(err, user) {

            console.log("user found ",user);
            if (!user) {
                var userData = new Usermodel({
                    oauthID: profile.id,
                    name: profile.displayName,
                    email:profile.emails[0].value,
                    created: new Date(),
                    username: profile.displayName,
                    password: "facebook"

                });
                userData.save(function(err, user) {
                    console.log(err);
                    if (err) {
                         console.log("err>>> ",err);
                        return cb(null,err);
                    } else {
                       console.log("user saved>>> ",user);
                        return cb(null,user);
                    }
                });
            }else{
                console.log("user already there ",user);
                return cb(null,user)
            }
        });
    }
));


/*loging with google*/


passport.use('google',new GoogleStrategy({
    clientID:     "905259209972-ac949jbr58j4c9qkupqds6t5s6ng76k9.apps.googleusercontent.com",
    clientSecret: "nqNBJgKCBPibTAg090N1rXLp",
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback   : false
  },
  function(request, accessToken, refreshToken, profile, done) {
        //console.log(request);
        //console.log(accessToken);
        //console.log(refreshToken);
        //profile.displayName
        console.log(">>>>>>>>>>>>>>>>>>>>>>    .. ",profile);

        //done(null,profile);
        Usermodel.findOne({ oauthID: profile.id }, function(err, user) {

            console.log("user found ",user);
            if (!user) {
                var userData = new Usermodel({
                    oauthID: profile.id,
                    name: profile.displayName,
                    email:profile.emails[0].value,
                    created: new Date(),
                    username: profile.displayName,
                    password: "google"

                });
                userData.save(function(err, user) {
                    console.log(err);
                    if (err) {
                         console.log("err>>> ",err);
                        return done(null,err);
                    } else {
                       console.log("user saved>>> ",user);
                        return done(null,user);
                    }
                });
            }else{
                console.log("user already there ",user);
                return done(null,user)
            }
        });



  }
));








passport.use('login', new LocalStrategy(
    function(username, password, cb) {
        Usermodel.findOne({ email: username }, function(err, user) {
            if (err) { return cb(err); }
            if (!user) { return cb(null, false); }
            if (!passwordHash.verify(password, user.password)) { return cb(null, false); }
            return cb(null, user);
        });
    }));








app.use('/', routes);
app.use('/home', home);

app.use(passport.initialize());

app.get('/auth/facebook',
    passport.authenticate('facebook',{ scope: ['email']}));








app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: "/app/#!/login" }),
  function(req, res) {
      var body = {
            id: req.user._id
        }

        const token = jwt.sign({ body }, "secret");
        res.redirect(`http://localhost:3000/app/#!/redirect?token=`+token);
  }
);


app.get('/auth/google',
  passport.authenticate('google', { scope: 
    [ 'https://www.googleapis.com/auth/plus.login',
    , 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));
 
app.get( '/auth/google/callback', 
    passport.authenticate( 'google', {
        failureRedirect: '/app/#!/login',
        session: false
}), function(req, res) {
      var body = {
            id: req.user._id
        }

        const token = jwt.sign({ body }, "secret");
        res.redirect(`http://localhost:3000/app/#!/redirect?token=`+token);
  });

app.post('/login',
    passport.authenticate('login', { session: false }),
    function(req, res) {
        var body = {
            id: req.user._id
        }
        const token = jwt.sign({ body }, "secret");
        res.json({ token: token });
    });





app.get('/userDetails', ensureToken, function(req, res) {

console.log("req.token ",req.token);

    jwt.verify(req.token, 'secret', function(err, data) {
        console.log("userdata>>>><>>>>><>>>>> ",data);
        var userId = data.body.id;



        if (err) {
            res.sendStatus(403);
        } else {
            Usermodel.findOne({ _id: userId }, { name: 1, username: 1, email: 1, _id: 0 }, function(err, user) {
                res.json(user);
            });


        }
    });
});





app.post('/signup', function(req, res) {
    console.log("email ", req.body.email);
    console.log("password ", req.body.password);
    Usermodel.find({ email: req.body.email }, function(err, user) {
        console.log("user count");
        console.log(user);
        if (user.length > 0) {
            //user already registered
            return res.json({ message: 'user already registered' });
        } else if (user.length == 0) {
            var userData = new Usermodel({
                oauthID: -1,
                name: req.body.name,
                created: new Date(),
                username: req.body.username,
                email: req.body.email,
                password: passwordHash.generate(req.body.password)

            });
            userData.save(function(err, user) {
                console.log(err);
                if (err) {
                    return res.json(err);
                } else {
                    console.log(user);

                    var body = {
                        id: user._id
                    }
                    const token = jwt.sign({ body }, "secret");



                    return res.json({
                        message: 'signup successful',
                        token: token
                    });
                }
            });
        }
        //return cb(err, user);
    });

    //res.json({despa:'cito'});
});






// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});






function ensureToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }

}


module.exports = app;