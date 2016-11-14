
Parse.Cloud.define("uploadFile", function(request, response) 
{
    Parse.Cloud.useMasterKey();
    
    var user = request.params.user;
    var decodedData = request.params.src;
    
    var parseFile = new Parse.File( request.params.fileType + "_"+user.objectId+ request.params.ext, { base64: decodedData });
    var fileCollection = Parse.Object.extend("File");
    var file = new fileCollection();

    getUser(user.objectId).then
    (   
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(_user)
        {
            
            var userID = (JSON.parse(JSON.stringify(_user[0])).objectId);
            var company = (JSON.parse(JSON.stringify(_user[0])).company);
            
            
            file.set("file", parseFile);
            file.set("fileDescription", "profile picture file");
            file.set("isDeleted", false);

            file.set("user", _user[0]);

            //set access control 
            var acl = new Parse.ACL();
            acl.setReadAccess(userID,true);
            acl.setWriteAccess(userID,true);

            acl.setRoleReadAccess("superAdmins",true);
            acl.setRoleWriteAccess("superAdmins",true);

            if(company != undefined){
                console.log("company object found");
                file.set("company", company);
                acl.setReadAccess(company.id,true);
                acl.setWriteAccess(company.id,true);
            }else{
                console.log("company object not found");
            }
            
            file.setACL(acl);
            file.save(null, {
                success: function(file) {
                    console.log("successfully uploaded profile picture");
                    _user[0].get("Information").set("profilePhoto", file);
                    _user[0].save(null, {
                        success: function(){
                            console.log("successfully changed to new profile picture");
                            response.success(file);
                        },
                        error: function(){
                            console.log('Failed to create new profile picture object, with error code: ' + error.message);
                            response.error(error);
                        }
                    });
                    
                },
                error: function(file, error) {
                    console.log('Failed to create new profile picture object, with error code: ' + error.message);
                    response.error(error);
                }
            });
        }
        ,
        function(error)
        {
            response.error(error);
        }
    );

    
});


Parse.Cloud.define("getUser", function(request, response) 
{
    //Example where an objectId is passed to a cloud function.
    var id = request.params.objectId;

    //When getUser(id) is called a promise is returned. Notice the .then this means that onc$
    getUser(id).then
    (   
        //When the promise is fulfilled function(user) fires, and now we have our USER!
        function(user)
        {
            response.success(user);
        }
        ,
        function(error)
        {
            response.error(error);
        }
    );

});

function getUser(userId)
{
    Parse.Cloud.useMasterKey();
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("objectId", userId);
    userQuery.include("information");
    userQuery.include("information.governmentId1");
    userQuery.include("information.governmentId2");
    userQuery.include("information.profilePhoto");
    userQuery.include("information.primaryContact");
    userQuery.include("information.primaryContact.currentAddress");
    userQuery.include("information.secondaryContact");
    userQuery.include("information.secondaryContact.currentAddress");
    userQuery.include("company");
    userQuery.include("company.logo");
    userQuery.include("locationHistory");
    //Here you aren't directly returning a user, but you are returning a function that will $
    return userQuery.find
    ({
        success: function(userRetrieved)
        {
            //When the success method fires and you return userRetrieved you fulfill the abo$
            console.log("userRetrieved : " + userRetrieved);
            return userRetrieved;
        },
        error: function(error)
        {
            return error;
        }
    });
};


var sendgridAPIKEY = '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';

Parse.Cloud.define('sendMailTest', function(req, res) {

        var helper = require('sendgrid').mail;
        var from_email = new helper.Email('test@example.com');
        var to_email = new helper.Email('tanzeelrana901223@gmail.com');
        var subject = 'Hello World from the SendGrid Node.js Library!';
        var content = new helper.Content('text/plain', 'Hello, Email!');
        var mail = new helper.Mail(from_email, subject, to_email, content);

        var sg = require('sendgrid')(sendgridAPIKEY);
        var request = sg.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: mail.toJSON(),
        });

        sg.API(request, function(error, response) {
          console.log(response.statusCode);
          console.log(response.body);
          console.log(response.headers);
                if(error){
                        res.error(error);
                }else{
                        res.success(response);
                }
        });

});

