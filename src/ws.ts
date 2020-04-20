import { useEffect, useState, useRef, useMemo, useCallback } from "react";

const WS_URL = 'ws://localhost:8888/play';

const unconnectedMessageHandler = () => {
  throw new Error('Not connected to server.');
};

export function useWebSocket(receiver: (msg: any) => any, reconnect: () => any): [boolean, (msg: any) => void] {
  const [connected, setConnected] = useState(false);

  const sendMessageRef = useRef<(msg: any) => void>(unconnectedMessageHandler);

  const receiverRef = useRef(receiver);
  const reconnectRef = useRef(reconnect);

  useEffect(() => {
    receiverRef.current = receiver;
    reconnectRef.current = reconnect;
  }, [receiver, reconnect]);

  const connect = () => {
    const socket = new WebSocket(WS_URL);

    socket.addEventListener('open', () => {
      sendMessageRef.current = msg => socket.send(JSON.stringify(msg));
      setConnected(true);
      reconnectRef.current();
    });

    socket.addEventListener('message', event => {
      try {
        const json = JSON.parse(event.data);
        receiverRef.current(json);
      }
      catch (err) {
        console.error(err);
      }
    });

    socket.addEventListener('error', (error: any) => {
      if (error.code == 'ECONNREFUSED') {
        setTimeout(() => connect(), 500);
      } else {
        console.error(error);
      }
    })

    socket.addEventListener('close', event => {
      setConnected(false);
      setTimeout(() => connect(), 500);
    });
  };

  useEffect(() => connect(), []);

  const sendMessage = useCallback(msg => {
    sendMessageRef.current(msg);
  }, []);

  return [connected, sendMessage];
}