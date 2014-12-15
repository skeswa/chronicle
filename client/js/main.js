/** @jsx React.DOM */
var React   = require('react'),
    Router  = require('react-router');

// React-router variables
var Route           = Router.Route,
    DefaultRoute    = Router.DefaultRoute,
    NotFoundRoute   = Router.NotFoundRoute;

// Authentication related page components
var NotFound    = require('./components/404');
// Publicly accessible page components
var Base        = require('./components/base'),
    Dashboard   = require('./components/dashboard'),
    LiveLog     = require('./components/livelog'),
    History     = require('./components/history');

// Routes representing the frontend
var sitemap = (
	<Route name="public" path="/" handler={Base}>
		<Route name="livelog" handler={LiveLog}/>
		<Route name="history" handler={History}/>
		<DefaultRoute handler={Dashboard}/>
		<NotFoundRoute handler={NotFound}/>
	</Route>
);

// Bind the routes to the DOM
Router.run(sitemap, Router.HistoryLocation, function (Handler) {
  React.render(<Handler/>, document.body);
});
