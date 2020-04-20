import * as React from 'react';
import { useWindowSize } from './util';
import { PolicyTracker } from './policy-tracker';

export interface PlayBoardProps {
  numLiberalCards: number;
  numFascistCards: number;
}

export function PlayBoard(props: PlayBoardProps) {
  const screen = useWindowSize();

  return (
    <div className="play-board">
      <PolicyTracker screen={screen} party="Liberal" numCards={props.numLiberalCards} />
      <PolicyTracker screen={screen} party="Fascist" numCards={props.numFascistCards} />
    </div>
  );
}