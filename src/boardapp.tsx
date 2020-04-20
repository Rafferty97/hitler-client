import * as React from 'react';
import { useWebSocket } from './ws';
import { Connect } from './connect';

export function BoardApp() {
  const [gameId, setGameId] = React.useState<string>('');
  const [state, setState] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [connected, send] = useWebSocket(msg => {
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
  }, () => {
    if (gameId != '') {
      send({ type: 'board_join', gameId });
    }
  });

  const sendConnect = params => {
    send({
      type: 'board_join',
      ...params
    });
  };

  const createGame = () => {
    send({ type: 'create_game' });
  };

  let controls;
  if (!state) {
    controls = <>
      <Connect player={false} connect={sendConnect} />
      <p>&mdash; OR &mdash;</p>
      <div className="form-row">
        <button onClick={createGame}>Create New Game</button>
      </div>
    </>;
  } else {
    controls = <pre>{JSON.stringify(state)}</pre>;
  }

  return <div>
    <div className={`connection${connected ? ' on' : ''}`}>
      {connected ? 'Connected' : 'Offline'}
      <div className="gameid">{gameId}</div>
    </div>
    <div className="controls">{controls}</div>
    <div className={`error${error ? ' visible' : ''}`}>{error}</div>
  </div>;
}