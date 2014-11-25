/** @jsx React.DOM */
var React           = require('react'),
    Router          = require('react-router');

var Util            = require('../util'),
    Actions         = require('../actions'),
    EntryStore      = require('../stores/entry');

// React-router variables
var Link            = Router.Link;

var Header = React.createClass({
    getInitialState: function() {
        return {
            ready: false
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
            <header className={this.state.ready ? '' : 'hidden'}>
                <div className="middle">
                    <Link to="livelog" className="nav">Livelog</Link>
                    <Link to="/" className="nav" id="logo">Chronicle</Link>
                    <Link to="history" className="nav">History</Link>
                </div>
            </header>
        );
    }
});

module.exports = Header;