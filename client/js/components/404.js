/** @jsx React.DOM */
var React   = require('react');

var NotFound = React.createClass({
    render: function() {
        return (
            <div id="404">
                THE PAGE WASNT FOUND.
            </div>
        );
    }
});

module.exports = NotFound;