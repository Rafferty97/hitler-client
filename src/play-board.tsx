import * as React from 'react';
import { useWindowSize } from './util';
import { PolicyTracker } from './policy-tracker';
import { GameState, PublicPlayer, Party } from './types';
import { NightRoundModal, ElectionModal, LegislativeModal, ExecutiveModal, GameOverModal } from './modals';
import { animated, useTransition } from 'react-spring';

export interface PlayBoardProps {
  players: PublicPlayer[];
  state: GameState;
  numLiberalCards: number;
  numFascistCards: number;
  electionTracker: number;
  drawPile: Party[];
}

export function PlayBoard(props: PlayBoardProps) {
  const screen = useWindowSize();

  const gameStarted = ['lobby', 'nightRound'].indexOf(props.state.type) == -1;

  const modalTransitions = useTransition(props.state, s => s.type, {
    from: { transform: 'translate(0%, 100%)' },
    enter: { transform: 'translate(0%, 0%)' },
    leave: { transform: 'translate(0%, -100%)' },
  })

  const revealLib = props.state.type == 'cardReveal' && props.state.card == 'Liberal';
  const revealFas = props.state.type == 'cardReveal' && props.state.card == 'Fascist';

  return (
    <div className="play-board">
      {gameStarted && <>
        <PolicyTracker screen={screen} party="Liberal" numCards={props.numLiberalCards} reveal={revealLib} />
        <PolicyTracker screen={screen} party="Fascist" numCards={props.numFascistCards} reveal={revealFas} />
      </>}
      <div className="util">
        {props.players.map(player => <div>{player.name}{player.isDead && ' (DEAD)'}</div>)}
        <div>
          <p><b>Election Tracker:</b> {props.electionTracker}</p>
          <p><b>Cards in deck:</b> {props.drawPile.length}</p>
        </div>
      </div>
      <div className="modal-wrap">
        {modalTransitions.map(({ item, key, props: style }) => {
          let modal;
          if (item.type == 'nightRound') {
            modal = <NightRoundModal />;
          }
          if (item.type == 'election') {
            modal = <ElectionModal election={item} players={props.players} />;
          }
          if (item.type == 'legislativeSession') {
            modal = <LegislativeModal state={item} players={props.players} />;
          }
          if (item.type == 'executiveAction') {
            modal = <ExecutiveModal state={item} players={props.players} />;
          }
          if (item.type == 'end') {
            modal = <GameOverModal state={item} players={props.players} />;
          }
          return modal ? (
            <animated.div className="modal" style={style}>{modal}</animated.div>
          ) : null;
        })}
      </div>
    </div>
  );
}