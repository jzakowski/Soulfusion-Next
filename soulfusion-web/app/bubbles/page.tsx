"use client"

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, Users, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

// Mock bubbles data - would come from API
const mockBubbles = [
  {
    id: "1",
    name: "Reisen",
    description: "Entdecke die Welt zusammen mit anderen",
    color: "#3b82f6",
    icon: "✈️",
    member_count: 1234,
    post_count: 5678,
    is_joined: false,
  },
  {
    id: "2",
    name: "Musik",
    description: "Teile deine Leidenschaft für Musik",
    color: "#8b5cf6",
    icon: "🎵",
    member_count: 892,
    post_count: 3421,
    is_joined: true,
  },
  {
    id: "3",
    name: "Sport & Fitness",
    description: "Bleib fit und aktiv gemeinsam",
    color: "#10b981",
    icon: "💪",
    member_count: 2103,
    post_count: 7892,
    is_joined: false,
  },
  {
    id: "4",
    name: "Essen & Kochen",
    description: "Rezepte, Tipps und kulinarische Entdeckungen",
    color: "#f59e0b",
    icon: "🍳",
    member_count: 1567,
    post_count: 4523,
    is_joined: false,
  },
  {
    id: "5",
    name: "Kunst & Kultur",
    description: "Kreative Ausdrucksformen und kulturelle Erlebnisse",
    color: "#ec4899",
    icon: "🎨",
    member_count: 743,
    post_count: 2189,
    is_joined: true,
  },
  {
    id: "6",
    name: "Natur & Outdoor",
    description: "Abenteuer in der großen weiten Welt",
    color: "#06b6d4",
    icon: "🌲",
    member_count: 1892,
    post_count: 5432,
    is_joined: false,
  },
  {
    id: "7",
    name: "Technologie",
    description: "Tech-Talk, Innovation und digitales Leben",
    color: "#6366f1",
    icon: "💻",
    member_count: 2341,
    post_count: 8765,
    is_joined: false,
  },
  {
    id: "8",
    name: "Spiritualität",
    description: "Innere Ruhe und spirituelle Entwicklung",
    color: "#a855f7",
    icon: "🧘",
    member_count: 654,
    post_count: 1987,
    is_joined: false,
  },
  {
    id: "9",
    name: "Gaming",
    description: "Zocker united - Spiele und Gaming Community",
    color: "#ef4444",
    icon: "🎮",
    member_count: 3456,
    post_count: 9876,
    is_joined: false,
  },
  {
    id: "10",
    name: "Books & Literature",
    description: "Bücherwürmer und Literaturfans",
    color: "#84cc16",
    icon: "📚",
    member_count: 521,
    post_count: 1432,
    is_joined: false,
  },
  {
    id: "11",
    name: "Photography",
    description: "Fotografie-Enthusiasten und Bildkünstler",
    color: "#f97316",
    icon: "📸",
    member_count: 876,
    post_count: 2987,
    is_joined: false,
  },
  {
    id: "12",
    name: "Pets & Animals",
    description: "Tierliebhaber und Haustier-Community",
    color: "#14b8a6",
    icon: "🐾",
    member_count: 1923,
    post_count: 5432,
    is_joined: false,
  },
];

type FilterType = "all" | "joined" | "trending";

export default function BubblesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [bubbles, setBubbles] = useState(mockBubbles);

  const filteredBubbles = bubbles
    .filter((bubble) => {
      if (activeFilter === "joined") return bubble.is_joined;
      return true;
    })
    .filter((bubble) =>
      bubble.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bubble.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const toggleJoin = (bubbleId: string) => {
    setBubbles(prev =>
      prev.map(bubble =>
        bubble.id === bubbleId
          ? {
              ...bubble,
              is_joined: !bubble.is_joined,
              member_count: bubble.is_joined
                ? bubble.member_count - 1
                : bubble.member_count + 1,
            }
          : bubble
      )
    );
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Bubbles</h1>
          <p className="text-muted-foreground">
            Finde Communities, die zu dir passen
          </p>
        </div>

        {/* Create Bubble CTA */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-5 w-5 text-primary" />
                Neue Bubble erstellen?
              </h3>
              <p className="text-sm text-muted-foreground">
                Starte deine eigene Community rund um dein Interesse
              </p>
            </div>
            <Button>Erstellen</Button>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Bubbles durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
          >
            Alle
          </Button>
          <Button
            variant={activeFilter === "joined" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("joined")}
          >
            Beigetreten
          </Button>
          <Button
            variant={activeFilter === "trending" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("trending")}
          >
            <TrendingUp className="mr-1 h-4 w-4" />
            Trending
          </Button>
        </div>

        {/* Bubbles Grid */}
        {filteredBubbles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Keine Bubbles gefunden"
                  : "Noch keine Bubbles beigetreten"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBubbles.map((bubble) => (
              <Card
                key={bubble.id}
                className="overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardHeader
                  className="border-b"
                  style={{ backgroundColor: `${bubble.color}10` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{bubble.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{bubble.name}</CardTitle>
                        <Badge
                          variant="secondary"
                          className="mt-1"
                          style={{
                            backgroundColor: `${bubble.color}20`,
                            color: bubble.color,
                          }}
                        >
                          {bubble.is_joined ? "Mitglied" : "Community"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {bubble.description}
                  </p>

                  <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{bubble.member_count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{bubble.post_count.toLocaleString()} Beiträge</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={bubble.is_joined ? "outline" : "default"}
                      className="flex-1"
                      onClick={() => toggleJoin(bubble.id)}
                    >
                      {bubble.is_joined ? "Verlassen" : "Beitreten"}
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/bubbles/${bubble.id}`}>
                        Ansehen
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
