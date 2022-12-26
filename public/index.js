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

    var WS_URL = "ws://localhost:8888/" ;
    var unconnectedMessageHandler = function () {
        throw new Error("Not connected to server.");
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
            socket.addEventListener("open", function () {
                sendMessageRef.current = function (msg) { return socket.send(JSON.stringify(msg)); };
                setConnected(true);
                reconnectRef.current();
            });
            socket.addEventListener("message", function (event) {
                try {
                    var json = JSON.parse(event.data);
                    receiverRef.current(json);
                }
                catch (err) {
                    console.error(err);
                }
            });
            socket.addEventListener("error", function (error) {
                if (error.code == "ECONNREFUSED") {
                    setTimeout(function () { return connect(); }, 500);
                }
                else {
                    console.error(error);
                }
            });
            socket.addEventListener("close", function (event) {
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
    function useDelay(trigger, delay) {
        var _a = React.useState(false), triggered = _a[0], setTriggered = _a[1];
        React.useEffect(function () {
            if (trigger) {
                var timeout_1 = setTimeout(function () { return setTriggered(true); }, delay);
                return function () { return clearTimeout(timeout_1); };
            }
            else {
                setTriggered(false);
                return function () { };
            }
        }, [trigger]);
        return triggered;
    }
    function useSound(sound, play) {
        React.useEffect(function () {
            if (play) {
                sound.play();
                return function () {
                    sound.pause();
                    sound.currentTime = 0;
                };
            }
        }, [sound, play]);
    }

    function Connect(props) {
        var _a = React.useState(function () {
            var id = getQueryVariable("g");
            return (id === null || id === void 0 ? void 0 : id.match(/[A-Z]{4}/)) ? id : "";
        }), gameId = _a[0], setGameId = _a[1];
        var _b = React.useState(function () {
            var _a;
            return (_a = getQueryVariable("p")) !== null && _a !== void 0 ? _a : "";
        }), name = _b[0], setName = _b[1];
        var formRef = React.useRef(null);
        var onInput = React.useCallback(function () {
            var form = formRef.current;
            var code = form.querySelector('[name="room"]').value
                .toUpperCase()
                .replace(/[^A-Z]/g, "")
                .slice(0, 4);
            setGameId(code);
            if (props.player) {
                var name_1 = form.querySelector('[name="name"]').value
                    .toUpperCase()
                    .replace(/[^A-Z \'\-]/g, "")
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
        return (React.createElement("form", { ref: formRef, onSubmit: onSubmit },
            React.createElement("div", { className: "form-row" },
                React.createElement("label", null, "Room code:"),
                React.createElement("input", { name: "room", type: "text", onInput: onInput, value: gameId })),
            props.player && (React.createElement("div", { className: "form-row" },
                React.createElement("label", null, "Name:"),
                React.createElement("input", { name: "name", type: "text", onInput: onInput, value: name }))),
            React.createElement("div", { className: "form-row" },
                React.createElement("input", { type: "submit", value: "Enter", disabled: disabled }))));
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

    function mapPlayerChoice(type) {
        if (type == "execution")
            return "Choose a player to execute";
        if (type == "nominateChancellor")
            return "President, nominate your chancellor";
        if (type == "investigate")
            return "Which player would you like to investigate?";
        if (type == "specialElection")
            return "Nominate a player to be the next president";
    }
    function CardSelectorCard(props) {
        var _a = useSpring({ r: props.n, o: props.hidden ? 0 : 1 }), r = _a.r, o = _a.o;
        return (React.createElement(extendedAnimated.div, { onClick: function () { return props.choose(); }, style: {
                transform: interpolate$1([r, o], function (r, o) {
                    return "rotate(" + 10 * r + "deg) translate(" + 80 * r + "px, " + 160 * (1 - o) + "px)";
                }),
                opacity: o,
            }, className: "policy-card " + props.party.toLowerCase() }));
    }
    function CardSelector(props) {
        var _a = React.useState(10), discarded = _a[0], setDiscarded = _a[1];
        var s = [0, 0, 1.2, 1][props.cards.length - (discarded == 10 ? 0 : 1)];
        var m = [0, 0, -0.6, -1][props.cards.length - (discarded == 10 ? 0 : 1)];
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "card-selection" }, props.cards.map(function (card, idx) { return (React.createElement(CardSelectorCard, { party: card, n: s * (idx - (idx > discarded ? 1 : 0)) + m, hidden: props.hidden || idx === discarded, choose: function () {
                    if (discarded == 10)
                        setDiscarded(idx);
                } })); })),
            React.createElement("div", { className: "undo-confirm" }, discarded == 10 ? (props.veto && (React.createElement("button", { className: "btn veto", onClick: function () { return props.send({ type: "veto" }); } }, "Veto Agenda"))) : (React.createElement(React.Fragment, null,
                React.createElement("button", { className: "btn undo", onClick: function () { return setDiscarded(10); } }, "Undo"),
                React.createElement("button", { className: "btn confirm", onClick: function () { return props.send({ type: "discard", idx: discarded }); } }, "Confirm"))))));
    }
    function PolicyPeak(props) {
        var _a = React.useState(false), visible = _a[0], setVisible = _a[1];
        var s = [0, 0, 1.2, 1][props.cards.length];
        var m = [0, 0, -0.6, -1][props.cards.length];
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "card-selection" },
                React.createElement("div", { className: "question-mark" }, "?"),
                props.cards.map(function (card, idx) { return (React.createElement(CardSelectorCard, { party: card, n: s * idx + m, hidden: !visible, choose: function () { } })); })),
            React.createElement("div", { className: "undo-confirm" }, !visible ? (React.createElement("button", { className: "btn veto", onClick: function () { return setVisible(true); } }, "Reveal policies")) : (React.createElement("button", { className: "btn okay", onClick: props.done }, "Done")))));
        //choose={idx => sendAction({ type: 'discard', idx })}
    }
    function RevealParty(props) {
        var _a = React.useState(false), visible = _a[0], setVisible = _a[1];
        var style = useSpring({
            position: "relative",
            margin: "50px auto",
            width: 150,
            height: 225,
            transformStyle: "preserve-3d",
            perspective: "200px",
            transform: visible ? "rotateY(0deg)" : "rotateY(180deg)",
        });
        return (React.createElement(React.Fragment, null,
            React.createElement(extendedAnimated.div, { onClick: function () { return setVisible(true); }, style: style },
                React.createElement("div", { className: "policy-card " + props.party.toLowerCase() + "-party" }),
                React.createElement("div", { className: "policy-card backface-party" })),
            visible && (React.createElement("button", { className: "btn okay", onClick: props.done }, "Done"))));
        //choose={idx => sendAction({ type: 'discard', idx })}
    }
    function PlayerApp() {
        var _a;
        var _b = React.useState((function () {
            var gameId = getQueryVariable("g");
            var playerId = getQueryVariable("p");
            if ((gameId === null || gameId === void 0 ? void 0 : gameId.length) == 4 && playerId) {
                return { type: "player_join", gameId: gameId, playerId: playerId };
            }
            else {
                return null;
            }
        })()), joinGameMsg = _b[0], setJoinGameMsg = _b[1];
        var _c = React.useState(null), state = _c[0], setState = _c[1];
        var _d = React.useState(null), error = _d[0], setError = _d[1];
        var _e = React.useState(false), elementVisible = _e[0], setElementVisible = _e[1];
        var transition = useTransition((_a = state === null || state === void 0 ? void 0 : state.action) !== null && _a !== void 0 ? _a : { type: "" }, function (item) { return item === null || item === void 0 ? void 0 : item.type; }, {
            from: { transform: "translate(0px, 30px)", opacity: 0 },
            enter: { transform: "translate(0px, 0px)", opacity: 1 },
            leave: { transform: "translate(0px, 30px)", opacity: 0 },
        });
        var _f = useWebSocket(function (msg) {
            switch (msg.type) {
                case "game_joined":
                    var joinMsg = {
                        type: "player_join",
                        gameId: msg.gameId,
                        playerId: msg.playerId,
                    };
                    setJoinGameMsg(joinMsg);
                    window.history.pushState("", "", "?m=p&g=" + msg.gameId + "&p=" + msg.playerId);
                    break;
                case "update":
                    setState(msg.state);
                    setError(null);
                    break;
                case "gameover":
                    setState(null);
                    setJoinGameMsg(null);
                    window.history.pushState("", "", "?m=p");
                    break;
                case "error":
                    if (msg.error.match(/game does not exist/i)) {
                        setState(null);
                        setJoinGameMsg(null);
                        window.history.pushState("", "", "?m=p");
                    }
                    else {
                        setError(msg.error);
                        throw new Error(msg.error);
                    }
                    break;
                default:
                    throw new Error("Unknown message from server: " + msg.type);
            }
        }, function () {
            if (joinGameMsg)
                send(joinGameMsg);
        }), connected = _f[0], send = _f[1];
        var sendConnect = function (params) {
            return send(__assign({ type: "player_join" }, params));
        };
        var debouncer = React.useRef(false);
        var sendAction = function (data) {
            var _a, _b;
            if (debouncer.current)
                return;
            debouncer.current = true;
            setTimeout(function () { return (debouncer.current = false); }, 1000);
            send({
                type: "player_action",
                action: (_b = (_a = state === null || state === void 0 ? void 0 : state.action) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : null,
                data: data,
            });
        };
        React.useEffect(function () {
            var interval = setInterval(function () {
                send({ type: "heartbeat" });
            }, 10000);
            return function () { return clearInterval(interval); };
        }, []);
        var controls, controlsClass = "";
        if (state) {
            controls = transition.map(function (_a) {
                var action = _a.item, props = _a.props, key = _a.key;
                return (React.createElement(extendedAnimated.div, { className: "controls-inner", style: props }, (function () {
                    var _a;
                    switch (action === null || action === void 0 ? void 0 : action.type) {
                        case "lobby":
                            var num = state.players.length;
                            controlsClass = "centre";
                            return (React.createElement(React.Fragment, null,
                                React.createElement("p", null, num == 1
                                    ? "1 player has joined."
                                    : num + " players have joined."),
                                action.canStart && (React.createElement("button", { className: "btn", onClick: function () { return sendAction("start"); } }, "Start game"))));
                        case "nightRound":
                            var fascists = state.players
                                .filter(function (p) { return p.role === "Fascist"; })
                                .map(function (p) { return p.name; });
                            var hitler = (_a = state.players.find(function (p) { return p.role === "Hitler"; })) === null || _a === void 0 ? void 0 : _a.name;
                            return (React.createElement("div", null,
                                React.createElement("p", null, "Your secret role is:"),
                                React.createElement("p", { className: "secret-role-text" }, state.role),
                                fascists.length ? (React.createElement(React.Fragment, null,
                                    React.createElement("div", { className: "player-wrap" },
                                        React.createElement("p", null, "Fascists:"),
                                        fascists.map(function (name) { return (React.createElement("p", { className: "player" }, name)); })),
                                    React.createElement("div", { className: "player-wrap" },
                                        React.createElement("p", null, "Hitler:"),
                                        React.createElement("p", { className: "player" }, hitler)))) : undefined,
                                React.createElement("button", { className: "btn okay", onClick: function () { return sendAction("done"); } }, "Okay")));
                        case "choosePlayer":
                            var c_1 = action.players.length > 5 ? " compact" : "";
                            return (React.createElement("div", null,
                                React.createElement("p", null, mapPlayerChoice(action.subtype)),
                                action.players
                                    .map(function (p) { return state.players[p]; })
                                    .map(function (player) { return (React.createElement("button", { className: "btn" + c_1, onClick: function () { return sendAction(player.id); } }, player.name)); })));
                        case "vote":
                            return (React.createElement("div", null,
                                React.createElement("p", null, "Please vote:"),
                                React.createElement("button", { className: "btn ja", onClick: function () { return sendAction(true); } }, "JA!"),
                                React.createElement("button", { className: "btn nein", onClick: function () { return sendAction(false); } }, "NEIN!")));
                        case "legislative":
                            return (React.createElement("div", null,
                                React.createElement("p", null, "Choose a policy to discard:"),
                                React.createElement(CardSelector, { cards: action.cards, send: sendAction, veto: action.canVeto })));
                        case "policyPeak":
                            return (React.createElement("div", null,
                                React.createElement("p", null, "Top three policies:"),
                                React.createElement(PolicyPeak, { cards: action.cards, done: function () { return sendAction("done"); } })));
                        case "vetoConsent":
                            return (React.createElement("div", null,
                                React.createElement("p", null, "Do you consent to the veto?"),
                                React.createElement("button", { className: "btn ja", onClick: function () { return sendAction(true); } }, "JA!"),
                                React.createElement("button", { className: "btn nein", onClick: function () { return sendAction(false); } }, "NEIN!")));
                        case "investigateParty":
                            return (React.createElement("div", { style: { perspective: 400 } },
                                React.createElement("p", null,
                                    "Tap to reveal ",
                                    React.createElement("b", null, state.players[action.player].name),
                                    "'s party membership:"),
                                React.createElement(RevealParty, { party: action.party, done: function () { return sendAction("done"); } })));
                        case "nextRound":
                            return (React.createElement("div", null,
                                React.createElement("p", null, "Ready to continue?"),
                                React.createElement("button", { className: "btn okay", onClick: function () { return sendAction("next"); } }, "Yes")));
                        case "gameover":
                            return (React.createElement("div", null,
                                React.createElement("p", { className: "gameover-text" },
                                    "The ",
                                    action.winner,
                                    "s win!"),
                                React.createElement("button", { className: "btn okay", onClick: function () { return sendAction("restart"); } }, "Restart"),
                                React.createElement("div", { style: { height: 10 } }),
                                React.createElement("button", { className: "btn okay", onClick: function () { return sendAction("end"); } }, "End Game")));
                        default:
                            if (state.isDead) {
                                return React.createElement("p", null, "Sorry, you're dead :(");
                            }
                            else {
                                return React.createElement("p", null);
                            }
                    }
                })()));
            });
        }
        else {
            controls = React.createElement(Connect, { player: true, connect: sendConnect });
        }
        return (React.createElement("div", null,
            React.createElement("div", { className: "connection" + (connected ? " on" : "") },
                connected ? "Connected" : "Offline",
                React.createElement("a", { href: "/", className: "home" }, "HOME"),
                React.createElement("div", { className: "gameid" }, joinGameMsg === null || joinGameMsg === void 0 ? void 0 : joinGameMsg.gameId)),
            React.createElement("div", { className: "controls " + controlsClass }, controls),
            state && (React.createElement("div", { className: "secret-role" },
                React.createElement("div", { className: "title" }, "Secret role"),
                React.createElement("div", { className: "role" }, state.role))),
            React.createElement("div", { className: "error" + (error ? " visible" : "") }, error)));
    }

    function PolicyCard(props) {
        return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "policy-card " + props.party.toLowerCase() }),
            React.createElement("div", { className: "policy-card backface" }));
    }

    var SIDEPANEL_WIDTH = 300;
    var drumrollSound = new Audio('./sound/drum roll final.mp3');
    var fascistSound = new Audio('./sound/fascist card.mp3');
    var liberalSound = new Audio('./sound/liberal card.mp3');
    liberalSound.volume = 0.8;
    function PolicyTrackerCard(props) {
        //const animStateRef = React.useRef(props.reveal ? 0 : 3);
        var step1 = useDelay(props.reveal, 900);
        var step2 = useDelay(step1, 1600);
        var step3 = useDelay(step2, 1500);
        var to = { y: 150, xy: 0, rot: 180, scale: props.startWidth / 200 };
        if (step1 || !props.reveal) {
            to.y = 50;
        }
        if (step2 || !props.reveal) {
            to.rot = 0;
        }
        if (step3 || !props.reveal) {
            to.y = 0;
            to.xy = 1;
            to.scale = props.width / 200;
        }
        useSound(drumrollSound, props.reveal);
        useSound(props.party == 'Liberal' ? liberalSound : fascistSound, step2 && props.reveal);
        var _a = useSpring(to), y = _a.y, xy = _a.xy, scale = _a.scale, rot = _a.rot;
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
        var scale = Math.min((screen.width - SIDEPANEL_WIDTH) / 1200, screen.height / 800, 1.5);
        var maxNumCards = party == 'Liberal' ? 5 : 6;
        var width = scale * ((maxNumCards * 170) + 40);
        var height = scale * (224 + 60);
        var top = scale * (party == 'Liberal' ? 200 : 550);
        var cards = [];
        for (var i = 0; i < numCards + (reveal ? 1 : 0); i++) {
            cards.push(React.createElement(PolicyTrackerCard, { key: i, party: party, x: scale * 170 * (i - 0.5 * (maxNumCards - 1)) - (0.5 * SIDEPANEL_WIDTH), y: top, width: 200 * scale, startWidth: 500 * scale, reveal: reveal && i == numCards }));
        }
        var boardStyles = {
            top: top,
            width: width,
            height: height,
            marginLeft: -0.5 * (width + SIDEPANEL_WIDTH),
            marginTop: -0.5 * height
        };
        var tiles = [];
        if (props.party == 'Liberal') {
            tiles = ['', '', '', '', 'liberal-win'];
        }
        else {
            switch (props.numPlayers) {
                case 5:
                case 6:
                    tiles = ['', '', 'policy-peak', 'kill', 'kill-veto', 'fascist-win'];
                    break;
                case 7:
                case 8:
                    tiles = ['', 'investigate', 'election', 'kill', 'kill-veto', 'fascist-win'];
                    break;
                case 9:
                case 10:
                    tiles = ['investigate', 'investigate', 'election', 'kill', 'kill-veto', 'fascist-win'];
                    break;
            }
        }
        return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "board", style: boardStyles }, tiles.map(function (tile) { return React.createElement("div", { className: "board-tile " + tile }); })),
            cards);
    }

    function VoteResult(props) {
        var _a = React.useState(false), started = _a[0], setStarted = _a[1];
        React.useEffect(function () {
            setTimeout(function () { return setStarted(true); }, 5);
        }, []);
        return React.createElement("div", { className: "vote-result" + (started ? ' show' : '') },
            React.createElement("div", { className: props.result }, props.result.toUpperCase() + '!'));
    }

    var clickSound = new Audio("./sound/click.mp3");
    function PlayerName(props) {
        var style = useSpring({
            opacity: props.show ? 1 : 0,
            transform: props.show ? "translate(0px, 0px)" : "translate(0px, 5vw)",
            config: {
                mass: 1,
                tension: 340,
                friction: 22,
            },
        });
        useSound(clickSound, props.show);
        return (React.createElement(extendedAnimated.div, { className: "player-name", style: style }, props.player.name));
    }
    function NightRoundModal() {
        return (React.createElement(React.Fragment, null,
            React.createElement("h1", null, "Night Round"),
            React.createElement("p", null, "You have now been given your secret role.")));
    }
    var jaSound = new Audio("./sound/Ja hitler.mp3");
    var jaSound2 = new Audio("./sound/ja ja ja ja hitler.mp3");
    var neinSound = new Audio("./sound/nein1.mp3");
    var neinSound2 = new Audio("./sound/neinneinnein.mp3");
    var voteNowSound = new Audio("./sound/cast-vote.mp3");
    function getVoteSound(result) {
        if (Math.random() < 0.2) {
            return result ? jaSound2 : neinSound2;
        }
        else {
            return result ? jaSound : neinSound;
        }
    }
    function ElectionModal(props) {
        var _a;
        var election = props.election, players = props.players, showResult = props.showResult;
        var showPresident = useDelay(true, 1000);
        var showChancellor = showPresident && election.chancellorElect != null;
        var showVoting = useDelay(showChancellor, 1000) && election.voteResult == null;
        React.useEffect(function () {
            if (showResult) {
                var timeout_1 = setTimeout(props.done, 4000);
                return function () { return clearTimeout(timeout_1); };
            }
        }, [showResult]);
        useSound(getVoteSound(election.voteResult == true), showResult);
        useSound(voteNowSound, showVoting);
        return (React.createElement(React.Fragment, null,
            React.createElement("h1", null, "Election"),
            React.createElement("div", { className: "gov" },
                React.createElement("div", null,
                    React.createElement("img", { src: "./img/president.png" }),
                    React.createElement(PlayerName, { player: players[election.presidentElect], show: showPresident })),
                React.createElement("div", null,
                    React.createElement("img", { src: "./img/chancellor.png" }),
                    React.createElement(PlayerName, { player: players[(_a = election.chancellorElect) !== null && _a !== void 0 ? _a : 0], show: showChancellor }))),
            React.createElement("div", { className: "vote-now" + (showVoting ? "" : " hidden") }, "Vote now!"),
            showResult && (React.createElement(VoteResult, { result: election.voteResult ? "ja" : "nein" }))));
    }
    var vetoCalledSound = new Audio("./sound/veto call.mp3");
    var vetoRejectedSound = new Audio("./sound/veto rejected.mp3");
    var vetoApprovedSound = new Audio("./sound/veto pass.mp3");
    function LegislativeModal(props) {
        var state = props.state, players = props.players;
        var turnCopy = "";
        switch (state.turn) {
            case "President":
                turnCopy = "The president is discarding a policy.";
                break;
            case "Chancellor":
                turnCopy = "The chancellor is discarding a policy.";
                break;
            case "Veto":
                turnCopy = "The chancellor has called for a veto!";
                break;
            case "VetoRejected":
                turnCopy =
                    "The president has rejected the veto. The chancellor must discard a policy.";
                break;
            case "VetoApproved":
                turnCopy = "The agenda has been vetoed!";
                break;
        }
        useSound(vetoCalledSound, state.turn == "Veto");
        useSound(vetoRejectedSound, state.turn == "VetoRejected");
        useSound(vetoApprovedSound, state.turn == "VetoApproved");
        React.useEffect(function () {
            if (state.turn == "VetoApproved") {
                var timeout_2 = setTimeout(props.done, 3500);
                return function () { return clearTimeout(timeout_2); };
            }
        }, [state.turn == "VetoApproved"]);
        return (React.createElement(React.Fragment, null,
            React.createElement("h1", null, "Legislative Session"),
            React.createElement("div", { className: "gov" },
                React.createElement("div", null,
                    React.createElement("img", { src: "./img/president.png" }),
                    React.createElement(PlayerName, { player: players[state.president], show: true })),
                React.createElement("div", null,
                    React.createElement("img", { src: "./img/chancellor.png" }),
                    React.createElement(PlayerName, { player: players[state.chancellor], show: true }))),
            React.createElement("p", { className: "turn-copy" }, turnCopy)));
    }
    function ExecutiveModal(props) {
        var _a;
        var state = props.state, players = props.players;
        var copy;
        switch (props.state.action) {
            case "execution":
                copy = "The president must now execute a player.";
                break;
            case "investigate":
                copy = "The president must now investigate a player's loyalty.";
                break;
            case "policyPeak":
                copy = "The president must now peek at the top three policy cards.";
                break;
            case "specialElection":
                copy =
                    "A special election has been called. The president must now nominate their successor.";
                break;
        }
        React.useEffect(function () {
            if (state.playerChosen != null &&
                ["specialElection", "execution"].indexOf(props.state.action) != -1) {
                var timeout_3 = setTimeout(props.done, 5000);
                return function () { return clearTimeout(timeout_3); };
            }
        }, [state.playerChosen]);
        return (React.createElement(React.Fragment, null,
            React.createElement("h1", null, "Executive Action"),
            React.createElement("p", null, copy),
            React.createElement("div", { style: { textAlign: "center" } },
                React.createElement(PlayerName, { player: players[(_a = state.playerChosen) !== null && _a !== void 0 ? _a : 0], show: state.playerChosen != null }))));
    }
    var fascistVictory = new Audio("./sound/fascist victory.mp3");
    fascistVictory.volume = 0.8;
    var liberalVictory = new Audio("./sound/liberal victory.mp3");
    var fascistsWin = new Audio("./sound/the fascists win.mp3");
    var liberalsWin = new Audio("./sound/liberal win.mp3");
    var hitlerChancellor = new Audio("./sound/hitler chancellor.mp3");
    var hitlerExecuted = new Audio("./sound/hitler executed.mp3");
    function GameOverModal(props) {
        var state = props.state, players = props.players;
        var copy, sound1, sound2;
        switch (state.winner) {
            case "Liberal":
                sound1 = liberalVictory;
                switch (state.winType) {
                    case "hitler":
                        copy = "Hitler has been assassinated";
                        sound2 = hitlerExecuted;
                        break;
                    case "legislative":
                        copy = "The liberals have completed their policy track";
                        sound2 = liberalsWin;
                        break;
                }
                break;
            case "Fascist":
                sound1 = fascistVictory;
                switch (state.winType) {
                    case "hitler":
                        copy = "Hitler has been elected chancellor";
                        sound2 = hitlerChancellor;
                        break;
                    case "legislative":
                        copy = "The fascists have completed their policy track";
                        sound2 = fascistsWin;
                        break;
                }
                break;
        }
        useSound(sound1, true);
        useSound(sound2, true);
        return (React.createElement(React.Fragment, null,
            React.createElement("h1", null, "Game Over"),
            React.createElement("p", { className: "gameover1" },
                "The ",
                state.winner,
                "s win!"),
            React.createElement("p", { className: "gameover2" },
                copy,
                ".")));
    }

    function ElectionTracker(props) {
        var left = (25 * props.tracker + 12.5) + '%';
        return React.createElement("div", { className: "election-tracker" },
            React.createElement("p", null, "Cards in Deck"),
            React.createElement("p", { className: "cards-in-deck" }, props.deck),
            React.createElement("p", null, "Election Tracker"),
            React.createElement("div", null,
                React.createElement("div", { className: "dot" }),
                React.createElement("div", { className: "dot" }),
                React.createElement("div", { className: "dot" }),
                React.createElement("div", { className: "dot" }),
                React.createElement("div", { className: "token", style: { left: left } })));
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var qrcode_1 = createCommonjsModule(function (module, exports) {
    //---------------------------------------------------------------------
    //
    // QR Code Generator for JavaScript
    //
    // Copyright (c) 2009 Kazuhiko Arase
    //
    // URL: http://www.d-project.com/
    //
    // Licensed under the MIT license:
    //  http://www.opensource.org/licenses/mit-license.php
    //
    // The word 'QR Code' is registered trademark of
    // DENSO WAVE INCORPORATED
    //  http://www.denso-wave.com/qrcode/faqpatent-e.html
    //
    //---------------------------------------------------------------------

    var qrcode = function() {

      //---------------------------------------------------------------------
      // qrcode
      //---------------------------------------------------------------------

      /**
       * qrcode
       * @param typeNumber 1 to 40
       * @param errorCorrectionLevel 'L','M','Q','H'
       */
      var qrcode = function(typeNumber, errorCorrectionLevel) {

        var PAD0 = 0xEC;
        var PAD1 = 0x11;

        var _typeNumber = typeNumber;
        var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
        var _modules = null;
        var _moduleCount = 0;
        var _dataCache = null;
        var _dataList = [];

        var _this = {};

        var makeImpl = function(test, maskPattern) {

          _moduleCount = _typeNumber * 4 + 17;
          _modules = function(moduleCount) {
            var modules = new Array(moduleCount);
            for (var row = 0; row < moduleCount; row += 1) {
              modules[row] = new Array(moduleCount);
              for (var col = 0; col < moduleCount; col += 1) {
                modules[row][col] = null;
              }
            }
            return modules;
          }(_moduleCount);

          setupPositionProbePattern(0, 0);
          setupPositionProbePattern(_moduleCount - 7, 0);
          setupPositionProbePattern(0, _moduleCount - 7);
          setupPositionAdjustPattern();
          setupTimingPattern();
          setupTypeInfo(test, maskPattern);

          if (_typeNumber >= 7) {
            setupTypeNumber(test);
          }

          if (_dataCache == null) {
            _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
          }

          mapData(_dataCache, maskPattern);
        };

        var setupPositionProbePattern = function(row, col) {

          for (var r = -1; r <= 7; r += 1) {

            if (row + r <= -1 || _moduleCount <= row + r) continue;

            for (var c = -1; c <= 7; c += 1) {

              if (col + c <= -1 || _moduleCount <= col + c) continue;

              if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
                  || (0 <= c && c <= 6 && (r == 0 || r == 6) )
                  || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        };

        var getBestMaskPattern = function() {

          var minLostPoint = 0;
          var pattern = 0;

          for (var i = 0; i < 8; i += 1) {

            makeImpl(true, i);

            var lostPoint = QRUtil.getLostPoint(_this);

            if (i == 0 || minLostPoint > lostPoint) {
              minLostPoint = lostPoint;
              pattern = i;
            }
          }

          return pattern;
        };

        var setupTimingPattern = function() {

          for (var r = 8; r < _moduleCount - 8; r += 1) {
            if (_modules[r][6] != null) {
              continue;
            }
            _modules[r][6] = (r % 2 == 0);
          }

          for (var c = 8; c < _moduleCount - 8; c += 1) {
            if (_modules[6][c] != null) {
              continue;
            }
            _modules[6][c] = (c % 2 == 0);
          }
        };

        var setupPositionAdjustPattern = function() {

          var pos = QRUtil.getPatternPosition(_typeNumber);

          for (var i = 0; i < pos.length; i += 1) {

            for (var j = 0; j < pos.length; j += 1) {

              var row = pos[i];
              var col = pos[j];

              if (_modules[row][col] != null) {
                continue;
              }

              for (var r = -2; r <= 2; r += 1) {

                for (var c = -2; c <= 2; c += 1) {

                  if (r == -2 || r == 2 || c == -2 || c == 2
                      || (r == 0 && c == 0) ) {
                    _modules[row + r][col + c] = true;
                  } else {
                    _modules[row + r][col + c] = false;
                  }
                }
              }
            }
          }
        };

        var setupTypeNumber = function(test) {

          var bits = QRUtil.getBCHTypeNumber(_typeNumber);

          for (var i = 0; i < 18; i += 1) {
            var mod = (!test && ( (bits >> i) & 1) == 1);
            _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
          }

          for (var i = 0; i < 18; i += 1) {
            var mod = (!test && ( (bits >> i) & 1) == 1);
            _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
          }
        };

        var setupTypeInfo = function(test, maskPattern) {

          var data = (_errorCorrectionLevel << 3) | maskPattern;
          var bits = QRUtil.getBCHTypeInfo(data);

          // vertical
          for (var i = 0; i < 15; i += 1) {

            var mod = (!test && ( (bits >> i) & 1) == 1);

            if (i < 6) {
              _modules[i][8] = mod;
            } else if (i < 8) {
              _modules[i + 1][8] = mod;
            } else {
              _modules[_moduleCount - 15 + i][8] = mod;
            }
          }

          // horizontal
          for (var i = 0; i < 15; i += 1) {

            var mod = (!test && ( (bits >> i) & 1) == 1);

            if (i < 8) {
              _modules[8][_moduleCount - i - 1] = mod;
            } else if (i < 9) {
              _modules[8][15 - i - 1 + 1] = mod;
            } else {
              _modules[8][15 - i - 1] = mod;
            }
          }

          // fixed module
          _modules[_moduleCount - 8][8] = (!test);
        };

        var mapData = function(data, maskPattern) {

          var inc = -1;
          var row = _moduleCount - 1;
          var bitIndex = 7;
          var byteIndex = 0;
          var maskFunc = QRUtil.getMaskFunction(maskPattern);

          for (var col = _moduleCount - 1; col > 0; col -= 2) {

            if (col == 6) col -= 1;

            while (true) {

              for (var c = 0; c < 2; c += 1) {

                if (_modules[row][col - c] == null) {

                  var dark = false;

                  if (byteIndex < data.length) {
                    dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
                  }

                  var mask = maskFunc(row, col - c);

                  if (mask) {
                    dark = !dark;
                  }

                  _modules[row][col - c] = dark;
                  bitIndex -= 1;

                  if (bitIndex == -1) {
                    byteIndex += 1;
                    bitIndex = 7;
                  }
                }
              }

              row += inc;

              if (row < 0 || _moduleCount <= row) {
                row -= inc;
                inc = -inc;
                break;
              }
            }
          }
        };

        var createBytes = function(buffer, rsBlocks) {

          var offset = 0;

          var maxDcCount = 0;
          var maxEcCount = 0;

          var dcdata = new Array(rsBlocks.length);
          var ecdata = new Array(rsBlocks.length);

          for (var r = 0; r < rsBlocks.length; r += 1) {

            var dcCount = rsBlocks[r].dataCount;
            var ecCount = rsBlocks[r].totalCount - dcCount;

            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);

            dcdata[r] = new Array(dcCount);

            for (var i = 0; i < dcdata[r].length; i += 1) {
              dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
            }
            offset += dcCount;

            var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
            var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

            var modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.getLength() - 1);
            for (var i = 0; i < ecdata[r].length; i += 1) {
              var modIndex = i + modPoly.getLength() - ecdata[r].length;
              ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
            }
          }

          var totalCodeCount = 0;
          for (var i = 0; i < rsBlocks.length; i += 1) {
            totalCodeCount += rsBlocks[i].totalCount;
          }

          var data = new Array(totalCodeCount);
          var index = 0;

          for (var i = 0; i < maxDcCount; i += 1) {
            for (var r = 0; r < rsBlocks.length; r += 1) {
              if (i < dcdata[r].length) {
                data[index] = dcdata[r][i];
                index += 1;
              }
            }
          }

          for (var i = 0; i < maxEcCount; i += 1) {
            for (var r = 0; r < rsBlocks.length; r += 1) {
              if (i < ecdata[r].length) {
                data[index] = ecdata[r][i];
                index += 1;
              }
            }
          }

          return data;
        };

        var createData = function(typeNumber, errorCorrectionLevel, dataList) {

          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

          var buffer = qrBitBuffer();

          for (var i = 0; i < dataList.length; i += 1) {
            var data = dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          // calc num max data.
          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i += 1) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() > totalDataCount * 8) {
            throw 'code length overflow. ('
              + buffer.getLengthInBits()
              + '>'
              + totalDataCount * 8
              + ')';
          }

          // end code
          if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
            buffer.put(0, 4);
          }

          // padding
          while (buffer.getLengthInBits() % 8 != 0) {
            buffer.putBit(false);
          }

          // padding
          while (true) {

            if (buffer.getLengthInBits() >= totalDataCount * 8) {
              break;
            }
            buffer.put(PAD0, 8);

            if (buffer.getLengthInBits() >= totalDataCount * 8) {
              break;
            }
            buffer.put(PAD1, 8);
          }

          return createBytes(buffer, rsBlocks);
        };

        _this.addData = function(data, mode) {

          mode = mode || 'Byte';

          var newData = null;

          switch(mode) {
          case 'Numeric' :
            newData = qrNumber(data);
            break;
          case 'Alphanumeric' :
            newData = qrAlphaNum(data);
            break;
          case 'Byte' :
            newData = qr8BitByte(data);
            break;
          case 'Kanji' :
            newData = qrKanji(data);
            break;
          default :
            throw 'mode:' + mode;
          }

          _dataList.push(newData);
          _dataCache = null;
        };

        _this.isDark = function(row, col) {
          if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
            throw row + ',' + col;
          }
          return _modules[row][col];
        };

        _this.getModuleCount = function() {
          return _moduleCount;
        };

        _this.make = function() {
          if (_typeNumber < 1) {
            var typeNumber = 1;

            for (; typeNumber < 40; typeNumber++) {
              var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
              var buffer = qrBitBuffer();

              for (var i = 0; i < _dataList.length; i++) {
                var data = _dataList[i];
                buffer.put(data.getMode(), 4);
                buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
                data.write(buffer);
              }

              var totalDataCount = 0;
              for (var i = 0; i < rsBlocks.length; i++) {
                totalDataCount += rsBlocks[i].dataCount;
              }

              if (buffer.getLengthInBits() <= totalDataCount * 8) {
                break;
              }
            }

            _typeNumber = typeNumber;
          }

          makeImpl(false, getBestMaskPattern() );
        };

        _this.createTableTag = function(cellSize, margin) {

          cellSize = cellSize || 2;
          margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

          var qrHtml = '';

          qrHtml += '<table style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
          qrHtml += '">';
          qrHtml += '<tbody>';

          for (var r = 0; r < _this.getModuleCount(); r += 1) {

            qrHtml += '<tr>';

            for (var c = 0; c < _this.getModuleCount(); c += 1) {
              qrHtml += '<td style="';
              qrHtml += ' border-width: 0px; border-style: none;';
              qrHtml += ' border-collapse: collapse;';
              qrHtml += ' padding: 0px; margin: 0px;';
              qrHtml += ' width: ' + cellSize + 'px;';
              qrHtml += ' height: ' + cellSize + 'px;';
              qrHtml += ' background-color: ';
              qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
              qrHtml += ';';
              qrHtml += '"/>';
            }

            qrHtml += '</tr>';
          }

          qrHtml += '</tbody>';
          qrHtml += '</table>';

          return qrHtml;
        };

        _this.createSvgTag = function(cellSize, margin, alt, title) {

          var opts = {};
          if (typeof arguments[0] == 'object') {
            // Called by options.
            opts = arguments[0];
            // overwrite cellSize and margin.
            cellSize = opts.cellSize;
            margin = opts.margin;
            alt = opts.alt;
            title = opts.title;
          }

          cellSize = cellSize || 2;
          margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

          // Compose alt property surrogate
          alt = (typeof alt === 'string') ? {text: alt} : alt || {};
          alt.text = alt.text || null;
          alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

          // Compose title property surrogate
          title = (typeof title === 'string') ? {text: title} : title || {};
          title.text = title.text || null;
          title.id = (title.text) ? title.id || 'qrcode-title' : null;

          var size = _this.getModuleCount() * cellSize + margin * 2;
          var c, mc, r, mr, qrSvg='', rect;

          rect = 'l' + cellSize + ',0 0,' + cellSize +
            ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

          qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
          qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
          qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
          qrSvg += ' preserveAspectRatio="xMinYMin meet"';
          qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
              escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
          qrSvg += '>';
          qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
              escapeXml(title.text) + '</title>' : '';
          qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
              escapeXml(alt.text) + '</description>' : '';
          qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
          qrSvg += '<path d="';

          for (r = 0; r < _this.getModuleCount(); r += 1) {
            mr = r * cellSize + margin;
            for (c = 0; c < _this.getModuleCount(); c += 1) {
              if (_this.isDark(r, c) ) {
                mc = c*cellSize+margin;
                qrSvg += 'M' + mc + ',' + mr + rect;
              }
            }
          }

          qrSvg += '" stroke="transparent" fill="black"/>';
          qrSvg += '</svg>';

          return qrSvg;
        };

        _this.createDataURL = function(cellSize, margin) {

          cellSize = cellSize || 2;
          margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min = margin;
          var max = size - margin;

          return createDataURL(size, size, function(x, y) {
            if (min <= x && x < max && min <= y && y < max) {
              var c = Math.floor( (x - min) / cellSize);
              var r = Math.floor( (y - min) / cellSize);
              return _this.isDark(r, c)? 0 : 1;
            } else {
              return 1;
            }
          } );
        };

        _this.createImgTag = function(cellSize, margin, alt) {

          cellSize = cellSize || 2;
          margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

          var size = _this.getModuleCount() * cellSize + margin * 2;

          var img = '';
          img += '<img';
          img += '\u0020src="';
          img += _this.createDataURL(cellSize, margin);
          img += '"';
          img += '\u0020width="';
          img += size;
          img += '"';
          img += '\u0020height="';
          img += size;
          img += '"';
          if (alt) {
            img += '\u0020alt="';
            img += escapeXml(alt);
            img += '"';
          }
          img += '/>';

          return img;
        };

        var escapeXml = function(s) {
          var escaped = '';
          for (var i = 0; i < s.length; i += 1) {
            var c = s.charAt(i);
            switch(c) {
            case '<': escaped += '&lt;'; break;
            case '>': escaped += '&gt;'; break;
            case '&': escaped += '&amp;'; break;
            case '"': escaped += '&quot;'; break;
            default : escaped += c; break;
            }
          }
          return escaped;
        };

        var _createHalfASCII = function(margin) {
          var cellSize = 1;
          margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min = margin;
          var max = size - margin;

          var y, x, r1, r2, p;

          var blocks = {
            '██': '█',
            '█ ': '▀',
            ' █': '▄',
            '  ': ' '
          };

          var blocksLastLineNoMargin = {
            '██': '▀',
            '█ ': '▀',
            ' █': ' ',
            '  ': ' '
          };

          var ascii = '';
          for (y = 0; y < size; y += 2) {
            r1 = Math.floor((y - min) / cellSize);
            r2 = Math.floor((y + 1 - min) / cellSize);
            for (x = 0; x < size; x += 1) {
              p = '█';

              if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
                p = ' ';
              }

              if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
                p += ' ';
              }
              else {
                p += '█';
              }

              // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
              ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
            }

            ascii += '\n';
          }

          if (size % 2 && margin > 0) {
            return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
          }

          return ascii.substring(0, ascii.length-1);
        };

        _this.createASCII = function(cellSize, margin) {
          cellSize = cellSize || 1;

          if (cellSize < 2) {
            return _createHalfASCII(margin);
          }

          cellSize -= 1;
          margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min = margin;
          var max = size - margin;

          var y, x, r, p;

          var white = Array(cellSize+1).join('██');
          var black = Array(cellSize+1).join('  ');

          var ascii = '';
          var line = '';
          for (y = 0; y < size; y += 1) {
            r = Math.floor( (y - min) / cellSize);
            line = '';
            for (x = 0; x < size; x += 1) {
              p = 1;

              if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
                p = 0;
              }

              // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
              line += p ? white : black;
            }

            for (r = 0; r < cellSize; r += 1) {
              ascii += line + '\n';
            }
          }

          return ascii.substring(0, ascii.length-1);
        };

        _this.renderTo2dContext = function(context, cellSize) {
          cellSize = cellSize || 2;
          var length = _this.getModuleCount();
          for (var row = 0; row < length; row++) {
            for (var col = 0; col < length; col++) {
              context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
              context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
            }
          }
        };

        return _this;
      };

      //---------------------------------------------------------------------
      // qrcode.stringToBytes
      //---------------------------------------------------------------------

      qrcode.stringToBytesFuncs = {
        'default' : function(s) {
          var bytes = [];
          for (var i = 0; i < s.length; i += 1) {
            var c = s.charCodeAt(i);
            bytes.push(c & 0xff);
          }
          return bytes;
        }
      };

      qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

      //---------------------------------------------------------------------
      // qrcode.createStringToBytes
      //---------------------------------------------------------------------

      /**
       * @param unicodeData base64 string of byte array.
       * [16bit Unicode],[16bit Bytes], ...
       * @param numChars
       */
      qrcode.createStringToBytes = function(unicodeData, numChars) {

        // create conversion map.

        var unicodeMap = function() {

          var bin = base64DecodeInputStream(unicodeData);
          var read = function() {
            var b = bin.read();
            if (b == -1) throw 'eof';
            return b;
          };

          var count = 0;
          var unicodeMap = {};
          while (true) {
            var b0 = bin.read();
            if (b0 == -1) break;
            var b1 = read();
            var b2 = read();
            var b3 = read();
            var k = String.fromCharCode( (b0 << 8) | b1);
            var v = (b2 << 8) | b3;
            unicodeMap[k] = v;
            count += 1;
          }
          if (count != numChars) {
            throw count + ' != ' + numChars;
          }

          return unicodeMap;
        }();

        var unknownChar = '?'.charCodeAt(0);

        return function(s) {
          var bytes = [];
          for (var i = 0; i < s.length; i += 1) {
            var c = s.charCodeAt(i);
            if (c < 128) {
              bytes.push(c);
            } else {
              var b = unicodeMap[s.charAt(i)];
              if (typeof b == 'number') {
                if ( (b & 0xff) == b) {
                  // 1byte
                  bytes.push(b);
                } else {
                  // 2bytes
                  bytes.push(b >>> 8);
                  bytes.push(b & 0xff);
                }
              } else {
                bytes.push(unknownChar);
              }
            }
          }
          return bytes;
        };
      };

      //---------------------------------------------------------------------
      // QRMode
      //---------------------------------------------------------------------

      var QRMode = {
        MODE_NUMBER :    1 << 0,
        MODE_ALPHA_NUM : 1 << 1,
        MODE_8BIT_BYTE : 1 << 2,
        MODE_KANJI :     1 << 3
      };

      //---------------------------------------------------------------------
      // QRErrorCorrectionLevel
      //---------------------------------------------------------------------

      var QRErrorCorrectionLevel = {
        L : 1,
        M : 0,
        Q : 3,
        H : 2
      };

      //---------------------------------------------------------------------
      // QRMaskPattern
      //---------------------------------------------------------------------

      var QRMaskPattern = {
        PATTERN000 : 0,
        PATTERN001 : 1,
        PATTERN010 : 2,
        PATTERN011 : 3,
        PATTERN100 : 4,
        PATTERN101 : 5,
        PATTERN110 : 6,
        PATTERN111 : 7
      };

      //---------------------------------------------------------------------
      // QRUtil
      //---------------------------------------------------------------------

      var QRUtil = function() {

        var PATTERN_POSITION_TABLE = [
          [],
          [6, 18],
          [6, 22],
          [6, 26],
          [6, 30],
          [6, 34],
          [6, 22, 38],
          [6, 24, 42],
          [6, 26, 46],
          [6, 28, 50],
          [6, 30, 54],
          [6, 32, 58],
          [6, 34, 62],
          [6, 26, 46, 66],
          [6, 26, 48, 70],
          [6, 26, 50, 74],
          [6, 30, 54, 78],
          [6, 30, 56, 82],
          [6, 30, 58, 86],
          [6, 34, 62, 90],
          [6, 28, 50, 72, 94],
          [6, 26, 50, 74, 98],
          [6, 30, 54, 78, 102],
          [6, 28, 54, 80, 106],
          [6, 32, 58, 84, 110],
          [6, 30, 58, 86, 114],
          [6, 34, 62, 90, 118],
          [6, 26, 50, 74, 98, 122],
          [6, 30, 54, 78, 102, 126],
          [6, 26, 52, 78, 104, 130],
          [6, 30, 56, 82, 108, 134],
          [6, 34, 60, 86, 112, 138],
          [6, 30, 58, 86, 114, 142],
          [6, 34, 62, 90, 118, 146],
          [6, 30, 54, 78, 102, 126, 150],
          [6, 24, 50, 76, 102, 128, 154],
          [6, 28, 54, 80, 106, 132, 158],
          [6, 32, 58, 84, 110, 136, 162],
          [6, 26, 54, 82, 110, 138, 166],
          [6, 30, 58, 86, 114, 142, 170]
        ];
        var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
        var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
        var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

        var _this = {};

        var getBCHDigit = function(data) {
          var digit = 0;
          while (data != 0) {
            digit += 1;
            data >>>= 1;
          }
          return digit;
        };

        _this.getBCHTypeInfo = function(data) {
          var d = data << 10;
          while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
            d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
          }
          return ( (data << 10) | d) ^ G15_MASK;
        };

        _this.getBCHTypeNumber = function(data) {
          var d = data << 12;
          while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
            d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
          }
          return (data << 12) | d;
        };

        _this.getPatternPosition = function(typeNumber) {
          return PATTERN_POSITION_TABLE[typeNumber - 1];
        };

        _this.getMaskFunction = function(maskPattern) {

          switch (maskPattern) {

          case QRMaskPattern.PATTERN000 :
            return function(i, j) { return (i + j) % 2 == 0; };
          case QRMaskPattern.PATTERN001 :
            return function(i, j) { return i % 2 == 0; };
          case QRMaskPattern.PATTERN010 :
            return function(i, j) { return j % 3 == 0; };
          case QRMaskPattern.PATTERN011 :
            return function(i, j) { return (i + j) % 3 == 0; };
          case QRMaskPattern.PATTERN100 :
            return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
          case QRMaskPattern.PATTERN101 :
            return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
          case QRMaskPattern.PATTERN110 :
            return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
          case QRMaskPattern.PATTERN111 :
            return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

          default :
            throw 'bad maskPattern:' + maskPattern;
          }
        };

        _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
          var a = qrPolynomial([1], 0);
          for (var i = 0; i < errorCorrectLength; i += 1) {
            a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
          }
          return a;
        };

        _this.getLengthInBits = function(mode, type) {

          if (1 <= type && type < 10) {

            // 1 - 9

            switch(mode) {
            case QRMode.MODE_NUMBER    : return 10;
            case QRMode.MODE_ALPHA_NUM : return 9;
            case QRMode.MODE_8BIT_BYTE : return 8;
            case QRMode.MODE_KANJI     : return 8;
            default :
              throw 'mode:' + mode;
            }

          } else if (type < 27) {

            // 10 - 26

            switch(mode) {
            case QRMode.MODE_NUMBER    : return 12;
            case QRMode.MODE_ALPHA_NUM : return 11;
            case QRMode.MODE_8BIT_BYTE : return 16;
            case QRMode.MODE_KANJI     : return 10;
            default :
              throw 'mode:' + mode;
            }

          } else if (type < 41) {

            // 27 - 40

            switch(mode) {
            case QRMode.MODE_NUMBER    : return 14;
            case QRMode.MODE_ALPHA_NUM : return 13;
            case QRMode.MODE_8BIT_BYTE : return 16;
            case QRMode.MODE_KANJI     : return 12;
            default :
              throw 'mode:' + mode;
            }

          } else {
            throw 'type:' + type;
          }
        };

        _this.getLostPoint = function(qrcode) {

          var moduleCount = qrcode.getModuleCount();

          var lostPoint = 0;

          // LEVEL1

          for (var row = 0; row < moduleCount; row += 1) {
            for (var col = 0; col < moduleCount; col += 1) {

              var sameCount = 0;
              var dark = qrcode.isDark(row, col);

              for (var r = -1; r <= 1; r += 1) {

                if (row + r < 0 || moduleCount <= row + r) {
                  continue;
                }

                for (var c = -1; c <= 1; c += 1) {

                  if (col + c < 0 || moduleCount <= col + c) {
                    continue;
                  }

                  if (r == 0 && c == 0) {
                    continue;
                  }

                  if (dark == qrcode.isDark(row + r, col + c) ) {
                    sameCount += 1;
                  }
                }
              }

              if (sameCount > 5) {
                lostPoint += (3 + sameCount - 5);
              }
            }
          }
          // LEVEL2

          for (var row = 0; row < moduleCount - 1; row += 1) {
            for (var col = 0; col < moduleCount - 1; col += 1) {
              var count = 0;
              if (qrcode.isDark(row, col) ) count += 1;
              if (qrcode.isDark(row + 1, col) ) count += 1;
              if (qrcode.isDark(row, col + 1) ) count += 1;
              if (qrcode.isDark(row + 1, col + 1) ) count += 1;
              if (count == 0 || count == 4) {
                lostPoint += 3;
              }
            }
          }

          // LEVEL3

          for (var row = 0; row < moduleCount; row += 1) {
            for (var col = 0; col < moduleCount - 6; col += 1) {
              if (qrcode.isDark(row, col)
                  && !qrcode.isDark(row, col + 1)
                  &&  qrcode.isDark(row, col + 2)
                  &&  qrcode.isDark(row, col + 3)
                  &&  qrcode.isDark(row, col + 4)
                  && !qrcode.isDark(row, col + 5)
                  &&  qrcode.isDark(row, col + 6) ) {
                lostPoint += 40;
              }
            }
          }

          for (var col = 0; col < moduleCount; col += 1) {
            for (var row = 0; row < moduleCount - 6; row += 1) {
              if (qrcode.isDark(row, col)
                  && !qrcode.isDark(row + 1, col)
                  &&  qrcode.isDark(row + 2, col)
                  &&  qrcode.isDark(row + 3, col)
                  &&  qrcode.isDark(row + 4, col)
                  && !qrcode.isDark(row + 5, col)
                  &&  qrcode.isDark(row + 6, col) ) {
                lostPoint += 40;
              }
            }
          }

          // LEVEL4

          var darkCount = 0;

          for (var col = 0; col < moduleCount; col += 1) {
            for (var row = 0; row < moduleCount; row += 1) {
              if (qrcode.isDark(row, col) ) {
                darkCount += 1;
              }
            }
          }

          var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
          lostPoint += ratio * 10;

          return lostPoint;
        };

        return _this;
      }();

      //---------------------------------------------------------------------
      // QRMath
      //---------------------------------------------------------------------

      var QRMath = function() {

        var EXP_TABLE = new Array(256);
        var LOG_TABLE = new Array(256);

        // initialize tables
        for (var i = 0; i < 8; i += 1) {
          EXP_TABLE[i] = 1 << i;
        }
        for (var i = 8; i < 256; i += 1) {
          EXP_TABLE[i] = EXP_TABLE[i - 4]
            ^ EXP_TABLE[i - 5]
            ^ EXP_TABLE[i - 6]
            ^ EXP_TABLE[i - 8];
        }
        for (var i = 0; i < 255; i += 1) {
          LOG_TABLE[EXP_TABLE[i] ] = i;
        }

        var _this = {};

        _this.glog = function(n) {

          if (n < 1) {
            throw 'glog(' + n + ')';
          }

          return LOG_TABLE[n];
        };

        _this.gexp = function(n) {

          while (n < 0) {
            n += 255;
          }

          while (n >= 256) {
            n -= 255;
          }

          return EXP_TABLE[n];
        };

        return _this;
      }();

      //---------------------------------------------------------------------
      // qrPolynomial
      //---------------------------------------------------------------------

      function qrPolynomial(num, shift) {

        if (typeof num.length == 'undefined') {
          throw num.length + '/' + shift;
        }

        var _num = function() {
          var offset = 0;
          while (offset < num.length && num[offset] == 0) {
            offset += 1;
          }
          var _num = new Array(num.length - offset + shift);
          for (var i = 0; i < num.length - offset; i += 1) {
            _num[i] = num[i + offset];
          }
          return _num;
        }();

        var _this = {};

        _this.getAt = function(index) {
          return _num[index];
        };

        _this.getLength = function() {
          return _num.length;
        };

        _this.multiply = function(e) {

          var num = new Array(_this.getLength() + e.getLength() - 1);

          for (var i = 0; i < _this.getLength(); i += 1) {
            for (var j = 0; j < e.getLength(); j += 1) {
              num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
            }
          }

          return qrPolynomial(num, 0);
        };

        _this.mod = function(e) {

          if (_this.getLength() - e.getLength() < 0) {
            return _this;
          }

          var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

          var num = new Array(_this.getLength() );
          for (var i = 0; i < _this.getLength(); i += 1) {
            num[i] = _this.getAt(i);
          }

          for (var i = 0; i < e.getLength(); i += 1) {
            num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
          }

          // recursive call
          return qrPolynomial(num, 0).mod(e);
        };

        return _this;
      }
      //---------------------------------------------------------------------
      // QRRSBlock
      //---------------------------------------------------------------------

      var QRRSBlock = function() {

        var RS_BLOCK_TABLE = [

          // L
          // M
          // Q
          // H

          // 1
          [1, 26, 19],
          [1, 26, 16],
          [1, 26, 13],
          [1, 26, 9],

          // 2
          [1, 44, 34],
          [1, 44, 28],
          [1, 44, 22],
          [1, 44, 16],

          // 3
          [1, 70, 55],
          [1, 70, 44],
          [2, 35, 17],
          [2, 35, 13],

          // 4
          [1, 100, 80],
          [2, 50, 32],
          [2, 50, 24],
          [4, 25, 9],

          // 5
          [1, 134, 108],
          [2, 67, 43],
          [2, 33, 15, 2, 34, 16],
          [2, 33, 11, 2, 34, 12],

          // 6
          [2, 86, 68],
          [4, 43, 27],
          [4, 43, 19],
          [4, 43, 15],

          // 7
          [2, 98, 78],
          [4, 49, 31],
          [2, 32, 14, 4, 33, 15],
          [4, 39, 13, 1, 40, 14],

          // 8
          [2, 121, 97],
          [2, 60, 38, 2, 61, 39],
          [4, 40, 18, 2, 41, 19],
          [4, 40, 14, 2, 41, 15],

          // 9
          [2, 146, 116],
          [3, 58, 36, 2, 59, 37],
          [4, 36, 16, 4, 37, 17],
          [4, 36, 12, 4, 37, 13],

          // 10
          [2, 86, 68, 2, 87, 69],
          [4, 69, 43, 1, 70, 44],
          [6, 43, 19, 2, 44, 20],
          [6, 43, 15, 2, 44, 16],

          // 11
          [4, 101, 81],
          [1, 80, 50, 4, 81, 51],
          [4, 50, 22, 4, 51, 23],
          [3, 36, 12, 8, 37, 13],

          // 12
          [2, 116, 92, 2, 117, 93],
          [6, 58, 36, 2, 59, 37],
          [4, 46, 20, 6, 47, 21],
          [7, 42, 14, 4, 43, 15],

          // 13
          [4, 133, 107],
          [8, 59, 37, 1, 60, 38],
          [8, 44, 20, 4, 45, 21],
          [12, 33, 11, 4, 34, 12],

          // 14
          [3, 145, 115, 1, 146, 116],
          [4, 64, 40, 5, 65, 41],
          [11, 36, 16, 5, 37, 17],
          [11, 36, 12, 5, 37, 13],

          // 15
          [5, 109, 87, 1, 110, 88],
          [5, 65, 41, 5, 66, 42],
          [5, 54, 24, 7, 55, 25],
          [11, 36, 12, 7, 37, 13],

          // 16
          [5, 122, 98, 1, 123, 99],
          [7, 73, 45, 3, 74, 46],
          [15, 43, 19, 2, 44, 20],
          [3, 45, 15, 13, 46, 16],

          // 17
          [1, 135, 107, 5, 136, 108],
          [10, 74, 46, 1, 75, 47],
          [1, 50, 22, 15, 51, 23],
          [2, 42, 14, 17, 43, 15],

          // 18
          [5, 150, 120, 1, 151, 121],
          [9, 69, 43, 4, 70, 44],
          [17, 50, 22, 1, 51, 23],
          [2, 42, 14, 19, 43, 15],

          // 19
          [3, 141, 113, 4, 142, 114],
          [3, 70, 44, 11, 71, 45],
          [17, 47, 21, 4, 48, 22],
          [9, 39, 13, 16, 40, 14],

          // 20
          [3, 135, 107, 5, 136, 108],
          [3, 67, 41, 13, 68, 42],
          [15, 54, 24, 5, 55, 25],
          [15, 43, 15, 10, 44, 16],

          // 21
          [4, 144, 116, 4, 145, 117],
          [17, 68, 42],
          [17, 50, 22, 6, 51, 23],
          [19, 46, 16, 6, 47, 17],

          // 22
          [2, 139, 111, 7, 140, 112],
          [17, 74, 46],
          [7, 54, 24, 16, 55, 25],
          [34, 37, 13],

          // 23
          [4, 151, 121, 5, 152, 122],
          [4, 75, 47, 14, 76, 48],
          [11, 54, 24, 14, 55, 25],
          [16, 45, 15, 14, 46, 16],

          // 24
          [6, 147, 117, 4, 148, 118],
          [6, 73, 45, 14, 74, 46],
          [11, 54, 24, 16, 55, 25],
          [30, 46, 16, 2, 47, 17],

          // 25
          [8, 132, 106, 4, 133, 107],
          [8, 75, 47, 13, 76, 48],
          [7, 54, 24, 22, 55, 25],
          [22, 45, 15, 13, 46, 16],

          // 26
          [10, 142, 114, 2, 143, 115],
          [19, 74, 46, 4, 75, 47],
          [28, 50, 22, 6, 51, 23],
          [33, 46, 16, 4, 47, 17],

          // 27
          [8, 152, 122, 4, 153, 123],
          [22, 73, 45, 3, 74, 46],
          [8, 53, 23, 26, 54, 24],
          [12, 45, 15, 28, 46, 16],

          // 28
          [3, 147, 117, 10, 148, 118],
          [3, 73, 45, 23, 74, 46],
          [4, 54, 24, 31, 55, 25],
          [11, 45, 15, 31, 46, 16],

          // 29
          [7, 146, 116, 7, 147, 117],
          [21, 73, 45, 7, 74, 46],
          [1, 53, 23, 37, 54, 24],
          [19, 45, 15, 26, 46, 16],

          // 30
          [5, 145, 115, 10, 146, 116],
          [19, 75, 47, 10, 76, 48],
          [15, 54, 24, 25, 55, 25],
          [23, 45, 15, 25, 46, 16],

          // 31
          [13, 145, 115, 3, 146, 116],
          [2, 74, 46, 29, 75, 47],
          [42, 54, 24, 1, 55, 25],
          [23, 45, 15, 28, 46, 16],

          // 32
          [17, 145, 115],
          [10, 74, 46, 23, 75, 47],
          [10, 54, 24, 35, 55, 25],
          [19, 45, 15, 35, 46, 16],

          // 33
          [17, 145, 115, 1, 146, 116],
          [14, 74, 46, 21, 75, 47],
          [29, 54, 24, 19, 55, 25],
          [11, 45, 15, 46, 46, 16],

          // 34
          [13, 145, 115, 6, 146, 116],
          [14, 74, 46, 23, 75, 47],
          [44, 54, 24, 7, 55, 25],
          [59, 46, 16, 1, 47, 17],

          // 35
          [12, 151, 121, 7, 152, 122],
          [12, 75, 47, 26, 76, 48],
          [39, 54, 24, 14, 55, 25],
          [22, 45, 15, 41, 46, 16],

          // 36
          [6, 151, 121, 14, 152, 122],
          [6, 75, 47, 34, 76, 48],
          [46, 54, 24, 10, 55, 25],
          [2, 45, 15, 64, 46, 16],

          // 37
          [17, 152, 122, 4, 153, 123],
          [29, 74, 46, 14, 75, 47],
          [49, 54, 24, 10, 55, 25],
          [24, 45, 15, 46, 46, 16],

          // 38
          [4, 152, 122, 18, 153, 123],
          [13, 74, 46, 32, 75, 47],
          [48, 54, 24, 14, 55, 25],
          [42, 45, 15, 32, 46, 16],

          // 39
          [20, 147, 117, 4, 148, 118],
          [40, 75, 47, 7, 76, 48],
          [43, 54, 24, 22, 55, 25],
          [10, 45, 15, 67, 46, 16],

          // 40
          [19, 148, 118, 6, 149, 119],
          [18, 75, 47, 31, 76, 48],
          [34, 54, 24, 34, 55, 25],
          [20, 45, 15, 61, 46, 16]
        ];

        var qrRSBlock = function(totalCount, dataCount) {
          var _this = {};
          _this.totalCount = totalCount;
          _this.dataCount = dataCount;
          return _this;
        };

        var _this = {};

        var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

          switch(errorCorrectionLevel) {
          case QRErrorCorrectionLevel.L :
            return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
          case QRErrorCorrectionLevel.M :
            return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
          case QRErrorCorrectionLevel.Q :
            return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
          case QRErrorCorrectionLevel.H :
            return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
          default :
            return undefined;
          }
        };

        _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

          var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

          if (typeof rsBlock == 'undefined') {
            throw 'bad rs block @ typeNumber:' + typeNumber +
                '/errorCorrectionLevel:' + errorCorrectionLevel;
          }

          var length = rsBlock.length / 3;

          var list = [];

          for (var i = 0; i < length; i += 1) {

            var count = rsBlock[i * 3 + 0];
            var totalCount = rsBlock[i * 3 + 1];
            var dataCount = rsBlock[i * 3 + 2];

            for (var j = 0; j < count; j += 1) {
              list.push(qrRSBlock(totalCount, dataCount) );
            }
          }

          return list;
        };

        return _this;
      }();

      //---------------------------------------------------------------------
      // qrBitBuffer
      //---------------------------------------------------------------------

      var qrBitBuffer = function() {

        var _buffer = [];
        var _length = 0;

        var _this = {};

        _this.getBuffer = function() {
          return _buffer;
        };

        _this.getAt = function(index) {
          var bufIndex = Math.floor(index / 8);
          return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
        };

        _this.put = function(num, length) {
          for (var i = 0; i < length; i += 1) {
            _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
          }
        };

        _this.getLengthInBits = function() {
          return _length;
        };

        _this.putBit = function(bit) {

          var bufIndex = Math.floor(_length / 8);
          if (_buffer.length <= bufIndex) {
            _buffer.push(0);
          }

          if (bit) {
            _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
          }

          _length += 1;
        };

        return _this;
      };

      //---------------------------------------------------------------------
      // qrNumber
      //---------------------------------------------------------------------

      var qrNumber = function(data) {

        var _mode = QRMode.MODE_NUMBER;
        var _data = data;

        var _this = {};

        _this.getMode = function() {
          return _mode;
        };

        _this.getLength = function(buffer) {
          return _data.length;
        };

        _this.write = function(buffer) {

          var data = _data;

          var i = 0;

          while (i + 2 < data.length) {
            buffer.put(strToNum(data.substring(i, i + 3) ), 10);
            i += 3;
          }

          if (i < data.length) {
            if (data.length - i == 1) {
              buffer.put(strToNum(data.substring(i, i + 1) ), 4);
            } else if (data.length - i == 2) {
              buffer.put(strToNum(data.substring(i, i + 2) ), 7);
            }
          }
        };

        var strToNum = function(s) {
          var num = 0;
          for (var i = 0; i < s.length; i += 1) {
            num = num * 10 + chatToNum(s.charAt(i) );
          }
          return num;
        };

        var chatToNum = function(c) {
          if ('0' <= c && c <= '9') {
            return c.charCodeAt(0) - '0'.charCodeAt(0);
          }
          throw 'illegal char :' + c;
        };

        return _this;
      };

      //---------------------------------------------------------------------
      // qrAlphaNum
      //---------------------------------------------------------------------

      var qrAlphaNum = function(data) {

        var _mode = QRMode.MODE_ALPHA_NUM;
        var _data = data;

        var _this = {};

        _this.getMode = function() {
          return _mode;
        };

        _this.getLength = function(buffer) {
          return _data.length;
        };

        _this.write = function(buffer) {

          var s = _data;

          var i = 0;

          while (i + 1 < s.length) {
            buffer.put(
              getCode(s.charAt(i) ) * 45 +
              getCode(s.charAt(i + 1) ), 11);
            i += 2;
          }

          if (i < s.length) {
            buffer.put(getCode(s.charAt(i) ), 6);
          }
        };

        var getCode = function(c) {

          if ('0' <= c && c <= '9') {
            return c.charCodeAt(0) - '0'.charCodeAt(0);
          } else if ('A' <= c && c <= 'Z') {
            return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
          } else {
            switch (c) {
            case ' ' : return 36;
            case '$' : return 37;
            case '%' : return 38;
            case '*' : return 39;
            case '+' : return 40;
            case '-' : return 41;
            case '.' : return 42;
            case '/' : return 43;
            case ':' : return 44;
            default :
              throw 'illegal char :' + c;
            }
          }
        };

        return _this;
      };

      //---------------------------------------------------------------------
      // qr8BitByte
      //---------------------------------------------------------------------

      var qr8BitByte = function(data) {

        var _mode = QRMode.MODE_8BIT_BYTE;
        var _bytes = qrcode.stringToBytes(data);

        var _this = {};

        _this.getMode = function() {
          return _mode;
        };

        _this.getLength = function(buffer) {
          return _bytes.length;
        };

        _this.write = function(buffer) {
          for (var i = 0; i < _bytes.length; i += 1) {
            buffer.put(_bytes[i], 8);
          }
        };

        return _this;
      };

      //---------------------------------------------------------------------
      // qrKanji
      //---------------------------------------------------------------------

      var qrKanji = function(data) {

        var _mode = QRMode.MODE_KANJI;

        var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
        if (!stringToBytes) {
          throw 'sjis not supported.';
        }
        !function(c, code) {
          // self test for sjis support.
          var test = stringToBytes(c);
          if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
            throw 'sjis not supported.';
          }
        }('\u53cb', 0x9746);

        var _bytes = stringToBytes(data);

        var _this = {};

        _this.getMode = function() {
          return _mode;
        };

        _this.getLength = function(buffer) {
          return ~~(_bytes.length / 2);
        };

        _this.write = function(buffer) {

          var data = _bytes;

          var i = 0;

          while (i + 1 < data.length) {

            var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

            if (0x8140 <= c && c <= 0x9FFC) {
              c -= 0x8140;
            } else if (0xE040 <= c && c <= 0xEBBF) {
              c -= 0xC140;
            } else {
              throw 'illegal char at ' + (i + 1) + '/' + c;
            }

            c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

            buffer.put(c, 13);

            i += 2;
          }

          if (i < data.length) {
            throw 'illegal char at ' + (i + 1);
          }
        };

        return _this;
      };

      //=====================================================================
      // GIF Support etc.
      //

      //---------------------------------------------------------------------
      // byteArrayOutputStream
      //---------------------------------------------------------------------

      var byteArrayOutputStream = function() {

        var _bytes = [];

        var _this = {};

        _this.writeByte = function(b) {
          _bytes.push(b & 0xff);
        };

        _this.writeShort = function(i) {
          _this.writeByte(i);
          _this.writeByte(i >>> 8);
        };

        _this.writeBytes = function(b, off, len) {
          off = off || 0;
          len = len || b.length;
          for (var i = 0; i < len; i += 1) {
            _this.writeByte(b[i + off]);
          }
        };

        _this.writeString = function(s) {
          for (var i = 0; i < s.length; i += 1) {
            _this.writeByte(s.charCodeAt(i) );
          }
        };

        _this.toByteArray = function() {
          return _bytes;
        };

        _this.toString = function() {
          var s = '';
          s += '[';
          for (var i = 0; i < _bytes.length; i += 1) {
            if (i > 0) {
              s += ',';
            }
            s += _bytes[i];
          }
          s += ']';
          return s;
        };

        return _this;
      };

      //---------------------------------------------------------------------
      // base64EncodeOutputStream
      //---------------------------------------------------------------------

      var base64EncodeOutputStream = function() {

        var _buffer = 0;
        var _buflen = 0;
        var _length = 0;
        var _base64 = '';

        var _this = {};

        var writeEncoded = function(b) {
          _base64 += String.fromCharCode(encode(b & 0x3f) );
        };

        var encode = function(n) {
          if (n < 0) ; else if (n < 26) {
            return 0x41 + n;
          } else if (n < 52) {
            return 0x61 + (n - 26);
          } else if (n < 62) {
            return 0x30 + (n - 52);
          } else if (n == 62) {
            return 0x2b;
          } else if (n == 63) {
            return 0x2f;
          }
          throw 'n:' + n;
        };

        _this.writeByte = function(n) {

          _buffer = (_buffer << 8) | (n & 0xff);
          _buflen += 8;
          _length += 1;

          while (_buflen >= 6) {
            writeEncoded(_buffer >>> (_buflen - 6) );
            _buflen -= 6;
          }
        };

        _this.flush = function() {

          if (_buflen > 0) {
            writeEncoded(_buffer << (6 - _buflen) );
            _buffer = 0;
            _buflen = 0;
          }

          if (_length % 3 != 0) {
            // padding
            var padlen = 3 - _length % 3;
            for (var i = 0; i < padlen; i += 1) {
              _base64 += '=';
            }
          }
        };

        _this.toString = function() {
          return _base64;
        };

        return _this;
      };

      //---------------------------------------------------------------------
      // base64DecodeInputStream
      //---------------------------------------------------------------------

      var base64DecodeInputStream = function(str) {

        var _str = str;
        var _pos = 0;
        var _buffer = 0;
        var _buflen = 0;

        var _this = {};

        _this.read = function() {

          while (_buflen < 8) {

            if (_pos >= _str.length) {
              if (_buflen == 0) {
                return -1;
              }
              throw 'unexpected end of file./' + _buflen;
            }

            var c = _str.charAt(_pos);
            _pos += 1;

            if (c == '=') {
              _buflen = 0;
              return -1;
            } else if (c.match(/^\s$/) ) {
              // ignore if whitespace.
              continue;
            }

            _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
            _buflen += 6;
          }

          var n = (_buffer >>> (_buflen - 8) ) & 0xff;
          _buflen -= 8;
          return n;
        };

        var decode = function(c) {
          if (0x41 <= c && c <= 0x5a) {
            return c - 0x41;
          } else if (0x61 <= c && c <= 0x7a) {
            return c - 0x61 + 26;
          } else if (0x30 <= c && c <= 0x39) {
            return c - 0x30 + 52;
          } else if (c == 0x2b) {
            return 62;
          } else if (c == 0x2f) {
            return 63;
          } else {
            throw 'c:' + c;
          }
        };

        return _this;
      };

      //---------------------------------------------------------------------
      // gifImage (B/W)
      //---------------------------------------------------------------------

      var gifImage = function(width, height) {

        var _width = width;
        var _height = height;
        var _data = new Array(width * height);

        var _this = {};

        _this.setPixel = function(x, y, pixel) {
          _data[y * _width + x] = pixel;
        };

        _this.write = function(out) {

          //---------------------------------
          // GIF Signature

          out.writeString('GIF87a');

          //---------------------------------
          // Screen Descriptor

          out.writeShort(_width);
          out.writeShort(_height);

          out.writeByte(0x80); // 2bit
          out.writeByte(0);
          out.writeByte(0);

          //---------------------------------
          // Global Color Map

          // black
          out.writeByte(0x00);
          out.writeByte(0x00);
          out.writeByte(0x00);

          // white
          out.writeByte(0xff);
          out.writeByte(0xff);
          out.writeByte(0xff);

          //---------------------------------
          // Image Descriptor

          out.writeString(',');
          out.writeShort(0);
          out.writeShort(0);
          out.writeShort(_width);
          out.writeShort(_height);
          out.writeByte(0);

          //---------------------------------
          // Local Color Map

          //---------------------------------
          // Raster Data

          var lzwMinCodeSize = 2;
          var raster = getLZWRaster(lzwMinCodeSize);

          out.writeByte(lzwMinCodeSize);

          var offset = 0;

          while (raster.length - offset > 255) {
            out.writeByte(255);
            out.writeBytes(raster, offset, 255);
            offset += 255;
          }

          out.writeByte(raster.length - offset);
          out.writeBytes(raster, offset, raster.length - offset);
          out.writeByte(0x00);

          //---------------------------------
          // GIF Terminator
          out.writeString(';');
        };

        var bitOutputStream = function(out) {

          var _out = out;
          var _bitLength = 0;
          var _bitBuffer = 0;

          var _this = {};

          _this.write = function(data, length) {

            if ( (data >>> length) != 0) {
              throw 'length over';
            }

            while (_bitLength + length >= 8) {
              _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
              length -= (8 - _bitLength);
              data >>>= (8 - _bitLength);
              _bitBuffer = 0;
              _bitLength = 0;
            }

            _bitBuffer = (data << _bitLength) | _bitBuffer;
            _bitLength = _bitLength + length;
          };

          _this.flush = function() {
            if (_bitLength > 0) {
              _out.writeByte(_bitBuffer);
            }
          };

          return _this;
        };

        var getLZWRaster = function(lzwMinCodeSize) {

          var clearCode = 1 << lzwMinCodeSize;
          var endCode = (1 << lzwMinCodeSize) + 1;
          var bitLength = lzwMinCodeSize + 1;

          // Setup LZWTable
          var table = lzwTable();

          for (var i = 0; i < clearCode; i += 1) {
            table.add(String.fromCharCode(i) );
          }
          table.add(String.fromCharCode(clearCode) );
          table.add(String.fromCharCode(endCode) );

          var byteOut = byteArrayOutputStream();
          var bitOut = bitOutputStream(byteOut);

          // clear code
          bitOut.write(clearCode, bitLength);

          var dataIndex = 0;

          var s = String.fromCharCode(_data[dataIndex]);
          dataIndex += 1;

          while (dataIndex < _data.length) {

            var c = String.fromCharCode(_data[dataIndex]);
            dataIndex += 1;

            if (table.contains(s + c) ) {

              s = s + c;

            } else {

              bitOut.write(table.indexOf(s), bitLength);

              if (table.size() < 0xfff) {

                if (table.size() == (1 << bitLength) ) {
                  bitLength += 1;
                }

                table.add(s + c);
              }

              s = c;
            }
          }

          bitOut.write(table.indexOf(s), bitLength);

          // end code
          bitOut.write(endCode, bitLength);

          bitOut.flush();

          return byteOut.toByteArray();
        };

        var lzwTable = function() {

          var _map = {};
          var _size = 0;

          var _this = {};

          _this.add = function(key) {
            if (_this.contains(key) ) {
              throw 'dup key:' + key;
            }
            _map[key] = _size;
            _size += 1;
          };

          _this.size = function() {
            return _size;
          };

          _this.indexOf = function(key) {
            return _map[key];
          };

          _this.contains = function(key) {
            return typeof _map[key] != 'undefined';
          };

          return _this;
        };

        return _this;
      };

      var createDataURL = function(width, height, getPixel) {
        var gif = gifImage(width, height);
        for (var y = 0; y < height; y += 1) {
          for (var x = 0; x < width; x += 1) {
            gif.setPixel(x, y, getPixel(x, y) );
          }
        }

        var b = byteArrayOutputStream();
        gif.write(b);

        var base64 = base64EncodeOutputStream();
        var bytes = b.toByteArray();
        for (var i = 0; i < bytes.length; i += 1) {
          base64.writeByte(bytes[i]);
        }
        base64.flush();

        return 'data:image/gif;base64,' + base64;
      };

      //---------------------------------------------------------------------
      // returns qrcode function.

      return qrcode;
    }();

    // multibyte support
    !function() {

      qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
        // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
        function toUTF8Array(str) {
          var utf8 = [];
          for (var i=0; i < str.length; i++) {
            var charcode = str.charCodeAt(i);
            if (charcode < 0x80) utf8.push(charcode);
            else if (charcode < 0x800) {
              utf8.push(0xc0 | (charcode >> 6),
                  0x80 | (charcode & 0x3f));
            }
            else if (charcode < 0xd800 || charcode >= 0xe000) {
              utf8.push(0xe0 | (charcode >> 12),
                  0x80 | ((charcode>>6) & 0x3f),
                  0x80 | (charcode & 0x3f));
            }
            // surrogate pair
            else {
              i++;
              // UTF-16 encodes 0x10000-0x10FFFF by
              // subtracting 0x10000 and splitting the
              // 20 bits of 0x0-0xFFFFF into two halves
              charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                | (str.charCodeAt(i) & 0x3ff));
              utf8.push(0xf0 | (charcode >>18),
                  0x80 | ((charcode>>12) & 0x3f),
                  0x80 | ((charcode>>6) & 0x3f),
                  0x80 | (charcode & 0x3f));
            }
          }
          return utf8;
        }
        return toUTF8Array(s);
      };

    }();

    (function (factory) {
      {
          module.exports = factory();
      }
    }(function () {
        return qrcode;
    }));
    });

    function PlayerItem(props) {
        var player = props.player, vote_ = props.vote;
        var _a = React.useState({ show: false, vote: false }), vote = _a[0], setVote = _a[1];
        React.useEffect(function () {
            if (vote_ === null) {
                var timeout_1 = setTimeout(function () {
                    setVote(function (v) { return ({ show: false, vote: v.vote }); });
                }, 6000);
                return function () { return clearTimeout(timeout_1); };
            }
            else {
                setVote({ show: true, vote: vote_ });
                return function () { };
            }
        }, [vote_]);
        return (React.createElement("div", { className: "player-item" + (player.isDead ? " dead" : "") },
            player.name,
            props.president ? " (P)" : "",
            props.chancellor ? " (C)" : "",
            player.isConfirmedNotHitler && (React.createElement("div", { className: "not-hitler" }, "Not Hitler!")),
            React.createElement("div", { className: "vote" + (vote.show ? "" : " hidden") + " " + (vote.vote ? "ja" : "nein") }, vote.vote ? "JA!" : "NEIN!")));
    }
    function mapModalKey(state) {
        if (state.type == "election") {
            return state.type + ":" + state.presidentElect;
        }
        return state.type;
    }
    var backgroundMusic = new Audio("./sound/moonlight.mp3");
    backgroundMusic.volume = 0.8;
    backgroundMusic.loop = true;
    var tensionMusic = new Audio("./sound/tension.mp3");
    tensionMusic.volume = 0.4;
    tensionMusic.loop = true;
    var staySilentSound = new Audio("./sound/remain-silent.mp3");
    var electChancellorSound = new Audio("./sound/elect a chancellor.mp3");
    var executePlayerSound = new Audio("./sound/execute player.mp3");
    var playerDeathSound = new Audio("./sound/player death.mp3");
    var investigateSound = new Audio("./sound/investigate loyalty.mp3");
    var policyPeekSound = new Audio("./sound/look at 3 policy cards.mp3");
    var secretRoleSound = new Audio("./sound/secret role.mp3");
    function PlayBoard(props) {
        var screen = useWindowSize();
        var gameStarted = ["lobby", "nightRound"].indexOf(props.state.type) == -1;
        var _a = React.useState(), qrCode = _a[0], setQrCode = _a[1];
        React.useEffect(function () {
            var qr = qrcode_1(4, "L");
            qr.addData("https://secrethitler.live/?m=p&g=" + props.gameId);
            qr.make();
            setQrCode(qr.createDataURL(20, 40));
        }, [props.gameId]);
        var president = props.lastPresident;
        var chancellor = props.lastChancellor;
        if (props.state.type == "legislativeSession") {
            president = props.state.president;
            chancellor = props.state.chancellor;
        }
        var modalTransitions = useTransition(props.state, mapModalKey, {
            from: { transform: "translate(0%, 100%)" },
            enter: { transform: "translate(0%, 0%)" },
            leave: { transform: "translate(0%, -100%)" },
        });
        var numPlayers = props.players.length;
        var revealLib = props.state.type == "cardReveal" && props.state.card == "Liberal";
        var revealFas = props.state.type == "cardReveal" && props.state.card == "Fascist";
        var voteHasResult = props.state.type == "election" && props.state.voteResult != null;
        var showResult = useDelay(voteHasResult, 1000);
        var getVote = function (i) {
            if (props.state.type == "election" && showResult) {
                return props.state.votes[i];
            }
            else {
                return null;
            }
        };
        var showChaos = props.state.type == "cardReveal" && props.state.chaos;
        var hideChaos = useDelay(showChaos, 2500);
        var cardRevealOver = useDelay(props.state.type == "cardReveal", 3800);
        var t = props.state.type;
        useSound(backgroundMusic, t != "legislativeSession" &&
            (t != "cardReveal" || cardRevealOver) &&
            t != "end");
        useSound(tensionMusic, t == "legislativeSession");
        useSound(staySilentSound, t == "legislativeSession");
        useSound(electChancellorSound, props.state.type == "election" && props.state.chancellorElect == undefined);
        useSound(executePlayerSound, props.state.type == "executiveAction" && props.state.action == "execution");
        useSound(playerDeathSound, props.state.type == "executiveAction" &&
            props.state.action == "execution" &&
            props.state.playerChosen != null);
        useSound(investigateSound, props.state.type == "executiveAction" && props.state.action == "investigate");
        useSound(policyPeekSound, props.state.type == "executiveAction" && props.state.action == "policyPeak");
        useSound(secretRoleSound, props.state.type == "nightRound");
        var electionTracker = props.electionTracker;
        if (props.state.type == "election" &&
            showResult &&
            props.state.voteResult === false) {
            electionTracker++;
        }
        if (props.state.type == "legislativeSession" &&
            props.state.turn == "VetoApproved") {
            electionTracker++;
        }
        return (React.createElement("div", { className: "play-board" },
            gameStarted && (React.createElement(React.Fragment, null,
                React.createElement(PolicyTracker, { screen: screen, party: "Liberal", numCards: props.numLiberalCards, reveal: revealLib, numPlayers: numPlayers }),
                React.createElement(PolicyTracker, { screen: screen, party: "Fascist", numCards: props.numFascistCards, reveal: revealFas, numPlayers: numPlayers }))),
            props.state.type === "lobby" && (React.createElement("div", { className: "joinscreen" },
                React.createElement("p", null,
                    "Go to ",
                    React.createElement("strong", null, "secrethitler.live"),
                    " and enter room code"),
                React.createElement("h2", null, props.gameId),
                React.createElement("p", null, "or scan the QR code"),
                React.createElement("img", { src: qrCode }))),
            React.createElement("div", { className: "util" },
                props.players.map(function (player, i) { return (React.createElement(PlayerItem, { player: player, vote: getVote(i), president: i === president, chancellor: i === chancellor })); }),
                React.createElement("div", null,
                    React.createElement(ElectionTracker, { tracker: electionTracker, deck: props.drawPile }))),
            React.createElement("div", { className: "modal-wrap" }, modalTransitions.map(function (_a) {
                var item = _a.item, key = _a.key, style = _a.props;
                var modal;
                var cl = "modal";
                if (item.type == "nightRound") {
                    modal = React.createElement(NightRoundModal, null);
                    cl = "modal no-bk";
                }
                if (item.type == "election") {
                    modal = (React.createElement(ElectionModal, { election: item, players: props.players, showResult: showResult, done: props.done }));
                }
                if (item.type == "legislativeSession") {
                    modal = (React.createElement(LegislativeModal, { state: item, players: props.players, done: props.done }));
                }
                if (item.type == "executiveAction") {
                    modal = (React.createElement(ExecutiveModal, { state: item, players: props.players, done: props.done }));
                }
                if (item.type == "end") {
                    modal = React.createElement(GameOverModal, { state: item, players: props.players });
                    cl = "modal " + item.winner.toLowerCase() + "-win";
                }
                return modal ? (React.createElement(extendedAnimated.div, { key: key, className: cl, style: style }, modal)) : null;
            })),
            React.createElement("h1", { className: "chaos" + (showChaos && !hideChaos ? " show" : "") }, "Chaos!")));
    }

    function BoardApp() {
        var _a;
        var _b = React.useState((function () {
            var gameId = getQueryVariable("g");
            if ((gameId === null || gameId === void 0 ? void 0 : gameId.length) == 4) {
                return { type: "board_join", gameId: gameId };
            }
            else {
                return null;
            }
        })()), joinGameMsg = _b[0], setJoinGameMsg = _b[1];
        var _c = React.useState(null), state = _c[0], setState = _c[1];
        var _d = React.useState(null), error = _d[0], setError = _d[1];
        var _e = useWebSocket(function (msg) {
            switch (msg.type) {
                case "game_created":
                    send({
                        type: "board_join",
                        gameId: msg.gameId,
                    });
                    break;
                case "game_joined":
                    var joinMsg = {
                        type: "board_join",
                        gameId: msg.gameId,
                    };
                    setJoinGameMsg(joinMsg);
                    window.history.pushState("", "", "?m=b&g=" + msg.gameId);
                    break;
                case "update":
                    setState(msg.state);
                    setError(null);
                    break;
                case "gameover":
                    setState(null);
                    setJoinGameMsg(null);
                    window.history.pushState("", "", "?m=p");
                    break;
                case "error":
                    if (msg.error.match(/game does not exist/i)) {
                        setState(null);
                        setJoinGameMsg(null);
                        window.history.pushState("", "", "?m=b");
                    }
                    else {
                        setError(msg.error);
                        throw new Error(msg.error);
                    }
                    break;
                default:
                    throw new Error("Unknown message from server: " + msg.type);
            }
        }, function () {
            if (joinGameMsg)
                send(joinGameMsg);
        }), connected = _e[0], send = _e[1];
        var sendConnect = function (params) {
            send(__assign({ type: "board_join" }, params));
        };
        var createGame = function () {
            send({ type: "create_game" });
        };
        React.useEffect(function () {
            var _a;
            if (((_a = state === null || state === void 0 ? void 0 : state.state) === null || _a === void 0 ? void 0 : _a.type) == "cardReveal") {
                var timeout_1 = setTimeout(function () {
                    send({ type: "board_next", state: "cardReveal" });
                }, 5000);
                return function () { return clearTimeout(timeout_1); };
            }
        }, [(_a = state === null || state === void 0 ? void 0 : state.state) === null || _a === void 0 ? void 0 : _a.type]);
        React.useEffect(function () {
            var interval = setInterval(function () {
                send({ type: "heartbeat" });
            }, 5000);
            return function () { return clearInterval(interval); };
        }, []);
        var controls;
        if (!state) {
            controls = (React.createElement("div", { className: "controls" },
                React.createElement(Connect, { player: false, connect: sendConnect }),
                React.createElement("p", null, "\u2014 OR \u2014"),
                React.createElement("div", { className: "form-row" },
                    React.createElement("button", { onClick: createGame }, "Create New Game"))));
        }
        else {
            controls = (React.createElement(PlayBoard, __assign({ gameId: joinGameMsg === null || joinGameMsg === void 0 ? void 0 : joinGameMsg.gameId }, state, { done: function () { return send({ type: "board_next", state: state.state.type }); } })));
        }
        var copyGameId = function () {
            var gameId = joinGameMsg === null || joinGameMsg === void 0 ? void 0 : joinGameMsg.gameId;
            if (gameId)
                navigator.clipboard.writeText(gameId);
        };
        return (React.createElement("div", null,
            React.createElement("div", { className: "connection on-board" + (connected ? " on" : "") },
                connected ? "Connected" : "Offline",
                React.createElement("a", { href: "/", className: "home" }, "HOME"),
                React.createElement("div", { className: "gameid", onClick: copyGameId }, joinGameMsg === null || joinGameMsg === void 0 ? void 0 : joinGameMsg.gameId)),
            controls,
            React.createElement("div", { className: "error" + (error ? " visible" : "") }, error)));
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
            setState(mode);
            window.history.pushState('', '', '?m=' + mode.substr(0, 1));
        };
        return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "controls vcentre" },
                React.createElement("div", { className: "form-row" },
                    React.createElement("button", { onClick: function () { return setMode('player'); } }, "New Player")),
                React.createElement("div", { className: "form-row" },
                    React.createElement("p", { style: { margin: 0 } }, "\u2014 OR \u2014")),
                React.createElement("div", { className: "form-row" },
                    React.createElement("button", { onClick: function () { return setMode('board'); } }, "Board Screen"))),
            React.createElement("div", { className: "licence" },
                React.createElement("p", null, "Secret Hitler is designed by Max Temkin, Mike Boxleiter, Tommy Maranges and illustrated by Mackenzie Schubert."),
                React.createElement("p", null,
                    "This game is attributed as per the ",
                    React.createElement("a", { target: "_blank", href: "https://creativecommons.org/licenses/by-nc-sa/4.0/" }, "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International license"),
                    "."),
                React.createElement("p", null,
                    "The original game can be found at ",
                    React.createElement("a", { target: "_blank", href: "https://www.secrethitler.com/" }, "secrethitler.com"),
                    ".")));
    }
    reactDom.render(React.createElement(App, null), document.querySelector('#app'));

    exports.App = App;

    return exports;

}({}, React, ReactDOM));
