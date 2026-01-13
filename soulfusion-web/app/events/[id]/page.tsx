"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEventsStore, Event } from "@/lib/stores/events-store";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Globe,
  ArrowLeft,
  Loader2,
  Check,
  X,
  Euro,
  Dog,
  Baby,
  Share2,
  Star,
} from "lucide-react";
import Image from "next/image";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchEvent } = useEventsStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [interested, setInterested] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadEvent(params.id as string);
    }
  }, [params.id]);

  const loadEvent = async (id: string) => {
    setLoading(true);
    try {
      const eventData = await fetchEvent(id);
      if (eventData) {
        setEvent(eventData);
        setJoined(eventData.is_joined || false);
        setInterested(eventData.is_interested || false);
      }
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    // TODO: Implement join API call
    setJoined(!joined);
  };

  const handleInterest = async () => {
    // TODO: Implement interest API call
    setInterested(!interested);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: event?.name,
        text: event?.description || '',
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Event nicht gefunden</p>
              <Button onClick={() => router.back()}>Zurück</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const priceDisplay = event.price_type === 'free'
    ? 'Kostenlos'
    : event.price_cents
      ? `${(event.price_cents / 100).toFixed(2)}€`
      : 'Preis auf Anfrage';

  const categoryColors: Record<string, string> = {
    meditation: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    yoga: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    retreat: 'bg-green-500/20 text-green-700 dark:text-green-300',
    ceremony: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
    workshop: 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold md:text-3xl">{event.name}</h1>
            {event.city && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {event.city}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Category Badge */}
        {event.category && (
          <div className="mb-4">
            <Badge className={categoryColors[event.category] || 'bg-secondary'}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Badge>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 md:col-span-2">
            {/* Date & Time Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Datum & Uhrzeit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {new Date(event.starts_at).toLocaleDateString('de-DE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <p className="font-medium">
                      {new Date(event.starts_at).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {event.ends_at && (
                        <>
                          {' - '}
                          {new Date(event.ends_at).toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            {!event.is_online && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Ort
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {event.street && (
                      <p className="font-medium">{event.street} {event.house_number}</p>
                    )}
                    {event.postcode && event.city && (
                      <p className="text-muted-foreground">
                        {event.postcode} {event.city}
                      </p>
                    )}
                    {event.place_note && (
                      <p className="text-sm text-muted-foreground mt-2 bg-muted p-2 rounded">
                        {event.place_note}
                      </p>
                    )}
                  </div>
                  {(event.latitude && event.longitude) && (
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;
                        window.open(mapsUrl, '_blank');
                      }}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Auf der Karte anzeigen
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Online Event Card */}
            {event.is_online && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Online Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    Dieses Event findet online statt.
                  </p>
                  {event.meeting_url && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(event.meeting_url || '', '_blank')}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Meeting beitreten
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Description Card */}
            {event.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Beschreibung</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Features Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <Euro className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Preis</p>
                      <p className="font-medium">{priceDisplay}</p>
                    </div>
                  </div>

                  {/* Capacity */}
                  {event.capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Plätze</p>
                        <p className="font-medium">{event.capacity}</p>
                      </div>
                    </div>
                  )}

                  {/* Dogs Allowed */}
                  <div className="flex items-center gap-2">
                    {event.dogs_allowed ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Hunde erlaubt</p>
                    </div>
                  </div>

                  {/* Child Friendly */}
                  <div className="flex items-center gap-2">
                    {event.child_friendly ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Kind freundlich</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Teilnehmen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.capacity && event.attendee_count && (
                  <div className="text-center py-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Teilnehmer</p>
                    <p className="text-2xl font-bold">{event.attendee_count}</p>
                    <p className="text-xs text-muted-foreground">
                      von {event.capacity} verfügbar
                    </p>
                  </div>
                )}

                {joined ? (
                  <Button className="w-full" variant="outline" onClick={handleJoin}>
                    <Check className="mr-2 h-4 w-4" />
                    Angemeldet
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleJoin}
                    disabled={!event.capacity || (event.attendee_count || 0) >= event.capacity}
                  >
                    {event.price_type === 'free' ? 'Kostenlos teilnehmen' : 'Teilnehmen'}
                  </Button>
                )}

                <Button
                  className="w-full"
                  variant={interested ? "default" : "outline"}
                  onClick={handleInterest}
                >
                  <Star className={`mr-2 h-4 w-4 ${interested ? "fill-current" : ""}`} />
                  {interested ? 'Interessiert' : 'Als Interessiert markieren'}
                </Button>

                {event.visibility === 'public' && event.is_shareable && (
                  <p className="text-xs text-center text-muted-foreground">
                    Dieses Event ist öffentlich sichtbar
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Organizer Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organisator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                    {event.created_by.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">Event Organisator</p>
                    <p className="text-xs text-muted-foreground">
                      Mitglied seit {new Date(event.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Profil ansehen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
