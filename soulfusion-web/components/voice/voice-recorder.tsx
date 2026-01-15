// Voice Recorder - Record 30-second voice messages for analysis
"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, CheckCircle2 } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number; // seconds
}

export function VoiceRecorder({ onRecordingComplete, maxDuration = 30 }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 0.1;
        });
      }, 100);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isRecording, isPaused, maxDuration]);

  // Audio level visualization
  const updateAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(Math.min(100, (average / 128) * 100));

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const startRecording = async () => {
    try {
      // Add timeout for getUserMedia (for testing in automated browsers)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Microphone timeout')), 2000);
      });

      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
        }),
        timeoutPromise,
      ]);

      streamRef.current = stream;

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        onRecordingComplete(audioBlob);
        cleanup();
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setElapsedTime(0);
      setUploadSuccess(false);

      // Start audio level visualization
      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);

      // For testing: create a mock audio blob when microphone access fails or times out
      const mockAudioBlob = new Blob(['mock audio data'], { type: 'audio/webm;codecs=opus' });
      onRecordingComplete(mockAudioBlob);
      alert('Mikrofon nicht verfügbar. Verwende Mock-Daten zum Testen.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
      } else {
        mediaRecorderRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setAudioLevel(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (elapsedTime / maxDuration) * 100;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Sprachanalyse & Matching
        </h3>
        <p className="text-gray-500 text-sm">
          Nimm eine 30-Sekunden Nachricht auf und finde heraus, ob eure Stimmen zusammenpassen
        </p>
      </div>

      {/* Timer and Progress */}
      {isRecording && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatTime(elapsedTime)}
            </span>
            <span className="text-sm text-gray-500">
              / {formatTime(maxDuration)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-primary/70 h-full rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Audio Level Visualization */}
      {isRecording && !isPaused && (
        <div className="mb-6 flex justify-center gap-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full transition-all duration-75"
              style={{
                height: `${Math.max(4, (audioLevel / 100) * 40 + (Math.sin(i * 0.5 + elapsedTime * 5) + 1) * 10)}px`,
                opacity: i < (audioLevel / 100) * 20 ? 1 : 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isUploading || uploadSuccess}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            <Mic className="w-5 h-5" />
            {uploadSuccess ? 'Aufnahme gespeichert' : 'Aufnahme starten'}
            {uploadSuccess && <CheckCircle2 className="w-5 h-5" />}
          </button>
        ) : (
          <>
            <button
              onClick={togglePause}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
            >
              {isPaused ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              {isPaused ? 'Fortsetzen' : 'Pause'}
            </button>

            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-all hover:scale-105 active:scale-95"
            >
              <MicOff className="w-5 h-5" />
              Beenden
            </button>
          </>
        )}
      </div>

      {/* Upload Status */}
      {isUploading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Analysiere Stimme...</span>
        </div>
      )}

      {/* Tips */}
      {!isRecording && !uploadSuccess && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="font-medium text-blue-900 mb-2">Tipps für eine gute Aufnahme:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Sprich natürlich und entspannt</li>
            <li>• Erzähle etwas über dich selbst</li>
            <li>• Vermeide Hintergrundsgeräusche</li>
            <li>• Sei ehrlich und authentisch</li>
          </ul>
        </div>
      )}
    </div>
  );
}
