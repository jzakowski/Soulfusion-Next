"use client";

import { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface MeditationAudioPlayerProps {
  roomName: string;
}

// Kostenlose Meditation/Klangschalen von Pixabay (Lizenzfrei)
const MEDITATION_TRACKS = {
  'meditations-raum': [
    {
      name: 'Tibetan Singing Bowls',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    },
    {
      name: 'Crystal Singing Bowl',
      url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
    },
    {
      name: 'Meditation Bowl',
      url: 'https://cdn.pixabay.com/download/audio/2022/02/23/audio_9b8d821e7e.mp3',
    },
  ],
};

export function MeditationAudioPlayer({ roomName }: MeditationAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tracks = MEDITATION_TRACKS[roomName as keyof typeof MEDITATION_TRACKS] || [];

  // Auto-play beim Betreten des Raums
  useEffect(() => {
    if (tracks.length > 0 && audioRef.current) {
      audioRef.current.volume = volume;
      // Versuche auto-play (Browser blockieren das oft ohne User Interaction)
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log('[MeditationAudio] Auto-play started');
          })
          .catch((error) => {
            console.log('[MeditationAudio] Auto-play blocked:', error);
            setIsPlaying(false);
          });
      }
    }
  }, [roomName, tracks.length]);

  // Weiter zur nächsten Track wenn aktuelle endet
  const handleTrackEnd = () => {
    if (currentTrack < tracks.length - 1) {
      setCurrentTrack(currentTrack + 1);
    } else {
      // Loop zurück zum Anfang
      setCurrentTrack(0);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    if (volume > 0) {
      audioRef.current.volume = 0;
      setVolume(0);
    } else {
      audioRef.current.volume = 0.5;
      setVolume(0.5);
    }
  };

  // Wenn keine Tracks für diesen Raum existieren
  if (tracks.length === 0) {
    return null;
  }

  const currentTrackData = tracks[currentTrack];

  return (
    <>
      {/* Audio Element (versteckt) */}
      <audio
        ref={audioRef}
        src={currentTrackData.url}
        loop={false}
        onEnded={handleTrackEnd}
        className="hidden"
      />

      {/* Player Controls (unten rechts im Video) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm p-2 rounded-full border border-white/20">
        {/* Track Info */}
        <div className="hidden sm:block text-white text-xs mr-2 max-w-[150px] truncate">
          {currentTrackData.name}
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-colors"
          title={isPlaying ? "Pause" : "Abspielen"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          title={volume > 0 ? "Stummschalten" : "Ein"}
        >
          {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </>
  );
}
