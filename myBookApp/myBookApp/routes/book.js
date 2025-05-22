var express = require('express')
var router = express.Router()
var book = require('../resources/book')
const Book = require('../models/bookModel.js')

// router.get('/', function(req,res){
//     res.render('book', {title: 'Book App Title', bookList : book})
// })
router.get('/', async function(req, res, next) {
  const books = await Book.find({});
  res.render('book', { title: 'AashikaRegmi', bookList : books });
});

router.get('/add', function(req,res){
    res.render('addBook', {title: ' Add Book'})
})

router.post('/save', async function(req, res){
    // book.push({
    //     ...req.body,
    //     _id:`00${book.length +1}`
    // })
    try{
    const book = await Book.create(req.body)
    res.status(200).redirect('/book')
    // res.redirect('/book')
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get("/edit/:_id", async function (req, res, next) {
  console.log(req.params._id);
  const book = await Book.findById(req.params._id);
  res.render("editBook", { title: "Edit Books", book });
});

router.post("/saveEdited/:_id", async function (req, res, next) {
  const book = await Book.findByIdAndUpdate(req.params._id, req.body)
  if(!book){
    return res.status(404).json({message:"Error updating book"})
  }
  res.redirect('/book');
});


router.post("/saveDeleted/:_id", function(req, res, next){
    const targetId = req.params._id;
    const index = book.findIndex(b => b._id === targetId);
    
        book.splice(index, 1); 
    
    res.redirect("/book");
});




module.exports = router;