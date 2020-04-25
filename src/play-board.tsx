import * as React from 'react';
import { useWindowSize, useDelay, useLatch, useSound } from './util';
import { PolicyTracker } from './policy-tracker';
import { GameState, PublicPlayer, Party } from './types';
import { NightRoundModal, ElectionModal, LegislativeModal, ExecutiveModal, GameOverModal } from './modals';
import { animated, useTransition } from 'react-spring';
import { VoteResult } from './vote-result';
import { ElectionTracker } from './election-tracker';

function PlayerItem(props: { player: PublicPlayer, vote: boolean | null }) {
  const { player, vote: vote_ } = props;

  const [vote, setVote] = React.useState({ show: false, vote: false });
  React.useEffect(() => {
    if (vote_ === null) {
      const timeout = setTimeout(() => {
        setVote(v => ({ show: false, vote: v.vote }));
      }, 6000);
      return () => clearTimeout(timeout);
    } else {
      setVote({ show: true, vote: vote_ });
      return () => {};
    }
  }, [vote_]);

  return <div className={`player-item${player.isDead ? ' dead' : ''}`}>
    {player.name}
    {player.isConfirmedNotHitler && <div className="not-hitler">Not Hitler!</div>}
    <div className={`vote${vote.show ? '' : ' hidden'} ${vote.vote ? 'ja' : 'nein'}`}>
      {vote.vote ? 'JA!' : 'NEIN!'}
    </div>
  </div>;
}

export interface PlayBoardProps {
  players: PublicPlayer[];
  state: GameState;
  numLiberalCards: number;
  numFascistCards: number;
  electionTracker: number;
  drawPile: Party[];
  done: () => any;
}

function mapModalKey(state: GameState) {
  if (state.type == 'election') {
    return state.type + ':' + state.presidentElect;
  }
  return state.type;
}

const backgroundMusic = new Audio('./sound/moonlight.mp3');
backgroundMusic.volume = 0.7;
backgroundMusic.loop = true;
const drumrollSound = new Audio('./sound/drum roll final.mp3');
const staySilentSound = new Audio('./sound/remain-silent.mp3');

export function PlayBoard(props: PlayBoardProps) {
  const screen = useWindowSize();

  const gameStarted = ['lobby', 'nightRound'].indexOf(props.state.type) == -1;

  const modalTransitions = useTransition(props.state, mapModalKey, {
    from: { transform: 'translate(0%, 100%)' },
    enter: { transform: 'translate(0%, 0%)' },
    leave: { transform: 'translate(0%, -100%)' },
  })

  const numPlayers = props.players.length;
  const revealLib = props.state.type == 'cardReveal' && props.state.card == 'Liberal';
  const revealFas = props.state.type == 'cardReveal' && props.state.card == 'Fascist';

  const voteHasResult = props.state.type == 'election' && props.state.voteResult != null;
  const showResult = useDelay(voteHasResult, 1000);
  const getVote = i => {
    if (props.state.type == 'election' && showResult) {
      return props.state.votes[i];
    } else {
      return null;
    }
  };

  const showVeto = useDelay(props.state.type == 'cardReveal' && props.state.card == 'Veto', 1000);
  const showChaos = props.state.type == 'cardReveal' && props.state.chaos;

  useSound(backgroundMusic, true);
  useSound(drumrollSound, props.state.type == 'cardReveal');
  useSound(staySilentSound, props.state.type == 'legislativeSession');

  let electionTracker = props.electionTracker;
  if (props.state.type == 'election' && showResult && props.state.voteResult === false) {
    electionTracker++;
  }
  if (props.state.type == 'cardReveal' && props.state.card == 'Veto') {
    electionTracker++;
  }

  return (
    <div className="play-board">
      {gameStarted && <>
        <PolicyTracker screen={screen} party="Liberal" numCards={props.numLiberalCards} reveal={revealLib} numPlayers={numPlayers} />
        <PolicyTracker screen={screen} party="Fascist" numCards={props.numFascistCards} reveal={revealFas} numPlayers={numPlayers} />
      </>}
      <div className="util">
        {props.players.map((player, i) => <PlayerItem player={player} vote={getVote(i)} />)}
        <div>
          <ElectionTracker tracker={electionTracker} deck={props.drawPile.length} />
        </div>
      </div>
      <div className="modal-wrap">
        {modalTransitions.map(({ item, key, props: style }) => {
          let modal;
          if (item.type == 'nightRound') {
            modal = <NightRoundModal />;
          }
          if (item.type == 'election') {
            modal = <ElectionModal
              election={item}
              players={props.players}
              showResult={showResult}
              done={props.done} />;
          }
          if (item.type == 'legislativeSession') {
            modal = <LegislativeModal state={item} players={props.players} />;
          }
          if (item.type == 'executiveAction') {
            modal = <ExecutiveModal state={item} players={props.players} done={props.done} />;
          }
          if (item.type == 'end') {
            modal = <GameOverModal state={item} players={props.players} />;
          }
          return modal ? (
            <animated.div key={key} className="modal" style={style}>{modal}</animated.div>
          ) : null;
        })}
      </div>
      {showVeto && <VoteResult result="veto" />}
      <h1 className={`chaos${showChaos ? ' show' : ''}`}>Chaos!</h1>
    </div>
  );
}