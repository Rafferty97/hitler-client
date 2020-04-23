var main = (function (exports, React, reactDom) {
    'use strict';

    var React__default = 'default' in React ? React['default'] : React;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var WS_URL = "ws://localhost:8888/" ;
    var unconnectedMessageHandler = function () {
        throw new Error('Not connected to server.');
    };
    function useWebSocket(receiver, reconnect) {
        var _a = React.useState(false), connected = _a[0], setConnected = _a[1];
        var sendMessageRef = React.useRef(unconnectedMessageHandler);
        var receiverRef = React.useRef(receiver);
        var reconnectRef = React.useRef(reconnect);
        React.useEffect(function () {
            receiverRef.current = receiver;
            reconnectRef.current = reconnect;
        }, [receiver, reconnect]);
        var connect = function () {
            var socket = new WebSocket(WS_URL);
            socket.addEventListener('open', function () {
                sendMessageRef.current = function (msg) { return socket.send(JSON.stringify(msg)); };
                setConnected(true);
                reconnectRef.current();
            });
            socket.addEventListener('message', function (event) {
                try {
                    var json = JSON.parse(event.data);
                    receiverRef.current(json);
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.addEventListener('error', function (error) {
                if (error.code == 'ECONNREFUSED') {
                    setTimeout(function () { return connect(); }, 500);
                }
                else {
                    console.error(error);
                }
            });
            socket.addEventListener('close', function (event) {
                setConnected(false);
                setTimeout(function () { return connect(); }, 500);
            });
        };
        React.useEffect(function () { return connect(); }, []);
        var sendMessage = React.useCallback(function (msg) {
            sendMessageRef.current(msg);
        }, []);
        return [connected, sendMessage];
    }

    function Connect(props) {
        var _a = React.useState(''), gameId = _a[0], setGameId = _a[1];
        var _b = React.useState(''), name = _b[0], setName = _b[1];
        var formRef = React.useRef(null);
        var onInput = React.useCallback(function () {
            var form = formRef.current;
            var code = form.querySelector('[name="room"]').value
                .toUpperCase()
                .replace(/[^A-Z]/g, '')
                .slice(0, 4);
            setGameId(code);
            if (props.player) {
                var name_1 = form.querySelector('[name="name"]').value
                    .toUpperCase()
                    .replace(/[^A-Z \'\-]/g, '')
                    .slice(0, 20);
                setName(name_1);
            }
        }, [props.player]);
        var disabled = (props.player && name.length == 0) || gameId.length != 4;
        var onSubmit = function (event) {
            event.preventDefault();
            if (disabled)
                return;
            if (props.player) {
                props.connect({ name: name, gameId: gameId });
            }
            else {
                props.connect({ gameId: gameId });
            }
        };
        return React.createElement("form", { ref: formRef, onSubmit: onSubmit },
            React.createElement("div", { className: "form-row" },
                React.createElement("label", null, "Room code:"),
                React.createElement("input", { name: "room", type: "text", onInput: onInput, value: gameId })),
            props.player && React.createElement("div", { className: "form-row" },
                React.createElement("label", null, "Name:"),
                React.createElement("input", { name: "name", type: "text", onInput: onInput, value: name })),
            React.createElement("div", { className: "form-row" },
                React.createElement("input", { type: "submit", value: "Enter", disabled: disabled })));
    }

    function useWindowSize() {
        function getSize() {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        }
        var _a = React.useState(getSize), windowSize = _a[0], setWindowSize = _a[1];
        React.useEffect(function () {
            function handleResize() {
                setWindowSize(getSize());
            }
            window.addEventListener('resize', handleResize);
            return function () { return window.removeEventListener('resize', handleResize); };
        }, []);
        return windowSize;
    }
    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
    }

    function PlayerApp() {
        var _a = React.useState((function () {
            var gameId = getQueryVariable('g');
            var playerId = getQueryVariable('p');
            if ((gameId === null || gameId === void 0 ? void 0 : gameId.length) == 4 && playerId) {
                return { type: 'player_join', gameId: gameId, playerId: playerId };
            }
            else {
                return null;
            }
        })()), joinGameMsg = _a[0], setJoinGameMsg = _a[1];
        var _b = React.useState(null), state = _b[0], setState = _b[1];
        var _c = React.useState(null), error = _c[0], setError = _c[1];
        var _d = useWebSocket(function (msg) {
            switch (msg.type) {
                case 'game_joined':
                    var joinMsg = {
                        type: 'player_join',
                        gameId: msg.gameId,
                        playerId: msg.playerId
                    };
                    setJoinGameMsg(joinMsg);
                    window.history.pushState('', '', "?m=p&g=" + msg.gameId + "&p=" + msg.playerId);
                    break;
                case 'update':
                    setState(msg.state);
                    setError(null);
                    break;
                case 'error':
                    setError(msg.error);
                    throw new Error(msg.error);
                default:
                    throw new Error('Unknown message from server: ' + msg.type);
            }
        }, function () {
            if (joinGameMsg)
                send(joinGameMsg);
        }), connected = _d[0], send = _d[1];
        var sendConnect = function (params) { return send(__assign({ type: 'player_join' }, params)); };
        var sendAction = function (data) {
            var _a, _b;
            return send({
                type: 'player_action',
                action: (_b = (_a = state === null || state === void 0 ? void 0 : state.action) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : null,
                data: data
            });
        };
        var controls, controlsClass = '';
        if (state) {
            if (state.isDead) {
                controls = React.createElement("p", null, "Sorry, you're dead :(");
            }
            var action = state.action;
            switch (action === null || action === void 0 ? void 0 : action.type) {
                case 'lobby':
                    var num = state.players.length;
                    controlsClass = 'centre';
                    controls = React.createElement(React.Fragment, null,
                        React.createElement("p", null, num == 1 ? '1 player has joined.' : num + ' players have joined.'),
                        state.action.canStart && (React.createElement("div", { className: "form-row" },
                            React.createElement("button", { onClick: function () { return sendAction('start'); } }, "Start game"))));
                    break;
                case 'nightRound':
                    controls = React.createElement("div", null,
                        React.createElement("p", null, "Your secret role is:"),
                        React.createElement("p", null, state.role),
                        React.createElement("div", { className: "form-row" },
                            React.createElement("button", { onClick: function () { return sendAction('done'); } }, "Okay")));
                    break;
                case 'choosePlayer':
                    controls = React.createElement("div", null,
                        React.createElement("p", null,
                            "Please choose a player (",
                            action.subtype,
                            "):"),
                        action.players.map(function (p) { return state.players[p]; }).map(function (player) { return (React.createElement("div", { className: "form-row" },
                            React.createElement("button", { onClick: function () { return sendAction(player.id); } }, player.name))); }));
                    break;
                case 'vote':
                    controls = React.createElement("div", null,
                        React.createElement("p", null, "Please vote:"),
                        React.createElement("div", { className: "form-row" },
                            React.createElement("button", { onClick: function () { return sendAction(true); } }, "JA!")),
                        React.createElement("div", { className: "form-row" },
                            React.createElement("button", { onClick: function () { return sendAction(false); } }, "NEIN!")));
                    break;
                case 'legislative':
                    controls = React.createElement("div", null,
                        React.createElement("p", null, "Choose a policy to discard:"),
                        action.cards.map(function (card, idx) { return (React.createElement("div", { className: "form-row" },
                            React.createElement("button", { onClick: function () { return sendAction({ type: 'discard', idx: idx }); } }, card))); }),
                        action.canVeto && (React.createElement("div", { className: "form-row" },
                            React.createElement("button", { onClick: function () { return sendAction({ type: 'veto' }); } }, "VETO"))));
                    break;
                case 'policyPeak':
                    controls = React.createElement("div", null,
                        React.createElement("p", null, "Here are the top three cards:"),
                        action.cards.map(function (card) { return React.createElement("p", null, card); }),
                        React.createElement("div", { className: "form-row" },
                            React.createElement("button", { onClick: function () { return sendAction('done'); } }, "Okay")));
                    break;
                case 'vetoConsent':
                    controls = React.createElement("div", null,
                        React.createElement("p", null, "Do you consent to the veto?"),
                        React.createElement("div", { className: "form-row" },
                            React.createElement("button", { onClick: function () { return sendAction(true); } }, "JA!")),
                        React.createElement("div", { className: "form-row" },
                            React.createElement("button", { onClick: function () { return sendAction(false); } }, "NEIN!")));
                    break;
                case 'gameover':
                    controls = React.createElement("p", null,
                        "The ",
                        action.winner,
                        "s win!");
                    break;
            }
        }
        else {
            controls = React.createElement(Connect, { player: true, connect: sendConnect });
        }
        return React.createElement("div", null,
            React.createElement("div", { className: "connection" + (connected ? ' on' : '') },
                connected ? 'Connected' : 'Offline',
                React.createElement("div", { className: "gameid" }, joinGameMsg === null || joinGameMsg === void 0 ? void 0 : joinGameMsg.gameId)),
            state && React.createElement("div", null, state.role),
            React.createElement("div", { className: "controls " + controlsClass }, controls),
            React.createElement("div", { className: "error" + (error ? ' visible' : '') }, error));
    }

    function _extends() {
      _extends = Object.assign || function (target) {
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

      return _extends.apply(this, arguments);
    }

    function _objectWithoutPropertiesLoose(source, excluded) {
      if (source == null) return {};
      var target = {};
      var sourceKeys = Object.keys(source);
      var key, i;

      for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
      }

      return target;
    }

    const is = {
      arr: Array.isArray,
      obj: a => Object.prototype.toString.call(a) === '[object Object]',
      fun: a => typeof a === 'function',
      str: a => typeof a === 'string',
      num: a => typeof a === 'number',
      und: a => a === void 0,
      nul: a => a === null,
      set: a => a instanceof Set,
      map: a => a instanceof Map,

      equ(a, b) {
        if (typeof a !== typeof b) return false;
        if (is.str(a) || is.num(a)) return a === b;
        if (is.obj(a) && is.obj(b) && Object.keys(a).length + Object.keys(b).length === 0) return true;
        let i;

        for (i in a) if (!(i in b)) return false;

        for (i in b) if (a[i] !== b[i]) return false;

        return is.und(i) ? a === b : true;
      }

    };
    function merge(target, lowercase) {
      if (lowercase === void 0) {
        lowercase = true;
      }

      return object => (is.arr(object) ? object : Object.keys(object)).reduce((acc, element) => {
        const key = lowercase ? element[0].toLowerCase() + element.substring(1) : element;
        acc[key] = target(key);
        return acc;
      }, target);
    }
    function useForceUpdate() {
      const _useState = React.useState(false),
            f = _useState[1];

      const forceUpdate = React.useCallback(() => f(v => !v), []);
      return forceUpdate;
    }
    function withDefault(value, defaultValue) {
      return is.und(value) || is.nul(value) ? defaultValue : value;
    }
    function toArray(a) {
      return !is.und(a) ? is.arr(a) ? a : [a] : [];
    }
    function callProp(obj) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return is.fun(obj) ? obj(...args) : obj;
    }

    function getForwardProps(props) {
      const to = props.to,
            from = props.from,
            config = props.config,
            onStart = props.onStart,
            onRest = props.onRest,
            onFrame = props.onFrame,
            children = props.children,
            reset = props.reset,
            reverse = props.reverse,
            force = props.force,
            immediate = props.immediate,
            delay = props.delay,
            attach = props.attach,
            destroyed = props.destroyed,
            interpolateTo = props.interpolateTo,
            ref = props.ref,
            lazy = props.lazy,
            forward = _objectWithoutPropertiesLoose(props, ["to", "from", "config", "onStart", "onRest", "onFrame", "children", "reset", "reverse", "force", "immediate", "delay", "attach", "destroyed", "interpolateTo", "ref", "lazy"]);

      return forward;
    }

    function interpolateTo(props) {
      const forward = getForwardProps(props);
      if (is.und(forward)) return _extends({
        to: forward
      }, props);
      const rest = Object.keys(props).reduce((a, k) => !is.und(forward[k]) ? a : _extends({}, a, {
        [k]: props[k]
      }), {});
      return _extends({
        to: forward
      }, rest);
    }
    function handleRef(ref, forward) {
      if (forward) {
        // If it's a function, assume it's a ref callback
        if (is.fun(forward)) forward(ref);else if (is.obj(forward)) {
          forward.current = ref;
        }
      }

      return ref;
    }

    class Animated {
      constructor() {
        this.payload = void 0;
        this.children = [];
      }

      getAnimatedValue() {
        return this.getValue();
      }

      getPayload() {
        return this.payload || this;
      }

      attach() {}

      detach() {}

      getChildren() {
        return this.children;
      }

      addChild(child) {
        if (this.children.length === 0) this.attach();
        this.children.push(child);
      }

      removeChild(child) {
        const index = this.children.indexOf(child);
        this.children.splice(index, 1);
        if (this.children.length === 0) this.detach();
      }

    }
    class AnimatedArray extends Animated {
      constructor() {
        super(...arguments);
        this.payload = [];

        this.attach = () => this.payload.forEach(p => p instanceof Animated && p.addChild(this));

        this.detach = () => this.payload.forEach(p => p instanceof Animated && p.removeChild(this));
      }

    }
    class AnimatedObject extends Animated {
      constructor() {
        super(...arguments);
        this.payload = {};

        this.attach = () => Object.values(this.payload).forEach(s => s instanceof Animated && s.addChild(this));

        this.detach = () => Object.values(this.payload).forEach(s => s instanceof Animated && s.removeChild(this));
      }

      getValue(animated) {
        if (animated === void 0) {
          animated = false;
        }

        const payload = {};

        for (const key in this.payload) {
          const value = this.payload[key];
          if (animated && !(value instanceof Animated)) continue;
          payload[key] = value instanceof Animated ? value[animated ? 'getAnimatedValue' : 'getValue']() : value;
        }

        return payload;
      }

      getAnimatedValue() {
        return this.getValue(true);
      }

    }

    let applyAnimatedValues;
    function injectApplyAnimatedValues(fn, transform) {
      applyAnimatedValues = {
        fn,
        transform
      };
    }
    let colorNames;
    function injectColorNames(names) {
      colorNames = names;
    }
    let requestFrame = cb => typeof window !== 'undefined' ? window.requestAnimationFrame(cb) : -1;
    let interpolation;
    function injectStringInterpolator(fn) {
      interpolation = fn;
    }
    let now = () => Date.now();
    let animatedApi = node => node.current;
    let createAnimatedStyle;
    function injectCreateAnimatedStyle(factory) {
      createAnimatedStyle = factory;
    }

    /**
     * Wraps the `style` property with `AnimatedStyle`.
     */

    class AnimatedProps extends AnimatedObject {
      constructor(props, callback) {
        super();
        this.update = void 0;
        this.payload = !props.style ? props : _extends({}, props, {
          style: createAnimatedStyle(props.style)
        });
        this.update = callback;
        this.attach();
      }

    }

    const isFunctionComponent = val => is.fun(val) && !(val.prototype instanceof React__default.Component);

    const createAnimatedComponent = Component => {
      const AnimatedComponent = React.forwardRef((props, ref) => {
        const forceUpdate = useForceUpdate();
        const mounted = React.useRef(true);
        const propsAnimated = React.useRef(null);
        const node = React.useRef(null);
        const attachProps = React.useCallback(props => {
          const oldPropsAnimated = propsAnimated.current;

          const callback = () => {
            let didUpdate = false;

            if (node.current) {
              didUpdate = applyAnimatedValues.fn(node.current, propsAnimated.current.getAnimatedValue());
            }

            if (!node.current || didUpdate === false) {
              // If no referenced node has been found, or the update target didn't have a
              // native-responder, then forceUpdate the animation ...
              forceUpdate();
            }
          };

          propsAnimated.current = new AnimatedProps(props, callback);
          oldPropsAnimated && oldPropsAnimated.detach();
        }, []);
        React.useEffect(() => () => {
          mounted.current = false;
          propsAnimated.current && propsAnimated.current.detach();
        }, []);
        React.useImperativeHandle(ref, () => animatedApi(node));
        attachProps(props);

        const _getValue = propsAnimated.current.getValue(),
              scrollTop = _getValue.scrollTop,
              scrollLeft = _getValue.scrollLeft,
              animatedProps = _objectWithoutPropertiesLoose(_getValue, ["scrollTop", "scrollLeft"]); // Functions cannot have refs, see:
        // See: https://github.com/react-spring/react-spring/issues/569


        const refFn = isFunctionComponent(Component) ? undefined : childRef => node.current = handleRef(childRef, ref);
        return React__default.createElement(Component, _extends({}, animatedProps, {
          ref: refFn
        }));
      });
      return AnimatedComponent;
    };

    let active = false;
    const controllers = new Set();

    const update = () => {
      if (!active) return false;
      let time = now();

      for (let controller of controllers) {
        let isActive = false;

        for (let configIdx = 0; configIdx < controller.configs.length; configIdx++) {
          let config = controller.configs[configIdx];
          let endOfAnimation, lastTime;

          for (let valIdx = 0; valIdx < config.animatedValues.length; valIdx++) {
            let animation = config.animatedValues[valIdx]; // If an animation is done, skip, until all of them conclude

            if (animation.done) continue;
            let from = config.fromValues[valIdx];
            let to = config.toValues[valIdx];
            let position = animation.lastPosition;
            let isAnimated = to instanceof Animated;
            let velocity = Array.isArray(config.initialVelocity) ? config.initialVelocity[valIdx] : config.initialVelocity;
            if (isAnimated) to = to.getValue(); // Conclude animation if it's either immediate, or from-values match end-state

            if (config.immediate) {
              animation.setValue(to);
              animation.done = true;
              continue;
            } // Break animation when string values are involved


            if (typeof from === 'string' || typeof to === 'string') {
              animation.setValue(to);
              animation.done = true;
              continue;
            }

            if (config.duration !== void 0) {
              /** Duration easing */
              position = from + config.easing((time - animation.startTime) / config.duration) * (to - from);
              endOfAnimation = time >= animation.startTime + config.duration;
            } else if (config.decay) {
              /** Decay easing */
              position = from + velocity / (1 - 0.998) * (1 - Math.exp(-(1 - 0.998) * (time - animation.startTime)));
              endOfAnimation = Math.abs(animation.lastPosition - position) < 0.1;
              if (endOfAnimation) to = position;
            } else {
              /** Spring easing */
              lastTime = animation.lastTime !== void 0 ? animation.lastTime : time;
              velocity = animation.lastVelocity !== void 0 ? animation.lastVelocity : config.initialVelocity; // If we lost a lot of frames just jump to the end.

              if (time > lastTime + 64) lastTime = time; // http://gafferongames.com/game-physics/fix-your-timestep/

              let numSteps = Math.floor(time - lastTime);

              for (let i = 0; i < numSteps; ++i) {
                let force = -config.tension * (position - to);
                let damping = -config.friction * velocity;
                let acceleration = (force + damping) / config.mass;
                velocity = velocity + acceleration * 1 / 1000;
                position = position + velocity * 1 / 1000;
              } // Conditions for stopping the spring animation


              let isOvershooting = config.clamp && config.tension !== 0 ? from < to ? position > to : position < to : false;
              let isVelocity = Math.abs(velocity) <= config.precision;
              let isDisplacement = config.tension !== 0 ? Math.abs(to - position) <= config.precision : true;
              endOfAnimation = isOvershooting || isVelocity && isDisplacement;
              animation.lastVelocity = velocity;
              animation.lastTime = time;
            } // Trails aren't done until their parents conclude


            if (isAnimated && !config.toValues[valIdx].done) endOfAnimation = false;

            if (endOfAnimation) {
              // Ensure that we end up with a round value
              if (animation.value !== to) position = to;
              animation.done = true;
            } else isActive = true;

            animation.setValue(position);
            animation.lastPosition = position;
          } // Keep track of updated values only when necessary


          if (controller.props.onFrame) controller.values[config.name] = config.interpolation.getValue();
        } // Update callbacks in the end of the frame


        if (controller.props.onFrame) controller.props.onFrame(controller.values); // Either call onEnd or next frame

        if (!isActive) {
          controllers.delete(controller);
          controller.stop(true);
        }
      } // Loop over as long as there are controllers ...


      if (controllers.size) {
        requestFrame(update);
      } else {
        active = false;
      }

      return active;
    };

    const start = controller => {
      if (!controllers.has(controller)) controllers.add(controller);

      if (!active) {
        active = true;
        requestFrame(update);
      }
    };

    const stop = controller => {
      if (controllers.has(controller)) controllers.delete(controller);
    };

    function createInterpolator(range, output, extrapolate) {
      if (typeof range === 'function') {
        return range;
      }

      if (Array.isArray(range)) {
        return createInterpolator({
          range,
          output: output,
          extrapolate
        });
      }

      if (interpolation && typeof range.output[0] === 'string') {
        return interpolation(range);
      }

      const config = range;
      const outputRange = config.output;
      const inputRange = config.range || [0, 1];
      const extrapolateLeft = config.extrapolateLeft || config.extrapolate || 'extend';
      const extrapolateRight = config.extrapolateRight || config.extrapolate || 'extend';

      const easing = config.easing || (t => t);

      return input => {
        const range = findRange(input, inputRange);
        return interpolate(input, inputRange[range], inputRange[range + 1], outputRange[range], outputRange[range + 1], easing, extrapolateLeft, extrapolateRight, config.map);
      };
    }

    function interpolate(input, inputMin, inputMax, outputMin, outputMax, easing, extrapolateLeft, extrapolateRight, map) {
      let result = map ? map(input) : input; // Extrapolate

      if (result < inputMin) {
        if (extrapolateLeft === 'identity') return result;else if (extrapolateLeft === 'clamp') result = inputMin;
      }

      if (result > inputMax) {
        if (extrapolateRight === 'identity') return result;else if (extrapolateRight === 'clamp') result = inputMax;
      }

      if (outputMin === outputMax) return outputMin;
      if (inputMin === inputMax) return input <= inputMin ? outputMin : outputMax; // Input Range

      if (inputMin === -Infinity) result = -result;else if (inputMax === Infinity) result = result - inputMin;else result = (result - inputMin) / (inputMax - inputMin); // Easing

      result = easing(result); // Output Range

      if (outputMin === -Infinity) result = -result;else if (outputMax === Infinity) result = result + outputMin;else result = result * (outputMax - outputMin) + outputMin;
      return result;
    }

    function findRange(input, inputRange) {
      for (var i = 1; i < inputRange.length - 1; ++i) if (inputRange[i] >= input) break;

      return i - 1;
    }

    class AnimatedInterpolation extends AnimatedArray {
      constructor(parents, range, output, extrapolate) {
        super();
        this.calc = void 0;
        this.payload = parents instanceof AnimatedArray && !(parents instanceof AnimatedInterpolation) ? parents.getPayload() : Array.isArray(parents) ? parents : [parents];
        this.calc = createInterpolator(range, output, extrapolate);
      }

      getValue() {
        return this.calc(...this.payload.map(value => value.getValue()));
      }

      updateConfig(range, output, extrapolate) {
        this.calc = createInterpolator(range, output, extrapolate);
      }

      interpolate(range, output, extrapolate) {
        return new AnimatedInterpolation(this, range, output, extrapolate);
      }

    }

    const interpolate$1 = (parents, range, output) => parents && new AnimatedInterpolation(parents, range, output);

    /**
     * Animated works by building a directed acyclic graph of dependencies
     * transparently when you render your Animated components.
     *
     *               new Animated.Value(0)
     *     .interpolate()        .interpolate()    new Animated.Value(1)
     *         opacity               translateY      scale
     *          style                         transform
     *         View#234                         style
     *                                         View#123
     *
     * A) Top Down phase
     * When an AnimatedValue is updated, we recursively go down through this
     * graph in order to find leaf nodes: the views that we flag as needing
     * an update.
     *
     * B) Bottom Up phase
     * When a view is flagged as needing an update, we recursively go back up
     * in order to build the new value that it needs. The reason why we need
     * this two-phases process is to deal with composite props such as
     * transform which can receive values from multiple parents.
     */
    function addAnimatedStyles(node, styles) {
      if ('update' in node) {
        styles.add(node);
      } else {
        node.getChildren().forEach(child => addAnimatedStyles(child, styles));
      }
    }

    class AnimatedValue extends Animated {
      constructor(_value) {
        var _this;

        super();
        _this = this;
        this.animatedStyles = new Set();
        this.value = void 0;
        this.startPosition = void 0;
        this.lastPosition = void 0;
        this.lastVelocity = void 0;
        this.startTime = void 0;
        this.lastTime = void 0;
        this.done = false;

        this.setValue = function (value, flush) {
          if (flush === void 0) {
            flush = true;
          }

          _this.value = value;
          if (flush) _this.flush();
        };

        this.value = _value;
        this.startPosition = _value;
        this.lastPosition = _value;
      }

      flush() {
        if (this.animatedStyles.size === 0) {
          addAnimatedStyles(this, this.animatedStyles);
        }

        this.animatedStyles.forEach(animatedStyle => animatedStyle.update());
      }

      clearStyles() {
        this.animatedStyles.clear();
      }

      getValue() {
        return this.value;
      }

      interpolate(range, output, extrapolate) {
        return new AnimatedInterpolation(this, range, output, extrapolate);
      }

    }

    class AnimatedValueArray extends AnimatedArray {
      constructor(values) {
        super();
        this.payload = values.map(n => new AnimatedValue(n));
      }

      setValue(value, flush) {
        if (flush === void 0) {
          flush = true;
        }

        if (Array.isArray(value)) {
          if (value.length === this.payload.length) {
            value.forEach((v, i) => this.payload[i].setValue(v, flush));
          }
        } else {
          this.payload.forEach(p => p.setValue(value, flush));
        }
      }

      getValue() {
        return this.payload.map(v => v.getValue());
      }

      interpolate(range, output) {
        return new AnimatedInterpolation(this, range, output);
      }

    }

    let G = 0;

    class Controller {
      constructor() {
        this.id = void 0;
        this.idle = true;
        this.hasChanged = false;
        this.guid = 0;
        this.local = 0;
        this.props = {};
        this.merged = {};
        this.animations = {};
        this.interpolations = {};
        this.values = {};
        this.configs = [];
        this.listeners = [];
        this.queue = [];
        this.localQueue = void 0;

        this.getValues = () => this.interpolations;

        this.id = G++;
      }
      /** update(props)
       *  This function filters input props and creates an array of tasks which are executed in .start()
       *  Each task is allowed to carry a delay, which means it can execute asnychroneously */


      update(args) {
        //this._id = n + this.id
        if (!args) return this; // Extract delay and the to-prop from props

        const _ref = interpolateTo(args),
              _ref$delay = _ref.delay,
              delay = _ref$delay === void 0 ? 0 : _ref$delay,
              to = _ref.to,
              props = _objectWithoutPropertiesLoose(_ref, ["delay", "to"]);

        if (is.arr(to) || is.fun(to)) {
          // If config is either a function or an array queue it up as is
          this.queue.push(_extends({}, props, {
            delay,
            to
          }));
        } else if (to) {
          // Otherwise go through each key since it could be delayed individually
          let ops = {};
          Object.entries(to).forEach((_ref2) => {
            let k = _ref2[0],
                v = _ref2[1];

            // Fetch delay and create an entry, consisting of the to-props, the delay, and basic props
            const entry = _extends({
              to: {
                [k]: v
              },
              delay: callProp(delay, k)
            }, props);

            const previous = ops[entry.delay] && ops[entry.delay].to;
            ops[entry.delay] = _extends({}, ops[entry.delay], entry, {
              to: _extends({}, previous, entry.to)
            });
          });
          this.queue = Object.values(ops);
        } // Sort queue, so that async calls go last


        this.queue = this.queue.sort((a, b) => a.delay - b.delay); // Diff the reduced props immediately (they'll contain the from-prop and some config)

        this.diff(props);
        return this;
      }
      /** start(onEnd)
       *  This function either executes a queue, if present, or starts the frameloop, which animates */


      start(onEnd) {
        // If a queue is present we must excecute it
        if (this.queue.length) {
          this.idle = false; // Updates can interrupt trailing queues, in that case we just merge values

          if (this.localQueue) {
            this.localQueue.forEach((_ref3) => {
              let _ref3$from = _ref3.from,
                  from = _ref3$from === void 0 ? {} : _ref3$from,
                  _ref3$to = _ref3.to,
                  to = _ref3$to === void 0 ? {} : _ref3$to;
              if (is.obj(from)) this.merged = _extends({}, from, this.merged);
              if (is.obj(to)) this.merged = _extends({}, this.merged, to);
            });
          } // The guid helps us tracking frames, a new queue over an old one means an override
          // We discard async calls in that caseÍ


          const local = this.local = ++this.guid;
          const queue = this.localQueue = this.queue;
          this.queue = []; // Go through each entry and execute it

          queue.forEach((_ref4, index) => {
            let delay = _ref4.delay,
                props = _objectWithoutPropertiesLoose(_ref4, ["delay"]);

            const cb = finished => {
              if (index === queue.length - 1 && local === this.guid && finished) {
                this.idle = true;
                if (this.props.onRest) this.props.onRest(this.merged);
              }

              if (onEnd) onEnd();
            }; // Entries can be delayed, ansyc or immediate


            let async = is.arr(props.to) || is.fun(props.to);

            if (delay) {
              setTimeout(() => {
                if (local === this.guid) {
                  if (async) this.runAsync(props, cb);else this.diff(props).start(cb);
                }
              }, delay);
            } else if (async) this.runAsync(props, cb);else this.diff(props).start(cb);
          });
        } // Otherwise we kick of the frameloop
        else {
            if (is.fun(onEnd)) this.listeners.push(onEnd);
            if (this.props.onStart) this.props.onStart();
            start(this);
          }

        return this;
      }

      stop(finished) {
        this.listeners.forEach(onEnd => onEnd(finished));
        this.listeners = [];
        return this;
      }
      /** Pause sets onEnd listeners free, but also removes the controller from the frameloop */


      pause(finished) {
        this.stop(true);
        if (finished) stop(this);
        return this;
      }

      runAsync(_ref5, onEnd) {
        var _this = this;

        let delay = _ref5.delay,
            props = _objectWithoutPropertiesLoose(_ref5, ["delay"]);

        const local = this.local; // If "to" is either a function or an array it will be processed async, therefor "to" should be empty right now
        // If the view relies on certain values "from" has to be present

        let queue = Promise.resolve(undefined);

        if (is.arr(props.to)) {
          for (let i = 0; i < props.to.length; i++) {
            const index = i;

            const fresh = _extends({}, props, interpolateTo(props.to[index]));

            if (is.arr(fresh.config)) fresh.config = fresh.config[index];
            queue = queue.then(() => {
              //this.stop()
              if (local === this.guid) return new Promise(r => this.diff(fresh).start(r));
            });
          }
        } else if (is.fun(props.to)) {
          let index = 0;
          let last;
          queue = queue.then(() => props.to( // next(props)
          p => {
            const fresh = _extends({}, props, interpolateTo(p));

            if (is.arr(fresh.config)) fresh.config = fresh.config[index];
            index++; //this.stop()

            if (local === this.guid) return last = new Promise(r => this.diff(fresh).start(r));
            return;
          }, // cancel()
          function (finished) {
            if (finished === void 0) {
              finished = true;
            }

            return _this.stop(finished);
          }).then(() => last));
        }

        queue.then(onEnd);
      }

      diff(props) {
        this.props = _extends({}, this.props, props);
        let _this$props = this.props,
            _this$props$from = _this$props.from,
            from = _this$props$from === void 0 ? {} : _this$props$from,
            _this$props$to = _this$props.to,
            to = _this$props$to === void 0 ? {} : _this$props$to,
            _this$props$config = _this$props.config,
            config = _this$props$config === void 0 ? {} : _this$props$config,
            reverse = _this$props.reverse,
            attach = _this$props.attach,
            reset = _this$props.reset,
            immediate = _this$props.immediate; // Reverse values when requested

        if (reverse) {
          var _ref6 = [to, from];
          from = _ref6[0];
          to = _ref6[1];
        } // This will collect all props that were ever set, reset merged props when necessary


        this.merged = _extends({}, from, this.merged, to);
        this.hasChanged = false; // Attachment handling, trailed springs can "attach" themselves to a previous spring

        let target = attach && attach(this); // Reduces input { name: value } pairs into animated values

        this.animations = Object.entries(this.merged).reduce((acc, _ref7) => {
          let name = _ref7[0],
              value = _ref7[1];
          // Issue cached entries, except on reset
          let entry = acc[name] || {}; // Figure out what the value is supposed to be

          const isNumber = is.num(value);
          const isString = is.str(value) && !value.startsWith('#') && !/\d/.test(value) && !colorNames[value];
          const isArray = is.arr(value);
          const isInterpolation = !isNumber && !isArray && !isString;
          let fromValue = !is.und(from[name]) ? from[name] : value;
          let toValue = isNumber || isArray ? value : isString ? value : 1;
          let toConfig = callProp(config, name);
          if (target) toValue = target.animations[name].parent;
          let parent = entry.parent,
              interpolation$$1 = entry.interpolation,
              toValues = toArray(target ? toValue.getPayload() : toValue),
              animatedValues;
          let newValue = value;
          if (isInterpolation) newValue = interpolation({
            range: [0, 1],
            output: [value, value]
          })(1);
          let currentValue = interpolation$$1 && interpolation$$1.getValue(); // Change detection flags

          const isFirst = is.und(parent);
          const isActive = !isFirst && entry.animatedValues.some(v => !v.done);
          const currentValueDiffersFromGoal = !is.equ(newValue, currentValue);
          const hasNewGoal = !is.equ(newValue, entry.previous);
          const hasNewConfig = !is.equ(toConfig, entry.config); // Change animation props when props indicate a new goal (new value differs from previous one)
          // and current values differ from it. Config changes trigger a new update as well (though probably shouldn't?)

          if (reset || hasNewGoal && currentValueDiffersFromGoal || hasNewConfig) {
            // Convert regular values into animated values, ALWAYS re-use if possible
            if (isNumber || isString) parent = interpolation$$1 = entry.parent || new AnimatedValue(fromValue);else if (isArray) parent = interpolation$$1 = entry.parent || new AnimatedValueArray(fromValue);else if (isInterpolation) {
              let prev = entry.interpolation && entry.interpolation.calc(entry.parent.value);
              prev = prev !== void 0 && !reset ? prev : fromValue;

              if (entry.parent) {
                parent = entry.parent;
                parent.setValue(0, false);
              } else parent = new AnimatedValue(0);

              const range = {
                output: [prev, value]
              };

              if (entry.interpolation) {
                interpolation$$1 = entry.interpolation;
                entry.interpolation.updateConfig(range);
              } else interpolation$$1 = parent.interpolate(range);
            }
            toValues = toArray(target ? toValue.getPayload() : toValue);
            animatedValues = toArray(parent.getPayload());
            if (reset && !isInterpolation) parent.setValue(fromValue, false);
            this.hasChanged = true; // Reset animated values

            animatedValues.forEach(value => {
              value.startPosition = value.value;
              value.lastPosition = value.value;
              value.lastVelocity = isActive ? value.lastVelocity : undefined;
              value.lastTime = isActive ? value.lastTime : undefined;
              value.startTime = now();
              value.done = false;
              value.animatedStyles.clear();
            }); // Set immediate values

            if (callProp(immediate, name)) {
              parent.setValue(isInterpolation ? toValue : value, false);
            }

            return _extends({}, acc, {
              [name]: _extends({}, entry, {
                name,
                parent,
                interpolation: interpolation$$1,
                animatedValues,
                toValues,
                previous: newValue,
                config: toConfig,
                fromValues: toArray(parent.getValue()),
                immediate: callProp(immediate, name),
                initialVelocity: withDefault(toConfig.velocity, 0),
                clamp: withDefault(toConfig.clamp, false),
                precision: withDefault(toConfig.precision, 0.01),
                tension: withDefault(toConfig.tension, 170),
                friction: withDefault(toConfig.friction, 26),
                mass: withDefault(toConfig.mass, 1),
                duration: toConfig.duration,
                easing: withDefault(toConfig.easing, t => t),
                decay: toConfig.decay
              })
            });
          } else {
            if (!currentValueDiffersFromGoal) {
              // So ... the current target value (newValue) appears to be different from the previous value,
              // which normally constitutes an update, but the actual value (currentValue) matches the target!
              // In order to resolve this without causing an animation update we silently flag the animation as done,
              // which it technically is. Interpolations also needs a config update with their target set to 1.
              if (isInterpolation) {
                parent.setValue(1, false);
                interpolation$$1.updateConfig({
                  output: [newValue, newValue]
                });
              }

              parent.done = true;
              this.hasChanged = true;
              return _extends({}, acc, {
                [name]: _extends({}, acc[name], {
                  previous: newValue
                })
              });
            }

            return acc;
          }
        }, this.animations);

        if (this.hasChanged) {
          // Make animations available to frameloop
          this.configs = Object.values(this.animations);
          this.values = {};
          this.interpolations = {};

          for (let key in this.animations) {
            this.interpolations[key] = this.animations[key].interpolation;
            this.values[key] = this.animations[key].interpolation.getValue();
          }
        }

        return this;
      }

      destroy() {
        this.stop();
        this.props = {};
        this.merged = {};
        this.animations = {};
        this.interpolations = {};
        this.values = {};
        this.configs = [];
        this.local = 0;
      }

    }

    /** API
     * const props = useSprings(number, [{ ... }, { ... }, ...])
     * const [props, set] = useSprings(number, (i, controller) => ({ ... }))
     */

    const useSprings = (length, props) => {
      const mounted = React.useRef(false);
      const ctrl = React.useRef();
      const isFn = is.fun(props); // The controller maintains the animation values, starts and stops animations

      const _useMemo = React.useMemo(() => {
        // Remove old controllers
        if (ctrl.current) {
          ctrl.current.map(c => c.destroy());
          ctrl.current = undefined;
        }

        let ref;
        return [new Array(length).fill().map((_, i) => {
          const ctrl = new Controller();
          const newProps = isFn ? callProp(props, i, ctrl) : props[i];
          if (i === 0) ref = newProps.ref;
          ctrl.update(newProps);
          if (!ref) ctrl.start();
          return ctrl;
        }), ref];
      }, [length]),
            controllers = _useMemo[0],
            ref = _useMemo[1];

      ctrl.current = controllers; // The hooks reference api gets defined here ...

      const api = React.useImperativeHandle(ref, () => ({
        start: () => Promise.all(ctrl.current.map(c => new Promise(r => c.start(r)))),
        stop: finished => ctrl.current.forEach(c => c.stop(finished)),

        get controllers() {
          return ctrl.current;
        }

      })); // This function updates the controllers

      const updateCtrl = React.useMemo(() => updateProps => ctrl.current.map((c, i) => {
        c.update(isFn ? callProp(updateProps, i, c) : updateProps[i]);
        if (!ref) c.start();
      }), [length]); // Update controller if props aren't functional

      React.useEffect(() => {
        if (mounted.current) {
          if (!isFn) updateCtrl(props);
        } else if (!ref) ctrl.current.forEach(c => c.start());
      }); // Update mounted flag and destroy controller on unmount

      React.useEffect(() => (mounted.current = true, () => ctrl.current.forEach(c => c.destroy())), []); // Return animated props, or, anim-props + the update-setter above

      const propValues = ctrl.current.map(c => c.getValues());
      return isFn ? [propValues, updateCtrl, finished => ctrl.current.forEach(c => c.pause(finished))] : propValues;
    };

    /** API
     * const props = useSpring({ ... })
     * const [props, set] = useSpring(() => ({ ... }))
     */

    const useSpring = props => {
      const isFn = is.fun(props);

      const _useSprings = useSprings(1, isFn ? props : [props]),
            result = _useSprings[0],
            set = _useSprings[1],
            pause = _useSprings[2];

      return isFn ? [result[0], set, pause] : result;
    };

    /** API
     * const transitions = useTransition(items, itemKeys, { ... })
     * const [transitions, update] = useTransition(items, itemKeys, () => ({ ... }))
     */

    let guid = 0;
    const ENTER = 'enter';
    const LEAVE = 'leave';
    const UPDATE = 'update';

    const mapKeys = (items, keys) => (typeof keys === 'function' ? items.map(keys) : toArray(keys)).map(String);

    const get = props => {
      let items = props.items,
          _props$keys = props.keys,
          keys = _props$keys === void 0 ? item => item : _props$keys,
          rest = _objectWithoutPropertiesLoose(props, ["items", "keys"]);

      items = toArray(items !== void 0 ? items : null);
      return _extends({
        items,
        keys: mapKeys(items, keys)
      }, rest);
    };

    function useTransition(input, keyTransform, config) {
      const props = _extends({
        items: input,
        keys: keyTransform || (i => i)
      }, config);

      const _get = get(props),
            _get$lazy = _get.lazy,
            lazy = _get$lazy === void 0 ? false : _get$lazy,
            _get$unique = _get.unique,
            _get$reset = _get.reset,
            reset = _get$reset === void 0 ? false : _get$reset,
            enter = _get.enter,
            leave = _get.leave,
            update = _get.update,
            onDestroyed = _get.onDestroyed,
            keys = _get.keys,
            items = _get.items,
            onFrame = _get.onFrame,
            _onRest = _get.onRest,
            onStart = _get.onStart,
            ref = _get.ref,
            extra = _objectWithoutPropertiesLoose(_get, ["lazy", "unique", "reset", "enter", "leave", "update", "onDestroyed", "keys", "items", "onFrame", "onRest", "onStart", "ref"]);

      const forceUpdate = useForceUpdate();
      const mounted = React.useRef(false);
      const state = React.useRef({
        mounted: false,
        first: true,
        deleted: [],
        current: {},
        transitions: [],
        prevProps: {},
        paused: !!props.ref,
        instances: !mounted.current && new Map(),
        forceUpdate
      });
      React.useImperativeHandle(props.ref, () => ({
        start: () => Promise.all(Array.from(state.current.instances).map((_ref) => {
          let c = _ref[1];
          return new Promise(r => c.start(r));
        })),
        stop: finished => Array.from(state.current.instances).forEach((_ref2) => {
          let c = _ref2[1];
          return c.stop(finished);
        }),

        get controllers() {
          return Array.from(state.current.instances).map((_ref3) => {
            let c = _ref3[1];
            return c;
          });
        }

      })); // Update state

      state.current = diffItems(state.current, props);

      if (state.current.changed) {
        // Update state
        state.current.transitions.forEach(transition => {
          const slot = transition.slot,
                from = transition.from,
                to = transition.to,
                config = transition.config,
                trail = transition.trail,
                key = transition.key,
                item = transition.item;
          if (!state.current.instances.has(key)) state.current.instances.set(key, new Controller()); // update the map object

          const ctrl = state.current.instances.get(key);

          const newProps = _extends({}, extra, {
            to,
            from,
            config,
            ref,
            onRest: values => {
              if (state.current.mounted) {
                if (transition.destroyed) {
                  // If no ref is given delete destroyed items immediately
                  if (!ref && !lazy) cleanUp(state, key);
                  if (onDestroyed) onDestroyed(item);
                } // A transition comes to rest once all its springs conclude


                const curInstances = Array.from(state.current.instances);
                const active = curInstances.some((_ref4) => {
                  let c = _ref4[1];
                  return !c.idle;
                });
                if (!active && (ref || lazy) && state.current.deleted.length > 0) cleanUp(state);
                if (_onRest) _onRest(item, slot, values);
              }
            },
            onStart: onStart && (() => onStart(item, slot)),
            onFrame: onFrame && (values => onFrame(item, slot, values)),
            delay: trail,
            reset: reset && slot === ENTER // Update controller

          });

          ctrl.update(newProps);
          if (!state.current.paused) ctrl.start();
        });
      }

      React.useEffect(() => {
        state.current.mounted = mounted.current = true;
        return () => {
          state.current.mounted = mounted.current = false;
          Array.from(state.current.instances).map((_ref5) => {
            let c = _ref5[1];
            return c.destroy();
          });
          state.current.instances.clear();
        };
      }, []);
      return state.current.transitions.map((_ref6) => {
        let item = _ref6.item,
            slot = _ref6.slot,
            key = _ref6.key;
        return {
          item,
          key,
          state: slot,
          props: state.current.instances.get(key).getValues()
        };
      });
    }

    function cleanUp(state, filterKey) {
      const deleted = state.current.deleted;

      for (let _ref7 of deleted) {
        let key = _ref7.key;

        const filter = t => t.key !== key;

        if (is.und(filterKey) || filterKey === key) {
          state.current.instances.delete(key);
          state.current.transitions = state.current.transitions.filter(filter);
          state.current.deleted = state.current.deleted.filter(filter);
        }
      }

      state.current.forceUpdate();
    }

    function diffItems(_ref8, props) {
      let first = _ref8.first,
          prevProps = _ref8.prevProps,
          state = _objectWithoutPropertiesLoose(_ref8, ["first", "prevProps"]);

      let _get2 = get(props),
          items = _get2.items,
          keys = _get2.keys,
          initial = _get2.initial,
          from = _get2.from,
          enter = _get2.enter,
          leave = _get2.leave,
          update = _get2.update,
          _get2$trail = _get2.trail,
          trail = _get2$trail === void 0 ? 0 : _get2$trail,
          unique = _get2.unique,
          config = _get2.config,
          _get2$order = _get2.order,
          order = _get2$order === void 0 ? [ENTER, LEAVE, UPDATE] : _get2$order;

      let _get3 = get(prevProps),
          _keys = _get3.keys,
          _items = _get3.items;

      let current = _extends({}, state.current);

      let deleted = [...state.deleted]; // Compare next keys with current keys

      let currentKeys = Object.keys(current);
      let currentSet = new Set(currentKeys);
      let nextSet = new Set(keys);
      let added = keys.filter(item => !currentSet.has(item));
      let removed = state.transitions.filter(item => !item.destroyed && !nextSet.has(item.originalKey)).map(i => i.originalKey);
      let updated = keys.filter(item => currentSet.has(item));
      let delay = -trail;

      while (order.length) {
        const changeType = order.shift();

        switch (changeType) {
          case ENTER:
            {
              added.forEach((key, index) => {
                // In unique mode, remove fading out transitions if their key comes in again
                if (unique && deleted.find(d => d.originalKey === key)) deleted = deleted.filter(t => t.originalKey !== key);
                const keyIndex = keys.indexOf(key);
                const item = items[keyIndex];
                const slot = first && initial !== void 0 ? 'initial' : ENTER;
                current[key] = {
                  slot,
                  originalKey: key,
                  key: unique ? String(key) : guid++,
                  item,
                  trail: delay = delay + trail,
                  config: callProp(config, item, slot),
                  from: callProp(first ? initial !== void 0 ? initial || {} : from : from, item),
                  to: callProp(enter, item)
                };
              });
              break;
            }

          case LEAVE:
            {
              removed.forEach(key => {
                const keyIndex = _keys.indexOf(key);

                const item = _items[keyIndex];
                const slot = LEAVE;
                deleted.unshift(_extends({}, current[key], {
                  slot,
                  destroyed: true,
                  left: _keys[Math.max(0, keyIndex - 1)],
                  right: _keys[Math.min(_keys.length, keyIndex + 1)],
                  trail: delay = delay + trail,
                  config: callProp(config, item, slot),
                  to: callProp(leave, item)
                }));
                delete current[key];
              });
              break;
            }

          case UPDATE:
            {
              updated.forEach(key => {
                const keyIndex = keys.indexOf(key);
                const item = items[keyIndex];
                const slot = UPDATE;
                current[key] = _extends({}, current[key], {
                  item,
                  slot,
                  trail: delay = delay + trail,
                  config: callProp(config, item, slot),
                  to: callProp(update, item)
                });
              });
              break;
            }
        }
      }

      let out = keys.map(key => current[key]); // This tries to restore order for deleted items by finding their last known siblings
      // only using the left sibling to keep order placement consistent for all deleted items

      deleted.forEach((_ref9) => {
        let left = _ref9.left,
            right = _ref9.right,
            item = _objectWithoutPropertiesLoose(_ref9, ["left", "right"]);

        let pos; // Was it the element on the left, if yes, move there ...

        if ((pos = out.findIndex(t => t.originalKey === left)) !== -1) pos += 1; // And if nothing else helps, move it to the start ¯\_(ツ)_/¯

        pos = Math.max(0, pos);
        out = [...out.slice(0, pos), item, ...out.slice(pos)];
      });
      return _extends({}, state, {
        changed: added.length || removed.length || updated.length,
        first: first && added.length === 0,
        transitions: out,
        current,
        deleted,
        prevProps: props
      });
    }

    class AnimatedStyle extends AnimatedObject {
      constructor(style) {
        if (style === void 0) {
          style = {};
        }

        super();

        if (style.transform && !(style.transform instanceof Animated)) {
          style = applyAnimatedValues.transform(style);
        }

        this.payload = style;
      }

    }

    // http://www.w3.org/TR/css3-color/#svg-color
    const colors = {
      transparent: 0x00000000,
      aliceblue: 0xf0f8ffff,
      antiquewhite: 0xfaebd7ff,
      aqua: 0x00ffffff,
      aquamarine: 0x7fffd4ff,
      azure: 0xf0ffffff,
      beige: 0xf5f5dcff,
      bisque: 0xffe4c4ff,
      black: 0x000000ff,
      blanchedalmond: 0xffebcdff,
      blue: 0x0000ffff,
      blueviolet: 0x8a2be2ff,
      brown: 0xa52a2aff,
      burlywood: 0xdeb887ff,
      burntsienna: 0xea7e5dff,
      cadetblue: 0x5f9ea0ff,
      chartreuse: 0x7fff00ff,
      chocolate: 0xd2691eff,
      coral: 0xff7f50ff,
      cornflowerblue: 0x6495edff,
      cornsilk: 0xfff8dcff,
      crimson: 0xdc143cff,
      cyan: 0x00ffffff,
      darkblue: 0x00008bff,
      darkcyan: 0x008b8bff,
      darkgoldenrod: 0xb8860bff,
      darkgray: 0xa9a9a9ff,
      darkgreen: 0x006400ff,
      darkgrey: 0xa9a9a9ff,
      darkkhaki: 0xbdb76bff,
      darkmagenta: 0x8b008bff,
      darkolivegreen: 0x556b2fff,
      darkorange: 0xff8c00ff,
      darkorchid: 0x9932ccff,
      darkred: 0x8b0000ff,
      darksalmon: 0xe9967aff,
      darkseagreen: 0x8fbc8fff,
      darkslateblue: 0x483d8bff,
      darkslategray: 0x2f4f4fff,
      darkslategrey: 0x2f4f4fff,
      darkturquoise: 0x00ced1ff,
      darkviolet: 0x9400d3ff,
      deeppink: 0xff1493ff,
      deepskyblue: 0x00bfffff,
      dimgray: 0x696969ff,
      dimgrey: 0x696969ff,
      dodgerblue: 0x1e90ffff,
      firebrick: 0xb22222ff,
      floralwhite: 0xfffaf0ff,
      forestgreen: 0x228b22ff,
      fuchsia: 0xff00ffff,
      gainsboro: 0xdcdcdcff,
      ghostwhite: 0xf8f8ffff,
      gold: 0xffd700ff,
      goldenrod: 0xdaa520ff,
      gray: 0x808080ff,
      green: 0x008000ff,
      greenyellow: 0xadff2fff,
      grey: 0x808080ff,
      honeydew: 0xf0fff0ff,
      hotpink: 0xff69b4ff,
      indianred: 0xcd5c5cff,
      indigo: 0x4b0082ff,
      ivory: 0xfffff0ff,
      khaki: 0xf0e68cff,
      lavender: 0xe6e6faff,
      lavenderblush: 0xfff0f5ff,
      lawngreen: 0x7cfc00ff,
      lemonchiffon: 0xfffacdff,
      lightblue: 0xadd8e6ff,
      lightcoral: 0xf08080ff,
      lightcyan: 0xe0ffffff,
      lightgoldenrodyellow: 0xfafad2ff,
      lightgray: 0xd3d3d3ff,
      lightgreen: 0x90ee90ff,
      lightgrey: 0xd3d3d3ff,
      lightpink: 0xffb6c1ff,
      lightsalmon: 0xffa07aff,
      lightseagreen: 0x20b2aaff,
      lightskyblue: 0x87cefaff,
      lightslategray: 0x778899ff,
      lightslategrey: 0x778899ff,
      lightsteelblue: 0xb0c4deff,
      lightyellow: 0xffffe0ff,
      lime: 0x00ff00ff,
      limegreen: 0x32cd32ff,
      linen: 0xfaf0e6ff,
      magenta: 0xff00ffff,
      maroon: 0x800000ff,
      mediumaquamarine: 0x66cdaaff,
      mediumblue: 0x0000cdff,
      mediumorchid: 0xba55d3ff,
      mediumpurple: 0x9370dbff,
      mediumseagreen: 0x3cb371ff,
      mediumslateblue: 0x7b68eeff,
      mediumspringgreen: 0x00fa9aff,
      mediumturquoise: 0x48d1ccff,
      mediumvioletred: 0xc71585ff,
      midnightblue: 0x191970ff,
      mintcream: 0xf5fffaff,
      mistyrose: 0xffe4e1ff,
      moccasin: 0xffe4b5ff,
      navajowhite: 0xffdeadff,
      navy: 0x000080ff,
      oldlace: 0xfdf5e6ff,
      olive: 0x808000ff,
      olivedrab: 0x6b8e23ff,
      orange: 0xffa500ff,
      orangered: 0xff4500ff,
      orchid: 0xda70d6ff,
      palegoldenrod: 0xeee8aaff,
      palegreen: 0x98fb98ff,
      paleturquoise: 0xafeeeeff,
      palevioletred: 0xdb7093ff,
      papayawhip: 0xffefd5ff,
      peachpuff: 0xffdab9ff,
      peru: 0xcd853fff,
      pink: 0xffc0cbff,
      plum: 0xdda0ddff,
      powderblue: 0xb0e0e6ff,
      purple: 0x800080ff,
      rebeccapurple: 0x663399ff,
      red: 0xff0000ff,
      rosybrown: 0xbc8f8fff,
      royalblue: 0x4169e1ff,
      saddlebrown: 0x8b4513ff,
      salmon: 0xfa8072ff,
      sandybrown: 0xf4a460ff,
      seagreen: 0x2e8b57ff,
      seashell: 0xfff5eeff,
      sienna: 0xa0522dff,
      silver: 0xc0c0c0ff,
      skyblue: 0x87ceebff,
      slateblue: 0x6a5acdff,
      slategray: 0x708090ff,
      slategrey: 0x708090ff,
      snow: 0xfffafaff,
      springgreen: 0x00ff7fff,
      steelblue: 0x4682b4ff,
      tan: 0xd2b48cff,
      teal: 0x008080ff,
      thistle: 0xd8bfd8ff,
      tomato: 0xff6347ff,
      turquoise: 0x40e0d0ff,
      violet: 0xee82eeff,
      wheat: 0xf5deb3ff,
      white: 0xffffffff,
      whitesmoke: 0xf5f5f5ff,
      yellow: 0xffff00ff,
      yellowgreen: 0x9acd32ff
    };

    // const INTEGER = '[-+]?\\d+';
    const NUMBER = '[-+]?\\d*\\.?\\d+';
    const PERCENTAGE = NUMBER + '%';

    function call() {
      for (var _len = arguments.length, parts = new Array(_len), _key = 0; _key < _len; _key++) {
        parts[_key] = arguments[_key];
      }

      return '\\(\\s*(' + parts.join(')\\s*,\\s*(') + ')\\s*\\)';
    }

    const rgb = new RegExp('rgb' + call(NUMBER, NUMBER, NUMBER));
    const rgba = new RegExp('rgba' + call(NUMBER, NUMBER, NUMBER, NUMBER));
    const hsl = new RegExp('hsl' + call(NUMBER, PERCENTAGE, PERCENTAGE));
    const hsla = new RegExp('hsla' + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER));
    const hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
    const hex4 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
    const hex6 = /^#([0-9a-fA-F]{6})$/;
    const hex8 = /^#([0-9a-fA-F]{8})$/;

    /*
    https://github.com/react-community/normalize-css-color

    BSD 3-Clause License

    Copyright (c) 2016, React Community
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this
      list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

    * Neither the name of the copyright holder nor the names of its
      contributors may be used to endorse or promote products derived from
      this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
    FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
    DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
    SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
    CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
    OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */
    function normalizeColor(color) {
      let match;

      if (typeof color === 'number') {
        return color >>> 0 === color && color >= 0 && color <= 0xffffffff ? color : null;
      } // Ordered based on occurrences on Facebook codebase


      if (match = hex6.exec(color)) return parseInt(match[1] + 'ff', 16) >>> 0;
      if (colors.hasOwnProperty(color)) return colors[color];

      if (match = rgb.exec(color)) {
        return (parse255(match[1]) << 24 | // r
        parse255(match[2]) << 16 | // g
        parse255(match[3]) << 8 | // b
        0x000000ff) >>> // a
        0;
      }

      if (match = rgba.exec(color)) {
        return (parse255(match[1]) << 24 | // r
        parse255(match[2]) << 16 | // g
        parse255(match[3]) << 8 | // b
        parse1(match[4])) >>> // a
        0;
      }

      if (match = hex3.exec(color)) {
        return parseInt(match[1] + match[1] + // r
        match[2] + match[2] + // g
        match[3] + match[3] + // b
        'ff', // a
        16) >>> 0;
      } // https://drafts.csswg.org/css-color-4/#hex-notation


      if (match = hex8.exec(color)) return parseInt(match[1], 16) >>> 0;

      if (match = hex4.exec(color)) {
        return parseInt(match[1] + match[1] + // r
        match[2] + match[2] + // g
        match[3] + match[3] + // b
        match[4] + match[4], // a
        16) >>> 0;
      }

      if (match = hsl.exec(color)) {
        return (hslToRgb(parse360(match[1]), // h
        parsePercentage(match[2]), // s
        parsePercentage(match[3]) // l
        ) | 0x000000ff) >>> // a
        0;
      }

      if (match = hsla.exec(color)) {
        return (hslToRgb(parse360(match[1]), // h
        parsePercentage(match[2]), // s
        parsePercentage(match[3]) // l
        ) | parse1(match[4])) >>> // a
        0;
      }

      return null;
    }

    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    function hslToRgb(h, s, l) {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const r = hue2rgb(p, q, h + 1 / 3);
      const g = hue2rgb(p, q, h);
      const b = hue2rgb(p, q, h - 1 / 3);
      return Math.round(r * 255) << 24 | Math.round(g * 255) << 16 | Math.round(b * 255) << 8;
    }

    function parse255(str) {
      const int = parseInt(str, 10);
      if (int < 0) return 0;
      if (int > 255) return 255;
      return int;
    }

    function parse360(str) {
      const int = parseFloat(str);
      return (int % 360 + 360) % 360 / 360;
    }

    function parse1(str) {
      const num = parseFloat(str);
      if (num < 0) return 0;
      if (num > 1) return 255;
      return Math.round(num * 255);
    }

    function parsePercentage(str) {
      // parseFloat conveniently ignores the final %
      const int = parseFloat(str);
      if (int < 0) return 0;
      if (int > 100) return 1;
      return int / 100;
    }

    function colorToRgba(input) {
      let int32Color = normalizeColor(input);
      if (int32Color === null) return input;
      int32Color = int32Color || 0;
      let r = (int32Color & 0xff000000) >>> 24;
      let g = (int32Color & 0x00ff0000) >>> 16;
      let b = (int32Color & 0x0000ff00) >>> 8;
      let a = (int32Color & 0x000000ff) / 255;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    } // Problem: https://github.com/animatedjs/animated/pull/102
    // Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662


    const stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g; // Covers rgb, rgba, hsl, hsla
    // Taken from https://gist.github.com/olmokramer/82ccce673f86db7cda5e

    const colorRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gi; // Covers color names (transparent, blue, etc.)

    const colorNamesRegex = new RegExp(`(${Object.keys(colors).join('|')})`, 'g');
    /**
     * Supports string shapes by extracting numbers so new values can be computed,
     * and recombines those values into new strings of the same shape.  Supports
     * things like:
     *
     *   rgba(123, 42, 99, 0.36)           // colors
     *   -45deg                            // values with units
     *   0 2px 2px 0px rgba(0, 0, 0, 0.12) // box shadows
     */

    const createStringInterpolator = config => {
      // Replace colors with rgba
      const outputRange = config.output.map(rangeValue => rangeValue.replace(colorRegex, colorToRgba)).map(rangeValue => rangeValue.replace(colorNamesRegex, colorToRgba));
      const outputRanges = outputRange[0].match(stringShapeRegex).map(() => []);
      outputRange.forEach(value => {
        value.match(stringShapeRegex).forEach((number, i) => outputRanges[i].push(+number));
      });
      const interpolations = outputRange[0].match(stringShapeRegex).map((_value, i) => createInterpolator(_extends({}, config, {
        output: outputRanges[i]
      })));
      return input => {
        let i = 0;
        return outputRange[0] // 'rgba(0, 100, 200, 0)'
        // ->
        // 'rgba(${interpolations[0](input)}, ${interpolations[1](input)}, ...'
        .replace(stringShapeRegex, () => interpolations[i++](input)) // rgba requires that the r,g,b are integers.... so we want to round them, but we *dont* want to
        // round the opacity (4th column).
        .replace(/rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi, (_, p1, p2, p3, p4) => `rgba(${Math.round(p1)}, ${Math.round(p2)}, ${Math.round(p3)}, ${p4})`);
      };
    };

    let isUnitlessNumber = {
      animationIterationCount: true,
      borderImageOutset: true,
      borderImageSlice: true,
      borderImageWidth: true,
      boxFlex: true,
      boxFlexGroup: true,
      boxOrdinalGroup: true,
      columnCount: true,
      columns: true,
      flex: true,
      flexGrow: true,
      flexPositive: true,
      flexShrink: true,
      flexNegative: true,
      flexOrder: true,
      gridRow: true,
      gridRowEnd: true,
      gridRowSpan: true,
      gridRowStart: true,
      gridColumn: true,
      gridColumnEnd: true,
      gridColumnSpan: true,
      gridColumnStart: true,
      fontWeight: true,
      lineClamp: true,
      lineHeight: true,
      opacity: true,
      order: true,
      orphans: true,
      tabSize: true,
      widows: true,
      zIndex: true,
      zoom: true,
      // SVG-related properties
      fillOpacity: true,
      floodOpacity: true,
      stopOpacity: true,
      strokeDasharray: true,
      strokeDashoffset: true,
      strokeMiterlimit: true,
      strokeOpacity: true,
      strokeWidth: true
    };

    const prefixKey = (prefix, key) => prefix + key.charAt(0).toUpperCase() + key.substring(1);

    const prefixes = ['Webkit', 'Ms', 'Moz', 'O'];
    isUnitlessNumber = Object.keys(isUnitlessNumber).reduce((acc, prop) => {
      prefixes.forEach(prefix => acc[prefixKey(prefix, prop)] = acc[prop]);
      return acc;
    }, isUnitlessNumber);

    function dangerousStyleValue(name, value, isCustomProperty) {
      if (value == null || typeof value === 'boolean' || value === '') return '';
      if (!isCustomProperty && typeof value === 'number' && value !== 0 && !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])) return value + 'px'; // Presumes implicit 'px' suffix for unitless numbers

      return ('' + value).trim();
    }

    const attributeCache = {};
    injectCreateAnimatedStyle(style => new AnimatedStyle(style));
    injectStringInterpolator(createStringInterpolator);
    injectColorNames(colors);
    injectApplyAnimatedValues((instance, props) => {
      if (instance.nodeType && instance.setAttribute !== undefined) {
        const style = props.style,
              children = props.children,
              scrollTop = props.scrollTop,
              scrollLeft = props.scrollLeft,
              attributes = _objectWithoutPropertiesLoose(props, ["style", "children", "scrollTop", "scrollLeft"]);

        const filter = instance.nodeName === 'filter' || instance.parentNode && instance.parentNode.nodeName === 'filter';
        if (scrollTop !== void 0) instance.scrollTop = scrollTop;
        if (scrollLeft !== void 0) instance.scrollLeft = scrollLeft; // Set textContent, if children is an animatable value

        if (children !== void 0) instance.textContent = children; // Set styles ...

        for (let styleName in style) {
          if (!style.hasOwnProperty(styleName)) continue;
          var isCustomProperty = styleName.indexOf('--') === 0;
          var styleValue = dangerousStyleValue(styleName, style[styleName], isCustomProperty);
          if (styleName === 'float') styleName = 'cssFloat';
          if (isCustomProperty) instance.style.setProperty(styleName, styleValue);else instance.style[styleName] = styleValue;
        } // Set attributes ...


        for (let name in attributes) {
          // Attributes are written in dash case
          const dashCase = filter ? name : attributeCache[name] || (attributeCache[name] = name.replace(/([A-Z])/g, n => '-' + n.toLowerCase()));
          if (typeof instance.getAttribute(dashCase) !== 'undefined') instance.setAttribute(dashCase, attributes[name]);
        }

        return;
      } else return false;
    }, style => style);

    const domElements = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr', // SVG
    'circle', 'clipPath', 'defs', 'ellipse', 'foreignObject', 'g', 'image', 'line', 'linearGradient', 'mask', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'stop', 'svg', 'text', 'tspan'];
    // Extend animated with all the available THREE elements
    const apply = merge(createAnimatedComponent, false);
    const extendedAnimated = apply(domElements);

    function PolicyCard(props) {
        return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "policy-card " + props.party.toLowerCase() }),
            React.createElement("div", { className: "policy-card backface" }));
    }

    var SIDEPANEL_WIDTH = 400;
    function PolicyTrackerCard(props) {
        var _this = this;
        var animStateRef = React.useRef(props.reveal ? 0 : 3);
        var _a = useSpring({
            from: {
                y: props.reveal ? 150 : 0,
                xy: props.reveal ? 0 : 1,
                rot: props.reveal ? 180 : 0,
                scale: (props.reveal ? props.startWidth : props.width) / 200
            },
            to: function (next, cancel) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(animStateRef.current < 1)) return [3 /*break*/, 2];
                            return [4 /*yield*/, next({ y: 50, xy: 0, rot: 180, scale: props.startWidth / 200 })];
                        case 1:
                            _a.sent();
                            animStateRef.current = 1;
                            _a.label = 2;
                        case 2:
                            if (!(animStateRef.current < 2)) return [3 /*break*/, 4];
                            return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                        case 3:
                            _a.sent();
                            animStateRef.current = 2;
                            _a.label = 4;
                        case 4:
                            if (!(animStateRef.current < 3)) return [3 /*break*/, 6];
                            return [4 /*yield*/, next({ y: 50, xy: 0, rot: 0, scale: props.startWidth / 200 })];
                        case 5:
                            _a.sent();
                            animStateRef.current = 3;
                            _a.label = 6;
                        case 6: return [4 /*yield*/, next({ y: 0, xy: 1, scale: props.width / 200 })];
                        case 7:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }
        }), y = _a.y, xy = _a.xy, scale = _a.scale, rot = _a.rot;
        return (React.createElement(extendedAnimated.div, { style: {
                position: 'absolute',
                top: -112,
                left: -75,
                transformStyle: 'preserve-3d',
                zIndex: xy.interpolate(function (xy) { return xy > 0.5 ? 1000 : 2000; }),
                transform: interpolate$1([y, xy, scale, rot], function (y, xy, s, rot) { return ("translate(50vw, " + y + "vh) translate(" + xy * props.x + "px, " + (xy * props.y - 0.45 * y) + "px) scale(" + s + ") rotateY(" + rot + "deg)"); })
            } },
            React.createElement(PolicyCard, { party: props.party })));
    }
    function PolicyTracker(props) {
        var screen = props.screen, party = props.party, numCards = props.numCards, reveal = props.reveal;
        var scale = Math.min((screen.width - SIDEPANEL_WIDTH) / 1400, screen.height / 800, 1);
        var maxNumCards = party == 'Liberal' ? 5 : 6;
        var width = scale * ((maxNumCards * 170) + 40);
        var height = scale * (224 + 60);
        var top = scale * (party == 'Liberal' ? 200 : 550);
        var cards = [];
        for (var i = 0; i < numCards + (reveal ? 1 : 0); i++) {
            cards.push(React.createElement(PolicyTrackerCard, { party: party, x: scale * 170 * (i - 0.5 * (maxNumCards - 1)) - (0.5 * SIDEPANEL_WIDTH), y: top, width: 200 * scale, startWidth: 500 * scale, reveal: reveal && i == numCards }));
        }
        var boardStyles = {
            position: 'absolute',
            left: '50vw',
            top: top,
            width: width,
            height: height,
            marginLeft: -0.5 * (width + SIDEPANEL_WIDTH),
            marginTop: -0.5 * height,
            backgroundColor: 'black'
        };
        return React.createElement(React.Fragment, null,
            React.createElement("div", { style: boardStyles }),
            cards);
    }

    function NightRoundModal() {
        return React.createElement(React.Fragment, null,
            React.createElement("h1", null, "Night Round"));
    }
    function ElectionModal(props) {
        var election = props.election, players = props.players;
        return React.createElement(React.Fragment, null,
            React.createElement("h1", null, "Election"),
            React.createElement("p", null,
                "President: ",
                players[election.presidentElect].name),
            React.createElement("p", null,
                "Chancellor: ",
                election.chancellorElect != null ? players[election.chancellorElect].name : 'Not chosen'),
            election.chancellorElect != null && (election.voteResult == null ? (React.createElement("p", null, "Voting in progress...")) : (React.createElement("p", null,
                "Vote result: ",
                election.voteResult ? 'JA!' : 'NEIN!'))));
    }
    function LegislativeModal(props) {
        var state = props.state, players = props.players;
        return React.createElement(React.Fragment, null,
            React.createElement("h1", null, "Legislative Session"),
            React.createElement("p", null,
                "President: ",
                players[state.president].name),
            React.createElement("p", null,
                "Chancellor: ",
                players[state.chancellor].name),
            React.createElement("p", null,
                "Turn: ",
                state.turn));
    }
    function ExecutiveModal(props) {
        var state = props.state, players = props.players;
        return React.createElement(React.Fragment, null,
            React.createElement("h1", null, "Executive Action"),
            React.createElement("p", null, state.action),
            React.createElement("p", null,
                "Player chosen: ",
                state.playerChosen != null ? players[state.playerChosen].name : 'Not chosen'));
    }
    function GameOverModal(props) {
        var state = props.state, players = props.players;
        return React.createElement(React.Fragment, null,
            React.createElement("h1", null, "Game Over"),
            React.createElement("p", null,
                state.winType,
                " win for ",
                state.winner));
    }

    function PlayBoard(props) {
        var screen = useWindowSize();
        var gameStarted = ['lobby', 'nightRound'].indexOf(props.state.type) == -1;
        var modalTransitions = useTransition(props.state, function (s) { return s.type; }, {
            from: { transform: 'translate(0%, 100%)' },
            enter: { transform: 'translate(0%, 0%)' },
            leave: { transform: 'translate(0%, -100%)' },
        });
        var revealLib = props.state.type == 'cardReveal' && props.state.card == 'Liberal';
        var revealFas = props.state.type == 'cardReveal' && props.state.card == 'Fascist';
        return (React.createElement("div", { className: "play-board" },
            gameStarted && React.createElement(React.Fragment, null,
                React.createElement(PolicyTracker, { screen: screen, party: "Liberal", numCards: props.numLiberalCards, reveal: revealLib }),
                React.createElement(PolicyTracker, { screen: screen, party: "Fascist", numCards: props.numFascistCards, reveal: revealFas })),
            React.createElement("div", { className: "util" },
                props.players.map(function (player) { return React.createElement("div", null,
                    player.name,
                    player.isDead && ' (DEAD)',
                    player.isConfirmedNotHitler && ' (NH)'); }),
                React.createElement("div", null,
                    React.createElement("p", null,
                        React.createElement("b", null, "Election Tracker:"),
                        " ",
                        props.electionTracker),
                    React.createElement("p", null,
                        React.createElement("b", null, "Cards in deck:"),
                        " ",
                        props.drawPile.length))),
            React.createElement("div", { className: "modal-wrap" }, modalTransitions.map(function (_a) {
                var item = _a.item, key = _a.key, style = _a.props;
                var modal;
                if (item.type == 'nightRound') {
                    modal = React.createElement(NightRoundModal, null);
                }
                if (item.type == 'election') {
                    modal = React.createElement(ElectionModal, { election: item, players: props.players });
                }
                if (item.type == 'legislativeSession') {
                    modal = React.createElement(LegislativeModal, { state: item, players: props.players });
                }
                if (item.type == 'executiveAction') {
                    modal = React.createElement(ExecutiveModal, { state: item, players: props.players });
                }
                if (item.type == 'end') {
                    modal = React.createElement(GameOverModal, { state: item, players: props.players });
                }
                return modal ? (React.createElement(extendedAnimated.div, { className: "modal", style: style }, modal)) : null;
            }))));
    }

    function BoardApp() {
        var _a = React.useState((function () {
            var gameId = getQueryVariable('g');
            if ((gameId === null || gameId === void 0 ? void 0 : gameId.length) == 4) {
                return { type: 'board_join', gameId: gameId };
            }
            else {
                return null;
            }
        })()), joinGameMsg = _a[0], setJoinGameMsg = _a[1];
        var _b = React.useState(null), state = _b[0], setState = _b[1];
        var _c = React.useState(null), error = _c[0], setError = _c[1];
        var _d = useWebSocket(function (msg) {
            switch (msg.type) {
                case 'game_created':
                    send({
                        type: 'board_join',
                        gameId: msg.gameId
                    });
                    break;
                case 'game_joined':
                    var joinMsg = {
                        type: 'board_join',
                        gameId: msg.gameId
                    };
                    setJoinGameMsg(joinMsg);
                    window.history.pushState('', '', "?m=b&g=" + msg.gameId);
                    break;
                case 'update':
                    setState(msg.state);
                    setError(null);
                    break;
                case 'error':
                    setError(msg.error);
                    throw new Error(msg.error);
                default:
                    throw new Error('Unknown message from server: ' + msg.type);
            }
        }, function () {
            if (joinGameMsg)
                send(joinGameMsg);
        }), connected = _d[0], send = _d[1];
        var sendConnect = function (params) {
            send(__assign({ type: 'board_join' }, params));
        };
        var createGame = function () {
            send({ type: 'create_game' });
        };
        var controls;
        if (!state) {
            controls = React.createElement("div", { className: "controls" },
                React.createElement(Connect, { player: false, connect: sendConnect }),
                React.createElement("p", null, "\u2014 OR \u2014"),
                React.createElement("div", { className: "form-row" },
                    React.createElement("button", { onClick: createGame }, "Create New Game")));
        }
        else {
            controls = React.createElement(PlayBoard, __assign({}, state));
        }
        React.useEffect(function () {
            var listener = function (event) {
                if (event.which == 32) {
                    send({ type: 'board_next' });
                }
            };
            document.addEventListener('keypress', listener);
            return function () { return document.removeEventListener('keypress', listener); };
        }, [send]);
        return React.createElement("div", null,
            React.createElement("div", { className: "connection" + (connected ? ' on' : '') },
                connected ? 'Connected' : 'Offline',
                React.createElement("div", { className: "gameid" }, joinGameMsg === null || joinGameMsg === void 0 ? void 0 : joinGameMsg.gameId)),
            controls,
            React.createElement("div", { className: "error" + (error ? ' visible' : '') }, error));
    }

    function App() {
        var _a = React.useState((function () {
            var state = getQueryVariable('m');
            if (state == 'p')
                return 'player';
            if (state == 'b')
                return 'board';
            return '';
        })()), state = _a[0], setState = _a[1];
        if (state == 'player') {
            return React.createElement(PlayerApp, null);
        }
        if (state == 'board') {
            return React.createElement(BoardApp, null);
        }
        var setMode = function (mode) {
            window.history.pushState('', '', '?m=' + mode.substr(0, 1));
            setState(mode);
        };
        return React.createElement("div", { className: "controls vcentre" },
            React.createElement("div", { className: "form-row" },
                React.createElement("button", { onClick: function () { return setMode('player'); } }, "New Player")),
            React.createElement("div", { className: "form-row" },
                React.createElement("p", { style: { margin: 0 } }, "\u2014 OR \u2014")),
            React.createElement("div", { className: "form-row" },
                React.createElement("button", { onClick: function () { return setMode('board'); } }, "Board Screen")));
    }
    reactDom.render(React.createElement(App, null), document.querySelector('#app'));

    exports.App = App;

    return exports;

}({}, React, ReactDOM));
