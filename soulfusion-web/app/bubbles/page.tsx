"use client"

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, Users, Clock, ArrowRight, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useBubbleStore } from "@/lib/stores/bubble-store";
import type { Bubble } from "@/lib/services/bubble-service";

export default function BubblesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPreferencesOnly, setShowPreferencesOnly] = useState(false);

  const {
    bubbles,
    bubblesLoading,
    fetchBubbles,
    bubblePreferences,
    fetchBubblePreferences,
    updateBubblePreference,
  } = useBubbleStore();

  useEffect(() => {
    fetchBubbles();
    fetchBubblePreferences();
  }, [fetchBubbles, fetchBubblePreferences]);

  // Get hidden bubble IDs
  const hiddenBubbleIds = new Set(
    bubblePreferences
      .filter(p => p.is_hidden)
      .map(p => p.bubble_id)
  );

  const filteredBubbles = bubbles
    .filter((bubble) => {
      // Don't show hidden bubbles when in preferences mode
      if (showPreferencesOnly && hiddenBubbleIds.has(bubble.id)) return false;
      return bubble.is_public;
    })
    .filter((bubble) =>
      bubble.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bubble.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Pinned bubbles first
      const aPref = bubblePreferences.find(p => p.bubble_id === a.id);
      const bPref = bubblePreferences.find(p => p.bubble_id === b.id);
      if (aPref?.is_pinned && !bPref?.is_pinned) return -1;
      if (!aPref?.is_pinned && bPref?.is_pinned) return 1;
      // Then by engagement score
      const aScore = aPref?.engagement_score || 0;
      const bScore = bPref?.engagement_score || 0;
      return bScore - aScore;
    });

  const toggleHide = async (bubbleId: string, currentlyHidden: boolean) => {
    const pref = bubblePreferences.find(p => p.bubble_id === bubbleId);
    if (pref) {
      await updateBubblePreference(pref.id, { is_hidden: !currentlyHidden });
    } else {
      // Create preference entry
      await updateBubblePreference('temp', { is_hidden: true });
    }
  };

  const togglePin = async (bubbleId: string, currentlyPinned: boolean) => {
    const pref = bubblePreferences.find(p => p.bubble_id === bubbleId);
    if (pref) {
      await updateBubblePreference(pref.id, { is_pinned: !currentlyPinned });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Bubbles</h1>
          <p className="text-muted-foreground">
            Deine Themenbereiche für den Feed
          </p>
        </div>

        {/* Unified Feed CTA */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-5 w-5 text-primary" />
                Zum Unified Feed
              </h3>
              <p className="text-sm text-muted-foreground">
                Siehe alle Beiträge aus deinen Bubbles in einem Feed
              </p>
            </div>
            <Button asChild>
              <Link href="/bubbles/feed">
                Feed öffnen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Search & Actions */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Bubbles durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showPreferencesOnly ? "default" : "outline"}
            onClick={() => setShowPreferencesOnly(!showPreferencesOnly)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Verwalten
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
                  : "Keine Bubbles verfügbar"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBubbles.map((bubble) => {
              const pref = bubblePreferences.find(p => p.bubble_id === bubble.id);
              const isHidden = hiddenBubbleIds.has(bubble.id);
              const isPinned = pref?.is_pinned || false;

              return (
                <Card
                  key={bubble.id}
                  className={`overflow-hidden transition-shadow hover:shadow-lg ${isHidden ? 'opacity-50' : ''}`}
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
                          {isPinned && (
                            <Badge variant="secondary" className="mt-1">
                              📌 Gepinnt
                            </Badge>
                          )}
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

                    {showPreferencesOnly ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => toggleHide(bubble.id, isHidden)}
                        >
                          {isHidden ? 'Anzeigen' : 'Ausblenden'}
                        </Button>
                        <Button
                          variant={isPinned ? "default" : "outline"}
                          onClick={() => togglePin(bubble.id, isPinned)}
                        >
                          📌
                        </Button>
                      </div>
                    ) : (
                      <Button asChild className="w-full">
                        <Link href="/bubbles/feed">
                          Zum Feed
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
