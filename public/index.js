var main = (function (exports, React, reactDom) {
    'use strict';

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

    var WS_URL = 'ws://localhost:8888/play';
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

    function PlayerApp() {
        var _a = React.useState(window['__JOIN_GAME_MSG']), joinGameMsg = _a[0], setJoinGameMsg = _a[1];
        var _b = React.useState({
            action: { type: 'connect' }
        }), state = _b[0], setState = _b[1];
        var _c = React.useState(null), error = _c[0], setError = _c[1];
        var _d = useWebSocket(function (msg) {
            switch (msg.type) {
                case 'game_joined':
                    var joinMsg = {
                        type: 'player_join',
                        name: msg.name,
                        gameId: msg.gameId,
                        playerId: msg.playerId
                    };
                    setJoinGameMsg(joinMsg);
                    localStorage.setItem('join_msg', JSON.stringify(joinMsg));
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
            if (joinGameMsg) {
                send(joinGameMsg);
            }
        }), connected = _d[0], send = _d[1];
        var sendConnect = function (params) { return send(__assign({ type: 'player_join' }, params)); };
        var sendAction = function (data) { return send({
            type: 'player_action',
            action: state.action.type,
            data: data
        }); };
        var controls, controlsClass = '';
        if (state.action) {
            switch (state.action.type) {
                case 'connect':
                    controls = React.createElement(Connect, { player: true, connect: sendConnect });
                    break;
                case 'lobby':
                    var num = state.players.length;
                    controlsClass = 'centre';
                    controls = React.createElement(React.Fragment, null,
                        React.createElement("p", null, num == 1 ? '1 player has joined.' : num + ' players have joined.'),
                        state.action.canStart && (React.createElement("div", { className: "form-row" },
                            React.createElement("button", { onClick: function () { return sendAction('start'); } }, "Start game"))));
                    break;
                default:
                    controls = React.createElement("div", null, state.action.type);
                    break;
            }
        }
        return React.createElement("div", null,
            React.createElement("div", { className: "connection" + (connected ? ' on' : '') },
                connected ? 'Connected' : 'Offline',
                React.createElement("div", { className: "gameid" }, joinGameMsg === null || joinGameMsg === void 0 ? void 0 : joinGameMsg.gameId)),
            React.createElement("div", { className: "controls " + controlsClass }, controls),
            React.createElement("div", { className: "error" + (error ? ' visible' : '') }, error));
    }

    function BoardApp() {
        var _a = React.useState(''), gameId = _a[0], setGameId = _a[1];
        var _b = React.useState(null), state = _b[0], setState = _b[1];
        var _c = React.useState(null), error = _c[0], setError = _c[1];
        var _d = useWebSocket(function (msg) {
            switch (msg.type) {
                case 'game_created':
                    setGameId(msg.gameId);
                    send({
                        type: 'board_join',
                        gameId: msg.gameId
                    });
                    break;
                case 'game_joined':
                    setGameId(msg.gameId);
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
            if (gameId != '') {
                send({ type: 'board_join', gameId: gameId });
            }
        }), connected = _d[0], send = _d[1];
        var sendConnect = function (params) {
            send(__assign({ type: 'board_join' }, params));
        };
        var createGame = function () {
            send({ type: 'create_game' });
        };
        var controls;
        if (!state) {
            controls = React.createElement(React.Fragment, null,
                React.createElement(Connect, { player: false, connect: sendConnect }),
                React.createElement("p", null, "\u2014 OR \u2014"),
                React.createElement("div", { className: "form-row" },
                    React.createElement("button", { onClick: createGame }, "Create New Game")));
        }
        else {
            controls = React.createElement("pre", null, JSON.stringify(state));
        }
        return React.createElement("div", null,
            React.createElement("div", { className: "connection" + (connected ? ' on' : '') },
                connected ? 'Connected' : 'Offline',
                React.createElement("div", { className: "gameid" }, gameId)),
            React.createElement("div", { className: "controls" }, controls),
            React.createElement("div", { className: "error" + (error ? ' visible' : '') }, error));
    }

    function App() {
        var _a = React.useState(''), state = _a[0], setState = _a[1];
        React.useEffect(function () {
            var msg = localStorage.getItem('join_msg');
            if (msg && msg.trim()[0] == '{') {
                try {
                    var json = JSON.parse(msg);
                    if (!json.playerId || !json.name)
                        throw new Error();
                    setState('rejoin:' + json.name);
                }
                catch (err) { }
            }
        }, []);
        if (state == 'player') {
            return React.createElement(PlayerApp, null);
        }
        if (state == 'board') {
            return React.createElement(BoardApp, null);
        }
        var rejoinGame = function () {
            window['__JOIN_GAME_MSG'] = JSON.parse(localStorage.getItem('join_msg'));
            setState('player');
        };
        return React.createElement("div", { className: "controls vcentre" },
            state.substr(0, 7) == 'rejoin:' && React.createElement(React.Fragment, null,
                React.createElement("div", { className: "form-row" },
                    React.createElement("button", { onClick: rejoinGame },
                        "Rejoin Game",
                        React.createElement("br", null),
                        React.createElement("span", { style: { fontSize: 12 } }, state.substr(7)))),
                React.createElement("div", { className: "form-row" },
                    React.createElement("p", { style: { margin: 0 } }, "\u2014 OR \u2014"))),
            React.createElement("div", { className: "form-row" },
                React.createElement("button", { onClick: function () { return setState('player'); } }, "New Player")),
            React.createElement("div", { className: "form-row" },
                React.createElement("p", { style: { margin: 0 } }, "\u2014 OR \u2014")),
            React.createElement("div", { className: "form-row" },
                React.createElement("button", { onClick: function () { return setState('board'); } }, "Board Screen")));
    }
    reactDom.render(React.createElement(App, null), document.querySelector('#app'));

    exports.App = App;

    return exports;

}({}, React, ReactDOM));
