const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const { use } = require("passport");

const app = express()

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));


const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        default: "student"
    }
});

const bookingSchema = new mongoose.Schema({
    room: {
        type: String,
        required: [true]
    },
    date: {
        type: String,
        required: [true]
    },
    start: {
        type: String,
        required: [true]
    },
    end: {
        type: String,
        required: [true]
    },
    purpose: {
        type: String,
        required: [true]
    },
    status: {
        type: String,
        default: "Pending"
    },
    student: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: [true]
    }
});



userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",userSchema);
const Booking = new mongoose.model("Booking",bookingSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret:"Our little secret.",
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: 10 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/userDB");

function isAdmin(req, res, next){
    if(req.user && req.user.role === 'admin'){
        next()
    }else{
        res.redirect('/admin_login')
    }
}


function isStudent(req, res, next){
    if(req.user && req.user.role === 'student'){
        next()
    }else{
        res.redirect('/login')
    }
}

app.get("/",function(req,res){
    res.render("signup");
});

app.get("/home",function(req,res){
    if(req.isAuthenticated()){
        res.render("home");
    }
    else{
        res.redirect("login");
    }
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/admin_login",function(req,res){
    res.render("admin_login");
});

app.get("/test",function(req,res){
    if( req.user &&req.user.role === 'admin'){
        res.render("test");
    }
    else{
        res.redirect("admin_login");
    }
});

app.get("/book",isStudent,function(req,res){
    res.render("book",{
        alert: false,
        message: ""
    });
});

app.get("/requests",isStudent,async function(req,res){
    const requests = await Booking.find({ student: req.user._id}).populate('student')
    
    res.render('requests.ejs', {
        requests
    })

});

app.get("/admin_approval",isAdmin,async function(req,res){
    const requests = await Booking.find({ }).populate('student')
    requests.sort((a,b) => {
        return new Date(b.date)-new Date(a.date)
    })
    const pendingRequests = requests.filter(req => {
    return req.status == "Pending"
    })
    const approvedRequests = requests.filter(req => {
        return req.status == "Approved"
        })
    // console.log(requests);
    res.render('admin_approval', {
        requests: pendingRequests,
        approvedRequests
    })
})

app.get('/approve_request/:id', isAdmin, async (req, res, next) => {
    const id = req.params.id
    const booking = await Booking.findById(id)
    booking.status = "Approved"
    await booking.save()
    res.redirect('/admin_approval')
})

app.get('/reject_request/:id', isAdmin, async (req, res, next) => {
    const id = req.params.id
    const booking = await Booking.findById(id)
    booking.status = "Rejected"
    await booking.save()
    res.redirect('/admin_approval')
})



app.post("/",function(req,res){

    if(req.body.username.split('@')[1] !== 'iiitdwd.ac.in'){
        res.render('signup', { warn: ' Please enter institute email Id' })
    }
    else{
        User.register({name: req.body.name, username: req.body.username},req.body.password, function(err, user){
            if(err){
                console.log(err);
                res.redirect("/");
            }
            else{

                // if(req.body.username.split('@')[1] !== 'iiitdwd.ac.in'){
                //     res.send('Please use Institute Email only!')
                // }else

                {passport.authenticate("local")(req,res,function(){
                    res.redirect("home");
                });}
            }
        })
    }
});

app.post("/login",function(req,res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    

    req.login(user, function(err){
        if(err){
           console.log(err); 
           return res.render("login",{
            alert: true,
            message: "Wrong Username/Password"
        })
        }
        else{
            passport.authenticate("local")(req, res, function(something){
                
                if(req.user.role === 'admin')
                {
                   return req.logout(function(err) {
                    if (err) { return next(err); }
                    res.redirect('/');
                  });
                }
                else if (req.user.role === 'student') {res.redirect("home");}
                
            });

        }
    
    });

});

app.post("/admin_login",function(req,res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    

    req.login(user, function(err){
        if(err){
           console.log(err); 
           res.redirect("login")
        }
        else{
            passport.authenticate("local")(req,res,function(something){
                if(req.user.role === 'student')
                {
                   req.logout(function(err) {
                    if (err) { return next(err); }
                    res.redirect('/');
                  });
                }else {res.redirect("admin_approval");}
            });

        }
    
    });

});

function compareTime(t1,t2){
    let t1Hours = t1.split(':')[0];
    let t2Hours = t2.split(':')[0];
    let t1Min = t1.split(':')[1];
    let t2Min = t2.split(':')[1];
    if(t1Hours < t2Hours){
        return -1;
    }
    else if(t1Hours > t2Hours){
        return 1;
    }
    else if(t1Min < t2Min){
        return -1;
    }
    else if(t1Min > t2Min){
        return 1;
    }
    else{
        return 0;
    }
}

app.post("/book",isStudent,async function(req,res,next){

    if(
        !req.body.date || !req.body.Classrooms || !req.body.start || !req.body.end || !req.body.purpose
    ){
        return res.render("book",{
         alert: true,
         message: "Please fill out the form completely!"
     })
     }

    const booking = new Booking({
        student: req.user._id,
        date: req.body.date,
        room: req.body.Classrooms,
        start: req.body.start,
        end: req.body.end,
        purpose: req.body.purpose
    });

   

    if(new Date(req.body.date).getTime() < new Date().getTime()){
        return res.render("book",{
            alert: true,
            message: "Invalid Date!"
        })
    }

    const sameDateBookings = await Booking.find({date: req.body.date, status: 'Approved', room: req.body.Classrooms})

    if(sameDateBookings.length>0){
        let flag = 0;
        sameDateBookings.forEach(booking => {
            if(compareTime(req.body.start,booking.start)>=0 && compareTime(req.body.start,booking.end)===-1){
                flag = 1
            }
        });
        if(flag === 1){
            return res.render("book",{
                alert: true,
                message: "Someone has already booked at this time."
            });
        }else{}
    }
    
     await booking.save();
        return res.redirect("/requests");
    
});

app.post("/requests",isStudent,function(req,res){

   
})

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port,function(){
    console.log("Server is running.");
});