import { useMemo, useEffect } from 'react';
import raceEngines from '../assets/audio/race_engines.mp3';

export function useRaceAudio(paused, setupComplete) {
  // Initialization of engine sound
  const raceAudio = useMemo(() => {
    const audio = new Audio(raceEngines);
    audio.loop = true;
    audio.volume = 0.05; // Set volume to 5%
    return audio;
  }, []);

  // Effect responsible for playing/pausing engine sounds
  useEffect(() => {
    if (!setupComplete) return;

    const playAudio = async () => {
      try {
        if (paused) {
          await raceAudio.pause();
        } else {
          await raceAudio.play();
        }
      } catch (error) {
        console.error("Audio playback error:", error);
      }
    };

    playAudio();

    return () => {
      raceAudio.pause();
    };
  }, [paused, setupComplete, raceAudio]);

  return { raceAudio };
}
