/** @jsx React.DOM */
var React           = require('react'),
    Router  		= require('react-router');

var Actions         = require('../actions'),
    EntryService    = require('../services/entry'),
    EntryStore      = require('../stores/entry')
    Header          = require('./header'),
    Footer          = require('./footer');

var RouteHandler	= Router.RouteHandler;

var BasePage = React.createClass({
    componentDidMount: function() {
        // Get the session immediately
        EntryService.getEntries(function(err, res) {
            if (err) {
                // TODO create mechanism to report network problems
                console.log('Could not get initial entries', err);
            } else {
                Actions.recordInitialEntries(res.body);
            }
        });
    },
    render: function() {
        return (
            <div id="base">
                <Header/>
                <div id="content">
                    <RouteHandler/>
                </div>
                <Footer/>
            </div>
        );
    }
});

module.exports = BasePage;
