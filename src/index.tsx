import * as React from 'react';
import { render } from 'react-dom';
import { PlayerApp } from './playerapp';
import { BoardApp } from './boardapp';

export function App() {
  const [state, setState] = React.useState('');

  React.useEffect(() => {
    const msg = localStorage.getItem('join_msg');
    if (msg && msg.trim()[0] == '{') {
      try {
        const json = JSON.parse(msg);
        if (typeof json.gameId === 'string' && ['player_join', 'board_join'].indexOf(json.type) != -1) {
          if (window.confirm(`Rejoin game ${json.gameId}?`)) {
            window['__JOIN_GAME_MSG'] = json;
            setState(json.type == 'player_join' ? 'player' : 'board');
          }
        }
      }
      catch (err) {}
    }
  }, []);

  if (state == 'player') {
    return <PlayerApp />;
  }
  
  if (state == 'board') {
    return <BoardApp />;
  }

  return <div className="controls vcentre">
    <div className="form-row">
      <button onClick={() => setState('player')}>New Player</button>
    </div>
    <div className="form-row">
      <p style={{ margin: 0 }}>&mdash; OR &mdash;</p>
    </div>
    <div className="form-row">
      <button onClick={() => setState('board')}>Board Screen</button>
    </div>
  </div>;  
}

render(<App />, document.querySelector('#app'));