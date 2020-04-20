import * as React from 'react';
import { useWebSocket } from './ws';
import { Connect } from './connect';

export function PlayerApp() {
  const [joinGameMsg, setJoinGameMsg] = React.useState<any>(window['__JOIN_GAME_MSG']);
  const [state, setState] = React.useState<any>({
    action: { type: 'connect' }
  });
  const [error, setError] = React.useState<string | null>(null);

  const [connected, send] = useWebSocket(msg => {
    switch (msg.type) {
      case 'game_joined':
        const joinMsg = {
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
  }, () => {
    if (joinGameMsg) {
      send(joinGameMsg);
    }
  });

  const sendConnect = params => send({
    type: 'player_join',
    ...params
  })

  const sendAction = data => send({
    type: 'player_action',
    action: state.action.type,
    data
  });

  let controls, controlsClass = '';
  if (state.action) {
    switch (state.action.type) {
      case 'connect':
        controls = <Connect player={true} connect={sendConnect} />;
        break;
      case 'lobby':
        const num = state.players.length;
        controlsClass = 'centre';
        controls = <>
          <p>{num == 1 ? '1 player has joined.' : num + ' players have joined.'}</p>
          {state.action.canStart && (
            <div className="form-row">
              <button onClick={() => sendAction('start')}>Start game</button>
            </div>
          )}
        </>;
        break;
      default:
        controls = <div>{state.action.type}</div>;
        break;
    }
  }

  return <div>
    <div className={`connection${connected ? ' on' : ''}`}>
      {connected ? 'Connected' : 'Offline'}
      <div className="gameid">{joinGameMsg?.gameId}</div>
    </div>
    <div className={`controls ${controlsClass}`}>{controls}</div>
    <div className={`error${error ? ' visible' : ''}`}>{error}</div>
  </div>;
}