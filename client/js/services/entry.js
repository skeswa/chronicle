var request = require('superagent');

var EntryService = {
    getEntries: function(callback) {
        request
            .get('/api/entries')
            .end(callback);
    }
};

module.exports = EntryService;