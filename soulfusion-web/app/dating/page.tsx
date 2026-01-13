"use client"

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  X,
  Sparkles,
  Info,
  Filter,
  MapPin,
  Calendar
} from "lucide-react";
import Image from "next/image";

// Mock profiles - would come from API
const mockProfiles = [
  {
    id: "1",
    name: "Lisa",
    age: 28,
    city: "Berlin",
    bio: "Reisebegeistert, Kaffeeliebhaber und immer auf der Suche nach neuen Abenteuern. 🌍☕",
    interests: ["Reisen", "Kaffee", "Fotografie", "Yoga"],
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    distance: 5,
    last_active: "Vor 2 Stunden",
  },
  {
    id: "2",
    name: "Max",
    age: 32,
    city: "München",
    bio: "Softwareentwickler, Bergwanderer und Hobbykoch. Lass uns gemeinsam kochen! 🏔️👨‍🍳",
    interests: ["Technologie", "Wandern", "Kochen", "Bücher"],
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    distance: 12,
    last_active: "Gerade eben",
  },
  {
    id: "3",
    name: "Sophie",
    age: 25,
    city: "Hamburg",
    bio: "Künstlerin mit Herz. Suche Menschen zum Kreativaustausch und gute Gespräche. 🎨",
    interests: ["Kunst", "Musik", "Ausgehen", "Kino"],
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    distance: 8,
    last_active: "Vor 1 Tag",
  },
];

export default function DatingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
  const [passedProfiles, setPassedProfiles] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  const currentProfile = mockProfiles[currentIndex];

  const handleLike = () => {
    setLikedProfiles([...likedProfiles, currentProfile.id]);
    nextProfile();
  };

  const handlePass = () => {
    setPassedProfiles([...passedProfiles, currentProfile.id]);
    nextProfile();
  };

  const nextProfile = () => {
    if (currentIndex < mockProfiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowInfo(false);
    }
  };

  const hasMoreProfiles = currentIndex < mockProfiles.length;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-pink-500" />
              SoulMatch
            </h1>
            <p className="text-sm text-muted-foreground">
              Finde deinen Seelenverwandten
            </p>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-gradient-to-br from-pink-500/10 to-purple-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-pink-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">So funktioniert's</p>
                <p className="text-muted-foreground mt-1">
                  Swipe right für Profile, die dir gefallen. Wenn es ein Match gibt,
                  könnt ihr chatten und euch kennenlernen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Card */}
        {hasMoreProfiles ? (
          <>
            <Card className="overflow-hidden">
              <div className="relative">
                {/* Image */}
                <div className="relative aspect-[3/4] w-full">
                  <img
                    src={currentProfile.avatar_url}
                    alt={currentProfile.name}
                    className="h-full w-full object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Profile Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-end justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {currentProfile.name}, {currentProfile.age}
                        </h2>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          {currentProfile.city}
                          <span>•</span>
                          <span>{currentProfile.distance} km entfernt</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
                          <Calendar className="h-3 w-3" />
                          {currentProfile.last_active}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 bg-white/20 hover:bg-white/30"
                        onClick={() => setShowInfo(!showInfo)}
                      >
                        <Info className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Detailed Info Overlay */}
                {showInfo && (
                  <div className="absolute inset-0 bg-black/90 p-6 text-white">
                    <h3 className="mb-2 text-lg font-semibold">Über mich</h3>
                    <p className="mb-4 text-sm text-white/90">{currentProfile.bio}</p>

                    <h3 className="mb-2 text-lg font-semibold">Interessen</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.interests.map((interest) => (
                        <Badge
                          key={interest}
                          variant="secondary"
                          className="bg-white/20 text-white"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      className="mt-4 border-white/20 text-white hover:bg-white/10"
                      onClick={() => setShowInfo(false)}
                    >
                      Schließen
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-16 w-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={handlePass}
              >
                <X className="h-8 w-8" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-16 w-16 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              >
                <Sparkles className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-16 w-16 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                onClick={handleLike}
              >
                <Heart className="h-8 w-8" />
              </Button>
            </div>

            {/* Progress */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {currentIndex + 1} von {mockProfiles.length} Profilen
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="mx-auto mb-4 h-16 w-16 text-pink-500" />
              <h3 className="mb-2 text-xl font-bold">Keine weiteren Profile</h3>
              <p className="mb-6 text-muted-foreground">
                Du hast alle Profile in deiner Nähe gesehen. Komm später wieder!
              </p>
              <Button onClick={() => setCurrentIndex(0)}>
                Nochmal starten
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Matches */}
        {likedProfiles.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <h3 className="mb-3 font-semibold">Deine Likes</h3>
              <div className="flex flex-wrap gap-2">
                {likedProfiles.map((id) => {
                  const profile = mockProfiles.find((p) => p.id === id);
                  return (
                    <div
                      key={id}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold"
                    >
                      {profile?.name.charAt(0)}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
