var fs          = require('fs'),
    path        = require('path');

var log     = require('../log');

var LEVEL_INFO      = 'info',
    LEVEL_VERBOSE   = 'verbose',
    LEVEL_DEBUG     = 'debug',
    LEVEL_ERROR     = 'error',
    LEVEL_FATAL     = 'fatal';

exports.route = function(app) {
    app.post('/api/entries', function(req, res) {
        if (req.body !== null && typeof req.body === 'object') {
            var level       = req.body['level'],
                deviceId    = req.body['deviceId'],
                tag         = req.body['tag'],
                message     = req.body['message'],
                trace       = req.body['trace'],
                ip          = req.ip;

            if ((typeof level === 'string' || (level instanceof String)) &&
                (typeof deviceId === 'string' || (deviceId instanceof String)) &&
                (typeof tag === 'string' || (tag instanceof String)) &&
                (typeof message === 'string' || (message instanceof String))) {
                // Check that level is correct
                if (level !== LEVEL_INFO && level !== LEVEL_VERBOSE &&
                    level !== LEVEL_DEBUG && level !== LEVEL_ERROR &&
                    level !== LEVEL_FATAL) {
                    return res.status(400).send('Invalid level provided');
                }
                // Check the client's ip address
                if (typeof ip !== 'string' && !(ip instanceof String)) {
                    return res.status(400).send('Invalid ip address provided');
                }
                // Ensure the type of trace
                if (typeof trace !== 'string' && !(trace instanceof String)) {
                    trace = undefined;
                }
                // Create a new entry
                var state = {
                    level: level,
                    deviceId: deviceId,
                    tag: tag,
                    message: message,
                    trace: trace,
                    ip: ip
                }, entry = req.models.Entry(state);
                // Save the new entry
                entry.save(function(err) {
                    if (err) {
                        log.error('Could not insert new log entry', err);
                        return res.status(500).send('Could not insert new log entry');
                    } else {
                        app.io.broadcast('entry', state);
                        return res.status(200).send();
                    }
                });
            } else {
                res.status(400).send('Missing or invalid parameter');
            }
        } else {
            res.status(400).send('Invalid body format');
        }
    });

    // TODO add filtering
    app.get('/api/entries', function(req, res) {
        var offset = parseInt(req.param('offset')) || 0,
            limit = parseInt(req.param('offset')) || 20;
        // Query the db
        req.models.Entry.find()
            .skip(offset)
            .limit(limit)
            .sort('-time')
            .select('-_id level deviceId tag message trace ip time')
            .exec(function(err, result) {
                if (err) {
                    log.error('Could not query the database for entries', err);
                    return res.status(500).send('Could not query the database for entries');
                } else {
                    return res.status(200).json(result);
                }
            });
    });
};