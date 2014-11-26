var assign              = require('object-assign'),
    EventEmitter        = require('events').EventEmitter;

var EntryDispatcher  = require('../dispatchers/entry');

// The event types
var events = {
    NEW_ENTRY: 1,
    INITIAL_ENTRIES_LOADED: 2,
    SOCKET_STATUS_CHANGED: 3
};

var state = {
    listeningForNewEntries: false,
    initialEntriesLoaded: false,
    entries: []
};

var EntryStore = assign({}, EventEmitter.prototype, {
    getEntries: function() {
        return state.entries;
    },

    listeningForNewEntries: function() {
        return state.listeningForNewEntries;
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

    emitSocketStatusChanged: function(socketIsConnected) {
        this.emit(events.SOCKET_STATUS_CHANGED, socketIsConnected);
    },
    onSocketStatusChanged: function(callback) {
        this.on(events.SOCKET_STATUS_CHANGED, callback);
    },
    offSocketStatusChanged: function(callback) {
        this.removeListener(events.SOCKET_STATUS_CHANGED, callback);
    },

    initialEntriesAreLoaded: function() {
        return state.initialEntriesLoaded;
    },
    emitInitialEntriesLoaded: function() {
        this.emit(events.INITIAL_ENTRIES_LOADED);
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
            state.entries.unshift(action.data);
            EntryStore.emitNewEntry(action.data);
            return true;
        case EntryDispatcher.events.INITIAL_ENTRIES_LOADED:
            for (var i = 0; i < action.data.length; i++) {
                state.entries.push(action.data[i]);
            }

            state.initialEntriesLoaded = true;
            EntryStore.emitInitialEntriesLoaded();
            return true;
    }

    return false;
});

// Start listening for new entries over websocket
var socketUrl = window.location.protocol +
        '//' + window.location.hostname +
        (window.location.port ? ':' + window.location.port : ''),
    socket = window.io.connect(socketUrl);
// Attach socket listeners
socket.on('connect', function() {
    state.listeningForNewEntries = true;
    EntryStore.emitSocketStatusChanged(true);
    console.log('Now listening for new log entries...');
});
socket.on('entry', function(entry) {
    state.entries.unshift(entry);
    EntryStore.emitNewEntry(entry);
});
socket.on('disconnect', function() {
    state.listeningForNewEntries = false;
    EntryStore.emitSocketStatusChanged(false);
    console.log('Stopped listening for new log entries...');
});

module.exports = EntryStore;