"use client";

import { useEffect, useState, useRef } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  Monitor,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Maximize,
  Minimize,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/stores/ui-store";
import { useClubStore } from "@/lib/stores/club-store";
import { VideoGrid } from "@/components/livekit/video-grid";
import { MeditationAudioPlayer } from "@/components/livekit/meditation-audio-player";
import { BreakoutRoomsSidebar } from "@/components/livekit/breakout-rooms-sidebar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useBreakoutStore } from "@/lib/stores/breakout-store";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();
  const [roomName, setRoomName] = useState<string | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
      const element = videoContainerRef.current as any;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes (user pressing ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Club Store State
  const {
    isConnected,
    isConnecting,
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenSharing,
    participants,
    localParticipant,
    error,
    connectToRoom,
    disconnect,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
    reset,
  } = useClubStore();

  // Breakout Store State
  const {
    currentSession,
    isSidebarOpen,
    toggleSidebar,
  } = useBreakoutStore();

  // Room ID aus Params holen
  useEffect(() => {
    params.then(p => {
      setRoomName(p.id);
    });
  }, [params]);

  // Auto-join wenn Raum geladen und User eingeloggt
  useEffect(() => {
    if (roomName && isAuthenticated && user && !isConnected && !isConnecting) {
      console.log('[RoomPage] Auto-joining room:', roomName);
      connectToRoom(roomName);
    }

    // Cleanup beim Verlassen der Seite
    return () => {
      if (isConnected) {
        console.log('[RoomPage] Auto-disconnect on unmount');
        disconnect();
      }
    };
  }, [roomName, isAuthenticated, user, isConnected, isConnecting]);

  // Error Handling
  useEffect(() => {
    if (error) {
      addToast({
        message: error,
        variant: "error",
      });
    }
  }, [error, addToast]);

  if (!roomName) {
    return (
      <AppLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p>Laden...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleLeave = async () => {
    // Cleanup breakout store
    useBreakoutStore.getState().reset();
    await disconnect();
    reset();
    router.push("/club");
  };

  // Join Screen (wenn nicht verbunden)
  if (!isConnected && !isConnecting) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-black">
          <div className="text-center text-white">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 mx-auto">
              <Video className="h-12 w-12" />
            </div>
            <h2 className="mb-2 text-xl font-bold">{roomName}</h2>
            <p className="mb-6 text-white/70">
              {participants.length > 0
                ? `${participants.length} Teilnehmer im Raum`
                : "Raum beitreten"}
            </p>
            <Button
              size="lg"
              onClick={() => connectToRoom(roomName)}
              className="gap-2"
              disabled={!isAuthenticated}
            >
              {!isAuthenticated ? (
                <>
                  <span>Bitte einloggen</span>
                </>
              ) : (
                <>
                  <Video className="h-5 w-5" />
                  Raum beitreten
                </>
              )}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Connecting Screen
  if (isConnecting) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-black">
          <div className="text-center text-white">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verbinde...</h2>
            <p className="text-white/70">Wird mit LiveKit verbunden...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Video Call Screen
  return (
    <AppLayout>
      <BreakoutRoomsSidebar roomName={roomName} />
      <div className="flex h-[calc(100vh-64px)] lg:h-screen flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-background/95 p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold">{roomName}</h1>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">● Verbunden</span>
                {" · "}
                {participants.length} Teilnehmer
                {currentSession && localParticipant && (() => {
                  // Find breakout room for local participant
                  const breakoutRoom = currentSession.rooms.find(room =>
                    room.participants?.some(p => p.id === localParticipant.sid)
                  );
                  return breakoutRoom ? (
                    <>
                      {" · "}
                      <span className="text-primary">→ {breakoutRoom.name}</span>
                    </>
                  ) : null;
                })()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {error && (
              <span className="text-sm text-destructive mr-2">{error}</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSidebar}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Breakout Rooms</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <span className="text-xs font-bold">
                {participants.length}
              </span>
            </Button>
          </div>
        </div>

        {/* Video Grid mit Overlay Controls */}
        <div ref={videoContainerRef} className="flex-1 overflow-hidden bg-black relative">
          <VideoGrid />

          {/* Meditation Audio Player (nur im Meditations-Raum) */}
          {roomName === 'meditations-raum' && <MeditationAudioPlayer roomName={roomName} />}

          {/* Controls Overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
          <Button
            variant={isMicrophoneEnabled ? "outline" : "destructive"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleMicrophone}
            title="Mikrofon umschalten"
          >
            {isMicrophoneEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant={isCameraEnabled ? "outline" : "destructive"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleCamera}
            title="Kamera umschalten"
          >
            {isCameraEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleScreenShare}
            title="Screen Sharing umschalten"
          >
            <Monitor className="h-5 w-5" />
          </Button>

          <Button
            variant={isFullscreen ? "default" : "outline"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Vollbild beenden" : "Vollbild"}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            title="Chat (demnächst)"
            disabled
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={handleLeave}
            title="Raum verlassen"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
