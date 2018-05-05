/*
*   Helpers for various task
*
*/

// Dependencies
const crypto=require('crypto');
const config=require('../config');

// Containers for all the helpers 
var helpers={};


// Create a SHA256 hash
helpers.hash=function(str){
    if(typeof(str)=='string'&&str.length>0){
       var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
       return hash;
    }else{
        return false;
    }
};


// Parse a json string to an object in all cases,without throwing
helpers.parseJsonToObject=function(str){
    try{
        var obj=JSON.parse(str);
        return obj;
    }catch(e){
        return {};
    }
}

// Create a string of random alphanumeric characters of a given length

helpers.createRandomString=function(str){
    
    str=typeof(str)=='number'&&str>0?str:false;
    if(str){
        var possibleCharacters='abcdefghijklmnopqrstuvwxyz0123456789';
        var strnew='';
        for(var i=0;i<str;i++){
            var RandomCharacter =possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length)); 
            strnew+=RandomCharacter;
        }
        return strnew;
    }else{
        return false;
    }
}

//Export the module
module.exports=helpers;