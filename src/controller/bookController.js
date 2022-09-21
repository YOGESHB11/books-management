const bookModel = require("../model/bookModel")
const reviewModel = require("../model/reviewModel")
const validator = require("../validators/validator")

// const bookModel = require("../model/bookModel")
 let userModel = require("../model/userModel")
// const validator = require("../validators/validator")
let {isValidObjectId,isValidName,isValid,typeSubCat,isNumber,isStringsArray,validISBN} = validator


const createBook = async function(req,res){
    try{
    let data = req.body
    let {title,excerpt,userId,ISBN,category,subcategory,reviews} = data

    if(!data) {return res.status(400).send({status : false, msg : "Please provide some data"})}
    
    if(!title){return res.status(400).send({status : false, msg : "Please provide title"})}
    if(!isValid(title)){return res.status(400).send({status : false, msg : "Please provide a valid title"})}

    if(!excerpt){return res.status(400).send({status : false, msg : "Please provide excerpt"})}
    if(!isValid(excerpt)){return res.status(400).send({status : false, msg : "Please provide a valid excerpt"})}


    if(!userId){return res.status(400).send({status : false, msg : "Please provide userId"})}
    if(!isValidObjectId(userId)) {return res.status(400).send({status : false, msg : "Please provide a valid userId"})}
    let findUserId = await userModel.findOne({_id : userId})
    if(!findUserId){return res.status(400).send({status : false, msg : "No user exist with the given userID"})}

    if(!ISBN){return res.status(400).send({status : false, msg : "Please provide ISBN"})}
    if(!validISBN(ISBN)){return res.status(400).send({status : false, msg : "Please provide a valid ISBN"})}

    if(!category){return res.status(400).send({status : false, msg : "Please provide Book's category"})}
    if(!isValid(category)){return res.status(400).send({status : false, msg : "Please provide a valid category"})}

    if(!subcategory){return res.status(400).send({status : false, msg : "Please provide Book's subcategory"})}
    if (!isStringsArray(subcategory)) return res.status(400).send({ status: false, msg: "Incorrect type of subcategory" });
        subcategory = subcategory.map(a => a.trim()) 
        
    if (Object.keys(data).some(t => t == "reviews")) {
     if(!isNumber(reviews)) {return res.status(400).send({status : false, msg : "Please provide reviews in number format"})}

    }

    let newBook = await bookModel.create(data)
    // let filterBook = await 
    {return res.status(201).send({status : true, msg : "Success", data : newBook})}

} catch(err){
    return res.status(500).send({status : false, msg : err.message})
}

}
module.exports.createBook = createBook

// const userModel = require('../model/userModel')
// const validator = require('../validators/validator.js');
// const bookModel = require('../model/bookModel.js');

const getBooks = async function (req, res) {
    try {
        let data = req.query

        let options = [{ userId: data.userId }, { category: data.category }, { subcategory: data.subcategory }]

        if (!Object.keys(data).length) {
            let filter = await bookModel.find({ $and: [data, { isDeleted: false }] }).select({ "_id": 1, "title": 1, "excerpt": 1, "userId": 1, "category": 1, "releasedAt": 1, "reviews": 1 }).sort({title: 1 })
            return res.status(200).send({ status: true, message: "Books list", data: filter })
        }

        let filter = await bookModel.find({ $or: options, isDeleted: false }).select({ "_id": 1, "title": 1, "excerpt": 1, "userId": 1, "category": 1, "releasedAt": 1, "reviews": 1 }).sort({ title: 1 })
        if (!filter.length)
            return res.status(404).send({ status: false, msg: "No such documents found" })
        res.status(200).send({ status: true, data: filter })

    }
    catch (error) { res.status(500).send({ status: false, message: error.message }) }

}
    

const getBooksById = async function(req,res){
    try{
        let bookId = req.params.bookId
        if(!validator.isValidObjectId(bookId)){
          return res.status(400).send({status : false , message : "Please provide a valid bookId"})
        }
        let books = await bookModel.findOne({_id : bookId , isDeleted : false}).select({__v : 0 , deletedAt : 0})
        if(!books || !validator.isValidRequestBody(books)){
          return res.status(404).send({status : false , message : `Book with bookId:${bookId} is not present...`})
        }
        let reviews = await reviewModel.find({bookId : bookId}).select({isDeleted : 0 , __v:0});
        books["reviewsData" ]= reviews;
        console.log(books.reviewsData)
        let reviewCount =  await reviewModel.findById(bookId).count();
        books.reviews = reviewCount;
        res.status(200).send({status : true  , message : "Book list" , data : books })
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message })
    }
  }

  module.exports = {getBooksById,getBooks,createBook}