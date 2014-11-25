/** @jsx React.DOM */
var React           = require('react'),
    Router          = require('react-router');

var Util            = require('../util'),
    Actions         = require('../actions'),
    EntryStore      = require('../stores/entry');

var socket;
var LiveLog = React.createClass({
    getInitialState: function() {
        return {
            ready: false,
            entries: [],
            socketConnected: false
        };
    },
    componentDidMount: function() {
        // Register for ready event
        EntryStore.onNewEntry(this.onNewEntry);
        EntryStore.onInitialEntriesLoaded(this.onReady);
    },
    componentWillUnmount: function() {
        // Unregister for ready event
        EntryStore.offNewEntry(this.onNewEntry);
        EntryStore.offInitialEntriesLoaded(this.onReady);
        // Stop listening for new entries
        if (socket) {
            socket.disconnect();
        }
    },
    onReady: function() {
        var component = this;
        setTimeout(function() {
            // Show the entries
            component.setState({
                ready: true,
                entries: EntryStore.getEntries()
            });
            // Start listening for other entries
            component.openSocket();
        }, 500);
    },
    openSocket: function() {
        // Start listening for new entries
        var component = this,
            url = window.location.protocol +
                '//' + window.location.hostname +
                (window.location.port ? ':' + window.location.port : '');

        socket = window.io.connect(url);
        socket.on('connect', function() {
            component.setState({
                socketConnected: true
            });
            console.log('Now listening for new log entries...');
        });
        socket.on('entry', function(entry) {
            Actions.recordEntry(entry);
        });
        socket.on('disconnect', function() {
            component.setState({
                socketConnected: false
            });
            socket = undefined;
            console.log('Stopped listening for new log entries...');
        });
    },
    onNewEntry: function() {
        this.setState({
            entries: EntryStore.getEntries()
        });
    },
    render: function() {
        var entryElements = [], entry;
        for (var i = 0; i < this.state.entries.length; i++) {
            entry = this.state.entries[i];
            entryElements.push(
                <div className="entry" key={i}>
                    <div className={'level ' + entry.level}>{entry.level}</div>
                    <div className="time">
                        <i className="fa fa-calendar-o"></i>&nbsp;<span>{(new Date(entry.time)).toUTCString()}</span>
                    </div>
                    <div className="device-id">
                        <i className="fa fa-phone"></i>&nbsp;<span>{entry.deviceId}</span>
                    </div>
                    <div className="ip">
                        <i className="fa fa-globe"></i>&nbsp;<span>{entry.ip}</span>
                    </div>
                    <div className={'tag ' + entry.level}>{entry.tag}</div>
                    <div className="message"><pre>{entry.message}</pre></div>
                    <div className="trace" style={{ display: (entry.trace ? 'block' : 'none') }}>
                        <pre>{entry.trace}</pre>
                    </div>
                </div>
            );
        }

        return (
            <div id="livelog" style={{ opacity: this.state.ready ? 1.0 : 0.0 }}>
                <div id="entries">
                    {entryElements}
                </div>
            </div>
        );
    }
});

module.exports = LiveLog;