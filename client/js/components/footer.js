/** @jsx React.DOM */
var React           = require('react');

var EntryStore      = require('../stores/entry'),
    Actions         = require('../actions');

var Footer = React.createClass({
    getInitialState: function() {
        return {
            ready: false
        };
    },
    componentDidMount: function() {
        // Register for events
        EntryStore.onInitialEntriesLoaded(this.onReady);
    },
    componentWillUnmount: function() {
        // Unregister for events
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
            <footer className={this.state.ready ? '' : 'hidden'}>
                <span>Made with <i className="fa fa-heart"></i> in Philadelphia</span>
            </footer>
        );
    }
});

module.exports = Footer;