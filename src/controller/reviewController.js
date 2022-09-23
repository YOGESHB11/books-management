const reviewModel = require("../model/reviewModel");
const mongoose = require("mongoose");
const bookModel = require("../model/bookModel");
const validator = require("../validators/validator")

let {isValidObjectId,isValidReviewer} = validator
const updateReview = async function(req, res){
    try{
    let data = req.body
    let bookId = req.params.bookId
    let reviewId = req.params.reviewId
    const {review, rating, reviewedBy} = data

    /************** Validation for bookId and reviewId **************/
    if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Invalid book id."})

    if (!isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: "Invalid review id."})

    if(!Object.keys(data).length) return res.status(400).send({status: false, message: "You must give data for updation of review."})  //Object.keys return array of keys

    // check review
    if(!review)  return res.status(400).send({ status: false, message: "Review is missing"})

    // check rating
    if(!rating)  return res.status(400).send({ status: false, message: "Rating is missing"})

    if (typeof data.rating != 'number' || data.rating < 1 || data.rating > 5)
    return res.status(400).send({status: false, message: 'Rating should be an Integer & between 1 to 5'})

    // check reviewedBy
    if(!reviewedBy)  return res.status(400).send({ status: false, message: "Reviewer's name is missing"})
    // if (!data.reviewedBy.match(/^[a-zA-Z,\-.\s]*$/)) return res.status(400).send({ status: false, msg: "enter a valid reviewer's name"})
    if(!isValidReviewer) return res.status(400).send({status:false,message:"enter a valid reviewer's name"})

    const searchBook = await bookModel.findOne({_id: bookId, isDeleted:false})

    if(!searchBook) return res.status(404).send({ status: false, message: " Book deleted or not exist with this id"})

    const updateReview = await reviewModel.findOneAndUpdate({_id: reviewId, bookId: bookId, isDeleted:false}, {review: review, rating: rating, reviewedBy: reviewedBy}, {new: true})

    let {...data3} = searchBook;    //it storing or spreading the data of searchbook into data3
    console.log(data3);
    data3._doc.reviewsData = updateReview   //under data3 ._doc is a key and reviewsData is another key of that,updateReview's data is storing into that

    if(!updateReview) return res.status(404).send({ status: false, message: "Review deleted or not exist with this id"})

    return res.status(200).send({status: true, message: "Books list", data: data3._doc})//we're printing only data3.doc cause reviewsData is already stored into that

 
    }catch(error) {
    res.status(500).send({ status: false, message: error.message }) 

    }

}

module.exports={updateReview};