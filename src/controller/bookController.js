const bookModel = require("../model/bookModel")
const reviewModel = require("../model/reviewModel")
const validator = require("../validators/validator")
let userModel = require("../model/userModel")

let {isValidObjectId,isValidName,isValid,isNumber,validISBN} = validator

const createBook = async function(req,res){
    try{
    let data = req.body
    let {title,excerpt,userId,ISBN,category,subcategory,reviews,releasedAt} = data

    if(!data) {return res.status(400).send({status : false, msg : "Please provide some data"})}
    
    if(!title){return res.status(400).send({status : false, msg : "Please provide title"})}
    if(!isValidName(title)){return res.status(400).send({status : false, msg : "Please provide a valid title"})}
    let findTitle = await bookModel.findOne({title : title})
    if(findTitle){return res.status(400).send({status : false, msg : "title should be unique"})}
    title = title.trim();

    if(!excerpt){return res.status(400).send({status : false, msg : "Please provide excerpt"})}
    if(!isValid(excerpt)){return res.status(400).send({status : false, msg : "Please provide a valid excerpt"})}


    if(!userId){return res.status(400).send({status : false, msg : "Please provide userId"})}
    if(!isValidObjectId(userId)) {return res.status(400).send({status : false, msg : "Please provide a valid userId"})}
    let findUserId = await userModel.findOne({_id : userId})
    if(!findUserId){return res.status(400).send({status : false, msg : "No user exist with the given userID"})}

    if(!ISBN){return res.status(400).send({status : false, msg : "Please provide ISBN"})}
    if(!validISBN(ISBN)){return res.status(400).send({status : false, msg : "Please provide a valid ISBN"})}
    let findISBN = await bookModel.findOne({ISBN : ISBN})
    if(findISBN){return res.status(400).send({status : false, msg : "This ISBN already exist"})}

    if(!category){return res.status(400).send({status : false, msg : "Please provide Book's category"})}
    if(!isValid(category)){return res.status(400).send({status : false, msg : "Please provide a valid category"})}

    if(!subcategory){return res.status(400).send({status : false, msg : "Please provide Book's subcategory"})}
    if(!isValid(subcategory)){return res.status(400).send({status : false, msg : "Please provide a valid subcategory"})}

    // if(!subcategory){return res.status(400).send({status : false, msg : "Please provide Book's subcategory"})}
    // if (!isStringsArray(subcategory)) return res.status(400).send({ status: false, msg: "Incorrect type of subcategory" });
    //     subcategory = subcategory.map(a => a.trim()) 
        
    if (Object.keys(data).some(t => t == "reviews")) {
     if(!isNumber(reviews)) {return res.status(400).send({status : false, msg : "Please provide reviews in number format"})}

    }
    if(!releasedAt){return res.status(400).send({status : false, msg : "Please provide Book's date"})}
    // if(!validreleaseat(releasedAt)){return res.status(400).send({status : false, msg : "Please provide a valid date"})}
    if (!/^(18|19|20)[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt)) {
        return res.status(400).send({ status: false, message: "Released date is not valid it should be YYYY-MM-DD" })
    }

    let newBook = await bookModel.create(data)
    // let filterBook = await 
    {return res.status(201).send({status : true, msg : "Success", data : newBook})}

} catch(err){
    return res.status(500).send({status : false, msg : err.message})
}

}
    
const getBooks = async function (req, res) {
    try {
        let data = req.query

        let options = [{ userId: data.userId }, { category: data.category }, { subcategory: data.subcategory }]

        if (!Object.keys(data).length) {
            let filter = await bookModel.find({ $and: [data, { isDeleted: false }] }).select({ "_id": 1, "title": 1, "excerpt": 1, "userId": 1, "category": 1, "releasedAt": 1, "reviews": 1 }).sort({title: 1 })
            return res.status(200).send({ status: true, message: "Books list", data: filter })
        }

        let filter = await bookModel.find(data,{isDeleted: false }).select({ "_id": 1, "title": 1, "excerpt": 1, "userId": 1, "category": 1, "releasedAt": 1, "reviews": 1 }).sort({ title: 1 })
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
        if(!books){
          return res.status(404).send({status : false , message : `Book with bookId:${bookId} is not present...`})
        }
        if(!validator.isValidRequestBody(books)){
            return res.status(404).send({status : false , message : `Provide a valid bookId`})
        }

        let {_id,title,excerpt,userId,ISBN,category,subcategory,reviews,isDeleted,createdAt,updatedAt} = books

        let findReviews = await reviewModel.find({bookId : bookId}).select({isDeleted : 0 , __v:0});

        let filter = {_id,title,excerpt,userId,ISBN,category,subcategory,reviews,isDeleted,createdAt,updatedAt,reviewData:findReviews};

        let reviewCount =  await reviewModel.findById(bookId).count();
        filter.reviews = reviewCount;
        res.status(200).send({status : true  , message : "Book list" , data : filter })
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message })
    }
  }

