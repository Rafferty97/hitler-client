import * as React from 'react';

export function VoteResult(props: { result: 'ja' | 'nein' | 'veto' }) {
  const [started, setStarted] = React.useState(false);
  React.useEffect(() => {
    setTimeout(() => setStarted(true), 5);
  }, []);
  return <div className={`vote-result${started ? ' show' : ''}`}>
    <div className={props.result}>
      {props.result.toUpperCase() + '!'}
    </div>
  </div>;
}