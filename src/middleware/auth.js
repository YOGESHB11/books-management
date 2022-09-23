const jwt = require("jsonwebtoken");
const validator = require("../validators/validator");
const bookModel = require("../model/bookModel")
const userModel = require("../model/userModel")

const Authentication = function (req, res, next) {
    try {
      let token = req.headers["x-api-key"];
      if (!token) {
        return res.status(404).send({ status: false, msg: "token must be present in the header" });
      }
      jwt.verify(
              token,
              "functionup-plutonium-blogging-Project1-secret-key",
              function (err, decodedToken) {
                if (err) {
                  return res.status(401).send({ msg: "invalid token" });
                } else {
                  req["x-api-key"] = decodedToken;
                  next();
                }
              }
            );
    } catch (error) {
      res.status(500).send({ status: false, message: error.message })
    }
  }
  
  
  const Authorisation = async (req, res, next) => {
  
    try{
        let decodedToken = req["x-api-key"]
        let bookId = req.params.bookId
        if (bookId) {
  
            if (!validator.isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: `This bookId: ${bookId} is not Valid.` }) }
  
            const checkBookId = await bookModel.findOne({ _id: bookId, isDeleted: false })
            if (!checkBookId) { return res.status(404).send({ status: false, message: `Book with this BookId: ${bookId} does not Exist.` }) }
  
            if (checkBookId['userId'].toString() !== decodedToken.UserId) {
                return res.status(403).send({ status: false, message: "Unauthorized User Access!" })
            }
  
  
            return next()
        }
  
  
        let data = req.body.userId
        
        if (data.trim().length == 0) { return res.status(400).send({ status: false, message: "Please insert valid userId." }) }
        if (!validator.isValidObjectId(data)) { return res.status(400).send({ status: false, message: `This UserId: ${data} is not Valid.` }) }
  
        const checkUserId = await userModel.findOne({ _id: data, isDeleted: false })
        if (!checkUserId) { return res.status(400).send({ status: false, message: `This UserId: ${data} is not Exist.` }) }
  
        if (checkUserId['_id'].toString() !== decodedToken.UserId) {
            return res.status(403).send({ status: false, message: "Unauthorized User Access!" })
        }
  
        // return
        next()
        // }
  
  
  
  
    } catch (error) {
  
        res.status(500).send({ status: 'error', error: error.message })
    }
  
  }
  //-----------------------------------------------------------------------------------------------------------------------//
  module.exports= {Authentication,Authorisation};
