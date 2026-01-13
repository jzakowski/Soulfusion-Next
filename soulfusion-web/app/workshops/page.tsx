"use client"

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Clock,
  Play,
  CheckCircle,
  Lock,
  Search,
  Filter
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock workshops data - would come from API
const mockWorkshops = [
  {
    id: "1",
    title: "Mindfulness für Einsteiger",
    description: "Lerne die Grundlagen der Achtsamkeit und wie du sie im Alltag anwenden kannst.",
    instructor: "Dr. Maria Schmidt",
    duration: "45 Min",
    lessons_count: 8,
    enrolled_count: 1234,
    rating: 4.8,
    category: "Meditation",
    level: "Anfänger",
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    is_enrolled: true,
    is_premium: false,
    progress: 0.5,
  },
  {
    id: "2",
    title: "Yoga für den Morgen",
    description: "Starte deinen Tag mit Energies. Eine 15-minütige Morgenroutine.",
    instructor: "Lisa Weber",
    duration: "15 Min",
    lessons_count: 5,
    enrolled_count: 856,
    rating: 4.9,
    category: "Yoga",
    level: "Alle Level",
    image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
    is_enrolled: false,
    is_premium: false,
    progress: 0,
  },
  {
    id: "3",
    title: "Stressbewältigung am Arbeitsplatz",
    description: "Strategien gegen Stress und Burnout im Berufsalltag.",
    instructor: "Dr. Thomas Müller",
    duration: "60 Min",
    lessons_count: 12,
    enrolled_count: 2341,
    rating: 4.7,
    category: "Mentale Gesundheit",
    level: "Mittel",
    image_url: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800",
    is_enrolled: false,
    is_premium: true,
    progress: 0,
  },
  {
    id: "4",
    title: "Tiefe Schlafmeditation",
    description: "Führe dich in eine tiefe Entspannung und schlafe besser.",
    instructor: "Sophie Klein",
    duration: "30 Min",
    lessons_count: 6,
    enrolled_count: 3456,
    rating: 4.9,
    category: "Meditation",
    level: "Alle Level",
    image_url: "https://images.unsplash.com/photo-1511295742392-9f789a87c436?w=800",
    is_enrolled: true,
    is_premium: false,
    progress: 1,
  },
  {
    id: "5",
    title: "Achtsamkeit bei Stress",
    description: "Notfall-Techniken für akute Stresssituationen.",
    instructor: "Dr. Anna Jung",
    duration: "20 Min",
    lessons_count: 4,
    enrolled_count: 1567,
    rating: 4.6,
    category: "Meditation",
    level: "Anfänger",
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    is_enrolled: false,
    is_premium: true,
    progress: 0,
  },
];

const categories = ["Alle", "Meditation", "Yoga", "Mentale Gesundheit", "Achtsamkeit"];
const levels = ["Alle", "Anfänger", "Mittel", "Fortgeschritten"];

export default function WorkshopsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [selectedLevel, setSelectedLevel] = useState("Alle");
  const [workshops, setWorkshops] = useState(mockWorkshops);

  const filteredWorkshops = workshops
    .filter((workshop) =>
      workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workshop.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((workshop) =>
      selectedCategory === "Alle" || workshop.category === selectedCategory
    )
    .filter((workshop) =>
      selectedLevel === "Alle" || workshop.level === selectedLevel
    );

  const enrolledWorkshops = filteredWorkshops.filter((w) => w.is_enrolled);
  const recommendedWorkshops = filteredWorkshops.filter((w) => !w.is_enrolled);

  const handleEnroll = (workshopId: string) => {
    setWorkshops(prev =>
      prev.map(workshop =>
        workshop.id === workshopId
          ? { ...workshop, is_enrolled: true }
          : workshop
      )
    );
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Workshops</h1>
          <p className="text-muted-foreground">
            Entdecke Kurse für Meditation, Yoga und persönliches Wachstum
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              placeholder="Workshops durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* My Workshops */}
        {enrolledWorkshops.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <BookOpen className="h-5 w-5 text-primary" />
              Meine Kurse ({enrolledWorkshops.length})
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledWorkshops.map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} isEnrolled />
              ))}
            </div>
          </div>
        )}

        {/* Recommended */}
        <div>
          <h2 className="mb-4 text-xl font-bold">Empfohlene Kurse</h2>
          {recommendedWorkshops.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Keine Workshops gefunden"
                    : "Keine weiteren Workshops verfügbar"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedWorkshops.map((workshop) => (
                <WorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                  onEnroll={() => handleEnroll(workshop.id)}
                  isEnrolled={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function WorkshopCard({
  workshop,
  onEnroll,
  isEnrolled,
}: {
  workshop: any;
  onEnroll?: () => void;
  isEnrolled: boolean;
}) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-video">
        <Image
          src={workshop.image_url}
          alt={workshop.title}
          fill
          className="object-cover"
        />
        <div className="absolute right-2 top-2 flex gap-2">
          {workshop.is_premium && (
            <Badge className="bg-yellow-500 text-white">
              <Lock className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          )}
        </div>
        {isEnrolled && workshop.progress > 0 && workshop.progress < 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${workshop.progress * 100}%` }}
            />
          </div>
        )}
        {isEnrolled && workshop.progress === 1 && (
          <div className="absolute right-2 top-2">
            <Badge className="bg-green-500">
              <CheckCircle className="mr-1 h-3 w-3" />
              Abgeschlossen
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="secondary">{workshop.category}</Badge>
          <span className="text-xs text-muted-foreground">{workshop.level}</span>
        </div>
        <CardTitle className="line-clamp-1 text-lg">{workshop.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {workshop.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{workshop.enrolled_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{workshop.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{workshop.lessons_count} Lektionen</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">von {workshop.instructor}</p>

        {isEnrolled ? (
          <Button className="w-full gap-2" asChild>
            <Link href={`/workshops/${workshop.id}`}>
              <Play className="h-4 w-4" />
              {workshop.progress > 0 ? "Fortsetzen" : "Starten"}
            </Link>
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={onEnroll}
          >
            {workshop.is_premium ? "Freischalten" : "Jetzt starten"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
