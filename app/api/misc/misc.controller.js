'use strict';

var fs = require('fs');
var aws = require('aws-sdk');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var path = require('path');

aws.config.update({accessKeyId: "AKIAJLRSDE5VREP4F7PQ" , secretAccessKey: "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" });
aws.config.update({region: 'us-west-2' , signatureVersion: 'v4' });
var s3 = new aws.S3(); 

exports.sign_s3 = function(req, res){
    var s3_params = { 
        Bucket: 'csc309a5', 
        Key: req.query.file_name, 
        Expires: 60, 
        ContentType: req.query.file_type, 
        ACL: 'public-read'
    }; 
    s3.getSignedUrl('putObject', s3_params, function(err, data){ 
        if(err){ 
            console.log(err); 
        }
        else{ 
            var return_data = {
                signed_request: data,
                url: 'https://'+'csc309a5'+'.s3.amazonaws.com/'+req.query.file_name 
            };
            res.write(JSON.stringify(return_data));
            res.end();
        } 
    });
};
