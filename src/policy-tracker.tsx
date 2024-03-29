import * as React from 'react';
import { animated, useSpring, interpolate } from 'react-spring';
import { useWindowSize, useDelay, useSound } from './util';
import { Party } from './types';
import { PolicyCard } from './policy-card';

const SIDEPANEL_WIDTH = 300;

interface PolicyTrackerCardProps {
  party: Party;
  x: number;
  y: number;
  width: number;
  startWidth: number;
  reveal: boolean;
}

var drumrollSound = new Audio('./sound/drum roll final.mp3');
const fascistSound = new Audio('./sound/fascist card.mp3');
const liberalSound = new Audio('./sound/liberal card.mp3');
liberalSound.volume = 0.8;

function PolicyTrackerCard(props: PolicyTrackerCardProps) {
  //const animStateRef = React.useRef(props.reveal ? 0 : 3);

  const step1 = useDelay(props.reveal, 900);
  const step2 = useDelay(step1, 1600);
  const step3 = useDelay(step2, 1500);

  let to = { y: 150, xy: 0, rot: 180, scale: props.startWidth / 200 };
  if (step1 || !props.reveal) {
    to.y = 50;
  }
  if (step2 || !props.reveal) {
    to.rot = 0;
  }
  if (step3 || !props.reveal) {
    to.y = 0;
    to.xy = 1;
    to.scale = props.width / 200;
  }

  useSound(drumrollSound, props.reveal);
  useSound(props.party == 'Liberal' ? liberalSound : fascistSound, step2 && props.reveal);

  const { y, xy, scale, rot } = useSpring(to) as any;

  return (
    <animated.div style={{
      position: 'absolute',
      top: -112,
      left: -75,
      transformStyle: 'preserve-3d',
      zIndex: xy.interpolate(xy => xy > 0.5 ? 1000 : 2000),
      transform: interpolate([y, xy, scale, rot], (y, xy, s, rot) => (
        `translate(50vw, ${y}vh) translate(${xy * props.x}px, ${xy * props.y - 0.45 * y}px) scale(${s}) rotateY(${rot}deg)`
      ))
    }}>
      <PolicyCard party={props.party} />
    </animated.div>
  );
}

interface PolicyTrackerProps {
  screen: {
    width: number,
    height: number
  },
  party: Party;
  numCards: number;
  reveal: boolean;
  numPlayers: number;
}

export function PolicyTracker(props: PolicyTrackerProps) {
  const { screen, party, numCards, reveal } = props;
  const scale = Math.min(
    (screen.width - SIDEPANEL_WIDTH) / 1200,
    screen.height / 800,
    1.5
  );
  const maxNumCards = party == 'Liberal' ? 5 : 6;
  const width = scale * ((maxNumCards * 170) + 40);
  const height = scale * (224 + 60);
  const top = scale * (party == 'Liberal' ? 200 : 550);

  const cards: JSX.Element[] = [];
  for (let i = 0; i < numCards + (reveal ? 1 : 0); i++) {
    cards.push(<PolicyTrackerCard
      key={i}
      party={party}
      x={scale * 170 * (i - 0.5 * (maxNumCards - 1)) - (0.5 * SIDEPANEL_WIDTH)}
      y={top}
      width={200 * scale}
      startWidth={500 * scale}
      reveal={reveal && i == numCards}
    />);
  }

  const boardStyles = {
    top,
    width,
    height,
    marginLeft: -0.5 * (width + SIDEPANEL_WIDTH),
    marginTop: -0.5 * height
  };

  let tiles: string[] = [];
  if (props.party == 'Liberal') {
    tiles = ['', '', '', '', 'liberal-win'];
  } else {
    switch (props.numPlayers) {
      case 5:
      case 6:
        tiles = ['', '', 'policy-peak', 'kill', 'kill-veto', 'fascist-win'];
        break;
      case 7:
      case 8:
        tiles = ['', 'investigate', 'election', 'kill', 'kill-veto', 'fascist-win'];
        break;
      case 9:
      case 10:
        tiles = ['investigate', 'investigate', 'election', 'kill', 'kill-veto', 'fascist-win'];
        break;
    }
  }

  return <>
    <div className="board" style={boardStyles}>
      {tiles.map(tile => <div className={`board-tile ${tile}`} />)}
    </div>
    {cards}
  </>;
}