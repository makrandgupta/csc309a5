/**
 * Created by makrand on 11/23/15.
 */
/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

    // Insert routes below
    //app.use('/api/rentals', require('./api/rental'));
    //app.use('/api/reservation-requests', require('./api/reservation-request'));
    //app.use('/api/products', require('./api/product'));
    //app.use('/api/things', require('./api/thing'));
    app.use('/api/users', require('./api/user'));

    //app.use('/auth', require('./auth'));


    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);



    // All other routes should redirect to the index.html
    app.route('/*')
        .get(function(req, res) {
            res.sendfile(app.get('appPath') + '/index.html');
        });
};