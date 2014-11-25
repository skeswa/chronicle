var colors  = require('colors');

var util    = require('./util');

function sanitizeArgs(_args) {
    var args = Array.prototype.slice.call(_args, 0);
    return args.sort();
}

module.exports = {
    details: function() {
        if (!util.env.loggingIsVerbose) return;
        var args = sanitizeArgs(arguments);
        args.unshift(((new Date().toISOString()) + ' details:\t').white);
        console.log.apply(this, args);
    },
    debug: function() {
        if (!util.env.loggingIsVerbose) return;
        var args = sanitizeArgs(arguments);
        args.unshift(((new Date().toISOString()) + ' debug:\t').green);
        console.log.apply(this, args);
    },
    info: function() {
        var args = sanitizeArgs(arguments);
        args.unshift(((new Date().toISOString()) + ' info:\t').cyan);
        console.log.apply(this, args);
    },
    error: function() {
        var args = sanitizeArgs(arguments);
        args.unshift(((new Date().toISOString()) + ' error:\t').red);
        console.log.apply(this, args);
    }
};