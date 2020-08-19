'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));
var reactPortal = require('react-portal');
var ClickOutside = _interopDefault(require('react-click-outside'));

// Acquire from http://jsfiddle.net/gliheng/vbucs/12/
function position($node, offsetx, offsety) {
  offsetx = offsetx || 0;
  offsety = offsety || 0;

  var nodeLeft = 0;
  var nodeTop = 0;
  if ($node) {
    nodeLeft = $node.offsetLeft;
    nodeTop = $node.offsetTop;
  }

  var pos = { left: 0, top: 0, bottom: 0 };

  if (document.selection) {
    var range = document.selection.createRange();
    pos.left = range.offsetLeft + offsetx - nodeLeft;
    pos.top = range.offsetTop + offsety - nodeTop;
  } else if (window.getSelection) {
    var sel = window.getSelection();
    if (sel.rangeCount === 0) return null;
    var _range = sel.getRangeAt(0).cloneRange();
    try {
      _range.setStart(_range.startContainer, _range.startOffset - 1);
    } catch (e) {}

    var rect = _range.getBoundingClientRect();

    if (_range.endOffset === 0 || _range.toString() === '') {
      // first char of line
      if (_range.startContainer === $node) {
        // empty div
        if (_range.endOffset === 0) {
          pos.top = 0;
          pos.left = 0;
        } else {
          // firefox need this
          var range2 = _range.cloneRange();
          range2.setStart(range2.startContainer, 0);
          var rect2 = range2.getBoundingClientRect();
          pos.left = rect2.left + offsetx - nodeLeft;
          pos.top = rect2.top + rect2.height + offsety - nodeTop;
        }
      } else {
        pos.top = _range.startContainer.offsetTop;
        pos.left = _range.startContainer.offsetLeft;
      }
    } else {
      pos.left = rect.left + rect.width + offsetx - nodeLeft;
      pos.top = rect.top + offsety - nodeTop;
    }
  }
  return pos;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var SuggestionItem = function (_React$Component) {
  inherits(SuggestionItem, _React$Component);

  function SuggestionItem() {
    var _ref;

    var _temp, _this, _ret;

    classCallCheck(this, SuggestionItem);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = SuggestionItem.__proto__ || Object.getPrototypeOf(SuggestionItem)).call.apply(_ref, [this].concat(args))), _this), _this.onClick = function (e) {

      _this.props.closePortal();

      var _this$props = _this.props,
          editor = _this$props.editor,
          suggestion = _this$props.suggestion,
          appendSuggestion = _this$props.appendSuggestion;

      appendSuggestion(suggestion, editor);

      editor.onChange(editor);
    }, _this.onMouseEnter = function () {
      return _this.props.setSelectedIndex(_this.props.index);
    }, _this.render = function () {
      return React.createElement(
        'li',
        {
          className: _this.props.index === _this.props.selectedIndex ? 'selected' : undefined,
          onClick: _this.onClick,
          onMouseEnter: _this.onMouseEnter
        },
        _this.props.suggestion.suggestion
      );
    }, _temp), possibleConstructorReturn(_this, _ret);
  }

  return SuggestionItem;
}(React.Component);

function getCurrentWord(text, index, initialIndex) {

  if (text[index] === " " || text[index] === undefined) return "";
  if (index < initialIndex) {
    return getCurrentWord(text, index - 1, initialIndex) + text[index];
  }
  if (index > initialIndex) {
    return text[index] + getCurrentWord(text, index + 1, initialIndex);
  }
  return getCurrentWord(text, index - 1, initialIndex) + text[index] + getCurrentWord(text, index + 1, initialIndex);
}

var ESCAPE_KEY = 27;
var UP_ARROW_KEY = 38;
var DOWN_ARROW_KEY = 40;
var ENTER_KEY = 13;
var RESULT_SIZE = 5;

