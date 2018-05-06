/*
*Primary File for the API
*
*
*/

//Dependencies
const server = require('./lib/server');
const workers= require('./lib/workers');
const cli=require('./lib/cli');

//Declare the app

var app={};

//Init function
app.init=function(){
    //Start the server
    server.init();

    //start the worker
    workers.init();

    // Start the cli, but make sure it start last
    setTimeout(function(){
        cli.init();
    },50)
};

// Execute Function
app.init();

//Export the app
module.exports=app;