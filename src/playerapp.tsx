import * as React from 'react';
import { useWebSocket } from './ws';
import { Connect } from './connect';
import { getQueryVariable } from './util';
import { PlayerState } from './types';

export function PlayerApp() {
  const [joinGameMsg, setJoinGameMsg] = React.useState<any>((() => {
    const gameId = getQueryVariable('g');
    const playerId = getQueryVariable('p');
    if (gameId?.length == 4 && playerId) {
      return { type: 'player_join', gameId, playerId };
    } else {
      return null;
    }
  })());
  const [state, setState] = React.useState<PlayerState | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [connected, send] = useWebSocket(msg => {
    switch (msg.type) {
      case 'game_joined':
        const joinMsg = {
          type: 'player_join',
          gameId: msg.gameId,
          playerId: msg.playerId
        };
        setJoinGameMsg(joinMsg);
        window.history.pushState('', '', `?m=p&g=${msg.gameId}&p=${msg.playerId}`);
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

  const sendConnect = params => send({
    type: 'player_join',
    ...params
  })

  const sendAction = data => send({
    type: 'player_action',
    action: state?.action?.type ?? null,
    data
  });

  let controls, controlsClass = '';
  if (state) {
    if (state.isDead) {
      controls = <p>Sorry, you're dead :(</p>;
    }
    const action = state.action;
    switch (action?.type) {
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
      case 'nightRound':
        controls = <div>
          <p>Your secret role is:</p>
          <p>{state.role}</p>
          <div className="form-row">
            <button onClick={() => sendAction('done')}>Okay</button>
          </div>
        </div>;
        break;
      case 'choosePlayer':
        controls = <div>
          <p>Please choose a player ({action.subtype}):</p>
          {action.players.map(p => state.players[p]).map(player => (
            <div className="form-row">
              <button onClick={() => sendAction(player.id)}>{player.name}</button>
            </div>
          ))}
        </div>;
        break;
      case 'vote':
        controls = <div>
          <p>Please vote:</p>
          <div className="form-row">
            <button onClick={() => sendAction(true)}>JA!</button>
          </div>
          <div className="form-row">
            <button onClick={() => sendAction(false)}>NEIN!</button>
          </div>
        </div>;
        break;
      case 'legislative':
        controls = <div>
          <p>Choose a policy to discard:</p>
          {action.cards.map((card, idx) => (
            <div className="form-row">
              <button onClick={() => sendAction({ type: 'discard', idx })}>{card}</button>
            </div>
          ))}
          {action.canVeto && (
            <div className="form-row">
              <button onClick={() => sendAction({ type: 'veto' })}>VETO</button>
            </div>
          )}
        </div>;
        break;
      case 'policyPeak':
        controls = <div>
          <p>Here are the top three cards:</p>
          {action.cards.map(card => <p>{card}</p>)}
          <div className="form-row">
            <button onClick={() => sendAction('done')}>Okay</button>
          </div>
        </div>;
        break;
      case 'vetoConsent':
        controls = <div>
          <p>Do you consent to the veto?</p>
          <div className="form-row">
            <button onClick={() => sendAction(true)}>JA!</button>
          </div>
          <div className="form-row">
            <button onClick={() => sendAction(false)}>NEIN!</button>
          </div>
        </div>;
        break;
      case 'gameover':
        controls = <p>The {action.winner}s win!</p>;
        break;
    }
  } else {
    controls = <Connect player={true} connect={sendConnect} />;
  }

  return <div>
    <div className={`connection${connected ? ' on' : ''}`}>
      {connected ? 'Connected' : 'Offline'}
      <div className="gameid">{joinGameMsg?.gameId}</div>
    </div>
    {state && <div>{state.role}</div>}
    <div className={`controls ${controlsClass}`}>{controls}</div>
    <div className={`error${error ? ' visible' : ''}`}>{error}</div>
  </div>;
}