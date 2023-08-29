// import required packages
const express = require('express');
const nunjucks = require('nunjucks');
const http = require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const fs = require('fs');
const sanitizer = require('sanitizer');

// import custom modules
const login = require('./login');

// define app, server and socket
const app = express();
const port = 21000;
const server = http.createServer(app);
const socket = socketio(server);
//use body-parser for post method

// body parser
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


// configuring nunjucks
nunjucks.configure('views', {
    express: app
});

app.set('view engine', 'njk');
app.use(express.static('public'));

// app routes
// home route
app.get('/', (req, res)=>{
    res.render('login' , {title: "Login"});
});

// post route for home
app.post('/', async (req, res)=>{
    // security for post login
    let loginData = {
        username: req.body.username,
        password: req.body.password
    }
    let checkLogin = await login.Login(loginData);
    // if login is valid
    if(checkLogin.loginValid){
        // get previous chat history
        let data = fs.readFileSync('./public/data/data.txt', 'utf-8');
        let array = data.split(",,,");
        let arrayOfMessages = [];
        array.forEach((value)=>{
            let NameMessageArray = value.split(":::")
            let name = NameMessageArray[0];
            let text = NameMessageArray[1];
            arrayOfMessages.push({name: name, text: text})
        })
        res.status(200).render('index', {title: "BlueBird", name: loginData.username, arrayOfMessages: arrayOfMessages});
    }
    // if invalid
    else{
        res.status(400).send('<h1>BAD REQUEST 400</h1>');
    }
})


// listen server
server.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
});


// check for socketio emits
socket.on('connection', function(socketObj){
    // if user does login
    socketObj.on('login', async function(loginData){
        let checkLogin = await login.Login(loginData);
        // if login is valid
        if(checkLogin.loginValid && !checkLogin.loginNew){
            socket.to(socketObj.id).emit('login-success');
        }
        // new login
        else if(checkLogin.loginValid && checkLogin.loginNew){
            socket.to(socketObj.id).emit('login-new');
        }
        // if login failed
        else{
            socket.to(socketObj.id).emit('login-fail');
        }
    })
    
    // for sending and recieving messages
    socketObj.on('message-send', (dataObject)=>{
        dataObject.name = sanitizer.escape(dataObject.name);
        dataObject.text = sanitizer.escape(dataObject.text);
        if(dataObject.text != "0012")
        {socket.sockets.emit('message-recieve', dataObject);
        fs.appendFileSync('public/data/data.txt', `${dataObject.name}:::${dataObject.text},,,`)}
        else{
            socket.sockets.emit('remove-all-data')
            fs.writeFileSync('./public/data/data.txt', '')
        }
        }) 
})