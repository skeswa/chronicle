/** @jsx React.DOM */
var React       = require('react');

var Util        = require('../util');

var Dropdown = React.createClass({
    propTypes: {
        nullable: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        value: React.PropTypes.string,
        onChange: React.PropTypes.func,
        map: React.PropTypes.object.isRequired
    },
    getDefaultProps: function() {
        return {
            nullable: true,
            disabled: false,
            value: undefined,
            onChange: function() {},
            map: {}
        };
    },
    getInitialState: function() {
        return {
            menuVisible: false,
            menuBuried: true
        };
    },
    componentDidMount: function() {
        Util.events.on(document, 'click', this.onDocumentClicked);
    },
    componentDidUnmount: function() {
        Util.events.off(document, 'click', this.onDocumentClicked);
    },
    onDocumentClicked: function(e) {
        // Check if the target is inside the current component
        if (this.isMounted() &&
            e.target != this.getDOMNode() &&
            !Util.dom.isDescendant(this.getDOMNode(), e.target)) {
            this.hideMenu();
        }
    },
    onSelectClicked: function() {
        this.showMenu();
    },
    onMenuItemClicked: function(key) {
        if (this.props.onChange) this.props.onChange(key);
        this.hideMenu();
    },
    generateMenuItemClickListener: function(key) {
        var component = this;
        return function() {
            component.onMenuItemClicked(key);
        };
    },
    showMenu: function() {
        if (this.props.disabled) return;

        this.setState({
            menuBuried: false
        }, function() {
            this.setState({
                menuVisible: true
            });
        });
    },
    hideMenu: function() {
        var component = this;
        this.setState({
            menuVisible: false
        }, function() {
            setTimeout(function() {
                component.setState({
                    menuBuried: true
                });
            }, 250);
        });
    },
    render: function() {
        var menuItems = [], key, value;
        for (key in this.props.map) {
            value = this.props.map[key];
            if (value !== undefined && value !== null) {
                menuItems.push(
                    <div key={key}
                        onClick={this.generateMenuItemClickListener(key)}
                        className={'dropdown-menu-item' + ((this.props.value === key) ? ' active' : '')}>{value}</div>
                );
            }
        }
        // If nullable, add an empty option
        if (this.props.nullable) {
            menuItems.unshift(
                <div key="null-entry"
                    onClick={this.generateMenuItemClickListener(undefined)}
                    className="dropdown-menu-item">&nbsp;</div>
            );
        }

        return (
            <div className={'dropdown' + (this.props.disabled ? ' disabled' : '')}>
                <div className="dropdown-select" onClick={this.onSelectClicked}>
                    <div className="dropdown-select-text">{this.props.map ? this.props.map[this.props.value] : undefined}</div>
                    <i className="fa fa-angle-down"></i>
                </div>
                <div className={'dropdown-menu' + (this.state.menuVisible ? '' : ' hidden') + (this.state.menuBuried ? ' buried' : '')}>
                    {menuItems}
                </div>
            </div>
        );
    }
});

module.exports = Dropdown;
