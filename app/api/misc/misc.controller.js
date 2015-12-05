'use strict';

var fs = require('fs');

exports.image = function (req, res) {

    var imgPath = __dirname;
    imgPath = imgPath.replace("app/api/misc", "views/assets/user_pictures/");
    fs.exists(imgPath, function (exists) {
        if(exists){
            console.log("directory exists");
        }
    });
    res.sendFile(imgPath+req.params.file);
};
