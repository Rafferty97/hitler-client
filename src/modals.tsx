import * as React from 'react';
import { animated, useSpring } from 'react-spring';
import { Election, PublicPlayer, LegislativeSession, ExecutiveAction, EndGame } from './types';
import { useDelay } from './util';
import { VoteResult } from './vote-result';

function PlayerName(props: { player: PublicPlayer, show: boolean }) {
  const style = useSpring({
    opacity: props.show ? 1 : 0,
    transform: props.show ? 'translate(0px, 0px)' : 'translate(0px, 5vw)',
    config: {
      mass: 1,
      tension: 340,
      friction: 22
    }
  });
  return <animated.div className="player-name" style={style}>
    {props.player.name}
  </animated.div>;
}

export function NightRoundModal() {
  return <>
    <h1>Night Round</h1>
    <p>You have now been given your secret role.</p>
  </>;
}

interface ElectionModalProps {
  election: Election;
  players: PublicPlayer[];
  showResult: boolean;
  done: () => any;
}

export function ElectionModal(props: ElectionModalProps) {
  const { election, players, showResult } = props;

  const showPresident = useDelay(true, 1000);
  const showChancellor = showPresident && election.chancellorElect != null;
  const showVoting = useDelay(showChancellor, 1000) && election.voteResult == null;

  React.useEffect(() => {
    if (showResult) {
      const timeout = setTimeout(props.done, 3000);
      return () => clearTimeout(timeout);
    }
  }, [showResult]);

  /*
    <p>President: {players[election.presidentElect].name}</p>
    <p>Chancellor: {election.chancellorElect != null ? players[election.chancellorElect].name : 'Not chosen'}</p>
    {election.chancellorElect != null && (election.voteResult == null ? (
      <p>Voting in progress...</p>
    ) : (
      <p>Vote result: {election.voteResult ? 'JA!' : 'NEIN!'}</p>
    ))}*/

  return <>
    <h1>Election</h1>
    <div className="gov">
      <div>
        <img src="./img/president.png" />
        <PlayerName
          player={players[election.presidentElect]}
          show={showPresident} />
      </div>
      <div>
        <img src="./img/chancellor.png" />
        <PlayerName
          player={players[election.chancellorElect ?? 0]}
          show={showChancellor} />
      </div>
    </div>
    <div className={`vote-now${showVoting ? '' : ' hidden'}`}>Vote now!</div>
    {showResult && <VoteResult result={election.voteResult ? 'ja' : 'nein'} />}
  </>;
}

interface LegislativeModalProps {
  state: LegislativeSession;
  players: PublicPlayer[];
}

export function LegislativeModal(props: LegislativeModalProps) {
  const { state, players } = props;
  let turnCopy;
  switch (state.turn) {
    case 'President':
      turnCopy = 'The president is discarding a policy.';
      break;
    case 'Chancellor':
      turnCopy = 'The chancellor is discarding a policy.';
      break;
    case 'Veto':
      turnCopy = 'The chancellor has called for a VETO!';
      break;
    case 'ChancellorAgain':
      turnCopy = 'The president has rejected the VETO. The chancellor must discard a policy.';
      break;
  }
  return <>
    <h1>Legislative Session</h1>
    <div className="gov">
      <div>
        <img src="./img/president.png" />
        <PlayerName
          player={players[state.president]}
          show={true} />
      </div>
      <div>
        <img src="./img/chancellor.png" />
        <PlayerName
          player={players[state.chancellor]}
          show={true} />
      </div>
    </div>
    <p className="turn-copy">{turnCopy}</p>
  </>;
}

interface ExecutiveModalProps {
  state: ExecutiveAction;
  players: PublicPlayer[];
  done: () => any;
}

export function ExecutiveModal(props: ExecutiveModalProps) {
  const { state, players } = props;

  let copy;
  switch(props.state.action) {
    case 'execution':
      copy = 'The president must now execute a player.';
      break;
    case 'investigate':
      copy = 'The president may now investigate a players loyalty.';
      break;
    case 'policyPeak':
      copy = 'The president may now peek at the top three policy cards.';
      break;
    case 'specialElection':
      copy = 'A special election has been called. The president must now nominate his successor.';
      break;
  }

  React.useEffect(() => {
    if (state.playerChosen != null) {
      const timeout = setTimeout(props.done, 2500);
      return () => clearTimeout(timeout);
    }
  }, [state.playerChosen]);

  return <>
    <h1>Executive Action</h1>
    <p>{copy}</p>
    <div style={{ textAlign: 'center' }}>
      <PlayerName player={players[state.playerChosen ?? 0]} show={state.playerChosen != null} />
    </div>
  </>;
}

interface GameOverModalProps {
  state: EndGame;
  players: PublicPlayer[];
}

export function GameOverModal(props: GameOverModalProps) {
  const { state, players } = props;
  return <>
    <h1>Game Over</h1>
    <p>{state.winType} win for {state.winner}</p>
  </>;
}