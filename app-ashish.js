const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));


app.get("/",function(req,res){
    res.sendFile(__dirname+"/01.html");
});

app.get("/book",function(req,res){
    res.sendFile(__dirname+"/book.html");
});

app.post("/book",function(req,res){
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.passw;

    console.log(name);
    console.log(email);
    console.log(password);
    res.redirect('/')
});

app.listen(3000,function(req,res){
    console.log("Server is running on port 3000");
});
