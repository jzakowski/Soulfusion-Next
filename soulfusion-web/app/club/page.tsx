"use client"

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Users, Sparkles } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface LiveKitRoom {
  id: string;
  name: string;
  participant_count: number;
  is_active: boolean;
}

// Mock rooms - would come from API
const mockRooms: LiveKitRoom[] = [
  { id: "1", name: "Game Night", participant_count: 12, is_active: true },
  { id: "2", name: "Stammtisch", participant_count: 8, is_active: true },
  { id: "3", name: "Kaffee & Klatsch", participant_count: 5, is_active: true },
];

export default function ClubPage() {
  const [rooms] = useState<LiveKitRoom[]>(mockRooms);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Club</h1>
          <p className="text-muted-foreground">
            Trete Video-Calls bei und verbinde dich mit der Community
          </p>
        </div>

        {/* Create Room CTA */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-semibold">Eigenen Room erstellen?</h3>
              <p className="text-sm text-muted-foreground">
                Starte einen Video-Call mit bis zu 50 Teilnehmern
              </p>
            </div>
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Room erstellen
            </Button>
          </CardContent>
        </Card>

        {/* Active Rooms */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Aktive Rooms</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <span className="text-xs font-bold">LIVE</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {room.participant_count} Teilnehmer
                  </div>
                  <Button className="w-full gap-2" asChild>
                    <Link href={`/club/${room.id}`}>
                      <Video className="h-4 w-4" />
                      Beitreten
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-12 rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">Weitere Features bald verfügbar</h3>
          <p className="text-sm text-muted-foreground">
            Breakout Rooms, Screen Sharing, Recording und mehr
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
