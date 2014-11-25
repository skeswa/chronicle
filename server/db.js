var mongoose    = require('mongoose');

var models      = require('./models'),
    util        = require('./util'),
    log         = require('./log');

module.exports = {
    setup: function(app, callback) {
        mongoose.connect(util.env.dbConnString);
        var db = mongoose.connection;
        db.once('open', function() {
            // Success
            log.info('Database connection opened');
            models.model(function(err, modelMap) {
                if (err) callback(err);
                else {
                    // Add middleware to make models accessible in request object
                    app.use(function(req, res, next) {
                        req.models = modelMap;
                        next();
                    });
                    // Done
                    log.info('Database configuration completed');
                    callback();
                }
            });
        });
        db.on('error', function(err) {
            // Failure
            callback(err);
        });
    }
};