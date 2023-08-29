const socket = io();


// submit form action
function submit(){
    // get user login data
    let loginData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    // emit login data through sockets
    socket.emit('login', loginData);
};
    
// check login
socket.on('login-success', ()=>{
    alert('Logged in successfully');
    document.getElementById('LoginForm').submit();
})
socket.on('login-fail', ()=>{
    alert('wrong username or password');
})
socket.on('login-new', ()=>{
    alert('new username found - new account created');
    document.getElementById('LoginForm').submit();
})