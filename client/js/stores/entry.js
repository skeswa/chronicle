var assign              = require('object-assign'),
    EventEmitter        = require('events').EventEmitter;

var EntryDispatcher  = require('../dispatchers/entry');

// The event types
var events = {
    NEW_ENTRY: 1,
    INITIAL_ENTRIES_LOADED: 2
};

var state = {
    initialEntriesLoaded: false,
    entries: []
};

var EntryStore = assign({}, EventEmitter.prototype, {
    getEntries: function() {
        return state.entries;
    },
    emitNewEntry: function(entry) {
        this.emit(events.NEW_ENTRY, entry);
    },
    onNewEntry: function(callback) {
        this.on(events.NEW_ENTRY, callback);
    },
    offNewEntry: function(callback) {
        this.removeListener(events.NEW_ENTRY, callback);
    },
    emitInitialEntriesLoaded: function() {
        this.emit(events.INITIAL_ENTRIES_LOADED, state.entries);
    },
    onInitialEntriesLoaded: function(callback) {
        this.on(events.INITIAL_ENTRIES_LOADED, callback);
    },
    offInitialEntriesLoaded: function(callback) {
        this.removeListener(events.INITIAL_ENTRIES_LOADED, callback);
    }
});

// Register for app state actions
EntryDispatcher.register(function(action) {
    switch(action.type) {
        case EntryDispatcher.events.NEW_ENTRY:
            state.entries.push(action.data);
            EntryStore.emitNewEntry(action.data);
            return true;
        case EntryDispatcher.events.INITIAL_ENTRIES_LOADED:
            state.entries.concat(action.data);
            state.initialEntriesLoaded = true;
            EntryStore.emitInitialEntriesLoaded();
            return true;
    }

    return false;
});

module.exports = EntryStore;