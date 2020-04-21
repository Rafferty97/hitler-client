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
    window.history.pushState('', '', '?m=' + mode.substr(0, 1));
    setState(mode);
  };

  return <div className="controls vcentre">
    <div className="form-row">
      <button onClick={() => setMode('player')}>New Player</button>
    </div>
    <div className="form-row">
      <p style={{ margin: 0 }}>&mdash; OR &mdash;</p>
    </div>
    <div className="form-row">
      <button onClick={() => setMode('board')}>Board Screen</button>
    </div>
  </div>;  
}

render(<App />, document.querySelector('#app'));