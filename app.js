// const express = require("express");
// const bodyParser = require("body-parser");
// const ejs = require("ejs");
// const mongoose = require("mongoose");
// // const encrypt = require("mongoose-encryption");

// const session = require('express-session');
// const passport = require('passport');
// const passportLocalMongoose = require('passport-local-mongoose');
// const { use } = require("passport");

// const app = express()

// const userSchema = new mongoose.Schema({
//     required: ['name','email','password','reenterPassword'],
//     name: {
//         type: String,
//         // required: [true]
//     },
//     email: {
//         type: String,
//         // required: [true]
//     },
//     password: {
//         type: String,
//         // required: [true]
//     },
//     reenterPassword: {
//         type: String,
//         // required: [true]
//     }
// });

// userSchema.plugin(passportLocalMongoose);


// const User = new mongoose.model("User",userSchema);
// passport.use(User.createStrategy());

// passport.serializeUser(function(user, done) {
//     done(null, user);
//   });
  
//   passport.deserializeUser(function(user, done) {
//     done(null, user);
//   });

// app.use(express.static("public"));
// app.set('view engine','ejs');
// app.use(bodyParser.urlencoded({extended: true}));

// app.use(session({
//     secret:"Our little secret.",
//     resave: false,
//     saveUninitialized: false
// }));

// app.use(passport.initialize());
// app.use(passport.session());

// mongoose.connect("mongodb://localhost:27017/userDB");

// app.get("/",function(req,res){
//     res.render("sign_up");
// });

// app.get("/sign_up",function(req,res){
//     res.render("sign_up");
// });

// app.get("/login",function(req,res){
//     res.render("login");
// });

// // app.get("/book",function(req,res){
    
// // });

// app.get("/home",function(req,res){
//     if(req.isAuthenticated()){
//         res.render("home");
//     }
//     else{
//         res.redirect("login");
//     }
// });

// app.get('/logout', function(req, res, next) {
//     req.logout(function(err) {
//       if (err) { return next(err); }
//       res.redirect('/');
//     });
//   });

// app.post("/",function(req,res){
//     User.register({username: req.body.username},req.body.password, function(err, user){
//         if(err){
//             console.log(err);
//             res.redirect("register");
//         }
//         else{
//             passport.authenticate("local")(req,res,function(){
//                 res.redirect("home");
//             });
//         }

//     })
// });

// app.post("/sign_up",function(req,res){
//     User.register({username: req.body.username},req.body.password,function(err, user){
//         if(err){
//             console.log(err);
//             res.redirect("register");
//         }
//         else{
//             passport.authenticate("local")(req,res,function(){
//                 res.redirect("home");
//             });
//         }

//     })
// });

// app.post("/login",function(req,res){
//     console.log(req.body)
//     const user = new User({
//         username: req.body.email,
//         password: req.body.password
//     });

//     req.login(user, function(err){
//         if(err){
//            console.log(err); 
//         }
//         else{
//             passport.authenticate("local")(req,res,function(){
//                 res.redirect("home");
//             });

//         }
//     })

// });


// app.listen(4000,function(){
//     console.log("Server running on port 3000.");
// });

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const { use } = require("passport");

const app = express()

const userSchema = new mongoose.Schema({
    required: ['email','password'],
    email: {
        type: String,
        // required: [true]
    },
    password: {
        type: String,
        // required: [true]
    },
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret:"Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/bookingDB");

app.get("/",function(req,res){
    res.render("sign_up");
});

app.get("/sign_up",function(re,res){
    res.render("sign_up");
});

app.get("/login",function(re,res){
    res.render("login");
});

app.get("/home",function(req,res){
    if(req.isAuthenticated()){
        res.render("home");
    }
    else{
        res.redirect("login");
    }
});

app.get("/book",function(req,res){
    if(req.isAuthenticated()){
        res.render("book");
    }
    else{
        res.redirect("login");
    }
});

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

app.post("/",function(req,res){
    User.register({username: req.body.username},req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("sign_up");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("home");
            });
        }

    });
});

app.post("/sign_up",function(req,res){
    User.register({username: req.body.username},req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("sign_up");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("home");
            });
        }

    });
});

app.post("/login",function(req,res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
           console.log(err); 
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("home");
            });

        }
    });
});

app.listen(3000,function(){
    console.log("Server running on port 3000.");
});
