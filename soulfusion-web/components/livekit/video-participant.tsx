"use client";

import { useEffect, useRef, useState } from 'react';
import { ParticipantInfo } from '@/lib/services/livekit-service';
import { getLiveKitService } from '@/lib/services/livekit-service';
import { User, Mic, MicOff, Video, VideoOff, CheckCircle, MessageCircle, UserPlus, Volume2, VolumeX, Crown } from 'lucide-react';

interface VideoParticipantProps {
  participant: ParticipantInfo;
  isActive?: boolean;
}

export function VideoParticipant({
  participant,
  isActive = false,
}: VideoParticipantProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isVideoAttached, setIsVideoAttached] = useState(false);
  const [hasVideoTrack, setHasVideoTrack] = useState(false);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const liveKitService = getLiveKitService();

  // Clear hover timeout
  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Show profile preview
  const showPreview = () => {
    clearHoverTimeout();
    setShowProfilePreview(true);
  };

  // Hide profile preview with delay (allows moving mouse to popup)
  const hidePreview = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setShowProfilePreview(false);
    }, 200);
  };

  // Prüfe regelmäßig, ob ein Video Track existiert (wie in Flutter)
  useEffect(() => {
    const checkVideoTrack = () => {
      const track = liveKitService.getVideoTrack(participant.sid);
      const hasTrack = track !== undefined;
      setHasVideoTrack(hasTrack);
      return hasTrack;
    };

    // Initial check
    checkVideoTrack();

    // Regelmäßig prüfen (wie Flutter mit _isCameraAvailable)
    const checkInterval = setInterval(() => {
      checkVideoTrack();
    }, 500);

    return () => {
      clearInterval(checkInterval);
    };
  }, [participant.sid, participant.cameraEnabled]);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      clearHoverTimeout();
    };
  }, []);

  // Call Control Actions für Remote-User
  const handleToggleRemoteMic = async () => {
    console.log('[VideoParticipant] Toggle remote mic:', participant.sid);
    // TODO: Implement server-side remote mute via API
  };

  const handleSetSpeaker = async () => {
    console.log('[VideoParticipant] Set as speaker:', participant.sid);
    // TODO: Implement speaker promotion
  };

  const handleSendMessage = async () => {
    console.log('[VideoParticipant] Send message to:', participant.sid);
    // TODO: Open chat with this participant
  };

  // Video Track attachen mit Retry-Mechanismus
  useEffect(() => {
    console.log('[VideoParticipant] Component mounted/updated:', {
      identity: participant.identity,
      sid: participant.sid,
      cameraEnabled: participant.cameraEnabled,
      screenShareEnabled: participant.screenShareEnabled,
      hasVideoTrack,
      isLocal: participant.isLocal,
    });

    // Wenn Screen Share aktiv ist, Camera-Video nicht attachen (wird durch ScreenShareView gehandhabt)
    if (participant.screenShareEnabled) {
      console.log('[VideoParticipant] Screen share enabled, skipping camera video');
      setIsVideoAttached(false);
      return;
    }

    // Wenn Kamera laut participant nicht aktiviert und kein Track da, Avatar zeigen
    if (!participant.cameraEnabled && !hasVideoTrack) {
      console.log('[VideoParticipant] Camera disabled and no track found, showing avatar');
      setIsVideoAttached(false);
      return;
    }

    if (!videoRef.current) {
      console.log('[VideoParticipant] No video ref yet');
      return;
    }

    console.log('[VideoParticipant] Attempting to attach video for:', participant.identity);

    let retryCount = 0;
    const maxRetries = 20; // 10 Sekunden max
    const retryInterval = setInterval(() => {
      const track = liveKitService.getVideoTrack(participant.sid);
      console.log('[VideoParticipant] Polling for track...', {
        sid: participant.sid,
        trackFound: !!track,
        retryCount,
      });

      if (track && videoRef.current) {
        console.log('[VideoParticipant] Found video track, attaching...');
        clearInterval(retryInterval);
        track.attach(videoRef.current);
        setIsVideoAttached(true);
      } else {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.warn('[VideoParticipant] Could not find video track after retries:', participant.sid);
          clearInterval(retryInterval);
          setIsVideoAttached(false);
        }
      }
    }, 500);

    return () => {
      clearInterval(retryInterval);
      setIsVideoAttached(false);
    };
  }, [participant.sid, participant.cameraEnabled, participant.screenShareEnabled, hasVideoTrack]);

  // Avatar anzeigen wenn: Kamera aus ODER kein Track vorhanden ODER nicht attached
  const showAvatar = !hasVideoTrack || !isVideoAttached;

  return (
    <div
      className={`relative aspect-video bg-black rounded-lg overflow-hidden ${
        isActive ? 'ring-4 ring-primary' : ''
      }`}
    >
      {/* Video Element - IMMER rendern, verstecken wenn nicht attached */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={participant.isLocal}
        className={`w-full h-full object-cover ${showAvatar ? 'hidden' : ''}`}
      />

      {/* Avatar Placeholder - nur zeigen wenn Video nicht da */}
      {showAvatar && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
          {participant.avatarUrl ? (
            <img
              src={participant.avatarUrl}
              alt={participant.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary/30"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center">
              <User className="w-16 h-16 text-primary-foreground" />
            </div>
          )}
        </div>
      )}

      {/* Instagram-Style Profilvorschau Hover - unter dem Namen */}
      {showProfilePreview && (
        <div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50"
          onMouseEnter={showPreview}
          onMouseLeave={hidePreview}
        >
          <div className="bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-72 overflow-hidden">
            {/* Header mit großem Profilbild */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-5">
              <div className="flex items-start gap-4">
                {participant.avatarUrl ? (
                  <img
                    src={participant.avatarUrl}
                    alt={participant.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-primary cursor-pointer hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-1">
                    <p className="text-white font-bold truncate">{participant.name}</p>
                    {participant.isLocal && (
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-white/60 text-sm truncate mb-2">
                    @{participant.name.toLowerCase().replace(/\s+/g, '')}
                  </p>
                  {!participant.isLocal && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleToggleRemoteMic}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        title="Mikrofon umschalten"
                      >
                        {participant.microphoneEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={handleSetSpeaker}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        title="Als Sprecher setzen"
                      >
                        <Crown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        title="Nachricht senden"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {participant.isLocal && (
                    <div className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                      <UserPlus className="w-3 h-3" />
                      Das bist du
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-black/50 px-5 py-3 flex justify-around border-t border-white/10">
              <div className="text-center">
                <p className="text-white font-bold text-sm">128</p>
                <p className="text-white/50 text-xs">Beiträge</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">1.2K</p>
                <p className="text-white/50 text-xs">Follower</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">348</p>
                <p className="text-white/50 text-xs">Folgt</p>
              </div>
            </div>

            {/* Letzte 3 Beiträge - Instagram Style */}
            <div className="grid grid-cols-3 gap-0.5 border-t border-white/10">
              {/* Beitrag 1 */}
              <div className="aspect-square bg-gradient-to-br from-pink-500/30 to-purple-500/30 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40"></div>
                <User className="w-6 h-6 text-white/80 relative z-10" />
                {/* Hover Overlay - nur unten */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                  <span className="text-white text-xs font-bold">❤️ 24</span>
                </div>
              </div>
              {/* Beitrag 2 */}
              <div className="aspect-square bg-gradient-to-br from-blue-500/30 to-cyan-500/30 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/40 to-cyan-400/40"></div>
                <Video className="w-6 h-6 text-white/80 relative z-10" />
                {/* Hover Overlay - nur unten */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                  <span className="text-white text-xs font-bold">▶️ 156</span>
                </div>
              </div>
              {/* Beitrag 3 */}
              <div className="aspect-square bg-gradient-to-br from-orange-500/30 to-red-500/30 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/40 to-red-400/40"></div>
                <User className="w-6 h-6 text-white/80 relative z-10" />
                {/* Hover Overlay - nur unten */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                  <span className="text-white text-xs font-bold">❤️ 89</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Name Tag - unten bei Video, 10px unter Avatar wenn Kamera aus */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer hover:bg-black/70 transition-colors ${
          showAvatar ? '' : 'bottom-12'
        }`}
        style={showAvatar ? { top: 'calc(50% + 74px)' } : undefined}
        onMouseEnter={showPreview}
        onMouseLeave={hidePreview}
      >
        <p className="text-white text-sm font-medium flex items-center gap-2">
          {participant.name}
        </p>
      </div>

      {/* Speaking Indicator - grüner Ring wenn sprechend */}
      {participant.isSpeaking && (
        <div className="absolute inset-0 ring-4 ring-green-500 rounded-lg pointer-events-none" />
      )}
    </div>
  );
}
