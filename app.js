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
var jwt    = require('jsonwebtoken');
//var models = require('mongoose').models;
var dbURL = 'mongodb://localhost:27017/sampleApp';






//connect to mongodb
var db = mongoose.connect(dbURL);


//var Schema = mongoose.Schema;

// create a user model
var User = new mongoose.Schema({
    oauthID: { type: Number, required: true },
    name:  { type: String, required: true },
    username: { type: String, required: true },
    email:{ type: String, required: true },
    password:{ type: String, required: true },
    created: { type: Date, required: true }
});


var Usermodel = db.model('User', User);

var routes = require('./routes/index');
var home = require('./routes/home');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());




/*loging with facebook*/

passport.use(new FacebookStrategy({
        clientID: 844565622366271,
        clientSecret: 'e83ea04ee6e6187b1066cb8c156121d1',
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, cb) {

        console.log("accessToken ", accessToken);
        console.log("refreshToken ", refreshToken);
        console.log("profile ", profile);
        console.log("profile.id ", profile.id);


        Usermodel.find({ oauthID: profile.id }, function(err, user) {
          console.log("user count");
          console.log(user);
          if(user.length==0){
            var userData = new Usermodel({
                  oauthID: profile.id,
                  name: profile.displayName,
                  created: new Date(),
                  username:profile.displayName,
                  password:""

              });
              userData.save(function(err,user){
                console.log(err);
                  if(err){
                    return cb(err);
                  }else{
                    return cb(user);
                  }
              });
          }
            //return cb(err, user);
          });
    }
));


/*loging with google*/

passport.use(new GoogleStrategy({
    clientID:     '905259209972-ac949jbr58j4c9qkupqds6t5s6ng76k9.apps.googleusercontent.com',
    clientSecret: 'nqNBJgKCBPibTAg090N1rXLp',
    callbackURL: 'https://localhost:3000/auth/google/callback',
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log(request);
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);

    /*User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });*/
  }
));

  



/*loging with Uername and password*/

passport.use(new LocalStrategy(
  function(email, password, cb) {
    Usermodel.find({email:email}, function(err, user) {
      console.log("user found ",user);
      if (err) { return cb(err); }
      if (!user) { cb(null, false); }
      if (!passwordHash.verify(password, user.password)) { 
        return cb(null, false);
      }
      return cb(null,user);
    });
  }));

/*passport.use(new LocalStrategy(
  function(username, password, done) {

    console.log("username",username);
    console.log("password",password);


      var userModel = new Usermodel({    
        'oauthID': 3234234234234,
        'name': 'abc',
        'username':"abc",
        'password':"password",
        'created': new Date()});

    

    userModel.save(function (err, user) {
      console.log("user>>>>>>>>>>>>>>>>>>>>>>>");
      console.log(user);
    });
  }
));
*/



passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use('/', routes);
app.use('/home', home);

app.use(passport.initialize());

app.get('/auth/facebook',
    passport.authenticate('facebook'));


app.get('/auth/google',
  passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read'
  ] }
));

/*app.get('/test',function(req,res){




var obj = new Usermodel({    
        'oauthID': 3234234234234,
    'name': 'abc',
    'username':'abc1',
    'password':'password1'
  });

 obj.save(function (err, user) {
      console.log("user>>>>>>>>>>>>>>>>>>>>>>>");
      console.log(user);
      console.log(err);
     
      if(err){
        return res.json(err);
      }else{
        return res.send("user inserted");
      }
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });


});
 */

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home. 
        console.log(res);
    });


app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
   console.log(res);
   //res.send("google login callback")
  });



app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    
  });


app.post('/signup',function(req,res){
  console.log("email ",req.body.email);
  console.log("password ",req.body.password);
   Usermodel.find({ email: req.body.email }, function(err, user) {
          console.log("user count");
          console.log(user);
          if(user.length>0){
            //user already registered
            return res.json({message:'user already registered'});
          }else if(user.length==0){
            var userData = new Usermodel({
                  oauthID: -1,
                  name: req.body.name,
                  created: new Date(),
                  username:req.body.username,
                  email:req.body.email,
                  password : passwordHash.generate(req.body.password)

              });
              userData.save(function(err,user){
                console.log(err);
                  if(err){
                    return res.json(err);
                  }else{
                    return res.json({message:'signup successful'});
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


module.exports = app;