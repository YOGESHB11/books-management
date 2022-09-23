const bookModel = require("../model/bookModel")
const reviewModel = require("../model/reviewModel")
const validator = require("../validators/validator")

const createReviews = async function (req, res) {
    try {
        const { bookId } = req.params;
        if (!validator.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid bookId" })
        }

        let books = await bookModel.findOne({_id : bookId , isDeleted : false}).select({__v : 0 , deletedAt : 0})
        if(!books || books.isDeleted == true){
          return res.status(404).send({status : false , message : `Book with bookId:${bookId} is not present...`})
        }
        if(!validator.isValidRequestBody(books)){
            return res.status(404).send({status : false , message : `Provide a valid bookId`}) // check in comment
        }
        req.body["bookId"] = bookId;
        console.log(bookId)
        const requestBody = req.body;
        if(!validator.isValidRequestBody(requestBody)){
            return res.status(400).send({status : false , message : "Provide details for reviews creation.."})
        }
        const {review ,rating} = requestBody;
        if(!requestBody.reviewedBy){
            requestBody.reviewedBy = "Guest";
        }
        if(!requestBody.reviewedAt){
            requestBody.reviewedAt = Date.now();
        }
        if(!validator.isValid(review)){
            return res.status(400).send({status : false , message : "Provide valid review details .."})
        }
        if(!validator.isValidRating(rating)){
            return res.status(400).send({status : false , message : "Provide valid rating (rate from 1-5) .."})
        }
        let createReview = await reviewModel.create(requestBody) // creating reviews in review collection
        //console.log(createReview._id)
        let reviewId = createReview._id.toString() //changing the objectId to string format

        let findReviews = await reviewModel.find({_id:reviewId ,isDeleted : false}).select({isDeleted :0 , __v:0}) //find the recently created review

        newBookId = bookId.toString()
        
        let reviewsCount = await reviewModel.find({bookId :newBookId}).count()
        
        let updateBook = await bookModel.findByIdAndUpdate({_id : newBookId},{reviews : reviewsCount},{new :true})
        
        const {_id,title,excerpt,userId,category,subcategory,isDeleted,reviews,releasedAt,createdAt} = updateBook
        
        let filter  = {_id,title,excerpt,userId,category,subcategory,isDeleted,reviews,releasedAt,createdAt , reviewsData : findReviews}
       
        res.status(200).send({status : true ,message : "review successfully created " ,data : filter})
       

    } catch (err) {
        res.status(500).send({ msg: err.message })
    }
}

module.exports = {createReviews}

