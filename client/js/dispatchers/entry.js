var assign      = require('object-assign'),
    Dispatcher  = require('flux').Dispatcher;

var EntryDispatcher = assign(new Dispatcher(), {
    events: {
        NEW_ENTRY: 1,
        INITIAL_ENTRIES_LOADED: 2
    },
    handleNewEntry: function(entry) {
        this.dispatch({
            type: this.events.NEW_ENTRY,
            data: entry
        });
    },
    handleInitialEntriesLoaded: function(entries) {
        this.dispatch({
            type: this.events.INITIAL_ENTRIES_LOADED,
            data: entries
        });
    }
});

module.exports = EntryDispatcher;