var SuggestionPortal = function (_React$Component) {
  inherits(SuggestionPortal, _React$Component);

  function SuggestionPortal(props) {
    classCallCheck(this, SuggestionPortal);

    var _this = possibleConstructorReturn(this, (SuggestionPortal.__proto__ || Object.getPrototypeOf(SuggestionPortal)).call(this));

    _this.state = {
      filteredSuggestions: []
    };

    _this.componentDidMount = function () {
      _this.adjustPosition();
      window.addEventListener('resize', _this.adjustPosition.bind(_this));
      window.addEventListener('scroll', _this.adjustPosition.bind(_this));
    };

    _this.componentDidUpdate = function () {
      _this.adjustPosition();
    };

    _this.componentWillUnmount = function () {
      window.removeEventListener('resize', _this.adjustPosition.bind(_this));
      window.removeEventListener('scroll', _this.adjustPosition.bind(_this));
    };

    _this.setCallbackSuggestion = function () {
      if (_this.state.filteredSuggestions.length) {

        _this.props.callback.suggestion = _this.state.filteredSuggestions[_this.selectedIndex];
      } else {
        _this.props.callback.suggestion = undefined;
      }
    };

    _this.setFilteredSuggestions = function (filteredSuggestions) {
      _this.setState({
        filteredSuggestions: filteredSuggestions
      }, _this.setCallbackSuggestion);
    };

    _this.onKeyUp = function (e, change, next) {
      var match = _this.matchCapture();
      if (match) {
        if (e.keyCode !== DOWN_ARROW_KEY && e.keyCode !== UP_ARROW_KEY && e.keyCode !== ENTER_KEY && e.keyCode !== ESCAPE_KEY) {

          _this.selectedIndex = 0;
          var newFilteredSuggestions = _this.getFilteredSuggestions(e.key);

          if (typeof newFilteredSuggestions.then === 'function') {
            newFilteredSuggestions.then(function (newFilteredSuggestions) {
              _this.setFilteredSuggestions(newFilteredSuggestions);
            }).catch(function () {
              _this.setFilteredSuggestions([]);
            });
          } else {
            _this.setFilteredSuggestions(newFilteredSuggestions);
          }
        }
      }

      next();
    };

    _this.onKeyDown = function (e, editor, next) {

      var match = _this.matchCapture();

      if (match) {
        var filteredSuggestions = _this.state.filteredSuggestions;

        if (filteredSuggestions.length > 0) {
          // Prevent default return/enter key press when portal is open
          if (e.keyCode === ESCAPE_KEY) {
            _this.hidePortal();
            return false;
          } else if (e.keyCode === ENTER_KEY) {
            e.preventDefault();
            _this.closePortal();
            _this.selectedIndex = _this.selectedIndex || 0;
            _this.setCallbackSuggestion();

            // Handle enter
            if (_this.props.callback.onEnter && _this.props.callback.suggestion !== undefined) {
              _this.props.callback.onEnter(_this.props.callback.suggestion, editor);
              editor.onChange(editor);
              return false;
            }
          } else if (e.keyCode === DOWN_ARROW_KEY) {
            e.preventDefault();
            if (_this.selectedIndex + 1 === filteredSuggestions.length) {
              _this.selectedIndex = -1;
            }
            _this.selectedIndex = (_this.selectedIndex || 0) + 1;
            _this.setCallbackSuggestion();
            _this.forceUpdate();
            return false;
          } else if (e.keyCode === UP_ARROW_KEY) {
            e.preventDefault();
            if (_this.selectedIndex === 0) {
              _this.selectedIndex = filteredSuggestions.length;
            }
            _this.selectedIndex = (_this.selectedIndex || filteredSuggestions.length) - 1;
            _this.setCallbackSuggestion();
            _this.forceUpdate();
            return false;
          }
        }
      }

      next();
    };

    _this.matchCapture = function () {
      var _this$props = _this.props,
          value = _this$props.value,
          capture = _this$props.capture;


      if (!value.selection.anchor.key) return '';

      var anchorText = value.anchorText,
          selection = value.selection;
      var offset = selection.anchor.offset;


      var currentWord = getCurrentWord(anchorText.text, offset - 1, offset - 1);

      var matchText = _this.getMatchText(currentWord, capture);

      return matchText;
    };

    _this.getMatchText = function (text, trigger) {
      var matchArr = text.match(trigger);

      if (matchArr) {
        return matchArr[0].toLowerCase();
      }

      return undefined;
    };

    _this.getFilteredSuggestions = function () {
      var _this$props2 = _this.props,
          suggestions = _this$props2.suggestions,
          value = _this$props2.value,
          capture = _this$props2.capture,
          resultSize = _this$props2.resultSize;


      if (!value.selection.anchor.key) return [];

      var anchorText = value.anchorText,
          selection = value.selection;
      var offset = selection.anchor.offset;


      var currentWord = getCurrentWord(anchorText.text, offset - 1, offset - 1);

      var matchText = _this.getMatchText(currentWord, capture);
      matchText = matchText.slice(1, matchText.length);

      if (typeof suggestions === 'function') {
        return suggestions(matchText);
      } else if (matchText) {
        return suggestions.filter(function (suggestion) {
          return suggestion.key.toLowerCase().indexOf(matchText) !== -1;
        }).slice(0, resultSize ? resultSize : RESULT_SIZE);
      } else {
        return suggestions;
      }
    };

    _this.adjustPosition = function () {
      if (!_this.portalContainer.current) return;

      var match = _this.matchCapture();

      if (match) {
        _this.showPortal();
        var rect = position();
        if (rect) {
          _this.portalContainer.current.style.display = 'block';
          _this.portalContainer.current.style.opacity = 1;
          if (_this.alignTop) {
            var height = _this.portalContainer.current.clientHeight;
            _this.portalContainer.current.style.top = rect.top + window.scrollY - height - 14 + 'px'; // eslint-disable-line no-mixed-operators
          } else {
            _this.portalContainer.current.style.top = rect.top + window.scrollY + 'px'; // eslint-disable-line no-mixed-operators
          }

          _this.portalContainer.current.style.left = rect.left + window.scrollX + 'px'; // eslint-disable-line no-mixed-operators
        }
      } else if (match === undefined) {
        _this.hidePortal();
        return;
      }
    };

    _this.showPortal = function (rect) {
      if (!_this.isOpen) {
        _this.isOpen = true;
        if (!_this.justOpened) {
          _this.justOpened = true;
          setTimeout(function () {
            _this.justOpened = false;
          }, 100);
        }
        _this.props.onOpen && _this.props.onOpen();
      }
    };

    _this.hidePortal = function () {
      if (_this.isOpen) {
        _this.portalContainer.current.removeAttribute('style');
        _this.isOpen = false;
        _this.props.onClose && _this.props.onClose();
      }
    };

    _this.closePortal = function () {

      if (!_this.portalContainer.current) return;

      var match = _this.matchCapture();
      _this.props.onClose && _this.props.onClose();
      if (!match) {
        _this.hidePortal();
        return;
      }
    };

    _this.clickOutside = function () {
      if (_this.isOpen) {
        if (!_this.justOpened) {
          _this.hidePortal();
        }
      }
    };

    _this.setSelectedIndex = function (selectedIndex) {
      _this.selectedIndex = selectedIndex;
      _this.forceUpdate();
    };

    _this.render = function () {
      var filteredSuggestions = _this.state.filteredSuggestions;


      return React.createElement(
        reactPortal.Portal,
        { isOpened: true, node: document && document.body },
        React.createElement(
          ClickOutside,
          { onClickOutside: _this.clickOutside },
          React.createElement(
            'div',
            { className: 'suggestion-portal', ref: _this.portalContainer },
            React.createElement(
              'ul',
              null,
              filteredSuggestions.map(function (suggestion, index) {
                return React.createElement(SuggestionItem, {
                  key: suggestion.key,
                  index: index,
                  suggestion: suggestion,
                  selectedIndex: _this.selectedIndex,
                  setSelectedIndex: _this.setSelectedIndex,
                  appendSuggestion: _this.props.callback.onEnter,
                  closePortal: _this.closePortal,
                  editor: _this.props.callback.editor
                });
              })
            )
          )
        )
      );
    };

    _this.isOpen = false;
    _this.justOpened = false;
    _this.portalContainer = React.createRef();
    _this.alignTop = !!props.alignTop;
    props.callback.onKeyDown = _this.onKeyDown;
    props.callback.onKeyUp = _this.onKeyUp;
    props.callback.onEnter = props.onEnter;

    _this.selectedIndex = 0;
    if (typeof props.suggestions === 'function') {
      props.callback.suggestion = undefined;
    } else {
      _this.state.filteredSuggestions = props.suggestions.slice(0, props.resultSize ? props.resultSize : RESULT_SIZE);
      props.callback.suggestion = _this.state.filteredSuggestions[_this.selectedIndex];
    }
    return _this;
  }

  return SuggestionPortal;
}(React.Component);

function SuggestionsPlugin(opts) {

  var callback = {};

  function onKeyDown(e, editor, next) {
    callback.editor = editor;

    if (callback.onKeyDown) {
      return callback.onKeyDown(e, editor, next);
    }

    next();
  }

  function onKeyUp(e, editor, next) {
    callback.editor = editor;

    if (callback.onKeyUp) {
      return callback.onKeyUp(e, editor, next);
    }

    next();
  }

  return {
    onKeyDown: onKeyDown,
    onKeyUp: onKeyUp,
    SuggestionPortal: React.forwardRef(function (props, ref) {
      return React.createElement(SuggestionPortal, _extends({}, props, opts, {
        ref: ref,
        callback: callback
      }));
    })

  };
}

module.exports = SuggestionsPlugin;
//# sourceMappingURL=index.js.map
