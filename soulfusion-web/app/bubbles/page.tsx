"use client"

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, Users, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { useBubbleStore } from "@/lib/stores/bubble-store";
import type { Bubble } from "@/lib/services/bubble-service";

type FilterType = "all" | "joined";

export default function BubblesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const {
    bubbles,
    bubblesLoading,
    fetchBubbles,
    joinBubble,
    leaveBubble,
  } = useBubbleStore();

  useEffect(() => {
    fetchBubbles();
  }, [fetchBubbles]);

  const filteredBubbles = bubbles
    .filter((bubble) => {
      if (activeFilter === "joined") return bubble.is_member;
      return bubble.is_public;
    })
    .filter((bubble) =>
      bubble.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bubble.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

  const toggleJoin = async (bubbleId: string, isMember: boolean) => {
    if (isMember) {
      await leaveBubble(bubbleId);
    } else {
      await joinBubble(bubbleId);
    }
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
                Eigene Bubble erstellen?
              </h3>
              <p className="text-sm text-muted-foreground">
                Starte deine eigene Community rund um dein Interesse
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Erstellen
            </Button>
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
        </div>

        {/* Bubbles Grid */}
        {bubblesLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Lade Bubbles...</p>
            </CardContent>
          </Card>
        ) : filteredBubbles.length === 0 ? (
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
                          {bubble.is_member ? "Mitglied" : "Community"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {bubble.description && (
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                      {bubble.description}
                    </p>
                  )}

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
                      variant={bubble.is_member ? "outline" : "default"}
                      className="flex-1"
                      onClick={() => toggleJoin(bubble.id, bubble.is_member || false)}
                    >
                      {bubble.is_member ? "Verlassen" : "Beitreten"}
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/bubbles/feed/${bubble.id}`}>
                        Feed
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
