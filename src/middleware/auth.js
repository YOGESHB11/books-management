const jwt = require("jsonwebtoken");

/////////////////////// -AUTHENTICATION- //////////////////////////////
const Authentication = async function (req, res, next) {
    // compare the logged in user's Id and the Id in request
    try {
      
      let token = req.headers["x-api-key"];
      if (!token) return res.status(404).send({ status: false, message: "token must be required in the header" });
  
      let decodedToken = jwt.verify(token, "functionup-plutonium-blogging-Project3-secret-key")
      
        req.headers['User-login'] = decodedToken.userId
        next();
      }
     catch (error) { res.status(500).send({ status: false, message: error.message })}
};



module.exports= Authentication