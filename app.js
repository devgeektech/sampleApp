var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy
var mongoose = require('mongoose');
var dbURL = 'mongodb://localhost/sampleApp';


//connect to mongodb
var db = mongoose.connect(dbURL);

// create a user model
var User = mongoose.model('User', {
    oauthID: Number,
    name: String,
    created: Date
});

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());


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

        User.find({ oauthID: profile.id }, function(err, user) {
          if(user.length==0){
            var userData = new User({
                  oauthID: profile.id,
                  name: profile.displayName,
                  created: Date
              });
              userData.save(function(err,res){
                console.log(res);
                 /* if(err){
                    res.send("could not login");
                  }else if(res){
                    res.send("data inserted successfully");
                  }*/
              });
          }
            //return cb(err, user);
          });
    }
));




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
 

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home. 
        console.log(res);
        //res.send("facebook login callback");
        //res.redirect('/home');
    });


app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
   console.log(res);
   //res.send("google login callback")
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