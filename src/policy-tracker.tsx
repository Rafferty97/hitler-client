import * as React from 'react';
import { animated, useSpring, interpolate } from 'react-spring';
import { useWindowSize } from './util';
import { Party } from './types';
import { PolicyCard } from './policy-card';

const SIDEPANEL_WIDTH = 400;

interface PolicyTrackerCardProps {
  party: Party;
  x: number;
  y: number;
  width: number;
  startWidth: number;
  reveal: boolean;
}

function PolicyTrackerCard(props: PolicyTrackerCardProps) {
  const animStateRef = React.useRef(props.reveal ? 0 : 3);

  const { y, xy, scale, rot } = useSpring({
    from: {
      y: props.reveal ? 150 : 0,
      xy: props.reveal ? 0 : 1,
      rot: props.reveal ? 180 : 0,
      scale: (props.reveal ? props.startWidth : props.width) / 200
    },
    to: async (next, cancel) => {
      if (animStateRef.current < 1) {
        await next({ y: 50, xy: 0, rot: 180, scale: props.startWidth / 200 });
        animStateRef.current = 1;
      }
      if (animStateRef.current < 2) {
        await new Promise(r => setTimeout(r, 500));
        animStateRef.current = 2;
      }
      if (animStateRef.current < 3) {
        await next({ y: 50, xy: 0, rot: 0, scale: props.startWidth / 200 });
        animStateRef.current = 3;
      }
      await next({ y: 0, xy: 1, scale: props.width / 200 });
    }
  }) as any;

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
}

export function PolicyTracker(props: PolicyTrackerProps) {
  const { screen, party, numCards, reveal } = props;
  const scale = Math.min(
    (screen.width - SIDEPANEL_WIDTH) / 1400,
    screen.height / 800,
    1
  );
  const maxNumCards = party == 'Liberal' ? 5 : 6;
  const width = scale * ((maxNumCards * 170) + 40);
  const height = scale * (224 + 60);
  const top = scale * (party == 'Liberal' ? 200 : 550);

  const cards: JSX.Element[] = [];
  for (let i = 0; i < numCards + (reveal ? 1 : 0); i++) {
    cards.push(<PolicyTrackerCard
      party={party}
      x={scale * 170 * (i - 0.5 * (maxNumCards - 1)) - (0.5 * SIDEPANEL_WIDTH)}
      y={top}
      width={200 * scale}
      startWidth={500 * scale}
      reveal={reveal && i == numCards}
    />);
  }

  const boardStyles = {
    position: 'absolute',
    left: '50vw',
    top,
    width,
    height,
    marginLeft: -0.5 * (width + SIDEPANEL_WIDTH),
    marginTop: -0.5 * height,
    backgroundColor: 'black'
  };

  return <>
    <div style={boardStyles}></div>
    {cards}
  </>;
}