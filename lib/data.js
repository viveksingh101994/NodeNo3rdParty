/*
* Library for storing and editing data
*
*/

//Dependencies
const fs=require('fs');
const path=require('path');
const helpers=require('./helpers');

// Container for the module(to be exported)
var lib={};

// Base Directory for data folder
lib.baseDir = path.join(__dirname,"/../.data/");

// Writing data to a file
lib.create = function(dir,file,data,callback){
        //Open the file for writing
        fs.open(lib.baseDir+dir+'/'+file+'.json','wx',(err,fileDescriptor)=>{
            if(!err&&fileDescriptor){
                //Convert data to string
                var StringData=JSON.stringify(data);

                //Write to file and close it
                fs.writeFile(fileDescriptor,StringData,function(err){
                    if(!err){
                        fs.close(fileDescriptor,function(err){
                            if(!err){
                                callback(false);
                            }else{
                                callback("Error closing new file");
                            }
                        })
                    }else{
                        callback("Error writing to new file");
                    }
                })
            }else{
                callback('Could not create new file,it may already exist');
            }
        })
};

//Read data from a file
lib.read=function(dir,file,callback){
    fs.readFile(lib.baseDir+dir+"/"+file+".json",'utf-8',(err,data)=>{
        var jsondata=helpers.parseJsonToObject(data);
        callback(err,jsondata)
    })
}


//Update data inside a file
lib.update=function(dir,file,data,callback){
    //Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',(err,fileDescriptor)=>{
        if(!err&&fileDescriptor){
            //Convert data to string
            var StringData=JSON.stringify(data);
            
            //Truncate the file

            fs.truncate(fileDescriptor,function(err){
                if(!err){
                    //Write to the file and close it
                    fs.writeFile(fileDescriptor,StringData,function(err){
                        if(!err){
                            fs.close(fileDescriptor,function(err){
                                if(!err){
                                    callback(false)
                                }else{
                                    callback("Error in closing the file")
                                }
                            
                            })
                        }else{
                            callback("Error writing to existing file");
                        }
                    })
                }else{
                    callback('Error truncating file');
                }
            })
        }else{
            callback("Could not open file for updating, it may not exist")
        }
    })
};

//Delete a file
lib.delete=function(dir,filename,callback){
    //Unlink the file 
    fs.unlink(lib.baseDir+dir+'/'+filename+".json",(err)=>{
        if(!err)
        callback(false)
        else
        callback("Error in deleting file")
    })
}

module.exports=lib;