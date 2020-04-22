import * as React from 'react';
import { Election, PublicPlayer, LegislativeSession, ExecutiveAction, EndGame } from './types';

export function NightRoundModal() {
  return <>
    <h1>Night Round</h1>
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
    <p>Chancellor: {election.chancellorElect ? players[election.chancellorElect].name : 'Not chosen'}</p>
    {election.chancellorElect && (election.voteResult == null ? (
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
  return <>
    <h1>Legislative Session</h1>
    <p>Turn: {state.turn}</p>
    <p>Cards: {state.cards.join(', ')}</p>
  </>;
}

interface ExecutiveModalProps {
  state: ExecutiveAction;
  players: PublicPlayer[];
}

export function ExecutiveModal(props: ExecutiveModalProps) {
  const { state, players } = props;
  return <>
    <h1>Executive Action</h1>
    <p>{state.action}</p>
    <p>Player chosen: {state.playerChosen ? players[state.playerChosen].name : 'Not chosen'}</p>
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