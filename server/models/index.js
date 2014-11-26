var fs      = require('fs'),
    path    = require('path'),
    async   = require('async');

var log     = require('../log');

exports.model = function(callback) {
    var models = {};
    fs.readdir(__dirname, function(err, files) {
        if (err) callback(err);
        else {
            async.each(files, function(file, callback) {
                try {
                    if (file !== 'index.js') {
                        var modelModule = require(path.join(__dirname, file));
                        if (modelModule && modelModule.model) {
                            log.debug('Loading model defined in ' + file);
                            models[modelModule.id] = modelModule.model();
                        }
                    }
                    callback();
                } catch (err) {
                    callback(err);
                }
            }, function(err) {
                if (err) callback(err);
                else {
                    callback(undefined, models);
                }
            });
        }
    });
};