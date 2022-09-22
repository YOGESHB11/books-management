const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const bookController = require("../controller/bookController")
const auth = require("../middleware/auth")

router.post("/register" , userController.createUser)

router.post("/login" , userController.loginUser)

router.post("/books" ,auth.Authentication , auth.Authorisation, bookController.createBook)

router.get("/books" , bookController.getBooks)

router.get("/books/:bookId" , bookController.getBooksById)

router.put("/books/:bookId" , auth.Authentication ,auth.Authorisation , bookController.updateBooks)

router.delete("/books/:bookId",auth.Authentication , auth.Authorisation,bookController.deleteBookById)

module.exports = router