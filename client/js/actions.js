var EntryDispatcher     = require('./dispatchers/entry');

module.exports = {
    recordEntry: function(entry) {
        EntryDispatcher.handleNewEntry(entry);
    },
    recordInitialEntries: function(entries) {
        EntryDispatcher.handleInitialEntriesLoaded(entries);
    }
};