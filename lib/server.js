
/*
*Server Related tasks
*
*
*/

//Dependencies
const http=require('http');
const https=require('https');
const url=require('url');
const StringDecoder=require('string_decoder').StringDecoder;
const Config=require('../config');
const handlers=require('./handlers');
const helpers=require('./helpers');
const fs=require('fs');
const path=require('path');


// Instantiate the server module object
var server={};



// const _data=require('./lib/data');

// //Testing
// // @Todo delete this
// _data.delete('test','testing',function(err){
//     console.log(err)
// })


//Instantiating Http Server
server.httpServer=http.createServer((req,res)=>{
    server.unifiedServer(req,res);
})



//Instantiating HTTPS server
server.httpsServerOptions={
    key:fs.readFileSync(path.join(__dirname,'../https/key.pem')),
    cert:fs.readFileSync(path.join(__dirname,'../https/cert.pem'))
};
server.httpsServer=https.createServer(server.httpsServerOptions,(req,res)=>{
    server.unifiedServer(req,res);
})



//All the server logic for both the http and https server
server.unifiedServer=function(req,res){
      
    // Get the url and parse it
    const parsedURL = url.parse(req.url,true);

    // Get the path from the url
    const path = parsedURL.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object
    const queryStringObject=parsedURL.query;
    
    // Get the Http Method
    const method=req.method.toLowerCase();

    //Get the Headers as an object
    const headers=req.headers;

    //Get the payload, if any
    const decoder=new StringDecoder('utf-8');
    var buffer='';
    req.on('data',(data)=>{
        
        buffer += decoder.write(data);
    })
    req.on('end',()=>{
        buffer += decoder.end();

        //Choose the handler this request should go to.
        var chosenHandler = typeof(server.router[trimmedPath])!=='undefined'?server.router[trimmedPath]:handlers.notFound;
        
        //Construct the data object to send to the handler
        var data ={
            'trimmedPath':trimmedPath,
            'queryStringObject':queryStringObject,
            'method':method,
            'headers':headers,
            'payload':helpers.parseJsonToObject(buffer)
        };
       
        //Route the request to the handler specified in the router
        chosenHandler(data,function(statusCode,payload){
            // Use the status code called back by the handler, or default 200
            statusCode=typeof(statusCode)=='number'?statusCode:200;

            //use the payload called by the handler
            payload = typeof(payload)=='object'?payload:{};

            //Convert the payload to a string
            const payloadString = JSON.stringify(payload);

            //Return the response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

        })
        // Log the request path
        // console.log("Request recieved on path:"+trimmedPath +" with "+method+" with these parameters ",queryStringObject)
        console.log("Request recieved with these payload",buffer);
    })
}


//Define a request router
server.router = {
    'ping' : handlers.ping,
    'users': handlers.users,
    'tokens': handlers.token,
    'checks':handlers.checks
}


server.init=function(){
    // Start the server, and have it listen on port 3000
    server.httpServer.listen(Config.httpPORT,()=>{
    console.log("Server is listening on port "+Config.httpPORT+" in "+ Config.envName);
    })
    //Start the HTTPS server
    server.httpsServer.listen(Config.httpsPORT,()=>{
        console.log("Server is listening on port "+Config.httpsPORT+" in "+ Config.envName);
    })

}

// Export the module

module.exports=server;