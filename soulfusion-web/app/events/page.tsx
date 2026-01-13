"use client"

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Plus,
  Filter,
  Clock,
  TrendingUp,
  Globe,
  Map,
  Plane,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Star,
  Settings
} from "lucide-react";
import Image from "next/image";

// Mock events data - would come from API
const mockEvents = [
  {
    id: "1",
    title: "Weihnachtsmarkt Tour Berlin",
    description: "Lass uns zusammen die schönsten Weihnachtsmärkte der Stadt erkunden!",
    date: "2024-12-15",
    time: "18:00",
    location: "Alexanderplatz, Berlin",
    city: "Berlin",
    attendee_count: 24,
    max_attendees: 50,
    organizer_name: "Sarah",
    organizer_avatar: "",
    organizer_is_vip: true,
    image_url: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800",
    category: "Ausgehen",
    is_online: false,
    is_joined: false,
    is_interested: false,
    has_forum: true,
    payment_required: true,
    payment_amount: 15,
  },
  {
    id: "2",
    title: "Wandern im Taunus",
    description: "Gemütliche Herbstwanderung mit Picknick. Alle Schwierigkeitsgrade willkommen!",
    date: "2024-11-20",
    time: "10:00",
    location: "Großer Feldberg, Taunus",
    city: "Frankfurt",
    attendee_count: 12,
    max_attendees: 20,
    organizer_name: "Max",
    organizer_avatar: "",
    organizer_is_vip: false,
    image_url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
    category: "Natur",
    is_online: false,
    is_joined: true,
    is_interested: false,
    has_forum: true,
    payment_required: false,
  },
  {
    id: "3",
    title: "Online Meditation Abend",
    description: "Gemeinsam meditieren und entspannen von zu Hause aus.",
    date: "2024-11-18",
    time: "19:00",
    location: "Zoom",
    city: "Online",
    attendee_count: 45,
    max_attendees: null,
    organizer_name: "Lisa",
    organizer_avatar: "",
    organizer_is_vip: true,
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    category: "Wellness",
    is_online: true,
    is_joined: false,
    is_interested: true,
    has_forum: true,
    payment_required: true,
    payment_amount: 5,
  },
  {
    id: "4",
    title: "Brettspiel-Nachmittag",
    description: "Spiele-Nachmittag mit Kaffee und Kuchen. Bring deine Lieblingsspiele mit!",
    date: "2024-11-25",
    time: "14:00",
    location: "Café Munich, München",
    city: "München",
    attendee_count: 15,
    max_attendees: null,
    organizer_name: "Tom",
    organizer_avatar: "",
    organizer_is_vip: false,
    image_url: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800",
    category: "Spiele",
    is_online: false,
    is_joined: false,
    is_interested: false,
    has_forum: true,
    payment_required: false,
  },
  {
    id: "5",
    title: "Yoga im Park",
    description: "Gemeinsame Yoga-Session im Grüßen. Für alle Level geeignet. Bring deine Matte mit!",
    date: "2024-11-19",
    time: "08:00",
    location: "Englischer Garten, München",
    city: "München",
    attendee_count: 18,
    max_attendees: 30,
    organizer_name: "Yoga with Maria",
    organizer_avatar: "",
    organizer_is_vip: true,
    image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
    category: "Sport",
    is_online: false,
    is_joined: false,
    is_interested: true,
    has_forum: true,
    payment_required: true,
    payment_amount: 10,
  },
  {
    id: "6",
    title: "Stammtisch Köln",
    description: "Regelmäßiger Stammtisch für alle, die sich kennenlernen wollen.",
    date: "2024-11-22",
    time: "19:00",
    location: "Gasthaus zur Stadt, Köln",
    city: "Köln",
    attendee_count: 8,
    max_attendees: 15,
    organizer_name: "Jan (VIP)",
    organizer_avatar: "",
    organizer_is_vip: true,
    image_url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800",
    category: "Stammtisch",
    is_online: false,
    is_joined: false,
    is_interested: false,
    has_forum: true,
    payment_required: false,
  },
];

