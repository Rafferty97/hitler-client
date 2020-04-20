import * as React from 'react';
import { Party } from './types';

export function PolicyCard(props: { party: Party }) {
  return <>
    <div className={`policy-card ${props.party.toLowerCase()}`} />
    <div className="policy-card backface" />
  </>;
}