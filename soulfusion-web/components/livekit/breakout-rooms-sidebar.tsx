"use client";

import { useEffect, useState, useRef } from 'react';
import { X, Plus, Users, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useBreakoutStore,
  BreakoutRoom,
  BreakoutParticipant,
} from '@/lib/stores/breakout-store';
import { useClubStore } from '@/lib/stores/club-store';
import { useUIStore } from '@/lib/stores/ui-store';

interface BreakoutRoomsSidebarProps {
  roomName: string | null;
}

export function BreakoutRoomsSidebar({ roomName }: BreakoutRoomsSidebarProps) {
  const {
    currentSession,
    isSidebarOpen,
    isLoading,
    error,
    sessionEndsAt,
    isTimerRunning,
    loadSession,
    createSession,
    endSession,
    extendTimer,
    moveParticipant,
    removeParticipant,
    toggleSidebar,
    getRemainingTime,
  } = useBreakoutStore();

  const { participants, localParticipant } = useClubStore();
  const { addToast } = useUIStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [roomCount, setRoomCount] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [showExtendMenu, setShowExtendMenu] = useState(false);
  const [tick, setTick] = useState(0);

  // Force update every second for timer display
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Load session when room changes
  useEffect(() => {
    if (roomName && isSidebarOpen) {
      loadSession(roomName);
    }
  }, [roomName, isSidebarOpen]);

  // Timer end notification
  useEffect(() => {
    const remaining = getRemainingTime();
    if (remaining === 0 && isTimerRunning && currentSession) {
      addToast({
        message: 'Breakout Session Timer abgelaufen!',
        variant: 'info',
      });
    }
  }, [tick, isTimerRunning, currentSession, addToast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateSession = async () => {
    if (!currentSession && roomName) {
      await createSession(roomName, roomCount, durationMinutes);
      setShowCreateDialog(false);
      addToast({
        message: `${roomCount} Breakout Rooms erstellt`,
        variant: 'success',
      });
    }
  };

  const handleEndSession = async () => {
    if (confirm('Alle Teilnehmer zurück zum Hauptraum?')) {
      if (roomName) {
        await endSession(roomName);
        addToast({
          message: 'Breakout Session beendet',
          variant: 'success',
        });
      }
    }
  };

  const handleExtendTimer = async (minutes: number) => {
    if (roomName) {
      await extendTimer(roomName, minutes);
      setShowExtendMenu(false);
      addToast({
        message: `Timer um ${minutes} Minuten verlängert`,
        variant: 'success',
      });
    }
  };

  const handleMoveParticipant = async (
    participantId: string,
    participantName: string,
    participantAvatar: string | undefined,
    toRoomId: string
  ) => {
    console.log('[BreakoutSidebar] handleMoveParticipant called:', { roomName, toRoomId, participantId, currentSession: !!currentSession });

    if (roomName && currentSession) {
      await moveParticipant(roomName, toRoomId, participantId, participantName, participantAvatar);
      addToast({
        message: `${participantName} verschoben`,
        variant: 'success',
      });
    } else {
      console.error('[BreakoutSidebar] Cannot move participant:', { roomName, currentSession: !!currentSession });
      addToast({
        message: 'Fehler: Konnte Teilnehmer nicht verschieben',
        variant: 'error',
      });
    }
  };

  const handleRemoveParticipant = async (roomId: string, participantId: string, participantName: string) => {
    if (roomName && currentSession && confirm(`${participantName} aus diesem Raum entfernen?`)) {
      await removeParticipant(roomName, roomId, participantId);
      addToast({
        message: `${participantName} entfernt`,
        variant: 'success',
      });
    }
  };

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <div className="fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] bg-background border-l shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Breakout Rooms
          </h2>
          {currentSession && getRemainingTime() > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Clock className="w-3 h-3" />
              <span className={getRemainingTime() < 60 ? 'text-orange-500 font-semibold' : ''}>
                {formatTime(getRemainingTime())}
              </span>
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!currentSession ? (
          /* Create Session UI */
          <div className="space-y-4">
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Erstelle Breakout Rooms um Teilnehmer in kleinere Gruppen aufzuteilen
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Session erstellen
              </Button>
            </div>

            {showCreateDialog && (
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <h3 className="font-medium text-sm mb-2">Anzahl Rooms</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRoomCount(Math.max(2, roomCount - 1))}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <span className="text-2xl font-bold w-12 text-center">{roomCount}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRoomCount(Math.min(10, roomCount + 1))}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-sm mb-2">Dauer (Minuten)</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDurationMinutes(Math.max(5, durationMinutes - 5))}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <span className="text-2xl font-bold w-12 text-center">{durationMinutes}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDurationMinutes(Math.min(120, durationMinutes + 5))}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button className="flex-1" onClick={handleCreateSession} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Erstellen'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Active Session UI */
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground text-center">
              {currentSession.rooms.length} Breakout Rooms aktiv
            </p>

            {/* Breakout Rooms */}
            {currentSession.rooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                onMoveParticipant={(participantId, participantName, participantAvatar) =>
                  handleMoveParticipant(participantId, participantName, participantAvatar, room.id)
                }
                onRemoveParticipant={(participantId, participantName) =>
                  handleRemoveParticipant(room.id, participantId, participantName)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer - Timer Controls */}
      {currentSession && (
        <div className="border-t p-4 space-y-2">
          {/* Extend Timer Menu */}
          {showExtendMenu ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Verlängern um:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExtendMenu(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[5, 10, 15, 30].map(mins => (
                  <Button
                    key={mins}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExtendTimer(mins)}
                    disabled={isLoading}
                  >
                    +{mins}m
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowExtendMenu(true)}
            >
              <Clock className="w-4 h-4 mr-2" />
              Timer verlängern
            </Button>
          )}

          {/* End Session */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleEndSession}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Session beenden
          </Button>
        </div>
      )}
    </div>
  );
}

interface RoomCardProps {
  room: BreakoutRoom;
  onMoveParticipant: (participantId: string, participantName: string, participantAvatar?: string, toRoomId?: string) => void;
  onRemoveParticipant: (participantId: string, participantName: string) => void;
}

function RoomCard({ room, onMoveParticipant, onRemoveParticipant }: RoomCardProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { participants } = useClubStore();

  // Get current room participants
  const roomParticipants = room.participants || [];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const participantId = e.dataTransfer.getData('participantId');
    const participantName = e.dataTransfer.getData('participantName');
    const participantAvatar = e.dataTransfer.getData('participantAvatar');

    if (participantId) {
      onMoveParticipant(participantId, participantName, participantAvatar || undefined, room.id);
    }
  };

  return (
    <div
      className={`bg-card border rounded-lg overflow-hidden transition-colors ${
        isDraggingOver ? 'border-primary bg-primary/5' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Room Header */}
      <div className="flex items-center justify-between p-3 bg-muted/50">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">{room.name}</h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {roomParticipants.length}
          </span>
        </div>
        {room.status === 'waiting' && (
          <span className="text-xs text-muted-foreground">Wartet...</span>
        )}
        {room.status === 'active' && (
          <span className="text-xs text-green-500">Aktiv</span>
        )}
      </div>

      {/* Participants List */}
      <div className="p-2 space-y-1 max-h-40 overflow-y-auto">
        {roomParticipants.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Teilnehmer hierher ziehen
          </p>
        ) : (
          roomParticipants.map(participant => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              onRemove={() => onRemoveParticipant(participant.id, participant.name)}
            />
          ))
        )}
      </div>

      {/* Available participants from main room */}
      {roomParticipants.length === 0 && (
        <div className="p-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Verfügbare Teilnehmer:</p>
          <div className="space-y-1">
            {participants.map(p => (
              <div
                key={p.sid}
                className="text-xs p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted transition-colors"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('participantId', p.sid);
                  e.dataTransfer.setData('participantName', p.name);
                  e.dataTransfer.setData('participantAvatar', p.avatarUrl || '');
                }}
              >
                {p.name} {p.isLocal && '(Du)'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ParticipantCard({
  participant,
  onRemove,
}: {
  participant: BreakoutParticipant;
  onRemove: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTimeRef = useRef<number>(0);
  const didActuallyDragRef = useRef(false);

  const handleDragStart = (e: React.DragEvent) => {
    dragStartTimeRef.current = Date.now();
    didActuallyDragRef.current = false;
    setIsDragging(true);
    e.dataTransfer.setData('participantId', participant.id);
    e.dataTransfer.setData('participantName', participant.name);
    e.dataTransfer.setData('participantAvatar', participant.avatar || '');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrag = (e: React.DragEvent) => {
    // Mark that an actual drag occurred (mouse moved)
    didActuallyDragRef.current = true;
  };

  const handleDragEnd = () => {
    // Reset dragging state
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only remove if we didn't actually drag
    if (!didActuallyDragRef.current) {
      e.stopPropagation();
      onRemove();
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className="flex items-center gap-2 p-2 rounded-md bg-background hover:bg-muted/50 cursor-move transition-colors group"
    >
      {participant.avatar ? (
        <img
          src={participant.avatar}
          alt={participant.name}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-primary" />
        </div>
      )}
      <span className="flex-1 text-sm truncate">{participant.name}</span>
      <button
        onClick={handleClick}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
