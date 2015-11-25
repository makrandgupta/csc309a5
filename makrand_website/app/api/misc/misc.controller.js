/**
 * Created by makrand on 11/24/15.
 */
'use strict';

exports.image = function (req, res) {
    res.sendfile('./views/assets/user_pictures/'+req.params.file);
};