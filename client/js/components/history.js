/** @jsx React.DOM */
var React           = require('react'),
    Router          = require('react-router');

var Util            = require('../util'),
    Actions         = require('../actions'),
    EntryStore      = require('../stores/entry');

var LiveLog = React.createClass({
    getInitialState: function() {
        return {
            ready: false,
            entries: []
        };
    },
    componentDidMount: function() {
        // Register for ready event
        EntryStore.onInitialEntriesLoaded(this.onReady);
    },
    componentWillUnmount: function() {
        // Unregister for ready event
        EntryStore.offInitialEntriesLoaded(this.onReady);
    },
    onReady: function() {
        // Show content via animation
        this.setState({
            ready: true
        });
    },
    render: function() {
        return (
            <div id="history" style={{ opacity: this.state.ready ? 1.0 : 0.0 }}>
            </div>
        );
    }
});

module.exports = LiveLog;