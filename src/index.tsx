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
        if (!json.playerId || !json.name) throw new Error();
        setState('rejoin:' + json.name);
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

  const rejoinGame = () => {
    window['__JOIN_GAME_MSG'] = JSON.parse(localStorage.getItem('join_msg') as string);
    setState('player');
  };

  return <div className="controls vcentre">
    {state.substr(0, 7) == 'rejoin:' && <>
      <div className="form-row">
        <button onClick={rejoinGame}>
          Rejoin Game<br/>
          <span style={{ fontSize: 12 }}>{state.substr(7)}</span>
        </button>
      </div>
      <div className="form-row">
        <p style={{ margin: 0 }}>&mdash; OR &mdash;</p>
      </div>
    </>}
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