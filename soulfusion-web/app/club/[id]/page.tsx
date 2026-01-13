"use client"

import { useEffect, useState, useRef } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Users,
  Monitor,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/stores/ui-store";

// Mock room data - would come from API
const mockRoom = {
  id: "1",
  name: "Game Night",
  participant_count: 5,
  is_active: true,
};

export default function RoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [room, setRoom] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Simulate loading room data
    setRoom(mockRoom);
  }, [params.id]);

  const handleJoin = async () => {
    try {
      // In real app, this would:
      // 1. Get LiveKit token from API
      // 2. Connect to LiveKit room
      // 3. Set up local and remote tracks

      // Mock connection
      setIsConnected(true);

      // Try to get user media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        addToast({
          message: "Kein Zugriff auf Kamera/Mikrofon",
          variant: "error",
        });
      }
    } catch (error) {
      addToast({
        message: "Fehler beim Beitreten",
        variant: "error",
      });
    }
  };

  const handleLeave = () => {
    // Stop all tracks
    if (localVideoRef.current?.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }

    setIsConnected(false);
    router.push("/club");
  };

  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      const audioTrack = (localVideoRef.current.srcObject as MediaStream)
        .getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const videoTrack = (localVideoRef.current.srcObject as MediaStream)
        .getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        if (localVideoRef.current) {
          // Replace video track with screen share
          const videoTrack = stream.getVideoTracks()[0];
          // In real app, this would publish track to LiveKit
          setIsScreenSharing(true);
          videoTrack.onended = () => setIsScreenSharing(false);
        }
      } catch (err) {
        addToast({
          message: "Bildschirmfreigabe abgebrochen",
          variant: "error",
        });
      }
    } else {
      setIsScreenSharing(false);
    }
  };

  if (!room) {
    return (
      <AppLayout>
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">Laden...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-4rem)] flex-col">
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
              <h1 className="font-semibold">{room.name}</h1>
              <p className="text-xs text-muted-foreground">
                {isConnected ? (
                  <span className="text-green-500">Verbunden</span>
                ) : (
                  "Nicht verbunden"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 overflow-hidden bg-black">
          {!isConnected ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-white">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
                  <Video className="h-12 w-12" />
                </div>
                <h2 className="mb-2 text-xl font-bold">{room.name}</h2>
                <p className="mb-6 text-white/70">
                  {room.participant_count} Teilnehmer warten
                </p>
                <Button
                  size="lg"
                  onClick={handleJoin}
                  className="gap-2"
                >
                  <Video className="h-5 w-5" />
                  Raum beitreten
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid h-full grid-cols-2 gap-2 p-2 md:grid-cols-3 lg:grid-cols-4">
              {/* Local Video */}
              <div className="relative overflow-hidden rounded-lg bg-gray-900">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
                {isVideoOff && (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                      Du
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                  {isMuted && <MicOff className="h-3 w-3" />}
                  <span>Du</span>
                </div>
                {isScreenSharing && (
                  <div className="absolute right-2 top-2 rounded bg-blue-500 px-2 py-1 text-xs text-white">
                    Screen
                  </div>
                )}
              </div>

              {/* Remote Participants (Mock) */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-lg bg-gray-900"
                >
                  <div className="flex h-full items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                    <span>User {i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        {isConnected && (
          <div className="flex items-center justify-center gap-2 border-t bg-background/95 p-4">
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Button
              variant={isVideoOff ? "destructive" : "outline"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>

            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleScreenShare}
            >
              <Monitor className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={handleLeave}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
