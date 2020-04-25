import * as React from 'react';

export function ElectionTracker(props: { tracker: number, deck: number }) {
  const left = (25 * props.tracker + 12.5) + '%';
  return <div className="election-tracker">
    <p>Cards in Deck</p>
    <p className="cards-in-deck">{props.deck}</p>
    <p>Election Tracker</p>
    <div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="token" style={{ left }}></div>
    </div>
  </div>;
}