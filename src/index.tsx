import * as React from 'react';
import { render } from 'react-dom';
import { PlayerApp } from './playerapp';
import { BoardApp } from './boardapp';
import { getQueryVariable } from './util';

export function App() {
  const [state, setState] = React.useState((() => {
    const state = getQueryVariable('m');
    if (state == 'p') return 'player';
    if (state == 'b') return 'board';
    return '';
  })());

  if (state == 'player') {
    return <PlayerApp />;
  }
  
  if (state == 'board') {
    return <BoardApp />;
  }

  const setMode = mode => {
    setState(mode);
    window.history.pushState('', '', '?m=' + mode.substr(0, 1));
  };

  return <>
    <div className="controls vcentre">
      <div className="form-row">
        <button onClick={() => setMode('player')}>New Player</button>
      </div>
      <div className="form-row">
        <p style={{ margin: 0 }}>&mdash; OR &mdash;</p>
      </div>
      <div className="form-row">
        <button onClick={() => setMode('board')}>Board Screen</button>
      </div>
    </div>
    <div className="licence">
      <p>Secret Hitler is designed by Max Temkin, Mike Boxleiter, Tommy Maranges and illustrated by Mackenzie Schubert.</p>
      <p>This game is attributed as per the <a target="_blank" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International license</a>.</p>
      <p>The original game can be found at <a target="_blank" href="https://www.secrethitler.com/">secrethitler.com</a>.</p>
    </div>
  </>; 
}

render(<App />, document.querySelector('#app'));