import { useEffect, useState } from "react";

export function useWindowSize() {
  function getSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {    
    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
          return decodeURIComponent(pair[1]);
      }
  }
}

export function useDelay(trigger: boolean, delay: number): boolean {
  const [triggered, setTriggered] = useState(false);
  useEffect(() => {
    if (trigger) {
      const timeout = setTimeout(() => setTriggered(true), delay);
      return () => clearTimeout(timeout);
    } else {
      setTriggered(false);
      return () => {};
    }
  }, [trigger]);
  return triggered;
}

export function useLatch<T>(value: T | null, delay: number): T {
  const [out, setValue] = useState(value);
  useEffect(() => {
    if (value === null) {
      const timeout = setTimeout(() => setValue(null), delay);
      return () => clearTimeout(timeout);
    } else {
      setValue(value);
      return () => {};
    }
  }, [value]);
  return out;
}

export function useSound(sound: HTMLAudioElement, play: boolean) {
  useEffect(() => {
    if (play) {
      sound.play();
      return () => {
        sound.pause();
        sound.currentTime = 0;
      }
    }
  }, [sound, play]);
}