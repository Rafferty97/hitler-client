import * as React from 'react';
import { useWebSocket } from './ws';
import { Connect } from './connect';
import { PlayBoard, PlayBoardProps } from './play-board';

function deriveBoardState(state: any): PlayBoardProps {
  return {
    numLiberalCards: 1,
    numFascistCards: 1
  };
}

export function BoardApp() {
  const [joinGameMsg, setJoinGameMsg] = React.useState<any>(window['__JOIN_GAME_MSG'] ?? null);
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
    controls = <PlayBoard {...deriveBoardState(state)} />;
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