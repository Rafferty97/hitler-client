import * as React from 'react';

interface ConnectProps {
  player: boolean,
  connect: (params: {
    gameId: string,
    name?: string,
    playerId?: string
  }) => any;
}

export function Connect(props: ConnectProps) {
  const [gameId, setGameId] = React.useState('');
  const [name, setName] = React.useState('');

  const formRef = React.useRef<HTMLFormElement | null>(null);

  const onInput = React.useCallback(() => {
    const form = formRef.current as HTMLFormElement;
    const code = (form.querySelector('[name="room"]') as HTMLInputElement).value
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 4);
    setGameId(code);
    if (props.player) {
      const name = (form.querySelector('[name="name"]') as HTMLInputElement).value
        .toUpperCase()
        .replace(/[^A-Z \'\-]/g, '')
        .slice(0, 20);
      setName(name);
    }
  }, [props.player]);

  const disabled = (props.player && name.length == 0) || gameId.length != 4;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled) return;
    if (props.player) {
      props.connect({ name, gameId });
    } else {
      props.connect({ gameId });
    }
  };

  return <form ref={formRef} onSubmit={onSubmit}>
    <div className="form-row">
      <label>Room code:</label>
      <input name="room" type="text" onInput={onInput} value={gameId} />
    </div>
    {props.player && <div className="form-row">
      <label >Name:</label>
      <input name="name" type="text" onInput={onInput} value={name} />
    </div>}
    <div className="form-row">
      <input type="submit" value="Enter" disabled={disabled} />
    </div>
  </form>;
}