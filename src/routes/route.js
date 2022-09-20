const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")

router.post("/register" , userController.createUser)

router.post("/login" , userController.loginUser)

router.all("/*",(req,res)=>{res.status(404).send({status:false,message:"Endpoint is not correct"})})

module.exports = router