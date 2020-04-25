import * as React from 'react';
import { useWebSocket } from './ws';
import { Connect } from './connect';
import { getQueryVariable } from './util';
import { Party, PlayerState } from './types';
import { animated, interpolate, useSpring, useTransition } from 'react-spring';

function mapPlayerChoice(type: string) {
  if (type == 'execution') return 'Choose a player to execute';
  if (type == 'nominateChancellor') return 'President, nominate your chancellor';
  if (type == 'investigate') return 'Which player would you like to investigate?';
  if (type == 'specialElection') return 'Nominate a player to be the next president';
}

function CardSelectorCard(props: { party: Party, n: number, hidden: boolean, choose: () => any }) {
  const { r, o } = useSpring({ r: props.n, o: props.hidden ? 0 : 1 });
  return <animated.div
    onClick={() => props.choose()}
    style={{ transform: interpolate([r, o], (r, o) => (
      `rotate(${10 * r}deg) translate(${80 * r}px, ${160 * (1 - o)}px)`
    )), opacity: o }}
    className={`policy-card ${props.party.toLowerCase()}`} />
}

function CardSelector(props: { cards: Party[], send: (msg: any) => void, veto: boolean, hidden?: boolean }) {
  const [discarded, setDiscarded] = React.useState<number>(10);
  const s = [0, 0, 1.2, 1][props.cards.length - (discarded == 10 ? 0 : 1)];
  const m = [0, 0, -0.6, -1][props.cards.length - (discarded == 10 ? 0 : 1)];

  return <>
    <div className="card-selection">
      {props.cards.map((card, idx) => (
        <CardSelectorCard
          party={card}
          n={s * (idx - (idx > discarded ? 1 : 0)) + m}
          hidden={props.hidden || idx === discarded}
          choose={() => { if (discarded == 10) setDiscarded(idx); }} />
      ))}
    </div>
    <div className="undo-confirm">
      {discarded == 10 ? (props.veto && (
        <button className="btn veto" onClick={() => props.send({ type: 'veto' })}>Veto Agenda</button>
      )) : <>
        <button className="btn undo" onClick={() => setDiscarded(10)}>Undo</button>
        <button className="btn confirm" onClick={() => props.send({ type: 'discard', idx: discarded })}>Confirm</button>
      </>}
    </div>
  </>;
}

function PolicyPeak(props: { cards: Party[], done: () => any }) {
  const [visible, setVisible] = React.useState(false);
  const s = [0, 0, 1.2, 1][props.cards.length];
  const m = [0, 0, -0.6, -1][props.cards.length];

  return <>
    <div className="card-selection">
      <div className="question-mark">?</div>
      {props.cards.map((card, idx) => (
        <CardSelectorCard
          party={card}
          n={s * idx + m}
          hidden={!visible}
          choose={() => {}} />
      ))}
    </div>
    <div className="undo-confirm">
      {!visible ? (
        <button className="btn veto" onClick={() => setVisible(true)}>Reveal policies</button>
      ) : (
        <button className="btn okay" onClick={props.done}>Done</button>
      )}
    </div>
  </>;
  //choose={idx => sendAction({ type: 'discard', idx })}
}

