/**
 * Created by makrand on 11/24/15.
 */
'use strict';

var fs = require('fs');

exports.image = function (req, res) {

    var imgPath = __dirname;
    console.log("initial: "+imgPath);
    imgPath = imgPath.replace("app/api/misc", "views/assets/user_pictures/");
    console.log("replaced: "+imgPath);
    fs.exists(imgPath, function (exists) {
        if(exists){
            console.log("directory exists");
        }
    });
    res.sendfile(imgPath+req.params.file);
};
