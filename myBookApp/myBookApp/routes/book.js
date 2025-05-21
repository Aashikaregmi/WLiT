var express = require('express')
var router = express.Router()
var book = require('../resources/book')

router.get('/', function(req,res){
    res.render('book', {title: 'Book App Title', bookList : book})
})

router.get('/add', function(req,res){
    res.render('addBook', {title: ' Add Book'})
})

router.post('/save', function(req, res){
    book.push({
        ...req.body,
        _id:`00${book.length +1}`
    })
    res.redirect('/book')
})

router.get("/edit/:_id", function (req, res, next) {
  console.log(req.params._id);
  const books = book.find((book) => book._id === req.params._id);
  res.render("editBook", { title: "Edit Books", book: books });
});

router.post("/saveEdited/:_id", function (req, res, next) {
  const currIndex = book.findIndex((book) => req.params._id === book._id);
  book.splice(currIndex, 1, { ...req.body, _id: req.params._id });
  res.redirect("/book");
});

router.post("/saveDeleted/:_id", function(req, res, next){
    const targetId = req.params._id;
    const index = book.findIndex(b => b._id === targetId);
    if (index !== -1) {
        book.splice(index, 1); 
    }
    res.redirect("/book");
});




module.exports = router;