/** @jsx React.DOM */
var React                   = require('react'),
    ReactAddons             = require('react/addons'),
    Router                  = require('react-router');

var Util                    = require('../util'),
    Actions                 = require('../actions'),
    EntryStore              = require('../stores/entry'),
	Dropdown    			= require('./dropdown');;

var ReactCSSTransitionGroup = ReactAddons.addons.CSSTransitionGroup,
	classSet				= ReactAddons.addons.classSet;

function humanizeEntryField(field) {
    switch (field) {
        case 'level':
            return 'Log Level';
        case 'deviceId':
            return 'Device Id';
        case 'tag':
            return 'Tag';
        case 'message':
            return 'Message';
        case 'trace':
            return 'Stack Trace';
        case 'ip':
            return 'IP Address';
        case 'appName':
            return 'Application';
        case 'appVersion':
            return 'Application Version';
    }

    return 'Unknown';
}

var LiveLog = React.createClass({
    getInitialState: function() {
        return {
            ready: false,
            entries: EntryStore.getEntries(),
            socketConnected: false,
            creatingNewFilter: false,
            newFilterFieldName: 'level',
            newFilterValue: '',
			filtersVisible: Util.storage.load('livelog-filters', []).length > 0,
            filters: Util.storage.load('livelog-filters', [])
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
		// Added refreshes for time updates
		var component = this;
		var refresh = function() {
			component.forceUpdate.call(component);
		};

		Util.time.sequence({
			1000: refresh,
			5000: refresh,
			60000: refresh,
			1800000: refresh,
			3600000: refresh,
			7200000: refresh,
			86400000: refresh
		});
    },
    onNewFilterClicked: function() {
        this.setState({
            creatingNewFilter: !(this.state.creatingNewFilter)
        });
    },
    onNewFilterFieldNameChanged: function(value) {
        this.setState({
            newFilterFieldName: value
        });
    },
    onNewFilterValueChanged: function(event) {
        this.setState({
            newFilterValue: event.target.value
        });
    },
    onNewFilterValueKeyPress: function(event) {
        if (event.keyCode === 13) {
            // Enter was pressed - submit the form
            this.onCreateFilterClicked();
        }
    },
	onShowFilterClicked: function() {
		this.setState({
			filtersVisible: true
		});
	},
	onHideFilterClicked: function() {
		this.setState({
			filtersVisible: false
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

            this.state.filters.push(newFilter);
            this.setState({
                newFilterFieldName: 'level',
                newFilterValue: '',
                creatingNewFilter: false
            });
            // Persist the revised list
            Util.storage.save('livelog-filters', this.state.filters);
        }
    },
    generateFilterDeleter: function(index) {
        var component = this, filters = this.state.filters;
        return function() {
            filters.splice(index, 1);
            component.setState({
                filters: filters
            });
            // Persist the revised list
            Util.storage.save('livelog-filters', filters);
        };
    },
    matchesFilter: function(entry) {
        var filterVal, entryVal;
        for (var i = 0; i < this.state.filters.length; i++) {
            filterVal = this.state.filters[i].value;
            entryVal = entry[this.state.filters[i].field];
            // The gauntlet
            if (!entryVal) return false;
            else if (typeof entryVal !== 'string' && !(entryVal instanceof String)) return false;
            else if (entryVal.toLowerCase().indexOf(filterVal.toLowerCase()) === -1) return false;
        }
        return true;
    },
    render: function() {
        if (this.state.entries.length > 0) {
            var entryElements = [], filterElements = [], entry, filter;
			// Create the array of messages
            for (var i = 0; i < this.state.entries.length; i++) {
                entry = this.state.entries[i];
                if (this.matchesFilter(entry)) {
                    // Format contextual data
					var time = Util.time.ago(entry.time);
					var isNew = ((new Date()).getTime() - entry.time) < 5000 && i === 0;
					// Format the entry
					entryElements.push(
                        <div className={'entry' + (isNew ? ' new' : '')} key={i}>
                            <div className={'level ' + entry.level}>{entry.level}</div>
                            <div className="time"><span>{time}</span></div>
                            <div className="device-id">
                                <i className="fa fa-bookmark"></i>&nbsp;<span>{entry.deviceId}</span>
                            </div>
                            <div className="ip">
                                <i className="fa fa-globe"></i>&nbsp;<span>{entry.ip}</span>
                            </div>
                            <div className="version">
                                <i className="fa fa-tag"></i>&nbsp;<span>{entry.appName + ' (' + entry.appVersion + ')'}</span>
                            </div>
                            <div className={'tag ' + entry.level}>{entry.tag}</div>
                            <div className={'new' + (isNew ? '' : ' hidden')}>New Log Message</div>
							<div className="message"><pre>{entry.message}</pre></div>
                            <div className="trace" style={{ display: (entry.trace ? 'block' : 'none') }}>
                                <pre>{entry.trace}</pre>
                            </div>
                        </div>
                    );
                }
            }
			// The array of filters
            for (var i = 0; i < this.state.filters.length; i++) {
                filter = this.state.filters[i];
                filterElements.push(
                    <div className="filter" key={i}>
                        <div className="label">{humanizeEntryField(filter.field)}</div>
                        <div className="value">{filter.value}</div>
                        <button onClick={this.generateFilterDeleter(i)}><i className="fa fa-times"></i></button>
                    </div>
                );
            }

            return (
                <div id="livelog" style={{ opacity: this.state.ready ? 1.0 : 0.0 }}>
					<div id="show-filters-button" className={this.state.filtersVisible ? 'hidden' : ''} onClick={this.onShowFilterClicked}><i className={'fa fa-filter'}></i></div>
                    <div id="filters" className={classSet({
							'create-new-filter': this.state.creatingNewFilter,
							'hidden': !this.state.filtersVisible
						})}>
                        <div id="heading">
                            <div className="left"><i className="fa fa-filter"></i> Filters</div>
                            <div className="right">
                                <button onClick={this.onHideFilterClicked} className="dark"><i className="fa fa-arrow-left"></i></button>
                                <button onClick={this.onNewFilterClicked} className="blue"><i className={'fa fa-' + (this.state.creatingNewFilter ? 'times' : 'plus')}></i></button>
                            </div>
                        </div>
                        <div id="filter-form">
                            <Dropdown
								map={{
									level: 'Log Level',
									deviceId: 'Device Id',
									tag: 'Tag',
									message: 'Message',
									trace: 'Stack Trace',
									ip: 'IP Address',
									appName: 'Application',
									appVersion: 'Version'
								}}
								nullable={false}
								value={this.state.newFilterFieldName}
								onChange={this.onNewFilterFieldNameChanged}
								disabled={this.state.waiting} />
                            <input type="text" className="filter-value" value={this.state.newFilterValue} placeholder="Filter Value" onChange={this.onNewFilterValueChanged} onKeyDown={this.onNewFilterValueKeyPress} />
                            <button className="finish" onClick={this.onCreateFilterClicked}>Add Filter</button>
                        </div>
                        <div id="filter-list">
                            <div className="empty-message" style={{ display: (this.state.filters.length > 0 ? 'none' : 'block') }}>There are no filters to show.</div>
                            <div id="filter-list-wrapper" style={{ display: (this.state.filters.length > 0 ? 'block' : 'none') }}>
                                {filterElements}
                            </div>
                        </div>
                    </div>
                    <div id="entries-container" className={this.state.filtersVisible ? '' : 'expanded'}>
                        <div id="entries">
                            <ReactCSSTransitionGroup transitionName="example">
                                {entryElements}
                            </ReactCSSTransitionGroup>
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