const updateBooks = async function(req,res){
    try{
        let bookId = req.params.bookId;
        let book = await bookModel.findById(bookId);
        if(!book || book.isDeleted === true){
            return res.status(404).send({status : false , message : "Book not found.."});
        }
        const requestBody = req.body;
        if(!validator.isValidRequestBody(requestBody)){
            return res.status(400).send({status : false , message : "Please provide details for updation"});
        }
        let {title,excerpt,ISBN,releasedAt} = requestBody;
        let dupTitle = await bookModel.findOne({title : title})
        if(title){
            if(!isValid(title)){
                return res.status(400).send({status : false , message : "Please provide a valid title for updation"});
            }
            if(dupTitle){
                return res.status(409).send({status : false , message : "Book with this title already exists.."});
            }
            else{
                book.title = title.trim();
            }
        }
        if(excerpt){
            if(isValid(excerpt)){
                book.excerpt = excerpt.trim();
            }
            else{
                return res.status(400).send({status : false , message : "Please provide a valid excerpt for updation"});
            }
        }
        let dupISBN = await bookModel.findOne({ISBN : ISBN})
        if(ISBN){
            if(!validator.validISBN(ISBN)){
                return res.status(400).send({
                    status: false,
                    message: "Please provide a valid ISBN for updation.."
                  });
            }
            if(dupISBN){
                return res.status(409).send({status : false , message : "Book with this ISBN already exists.."});
            }
            else{
                book.ISBN = ISBN
            }
        }
        if(releasedAt){
            if(!validator.isValidDate(releasedAt)){
                return res.status(400).send({
                    status: false,
                    message: "Please provide a valid release date for updation.."
                  });
            }
            else{
                book.releasedAt = releasedAt
            }
        }

        let updatedBook = await bookModel.findByIdAndUpdate({_id : bookId},book,{new : true});
        return res.status(200).send({status : true , message :"Successfully updated" , data : updatedBook})
    } catch(error){
        res.status(500).send({status: false, message: error.message})
    }
}

const deleteBookById = async (req, res) => {
    try {
        let bookId = req.params.bookId;
        // let Query = req.query
        // if (Query) { return res.status(400).send({ status: false, message: "You can't put anything in Query." }) }

        let deleteByBookId = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false },
            { isDeleted: true, deletedAt: Date.now() }, { new: true })

        if (!deleteByBookId) { return res.status(404).send({ status: false, message: "Book is already deleted" }) }

        res.status(200).send({ status: true, message: 'Book Deleted Successfully' })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }
}


//--------------------------------------delete-----------------------

const deleteByReview = async function (req,res){
   data= req.params
   reviewId = data.reviewId
   bookID = data.bookId

   const findReviewId = await reviewModel.findOne({_id : reviewId})
   if(!findReviewId) return res.status(404).send({status :false, msg:"review not found"})
   if(findReviewId.isDeleted==true) return res.status(404).send({status : false, msg : "this review is already deleted"})
   if(findReviewId.bookId!== bookID.toString()) return res.status(400).send({status : false, msg : ""})
   
   const deletereview = await reviewModel.findByIdAndUpdate(reviewId, { $set: { isDeleted: true } }, { new: true });
   const reviewCount = await reviewModel.find({bookId : bookID}).count()
   const findBook = await bookModel.findOne({_id : bookID})
   findBook.reviews = reviewCount-1
   return res.status(200).send({status : true , msg : " review deleted successfully"})
}

  module.exports = {getBooksById,getBooks,createBook, updateBooks,deleteBookById,deleteByReview}