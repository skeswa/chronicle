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
        EntryStore.onInitialEntriesLoaded(this.onReady);
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
            console.log('socket connected');
        });
        socket.on('event', function(data) {
            console.log('event', arguments);
        });
        socket.on('entry', function(data) {
            console.log('entry', arguments);
        });
        socket.on('disconnect', function() {
            component.setState({
                socketConnected: false
            });
            console.log('socket disconnected');
        });
    },
    componentWillUnmount: function() {
        // Unregister for ready event
        EntryStore.offInitialEntriesLoaded(this.onReady);
        // Stop listening for new entries
        if (socket) socket.disconnect();
    },
    onReady: function() {
        // Show content via animation
        this.setState({
            ready: true
        });
    },
    onNewEntry: function() {
        this.setState({
            entries: EntryStore.getEntries()
        });
    },
    render: function() {
        var entryElements = [];
        this.state.entries.forEach(function(entry, i) {
            entryElements.push(
                <div className="entry" key={i}>
                    <div className="level">{entry.level}</div>
                    <div className="time">{entry.time}</div>
                    <div className="deviceId">{entry.deviceId}</div>
                    <div className="tag">{entry.tag}</div>
                    <div className="ip">{entry.ip}</div>
                    <div className="level">{entry.level}</div>
                    <div className="trace">{entry.trace}</div>
                </div>
            );
        });

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