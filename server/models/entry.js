var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var MODEL_ID = 'Entry',
    model = undefined;

module.exports = {
    id: MODEL_ID,
    model: function() {
        if (!model) {
            model = mongoose.model(MODEL_ID, new Schema({
                level: String,
                deviceId: String,
                tag: String,
                message: String,
                trace: String,
                ip: String,
                time: Number
            }));
        }
        return model;
    }
};