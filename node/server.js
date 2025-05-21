const http = require('http')

const server = http.createServer((req, res)=>{
    const url = req.url
    if(url == "/about"){
        res.end(`<h1>About page</h1>`)
        return;
    }
    else if(url == "/contact"){
        res.end(`
            <html>
              <h1>call me on 9862214142</h1>
            </html>
            `)
            return;
    } 
    console.log(url)
    res.end("404 not found");
   
})

server.listen(3002, ()=>{
    console.log("server is running on port 3002")
})