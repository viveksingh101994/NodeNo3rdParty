/*
* Request handlers
*
*/

//Dependencies 
const _data=require('./data');
const helpers=require('./helpers');
//Define the handlers
var handlers={};

//Sample Handler
handlers.ping = function(data,callback){
    //Callback a http status code, and a payload object
    callback(200)
};

//NotFound Handler
handlers.notFound=function(data,callback){
    callback(404);
};

handlers.users=function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handlers._users[data.method](data,callback);
    }else{
        callback(405);
    }
}

//Container for the users submethods
handlers._users={};

//Users - post
// Required data: fname,lname,phone,password,tosAgreement
// optional data:none
handlers._users.post=function(data,callback){
   
    //Check that all required fields are filled out
    var firstName = typeof(data.payload.firstName)=="string"&&data.payload.firstName.trim().length>0?data.payload.firstName.trim() :false;
    var lastName = typeof(data.payload.lastName)=="string"&&data.payload.lastName.trim().length>0?data.payload.lastName.trim() :false;
    var phone = typeof(data.payload.phone)=="string"&&data.payload.phone.trim().length==10?data.payload.phone.trim() :false;
    var password = typeof(data.payload.password)=="string"&&data.payload.password.trim().length>0?data.payload.password.trim() :false;
    var tosAgreement = typeof(data.payload.tosAgreement)=="boolean"&&data.payload.tosAgreement==true?true :false;
    
    if(firstName&&lastName&&phone&&password&&tosAgreement){
        //Make sure that the user doesn't already exist
        _data.read('users',phone,function(err,data){
            if(err){
                // Hash the password
                var hashedPassword=helpers.hash(password);

                if(hashedPassword){

                     //Create the user object
                    var UserObject={
                        firstName:firstName,
                        lastName:lastName,
                        phone:phone,
                        password:hashedPassword,
                        tosAgreement:true
                    };
                        // Store the User
                    _data.create('users',phone,UserObject,function(err){
                        if(!err){
                            callback(200);
                        }else{
                            console.log(err);
                            callback(500,{Error:"Could not Add User"})
                        }
                    })
                }
                else{
                    callback(500,{Error:"Could not able to hash password"})
                }
               

               
            }else{
                //User Already exist
                callback(400,{'Error':'User Already Exist'})
            }
        })
    }else{
        callback(400,{'Error':'Missing Required Fields'});
    }
};

//Users - get
//Require data:phone
//Optional data:none
// @TODO Only let an authenticated user access their object. 
handlers._users.get=function(data,callback){
    //Check valid phone numbers
    
    var phone=typeof(data.queryStringObject.phone)=="string"&&data.queryStringObject.phone.length==10?data.queryStringObject.phone:false;
    if(phone){
        _data.read('users',phone,function(err,data){
            if(!err){
                //Remove the hashed password
                delete data.password;
                callback(200,data);
            }else{
                callback(404);
            }
        })
    }else{
        callback(400,{Error:"Required Field"});
    }
};

//Users - put
//Required data:phone,
//Optional data:firstName,lastName,password 
handlers._users.put=function(data,callback){
// Check for required field
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  // Check for optional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if phone is invalid
  if(phone){
    // Error if nothing is sent to update
    if(firstName || lastName || password){
      // Lookup the user
      _data.read('users',phone,function(err,userData){
        if(!err && userData){
          // Update the fields if necessary
          if(firstName){
            userData.firstName = firstName;
          }
          if(lastName){
            userData.lastName = lastName;
          }
          if(password){
            userData.hashedPassword = helpers.hash(password);
          }
          // Store the new updates
          _data.update('users',phone,userData,function(err){
            if(!err){
              callback(200);
            } else {
              console.log(err);
              callback(500,{'Error' : 'Could not update the user.'});
            }
          });
        } else {
          callback(400,{'Error' : 'Specified user does not exist.'});
        }
      });
    } else {
      callback(400,{'Error' : 'Missing fields to update.'});
    }
  } else {
    callback(400,{'Error' : 'Missing required field.'});
  }
};

//Users - delete
handlers._users.delete=function(data,callback){

};

module.exports=handlers;