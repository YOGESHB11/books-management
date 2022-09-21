const userModel = require("../model/userModel");

const validator = require("../validators/validator")
const jwt = require("jsonwebtoken")

const createUser = async function(req,res){
    try{
        let data = req.body;
        if(!validator.isValidRequestBody(data)){
            return res.status(400).send({status : false , message : "PLease provide a valid request body"})
        }
        let  {title,name,phone,email,password,address} = data;
        // newTitle = title.trim();
        // console.log(typeof newTitle)
        if(!title){
            return res.status(400).send({status : false , message : "Please provide a tile. "})
        }
        if(!title.trim().length> 0){
            return res.status(400).send({status : false , message : "Please provide a valid tile. Title should be among Mr,Mrs and Miss only"})
        }
        title = title.trim()
        console.log(title)
        if(!validator.isValidTitle(title)){
            return res.status(400).send({status : false , message : "Title should be among Mr,Mrs and Miss only"})
        }
        if(!validator.isValidName(name)){
            return res.status(400).send({status : false , message : "Please provide a valid name..."})
        }
        if(!validator.isValidMobile(phone)){
            return res.status(400).send({status : false , message : "PLease provide a valid phone number of length 10"})
        }
        if(!validator.isValidEmail(email)){
            return res.status(400).send({status : false , message : "Please provide a valid email ID"})
        }
        if(!validator.isValidPassword(password)){
            return res.status(400).send({status : false , message : "Password must contain an uppercase,a lowercase , a special character and should be of length between 8-15"})
        }
        if(!validator.isValidPincode(address.pincode)){
            return res.status(400).send({status : false , message : "Pincode should be of length 6 only."})
        }

        const findEmail = await userModel.findOne({email : email});
        if(findEmail){
            return res.status(409).send({status : false , message : "User with this email Id alredy exists."})
        }
        const findPhone = await userModel.findOne({phone : phone});
        if(findPhone){
            return res.status(409).send({status : false , message : "User with this phone number already exists"})
        }

        const created = await userModel.create(data)
        const filteredData = await userModel.findOne({email : email}).select({__v :0})
        res.status(201).send({status : true , message : "User successfully created" , data : filteredData});
    }catch(err){
        res.status(500).send({msg : err.message})
    }
}

const loginUser = async function (req, res) {
    try {
      const requestBody = req.body;
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide login credentials",
      });
    }
   
    let { email, password } = requestBody;
    if (!validator.isValidEmail(email)) {
      return res.status(400).send({
        status: false,
        message: `Email is mandatory and provide valid email address`,
      });
    
    }
    if (!validator.isValidPassword(password)) {
      return res.status(400).send({
        status: false,
        message : "Please enter a valid password"
        //message: `Password is required, Please enter At least one upper case,  one lower case English letter, one digit,  one special character and minimum eight in length`,
      });
    }
      // let emailId = req.body.email;
      // let password = req.body.password;
      // let data = req.body
      //destructure
      //check for req.body 
      //email validation and password validation
      // let User = await userModel.findOne({email : emailId , password : password}) //only req.body
      let user = await userModel.findOne(requestBody)
      if(!user)  {
        return res.status(400).send({status : false , message : "Invalid credentials"})
      }

      // let findEmail = await userModel.findOne({ email: emailId});  //wrong method should be only one db call
      // let findPassword = await userModel.findOne({password : password})
      // if (!emailId) {
      //   return res.status(400).send({
      //     status: false,
      //     msg: "emailId is required",
      //   });
      // }
      // if (!password) {
      //   return res.status(400).send({
      //     status: false,
      //     msg: "password is required",
      //   });
      // }
      // if (!findEmail)
      //   return res.status(404).send({
      //     status: false,
      //     msg: "emailId is not corerct",
      //   });
      //   if (!findPassword)
      //   return res.status(404).send({
      //     status: false,
      //     msg: "password is not corerct",
      //   });
  
  
      let token = jwt.sign(
        {
          UserId: user._id.toString(),
          Team: "Group 2",
          organisation: "FunctionUp",
          iat : Math.floor(Date.now() / 1000),
            exp : Math.floor(Date.now() / 1000) +60*60

        },
        "functionup-plutonium-blogging-Project1-secret-key"
      );
      res.send({ status: true,msg:"login successful", token: token });
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message })
    }
  };

  


  
module.exports = {createUser,loginUser}