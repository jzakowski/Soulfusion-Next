"use client";

import { useState, useMemo } from 'react';
import { VideoParticipant } from './video-participant';
import { ScreenShareView } from './screen-share-view';
import { useClubStore } from '@/lib/stores/club-store';
import { Grid, User, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewMode = 'speaker' | 'gallery';

export function VideoGrid() {
  const { participants, localParticipant, isConnected } = useClubStore();
  const [viewMode, setViewMode] = useState<ViewMode>('speaker');

  // Alle Teilnehmer (Remote + Local)
  const allParticipants = useMemo(() => {
    const all = [...participants];
    if (localParticipant && !participants.find(p => p.isLocal)) {
      all.push(localParticipant);
    }
    return all;
  }, [participants, localParticipant]);

  // Screen Share finden (höchste Priorität)
  const screenSharer = useMemo(() => {
    return allParticipants.find(p => p.screenShareEnabled);
  }, [allParticipants]);

  // Aktiven Sprecher finden (für Speaker View)
  const activeSpeaker = useMemo(() => {
    // Screen Share hat Priorität
    if (screenSharer) return screenSharer;

    // Prefer someone who is speaking
    const speaking = allParticipants.find(p => p.isSpeaking);
    if (speaking) return speaking;

    // Otherwise show local participant
    if (localParticipant) return localParticipant;

    // Fallback to first remote participant
    return allParticipants[0];
  }, [allParticipants, localParticipant, screenSharer]);

  // Andere Teilnehmer (für kleine Vorschau im Speaker View)
  const otherParticipants = useMemo(() => {
    return allParticipants.filter(p => p.sid !== activeSpeaker?.sid);
  }, [allParticipants, activeSpeaker]);

  // Grid Layout basierend auf Teilnehmerzahl (nur für Gallery View)
  const getGridClass = () => {
    const count = allParticipants.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 4) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 9) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  if (!isConnected || allParticipants.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white/60">
          <p>Keine Teilnehmer im Raum</p>
          <p className="text-sm mt-2">Warte auf andere Teilnehmer...</p>
        </div>
      </div>
    );
  }

  // ===== SPEAKER VIEW (Mobile Default) =====
  if (viewMode === 'speaker') {
    return (
      <div className="w-full h-full flex flex-col">
        {/* Haupt-Sprecher (groß) - Screen Share oder normale Video */}
        <div className="flex-1 p-2 md:p-4">
          {screenSharer ? (
            <ScreenShareView screenSharer={screenSharer} localParticipant={localParticipant} />
          ) : activeSpeaker ? (
            <VideoParticipant
              key={activeSpeaker.sid}
              participant={activeSpeaker}
              isActive={true}
            />
          ) : null}
        </div>

        {/* Kleine Vorschau der anderen Teilnehmer (unten) */}
        {otherParticipants.length > 0 && (
          <div className="h-20 md:h-24 bg-black/50 backdrop-blur-sm border-t border-white/10 px-2 flex items-center gap-2 overflow-x-auto">
            {otherParticipants.map((participant) => (
              <div
                key={participant.sid}
                className="relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-white/20 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => {
                  // Optional: Klicken um Hauptvideo zu wechseln
                }}
              >
                {participant.cameraEnabled ? (
                  <video
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-white/60" />
                  </div>
                )}
                {/* Sprecher-Indikator */}
                {participant.isSpeaking && (
                  <div className="absolute inset-0 ring-2 ring-green-500 rounded-lg pointer-events-none" />
                )}
                {/* Screen Share Indikator */}
                {participant.screenShareEnabled && (
                  <div className="absolute inset-0 ring-2 ring-primary rounded-lg pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Screen Share Indikator - falls jemand screenen */}
        {screenSharer && (
          <div className="absolute top-16 left-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <p className="text-white text-sm font-medium flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              {screenSharer.name} teilt seinen Screen
            </p>
          </div>
        )}

        {/* View Toggle Button (oben rechts) */}
        <button
          onClick={() => setViewMode('gallery')}
          className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/80 transition-colors"
          title="Galerie-Ansicht"
        >
          <Grid className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ===== GALLERY VIEW =====
  return (
    <div className="w-full h-full flex flex-col">
      {/* Screen Share Banner - falls jemand screenen */}
      {screenSharer && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-full">
          <p className="text-white text-sm font-medium flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            {screenSharer.name} teilt seinen Screen
          </p>
        </div>
      )}

      {/* Grid Container */}
      <div className={`flex-1 grid gap-2 md:gap-4 p-2 md:p-4 ${getGridClass()}`}>
        {allParticipants.map((participant) => (
          <div key={participant.sid} className="relative">
            {participant.screenShareEnabled ? (
              <ScreenShareView screenSharer={participant} localParticipant={localParticipant} />
            ) : (
              <VideoParticipant
                participant={participant}
                isActive={participant.sid === activeSpeaker?.sid}
              />
            )}
            {/* Screen Share Indikator */}
            {participant.screenShareEnabled && (
              <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded">
                <p className="text-white text-xs font-medium flex items-center gap-1">
                  <Monitor className="w-3 h-3" />
                  Screen Share
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View Toggle Button (oben rechts) */}
      <button
        onClick={() => setViewMode('speaker')}
        className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/80 transition-colors"
        title="Sprecher-Ansicht"
      >
        <User className="w-5 h-5" />
      </button>
    </div>
  );
}

/**
 * Local Video Preview - kleine Vorschau des eigenen Videos
 * Wird in der Ecke des Screens angezeigt
 */
export function LocalVideoPreview() {
  const { localParticipant, isCameraEnabled } = useClubStore();

  if (!localParticipant || !isCameraEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-primary">
      <VideoParticipant participant={localParticipant} />
    </div>
  );
}
