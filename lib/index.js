'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash.throttle');

var _lodash2 = _interopRequireDefault(_lodash);

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function getHorizontalStrength(_ref, _ref2, buffer) {
  var left = _ref.left;
  var width = _ref.width;
  var clientX = _ref2.clientX;

  if (clientX >= left && clientX <= left + width) {
    if (clientX < left + buffer) {
      return (clientX - left - buffer) / buffer;
    } else if (clientX > left + width - buffer) {
      return -(left + width - clientX - buffer) / buffer;
    }
  }

  return 0;
}

function getVerticalStrength(_ref3, _ref4, buffer) {
  var top = _ref3.top;
  var height = _ref3.height;
  var clientY = _ref4.clientY;

  if (clientY >= top && clientY <= top + height) {
    if (clientY < top + buffer) {
      return (clientY - top - buffer) / buffer;
    } else if (clientY > top + height - buffer) {
      return -(top + height - clientY - buffer) / buffer;
    }
  }

  return 0;
}

var Scrollzone = function (_React$Component) {
  _inherits(Scrollzone, _React$Component);

  function Scrollzone(props, ctx) {
    _classCallCheck(this, Scrollzone);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Scrollzone).call(this, props, ctx));

    _this.handleDragOver = function (evt) {
      // give users a chance to preventDefault
      if (typeof _this.props.onDragOver === 'function') _this.props.onDragOver(evt);

      if (!_this.attached) {
        _this.attach();
        _this.updateScrolling(evt);
      }
    };

    _this.updateScrolling = (0, _lodash2.default)(function (evt) {
      var buffer = _this.props.buffer;
      var container = _this.refs.container;

      var rect = container.getBoundingClientRect();

      // calculate strength
      _this.scaleX = getHorizontalStrength(rect, evt, buffer);
      _this.scaleY = getVerticalStrength(rect, evt, buffer);

      // start scrolling if we need to
      if (!_this.frame && (_this.scaleX || _this.scaleY)) _this.startScrolling();
    }, 100, { trailing: false });

    _this.stopScrolling = function () {
      if (_this.frame) {
        _this.detach();
        _raf2.default.cancel(_this.frame);
        _this.frame = null;
        _this.scaleX = 0;
        _this.scaleY = 0;
      }
    };

    _this.scaleX = 0;
    _this.scaleY = 0;
    _this.frame = null;
    _this.attached = false;
    return _this;
  }

  _createClass(Scrollzone, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.frame) _raf2.default.cancel(this.frame);
      this.detach();
    }
  }, {
    key: 'attach',
    value: function attach() {
      window.document.body.addEventListener('dragover', this.updateScrolling);
      window.document.body.addEventListener('dragend', this.stopScrolling);
      window.document.body.addEventListener('drop', this.stopScrolling);
      this.attached = true;
    }
  }, {
    key: 'detach',
    value: function detach() {
      window.document.body.removeEventListener('dragover', this.updateScrolling);
      window.document.body.removeEventListener('dragend', this.stopScrolling);
      window.document.body.removeEventListener('drop', this.stopScrolling);
      this.attached = false;
    }

    // we don't care about the body's dragover events until this
    // component gets dragged over for the first time


    // Update scaleX and scaleY every 100ms or so
    // and start scrolling if necessary

  }, {
    key: 'startScrolling',
    value: function startScrolling() {
      var _this2 = this;

      var speed = this.props.speed;
      var container = this.refs.container;


      var i = 0;
      var tick = function tick() {
        var scaleX = _this2.scaleX;
        var scaleY = _this2.scaleY;

        if (scaleX || scaleY) {
          // there's a bug in safari where it seems like we can't get
          // dragover events from a container that also emits a scroll
          // event that same frame. So we double the speed and only adjust
          // the scroll position at 30fps
          if (i++ % 2) {
            if (scaleX) container.scrollLeft += Math.floor(scaleX * speed);
            if (scaleY) container.scrollTop += Math.floor(scaleY * speed);
          }
          _this2.frame = (0, _raf2.default)(tick);
        } else {
          _this2.stopScrolling();
        }
      };

      tick();
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var Tag = _props.tag;
      var className = _props.className;
      var compClass = className ? className + ' scrollzone' : 'scrollzone';
      var clonedProps = _extends({}, this.props);
      delete clonedProps.tag;
      delete clonedProps.buffer;

      return _react2.default.createElement(Tag, _extends({}, clonedProps, {
        className: compClass,
        onDragOver: this.handleDragOver,
        ref: 'container'
      }));
    }
  }]);

  return Scrollzone;
}(_react2.default.Component);

Scrollzone.propTypes = {
  tag: _react2.default.PropTypes.string,
  buffer: _react2.default.PropTypes.number,
  speed: _react2.default.PropTypes.number,
  onDragOver: _react2.default.PropTypes.func,
  className: _react2.default.PropTypes.string
};
Scrollzone.defaultProps = {
  tag: 'div',
  buffer: 150,
  speed: 30
};
exports.default = Scrollzone;
