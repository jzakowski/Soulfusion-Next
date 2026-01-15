"use client";

import { useEffect, useRef, useState } from 'react';
import { ParticipantInfo } from '@/lib/services/livekit-service';
import { getLiveKitService } from '@/lib/services/livekit-service';
import { User, Monitor } from 'lucide-react';

interface ScreenShareViewProps {
  screenSharer: ParticipantInfo;
  localParticipant: ParticipantInfo | null;
}

export function ScreenShareView({ screenSharer, localParticipant }: ScreenShareViewProps) {
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isScreenAttached, setIsScreenAttached] = useState(false);
  const [isLocalAttached, setIsLocalAttached] = useState(false);
  const [hasLocalVideo, setHasLocalVideo] = useState(false);
  const liveKitService = getLiveKitService();

  // Screen Share Video attachen
  useEffect(() => {
    console.log('[ScreenShareView] Attaching screen share for:', screenSharer.identity);

    const attachScreenShare = () => {
      if (!screenVideoRef.current) return;

      const track = screenSharer.screenShareTrack;
      if (track) {
        console.log('[ScreenShareView] Screen share track found, attaching');
        track.attach(screenVideoRef.current);
        setIsScreenAttached(true);
        return true;
      }
      return false;
    };

    // Versuch direkt zu attachen
    if (attachScreenShare()) return;

    // Retry mechanism falls track noch nicht da
    let retryCount = 0;
    const maxRetries = 20;
    const retryInterval = setInterval(() => {
      const track = screenSharer.isLocal
        ? liveKitService.getLocalParticipant()?.screenShareTrack
        : liveKitService.getParticipants().find(p => p.sid === screenSharer.sid)?.screenShareTrack;

      if (track && screenVideoRef.current) {
        console.log('[ScreenShareView] Screen share track found after polling, attaching');
        clearInterval(retryInterval);
        track.attach(screenVideoRef.current);
        setIsScreenAttached(true);
      } else {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.warn('[ScreenShareView] Could not attach screen share after retries');
          clearInterval(retryInterval);
        }
      }
    }, 500);

    return () => {
      clearInterval(retryInterval);
      setIsScreenAttached(false);
    };
  }, [screenSharer.sid, screenSharer.screenShareTrack, screenSharer.isLocal, liveKitService]);

  // Lokales Video für Side-Panel attachen (nur wenn wir screenen)
  useEffect(() => {
    if (!localParticipant?.isLocal) return;

    console.log('[ScreenShareView] Attaching local video for side panel');

    const attachLocalVideo = () => {
      if (!localVideoRef.current) return;

      const track = liveKitService.getVideoTrack(localParticipant.sid);
      if (track) {
        console.log('[ScreenShareView] Local video track found, attaching');
        track.attach(localVideoRef.current);
        setIsLocalAttached(true);
        setHasLocalVideo(true);
        return true;
      }
      return false;
    };

    // Prüfen ob Kamera an ist
    setHasLocalVideo(localParticipant.cameraEnabled);

    // Versuch direkt zu attachen
    if (attachLocalVideo()) return;

    // Retry mechanism
    let retryCount = 0;
    const maxRetries = 20;
    const retryInterval = setInterval(() => {
      const track = liveKitService.getVideoTrack(localParticipant.sid);
      if (track && localVideoRef.current) {
        console.log('[ScreenShareView] Local video track found after polling, attaching');
        clearInterval(retryInterval);
        track.attach(localVideoRef.current);
        setIsLocalAttached(true);
        setHasLocalVideo(true);
      } else {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.warn('[ScreenShareView] Could not attach local video after retries');
          clearInterval(retryInterval);
          setHasLocalVideo(false);
        }
      }
    }, 500);

    return () => {
      clearInterval(retryInterval);
      setIsLocalAttached(false);
    };
  }, [localParticipant?.sid, localParticipant?.cameraEnabled, liveKitService]);

  return (
    <div className="relative w-full h-full bg-black flex">
      {/* Screen Share - Links (Hauptteil) */}
      <div className="flex-1 relative flex items-center justify-center">
        <video
          ref={screenVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-contain ${!isScreenAttached ? 'hidden' : ''}`}
        />
        {!isScreenAttached && (
          <div className="flex flex-col items-center gap-3 text-white/60 absolute inset-0">
            <Monitor className="w-12 h-12" />
            <p className="text-sm">Screen Share wird geladen...</p>
          </div>
        )}
      </div>

      {/* Eigenes Video/Avatar - Rechts (Side Panel) */}
      {/* Nur anzeigen wenn DU der Screen-Sharer bist */}
      {screenSharer.isLocal && localParticipant && (
        <div className="w-32 md:w-48 lg:w-64 bg-black/50 border-l border-white/10 flex flex-col">
          {/* Video oder Avatar */}
          <div className="flex-1 relative">
            {hasLocalVideo && isLocalAttached ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                {localParticipant.avatarUrl ? (
                  <img
                    src={localParticipant.avatarUrl}
                    alt={localParticipant.name}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-primary/30"
                  />
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Name Tag - unten */}
          <div className="p-2 bg-black/70 backdrop-blur-sm text-center">
            <p className="text-white text-xs md:text-sm font-medium truncate">
              {localParticipant.name}
            </p>
            <p className="text-white/50 text-xs">(Du)</p>
          </div>
        </div>
      )}
    </div>
  );
}
