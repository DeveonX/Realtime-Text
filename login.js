const mongoose = require('mongoose');

// connect to database
async function connect() {
    await mongoose.connect('mongodb://127.0.0.1:27017/BlueBirdLogins');
};
connect();


// make schema for model
const loginSchema = new mongoose.Schema({
    username: String,
    password: String
});

// create model
const loginModel = new mongoose.model('UserDatas', loginSchema);

// function to check if user exists(returns true) or not(returns false)
async function checkUserExists(username){
    let count = await loginModel.count({username: username});
    if (count>0){
      return true;
    }
    else{
      return false;
    }
    
};

// login function -> checks if user exists or not, if yes it checks password or else it creates new user
async function Login(loginData){
    let userExists = await checkUserExists(loginData.username);
    if(userExists){
        let userData = await loginModel.findOne({username: loginData.username});
        if (loginData.password == userData.password){
            return {name: loginData.username, loginValid: true, loginNew: false};
        }
        else{
            return {name: undefined, loginValid: false, loginNew: false};
        }
    }
    else{
        let userData = loginModel(loginData);
        userData.save();
        return {name: loginData.username, loginValid: true, loginNew: true};
    }
};


// export required functions
module.exports = {
    Login: Login
}