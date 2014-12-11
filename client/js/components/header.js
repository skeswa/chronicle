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
            ready: false,
            connected: false
        };
    },
    componentDidMount: function() {
        EntryStore.onInitialEntriesLoaded(this.onReady);
        EntryStore.onSocketStatusChanged(this.onSocketStatusChanged);
    },
    componentWillUnmount: function() {
        EntryStore.offInitialEntriesLoaded(this.onReady);
        EntryStore.offSocketStatusChanged(this.onSocketStatusChanged);
    },
    onReady: function() {
        // Show content via animation
        this.setState({
            ready: true
        });
    },
    onSocketStatusChanged: function(socketIsConnected) {
        this.setState({
            connected: socketIsConnected
        });
    },
    render: function() {
        return (
            <header className={this.state.ready ? '' : 'hidden'}>
                <Link to="/" id="logo">Chronicle</Link>

                <div className="middle">
                    <Link to="livelog" className="nav">Livelog</Link>
                    <Link to="/" className="nav">Dashboard</Link>
                    <Link to="history" className="nav">History</Link>
                </div>
                
				<div id="status" className={this.state.connected ? '' : 'not-connected'}>
					<i className={'fa fa-check' + (this.state.connected ? ' visible' : '')}/>
					<i className={'fa fa-plug' + (this.state.connected ? '' : ' visible')}/>
					<span className="message">{(this.state.connected ? '' : 'not ') + 'connected'}</span>
				</div>
            </header>
        );
    }
});

module.exports = Header;
