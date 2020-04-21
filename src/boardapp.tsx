import * as React from 'react';
import { useWebSocket } from './ws';
import { Connect } from './connect';
import { PlayBoard, PlayBoardProps } from './play-board';
import { getQueryVariable } from './util';

export function BoardApp() {
  const [joinGameMsg, setJoinGameMsg] = React.useState<any>((() => {
    const gameId = getQueryVariable('g');
    if (gameId?.length == 4) {
      return { type: 'board_join', gameId };
    } else {
      return null;
    }
  })());
  const [state, setState] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [connected, send] = useWebSocket(msg => {
    switch (msg.type) {
      case 'game_created':
        send({
          type: 'board_join',
          gameId: msg.gameId
        });
        break;
      case 'game_joined':
        const joinMsg = {
          type: 'board_join',
          gameId: msg.gameId
        };
        setJoinGameMsg(joinMsg);
        window.history.pushState('', '', `?m=b&g=${msg.gameId}`);
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
    if (joinGameMsg) send(joinGameMsg);
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
    controls = <div className="controls">
      <Connect player={false} connect={sendConnect} />
      <p>&mdash; OR &mdash;</p>
      <div className="form-row">
        <button onClick={createGame}>Create New Game</button>
      </div>
    </div>;
  } else {
    controls = <PlayBoard {...state} />;
  }

  return <div>
    <div className={`connection${connected ? ' on' : ''}`}>
      {connected ? 'Connected' : 'Offline'}
      <div className="gameid">{joinGameMsg?.gameId}</div>
    </div>
    {controls}
    <div className={`error${error ? ' visible' : ''}`}>{error}</div>
  </div>;
}