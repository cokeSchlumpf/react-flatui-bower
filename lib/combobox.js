define(function (require, exports, module) {var React = require("react");
var Bootstrap = require("react-bootstrap");
var Textbox = require("./textbox");
var Listbox = require("./listbox");

var BLUR_TIMEOUT = 100;

var $ = require("jquery");
var helper = require("./helper");
var classnames = require("./util/classnames/index");
var updateListValue = require("./helper").updateListValue;

var keyHandlers = {
  38: '_handleKeyUp',
  40: '_handleKeyDown',
  13: '_handleKeyEnter',
  27: '_handleKeyEsc'
}

var ListItem = React.createClass({displayName: "ListItem",
  render: function() {
    return (
        React.createElement("span", null,  this.props.value.title)
      );
  }
})

module.exports = React.createClass({displayName: "exports",
    propTypes: {
      multiselect: React.PropTypes.bool,
      renderWith: React.PropTypes.any,
      value: React.PropTypes.object.isRequired,
      onChange: React.PropTypes.func
    },
    
    getDefaultProps: function() {
      return {
        multiselect: false,
        renderWith: undefined,
        value: {}
      }; 
    },
    
    getInitialState: function() {
      return {
        focus: false,
        value: undefined,
        selected: undefined
      }
    },
    
    _getClassName: function() {
      var 
        className = this.props.className,
        classes = {
          "fu-combobox": true,
          "fu-combobox-focused": this.state.focus,
          "fu-combobox-multiselect": this.props.multiselect
        };

      return classnames(className, classes);
    },
    
    _getTextboxValue: function() {
      var
        value = this.props.value,
        multiselect = this.props.multiselect,
        selected = helper.getSelectedValue(value, multiselect),
        result;
        
      if (this.state.value != undefined) {
        result = this.state.value;
      } else if (!this.props.multiselect && selected.length > 0) {
        result = value[selected[0]].title;
      }
      
      return result;
    },
    
    _isListboxVisible: function() {
      return this.state.focus && this.state.value != undefined;
    },
    
    _renderListbox: function() {
      var 
        self = this,
        $__0=      this.props,value=$__0.value,multiselect=$__0.multiselect,other=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{value:1,multiselect:1}),
        selected = helper.getSelectedValue(value, multiselect),
        keys = Object.keys(value),
        items = {},
        selected = this.state.selected;
      
      keys.forEach(function(key) {    
        if (!multiselect || !value[key].selected) { 
          if (!selected && self.state.value && value[key].title.indexOf(self.state.value) == 0) { 
            selected = key 
          }
          items[key] = $.extend(true, {}, value[key], { selected: key == selected });
        }
      });
      
      this.nextSelection = helper.calculateNextAndPreviousSelectionIndex(items, selected);
      this.nextSelection.current = selected;
      
      return React.createElement(Listbox, {value: items, onChange:  self._handleListboxChange, scrollToSelection: true})
    },
    
    _renderTextboxAddonBefore: function() {
      var
        self = this,
        $__0=      this.props,value=$__0.value,multiselect=$__0.multiselect,other=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{value:1,multiselect:1}),
        selected = helper.getSelectedValue(value, multiselect),
        result;
        
      if (this.props.multiselect && selected.length > 0) {
        var items = {};
        selected.forEach(function(key) {
          var title = value[key].shorttitle ? value[key].shorttitle : value[key].title;
          items["k" + key] = React.createElement(Bootstrap.Label, null, title, " ", React.createElement(Bootstrap.Glyphicon, {glyph: "remove", onClick:  self._handleRemove(key) }))
        });
        result = React.createElement("span", {className: "fu-combobox-selected-items"}, items )
      }
      
      return result;
    },
    
    render: function() {
      var 
        $__0=         this.props,className=$__0.className,multiselect=$__0.multiselect,renderWith=$__0.renderWith,onChange=$__0.onChange,value=$__0.value,other=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{className:1,multiselect:1,renderWith:1,onChange:1,value:1}),
        button = React.createElement(Bootstrap.Button, {onClick:  this._handleButtonClick}, React.createElement("span", {className: "glyphicon glyphicon-triangle-bottom"})),
        listbox = this._renderListbox();
        
      return (
          React.createElement("div", {className:  this._getClassName() }, 
            React.createElement(Textbox, React.__spread({},   other , {addonBefore:  this._renderTextboxAddonBefore(), addonAfter: button, 
              ref: "textbox", onFocus:  this._handleFocus, onBlur:  this._handleBlur, onKeyDown:  this._handleKeyDownEvent, 
              onChange:  this._handleChange, value:  this._getTextboxValue() })), 
             this._isListboxVisible() && listbox
          )
        )
    },
    
    _handleBlur: function() {
      if (this._blurTimeout) clearTimeout(this._blurTimeout);
      var self = this;
      
      this._blurTimeout = setTimeout(function() {
        self.setState({ focus: false, value: undefined }, function() {
          var selected = self.nextSelection.current;
          if (selected) self._handleSelect(selected);
        });
      }, BLUR_TIMEOUT);
    },
    
    _blurTimeout: undefined,
    
    _handleButtonClick: function() {
      if (this._blurTimeout) clearTimeout(this._blurTimeout);
      var self = this;
      
      if (!this._isListboxVisible()) {
        selected = helper.getSelectedValue(self.props.value, self.props.multiselect);
        if (selected.length > 0) selected = selected[0]; else selected = Object.keys(self.props.value)[0];
        
        this.setState({ focus: true, selected: selected, value: self.props.value[selected].title }, function() {
          self._select();
        });
      } else {
        this.setState({ focus: true, selected: undefined, value: undefined }, function() {
          self._select();
        });
      }
    },
    
    _handleChange: function(value) {
      this.setState({ value: value });
    },
    
    _handleFocus: function() {
      if (this._blurTimeout) clearTimeout(this._blurTimeout);
      var self = this;
      
      this.setState({ focus: true }, function() {
        self._select();
      });
    },
    
    _handleListboxChange: function(value, key, selected) {
      if (this._blurTimeout) clearTimeout(this._blurTimeout);
      var self = this;
      
      self.setState({ focus: true, selected: undefined, value: undefined }, function() {
        this._handleSelect(key);
        this._select();
      });
    },
    
    _handleKeyDown: function(event) {
      this._selectItem(this.nextSelection.next);
    },
    
    _handleKeyDownEvent: function(event) {
      if (event && this[keyHandlers[event.which]]) {
        this[keyHandlers[event.which]](event);
        event.preventDefault();
      } else {
        this.setState({ selected: undefined });
      }
      
      if (this.props.onKeyDown) {
        this.props.onKeyDown(event);
      }
    },
    
    _handleKeyEnter: function(event) {
      if (this.nextSelection.current) {
        var self = this;
        var selected = this.nextSelection.current;
        
        this.setState({ selected: undefined, value: undefined }, function() {
          if (selected) self._handleSelect(selected);
          self._select();
        });
      }  
    },
    
    _handleKeyEsc: function(event) {
      if (this.state.selected) {
        var self = this;
        
        this.setState({ selected: undefined }, function() {
          self._select();
        });
      }  
    },
    
    _handleKeyUp: function(event) {
      this._selectItem(this.nextSelection.previous);
    },
    
    _handleRemove: function(key) {
      var self = this;
      return function() {
        if (self.props.onChange) {
          self.props.onChange(helper.updateListValue(self.props.value, true, key, false));
        }
        self._select();
      };
    },
    
    _handleSelect: function(item) {
      if (this.props.onChange) {
        this.props.onChange(helper.updateListValue(this.props.value, this.props.multiselect, item, true));
      }
    },
    
    nextSelection: {
      next: undefined,
      current: undefined,
      previous: undefined
    },
    
    _select: function() {
      var self = this;
      setTimeout(function() {
        self.refs.textbox.getDOMNode().getElementsByTagName("input")[0].focus();
        self.refs.textbox.getDOMNode().getElementsByTagName("input")[0].select(); 
      }, 50);
    },
    
    _selectItem: function(item) {
      if (item) {
        this.setState({ selected: item, value: this.props.value[item].title }, this._select)
      }
    }
  });
});
