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
     
      
      if (!title) return res.status(400).send({status :false, msg: "title is requried" })
      if (!validator.isNotEmpty(title)) return res.status(400).send({status :false, msg: "title is empty" })
      data.title = title.trim()
      let arr = ["Mr", "Mrs", "Miss"]
      if (!arr.includes(data.title)) return res.status(400).send({status :false, msg: "use only Mr, Mrs, Miss" })
      
      // name validation
      if (!name) return res.send({status :false, msg: "name is requried" })
      if (!validator.isNotEmpty(name)) return res.status(400).send({status :false, msg: "name is required" })
      data.name = name.trim()
      if (!validator.isWrong(data.name)) return res.status(400).send({status :false, msg: "name is not valid" })
      
      if (!validator.isNotEmpty(phone)) return res.status(400).send({status :false, msg: "phone No. is required" })
      data.phone = phone.trim()
      if(!validator.isValidMobile(data.phone)){
          return res.status(400).send({status : false , message : "PLease provide a valid phone number of length 10"})
      }
     
      if (!validator.isNotEmpty(email)) return res.status(400).send({status :false, msg: "email is required" })
      data.email = email.trim()
      if(!validator.isValidEmail(data.email)){
          return res.status(400).send({status : false , message : "Please provide a valid email ID"})
      }
      const findEmail = await userModel.findOne({email : email});
      if(findEmail){
          return res.status(409).send({status : false , message : "User with this email Id alredy exists."})
      }
     
      if (!validator.isNotEmpty(password)) return res.status(400).send({status :false, msg: "password is required" })
      data.password = password.trim()
      if(!validator.isValidPassword(data.password)){
          return res.status(400).send({status : false , message : "Password must contain an uppercase,a lowercase , a special character and should be of length between 8-15"})
      }
      const findPhone = await userModel.findOne({phone : phone});
      if(findPhone){
          return res.status(409).send({status : false , message : "User with this phone number already exists"})
      }

      if (!address.street.match(/^[a-zA-Z0-9\s,.'-/ ]{3,}$/)) return res.status(400).send({status : false , message : "please provide valid street address."})
      if(!validator.isValidPincode(address.pincode)){
          return res.status(400).send({status : false , message : "Pincode should be of length 6 only."})
      }
      data.address.street = address.street.trim()
      data.address.city = address.city.trim()

      const created = await userModel.create(data)
      console.log(created)
      
      let filter = {}
      
        filter["_id"] = created._id;
        filter["title"] = created.title;
        filter["name"] = created.name;
        filter["phone"] = created.phone;
        filter["email"] = created.email;
        filter["password"] = created.password;
        filter["address"] = created.address;
        filter["createdAt"] = created.createdAt;
        filter["updatedAt"] = created.updatedAt;
    
      res.status(201).send({status : true , message : "User successfully created" , data : filter});
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
      });
    }

      let user = await userModel.findOne(requestBody)
      if(!user)  {
        return res.status(400).send({status : false , message : "Invalid credentials"})
      }

      let token = jwt.sign(
        {
          UserId: user._id.toString(),
          Team: "Group 2",
          organisation: "FunctionUp"
        
        },
        "functionup-plutonium-blogging-Project1-secret-key",{ expiresIn: '24h'  }
      );
      
      res.send({ status: true,msg:"login successful", data : {token: token ,UserId: user._id.toString(), iat : new Date() ,expiresIn: '24h' }});
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message })
    }
  };
  

  
module.exports = {createUser,loginUser}