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
            entries: EntryStore.getEntries(),
            socketConnected: false,
            creatingNewFilter: false,
            newFilterFieldName: 'level',
            newFilterValue: '',
            filters: []
        };
    },
    componentDidMount: function() {
        if (EntryStore.initialEntriesAreLoaded) {
            this.onReady();
        } else {
            EntryStore.onInitialEntriesLoaded(this.onReady);
        }
    },
    componentWillUnmount: function() {
        // Unregister for events
        EntryStore.offNewEntry(this.onNewEntry);
        EntryStore.offInitialEntriesLoaded(this.onReady);
    },
    onReady: function() {
        EntryStore.onNewEntry(this.onNewEntry);

        var component = this;
        setTimeout(function() {
            // Show the entries
            component.setState({
                ready: true,
                entries: EntryStore.getEntries()
            });
        }, 500);
    },
    onNewEntry: function() {
        this.setState({
            entries: EntryStore.getEntries()
        });
    },
    onNewFilterClicked: function() {
        this.setState({
            creatingNewFilter: !(this.state.creatingNewFilter)
        });
    },
    onNewFilterFieldNameChanged: function(event) {
        this.setState({
            newFilterFieldName: event.target.value
        });
    },
    onNewFilterValueChanged: function() {
        this.setState({
            newFilterValue: event.target.value
        });
    },
    onCreateFilterClicked: function() {
        if (!this.state.newFilterFieldName || this.state.newFilterFieldName.trim() === '' ||
            !this.state.newFilterValue || this.state.newFilterValue.trim() === '') {
            alert('Please make sure that the both the new filter inputs have valid values.');
        } else {
            var newFilter = {
                field: this.state.newFilterFieldName,
                value: this.state.newFilterValue
            };

            console.log('newFilter', newFilter);
            this.state.filters.push(newFilter);
            this.setState({
                newFilterFieldName: 'level',
                newFilterValue: '',
                creatingNewFilter: false
            });
        }
    },
    render: function() {
        if (this.state.entries.length > 0) {
            var entryElements = [], filterElements = [], entry, filter;

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
                        <div className="version">
                            <i className="fa fa-tag"></i>&nbsp;<span>{entry.appName + ' (' + entry.appVersion + ')'}</span>
                        </div>
                        <div className={'tag ' + entry.level}>{entry.tag}</div>
                        <div className="message"><pre>{entry.message}</pre></div>
                        <div className="trace" style={{ display: (entry.trace ? 'block' : 'none') }}>
                            <pre>{entry.trace}</pre>
                        </div>
                    </div>
                );
            }

            for (var i = 0; i < this.state.filters.length; i++) {
                filter = this.state.filters[i];
                filterElements.push(
                    <div className="filter" key={i}>
                        <div className='field'>{filter.field}</div>
                        <div className='value'>{filter.value}</div>
                    </div>
                );
            }

            return (
                <div id="livelog" style={{ opacity: this.state.ready ? 1.0 : 0.0 }}>
                    <div id="filters" className={this.state.creatingNewFilter ? 'create-new-filter' : ''}>
                        <div id="heading">
                            <div className="left">Filters</div>
                            <div className="right">
                                <button onClick={this.onNewFilterClicked}><i className={'fa fa-' + (this.state.creatingNewFilter ? 'times' : 'plus')}></i></button>
                            </div>
                        </div>
                        <div id="filter-form">
                            <select className="field-select" value={this.state.newFilterFieldName} onChange={this.onNewFilterFieldNameChanged}>
                                <option value="level">Log Level</option>
                                <option value="deviceId">Device Id</option>
                                <option value="tag">Tag</option>
                                <option value="message">Message</option>
                                <option value="trace">Stack Trace</option>
                                <option value="ip">IP Address</option>
                                <option value="appName">Application</option>
                                <option value="appVersion">Version</option>
                            </select>
                            <input type="text" className="filter-value" value={this.state.newFilterValue} placeholder="Filter Value" onChange={this.onNewFilterValueChanged}/>
                            <button className="finish" onClick={this.onCreateFilterClicked}>Add Filter</button>
                        </div>
                        <div id="filter-list">
                            <div className="empty-message" style={{ display: (this.state.filters.length > 0 ? 'none' : 'block') }}>There are no filters to show.</div>
                            {filterElements}
                        </div>
                    </div>
                    <div id="entries-container">
                        <div id="entries">
                            {entryElements}
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div id="livelog" style={{ opacity: this.state.ready ? 1.0 : 0.0 }}>
                    <div className="empty-message">There are no entries to show yet.</div>
                </div>
            );
        }
    }
});

module.exports = LiveLog;