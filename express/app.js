const express = require("express");
const app = express();

const authmiddleware = (req, res, next) => {
    const secret = req.params.secret;
    console.log(secret);
    if(secret !== "1234"){
        return res.status(401).send("unauthorized");

    }
    console.log("authmiddleware");
    next();
};
app.get("/:secret",authmiddleware, (req, res)=>{
    // const secret = req.params.secret;
    // console.log(secret);
    // if(secret !== "1234"){
    //     return res.status(401).send("unauthorized");

    // }else{
    //     res.send("hello authorized person");
    // }
    
})

app.get("/:secret/about", authmiddleware, (req, res)=>{
    res.send(`
        <html>
        <h1>About page</h1>
        </html>
        `)
    
})

app.get("/secret:contact", authmiddleware, (req, res)=>{
    res.send(`
        <html>
        <h1>Contact me on 9862213142</h1>
        </html>
        `)
})

app.listen(3000, ()=>{
    console.log("server is running on port 3000");
})