function RevealParty(props: { party: Party, done: () => any }) {
  const [visible, setVisible] = React.useState(false);

  const style = useSpring({
    position: 'relative',
    margin: '50px auto',
    width: 150,
    height: 225,
    transformStyle: 'preserve-3d',
    perspective: '200px',
    transform: visible ? 'rotateY(0deg)' : 'rotateY(180deg)'
  });

  return <>
    <animated.div onClick={() => setVisible(true)} style={style}>  
      <div className={`policy-card ${props.party.toLowerCase()}-party`} />
      <div className="policy-card backface-party" />
    </animated.div>
    {visible && (
      <button className="btn okay" onClick={props.done}>Done</button>
    )}
  </>;
  //choose={idx => sendAction({ type: 'discard', idx })}
}

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
  const [elementVisible, setElementVisible] = React.useState(false);

  const transition = useTransition(state?.action ?? { type: '' as '' }, item => item?.type, {
    from: { transform: 'translate(0px, 30px)', opacity: 0 },
    enter: { transform: 'translate(0px, 0px)', opacity: 1 },
    leave: { transform: 'translate(0px, 30px)', opacity: 0 }
  });
  
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

  const debouncer = React.useRef(false);
  const sendAction = data => {
    if (debouncer.current) return;
    debouncer.current = true;
    setTimeout(() => debouncer.current = false, 1000);
    send({
      type: 'player_action',
      action: state?.action?.type ?? null,
      data
    });
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      send({ type: 'get_state' });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  let controls, controlsClass = '';
  if (state) {
    controls = transition.map(({ item: action, props, key }) => (
      <animated.div className="controls-inner" style={props}>
      {(() => {
        switch (action?.type) {
          case 'lobby':
            const num = state.players.length;
            controlsClass = 'centre';
            return <>
              <p>{num == 1 ? '1 player has joined.' : num + ' players have joined.'}</p>
              {action.canStart && (
                <button className="btn" onClick={() => sendAction('start')}>Start game</button>
              )}
            </>;
          case 'nightRound':
            const fascists: string[] = [];
            let hitler = '';
            if (action.roles) {
              for (let i = 0; i < state.players.length; i++) {
                if (action.roles[i] == 'Fascist') fascists.push(state.players[i].name);
                if (action.roles[i] == 'Hitler') hitler = state.players[i].name;
              }
            }
            return <div>
              <p>Your secret role is:</p>
              <p className="secret-role-text">{state.role}</p>
              {action.roles && <>
                <div className="player-wrap">
                  <p>Fascists:</p>
                  {fascists.map(name => <p className="player">{name}</p>)}
                </div>
                <div className="player-wrap">
                <p>Hitler:</p>
                  <p className="player">{hitler}</p>
                </div>
              </>}
              <button className="btn okay" onClick={() => sendAction('done')}>Okay</button>
            </div>;
          case 'choosePlayer':
            const c = action.players.length > 5 ? ' compact' : '';
            return <div>
              <p>{mapPlayerChoice(action.subtype)}</p>
              {action.players.map(p => state.players[p]).map(player => (
                <button className={`btn${c}`} onClick={() => sendAction(player.id)}>{player.name}</button>
              ))}
            </div>;
          case 'vote':
            return <div>
              <p>Please vote:</p>
              <button className="btn ja" onClick={() => sendAction(true)}>JA!</button>
              <button className="btn nein" onClick={() => sendAction(false)}>NEIN!</button>
            </div>;
          case 'legislative':
            return <div>
              <p>Choose a policy to discard:</p>
              <CardSelector
                cards={action.cards}
                send={sendAction}
                veto={action.canVeto} />
            </div>;
          case 'policyPeak':
            return <div>
              <p>Top three policies:</p>
              <PolicyPeak cards={action.cards} done={() => sendAction('done')} />
            </div>;
          case 'vetoConsent':
            return <div>
              <p>Do you consent to the veto?</p>
              <button className="btn ja" onClick={() => sendAction(true)}>JA!</button>
              <button className="btn nein" onClick={() => sendAction(false)}>NEIN!</button>
            </div>;
          case 'investigateParty':
            return <div style={{ perspective: 400 }}>
              <p>Tap to reveal <b>{state.players[action.player].name}</b>'s party membership:</p>
              <RevealParty party={action.party} done={() => sendAction('done')} />
            </div>;
          case 'nextRound':
            return <div>
              <p>Ready to continue?</p>
              <button className="btn okay" onClick={() => sendAction('next')}>Yes</button>
            </div>;
          case 'gameover':
            return <div>
              <p className="gameover-text">The {action.winner}s win!</p>
              <button className="btn okay" onClick={() => sendAction('restart')}>Restart</button>
            </div>;
          default:
            if (state.isDead) {
              return <p>Sorry, you're dead :(</p>;
            } else {
              return <p></p>;
            }
        }
      })()}
      </animated.div>
    ));
  } else {
    controls = <Connect player={true} connect={sendConnect} />;
  }

  return <div>
    <div className={`connection${connected ? ' on' : ''}`}>
      {connected ? 'Connected' : 'Offline'}
      <div className="gameid">{joinGameMsg?.gameId}</div>
    </div>
    <div className={`controls ${controlsClass}`}>{controls}</div>
    {state && <div className="secret-role">
      <div className="title">Secret role</div>
      <div className="role">{state.role}</div>
    </div>}
    <div className={`error${error ? ' visible' : ''}`}>{error}</div>
  </div>;
}