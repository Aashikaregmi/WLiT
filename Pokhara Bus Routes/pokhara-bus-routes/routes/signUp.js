var express = require('express')
var router = express.Router()
const User = require('../models/users.js')


router.post('/createUser', async function(req, res){
    
    try{
    const user = await User.create(req.body)
    res.status(200).redirect('/login')

    }catch(error){
        res.status(500).json({message: error.message})
    }
})


module.exports = router;