const categories = ["Alle", "Ausgehen", "Natur", "Essen", "Spiele", "Sport", "Kultur", "Musik", "Wellness", "Stammtisch"];

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [events, setEvents] = useState(mockEvents);
  const [radius, setRadius] = useState(50);
  const [showRadiusSlider, setShowRadiusSlider] = useState(true);
  const [travelMode, setTravelMode] = useState(false);
  const [additionalCity, setAdditionalCity] = useState("");
  const [eventMode, setEventMode] = useState<"all" | "online" | "offline">("all");
  const [expandedParticipants, setExpandedParticipants] = useState<string | null>(null);

  const currentUser = {
    id: "current-user",
    name: "Du",
    is_admin: false,
    is_vip: false,
  };

  const filteredEvents = events
    .filter((event) => {
      if (eventMode === "online" && !event.is_online) return false;
      if (eventMode === "offline" && event.is_online) return false;
      return true;
    })
    .filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((event) =>
      selectedCategory === "Alle" || event.category === selectedCategory
    );

  const toggleJoin = (eventId: string) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? {
              ...event,
              is_joined: !event.is_joined,
              attendee_count: event.is_joined
                ? event.attendee_count - 1
                : event.attendee_count + 1,
            }
          : event
      )
    );
  };

  const toggleInterest = (eventId: string) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? { ...event, is_interested: !event.is_interested }
          : event
      )
    );
  };

  const toggleParticipants = (eventId: string) => {
    setExpandedParticipants(expandedParticipants === eventId ? null : eventId);
  };

  const myEvents = filteredEvents.filter(e => e.is_joined);

  // Mock participants for events
  const getParticipants = (eventId: string) => {
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) return [];

    // Only return participants if user is joined or interested
    if (!event.is_joined && !event.is_interested) return [];

    return [
      { id: "1", name: "Anna", is_friend: true, is_vip: false },
      { id: "2", name: "Ben", is_friend: true, is_vip: true },
      { id: "3", name: "Clara", is_friend: false, is_vip: false },
      { id: "4", name: "David", is_friend: false, is_vip: true },
      { id: "5", name: "Eva", is_friend: true, is_vip: false },
    ];
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-muted-foreground">
              Triff Community-Mitglieder bei Events in deiner Nähe
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Einstellungen
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Event erstellen
            </Button>
          </div>
        </div>

        {/* Travel Mode Banner */}
        {travelMode && (
          <Card className="mb-6 border-tertiary bg-tertiary/10">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Plane className="h-5 w-5 text-tertiary" />
                <div>
                  <p className="font-semibold">Reise-Modus aktiv</p>
                  <p className="text-sm text-muted-foreground">
                    Events aus deiner Heimat und {additionalCity || "zusätzlichen Stadt"} werden angezeigt
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setTravelMode(false)}>
                Deaktivieren
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Event CTA */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-tertiary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Eigenes Event erstellen?</h3>
                <p className="text-sm text-muted-foreground">
                  Organisiere ein Treffen und lade die Community ein
                </p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Erstellen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Events durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Event Mode Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={eventMode === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEventMode("all")}
                >
                  Alle Events
                </Button>
                <Button
                  variant={eventMode === "offline" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEventMode("offline")}
                >
                  <MapPin className="mr-1 h-4 w-4" />
                  Vor Ort
                </Button>
                <Button
                  variant={eventMode === "online" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEventMode("online")}
                >
                  <Globe className="mr-1 h-4 w-4" />
                  Online
                </Button>
              </div>

              {/* Radius Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0"
                    onClick={() => setShowRadiusSlider(!showRadiusSlider)}
                  >
                    <span className="flex items-center gap-2">
                      <Map className="h-4 w-4" />
                      <span className="font-semibold">Suchradius: {radius} km</span>
                      {showRadiusSlider ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </Button>
                  <Button
                    variant={travelMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTravelMode(!travelMode)}
                    className="gap-1"
                  >
                    <Plane className="h-4 w-4" />
                    Reise-Modus
                  </Button>
                </div>
                {showRadiusSlider && (
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {radius} km
                    </span>
                  </div>
                )}
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
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
            </div>
          </CardContent>
        </Card>

        {/* My Events */}
        {myEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Calendar className="h-5 w-5 text-primary" />
              Meine Events ({myEvents.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  currentUser={currentUser}
                  onJoin={() => toggleJoin(event.id)}
                  onInterest={() => toggleInterest(event.id)}
                  onToggleParticipants={() => toggleParticipants(event.id)}
                  showParticipants={expandedParticipants === event.id}
                  participants={getParticipants(event.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Events */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Anstehende Events
          </h2>
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Keine Events gefunden"
                    : "Keine Events in deiner Nähe"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  currentUser={currentUser}
                  onJoin={() => toggleJoin(event.id)}
                  onInterest={() => toggleInterest(event.id)}
                  onToggleParticipants={() => toggleParticipants(event.id)}
                  showParticipants={expandedParticipants === event.id}
                  participants={getParticipants(event.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

interface EventCardProps {
  event: any;
  currentUser: any;
  onJoin: () => void;
  onInterest: () => void;
  onToggleParticipants: () => void;
  showParticipants: boolean;
  participants: any[];
}

function EventCard({
  event,
  currentUser,
  onJoin,
  onInterest,
  onToggleParticipants,
  showParticipants,
  participants,
}: EventCardProps) {
  const canSeeParticipants = event.is_joined || event.is_interested;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-video">
        <Image
          src={event.image_url}
          alt={event.title}
          fill
          className="object-cover"
        />
        <div className="absolute right-2 top-2 flex gap-1">
          {event.is_online && (
            <Badge className="bg-tertiary">
              <Globe className="mr-1 h-3 w-3" />
              Online
            </Badge>
          )}
          <Badge variant="secondary">{event.category}</Badge>
        </div>
        {event.is_joined && (
          <div className="absolute left-2 top-2">
            <Badge className="bg-success">Angemeldet</Badge>
          </div>
        )}
        {event.payment_required && !event.is_joined && (
          <div className="absolute left-2 bottom-2">
            <Badge className="bg-warning text-warning-foreground">
              {event.payment_amount}€
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-lg">{event.title}</CardTitle>
          {event.organizer_is_vip && (
            <Badge className="bg-highlight text-highlight-foreground gap-1">
              <Star className="h-3 w-3" />
              VIP
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(event.date).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {event.time}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {event.description}
        </p>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {event.is_online ? (
            <Globe className="h-4 w-4" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          <span className="line-clamp-1">{event.location}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{event.attendee_count}</span>
            {event.max_attendees && <span> {" / "} {event.max_attendees}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">von {event.organizer_name}</span>
          </div>
        </div>

        {/* Forum Badge */}
        {event.has_forum && canSeeParticipants && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            Event-Forum verfügbar
          </div>
        )}

        {/* Participants List (only visible if joined or interested) */}
        {canSeeParticipants && participants.length > 0 && (
          <div className="border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 w-full flex items-center justify-between"
              onClick={onToggleParticipants}
            >
              <span className="text-sm font-medium">
                Teilnehmer ({participants.length})
              </span>
              {showParticipants ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {showParticipants && (
              <div className="mt-2 space-y-1">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between rounded bg-muted p-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span>{participant.name}</span>
                      {participant.is_vip && (
                        <Star className="h-3 w-3 fill-highlight text-highlight" />
                      )}
                      {participant.is_friend && (
                        <Badge variant="outline" className="text-xs">Freund</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment Info */}
        {event.payment_required && !event.is_joined && (
          <div className="rounded border border-warning bg-warning/10 p-2 text-center text-sm">
            <p className="font-semibold text-warning">
              Zahlung vor Event erforderlich: {event.payment_amount}€
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant={event.is_joined ? "outline" : "default"}
            className="flex-1"
            onClick={onJoin}
          >
            {event.is_joined ? "Abmelden" : "Teilnehmen"}
          </Button>
          <Button
            variant={event.is_interested ? "default" : "outline"}
            size="icon"
            onClick={onInterest}
          >
            <Calendar className={`h-4 w-4 ${event.is_interested ? "fill-current" : ""}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
