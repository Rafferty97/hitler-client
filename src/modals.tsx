import * as React from 'react';
import { Election, PublicPlayer, LegislativeSession, ExecutiveAction, EndGame } from './types';

export function NightRoundModal() {
  return <>
    <h1>Night Round</h1>
    <p>You have now been given your secret role.</p>
  </>;
}

interface ElectionModalProps {
  election: Election;
  players: PublicPlayer[];
}

export function ElectionModal(props: ElectionModalProps) {
  const { election, players } = props;
  return <>
    <h1>Election</h1>
    <p>President: {players[election.presidentElect].name}</p>
    <p>Chancellor: {election.chancellorElect != null ? players[election.chancellorElect].name : 'Not chosen'}</p>
    {election.chancellorElect != null && (election.voteResult == null ? (
      <p>Voting in progress...</p>
    ) : (
      <p>Vote result: {election.voteResult ? 'JA!' : 'NEIN!'}</p>
    ))}
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
    <p>President: {players[state.president].name}</p>
    <p>Chancellor: {players[state.chancellor].name}</p>
    <p>{turnCopy}</p>
  </>;
}

interface ExecutiveModalProps {
  state: ExecutiveAction;
  players: PublicPlayer[];
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
      copy = 'The president may now peak at the top three policy cards.';
      break;
    case 'specialElection':
      copy = 'A special election has been called. The president must now nominate his successor.';
      break;
  }
  return <>
    <h1>Executive Action</h1>
    <p>{copy}</p>
    {state.playerChosen != null && (
      <p>Player chosen: {players[state.playerChosen].name}</p>
    )}
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