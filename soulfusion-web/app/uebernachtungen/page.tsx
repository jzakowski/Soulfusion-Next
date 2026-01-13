"use client"

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAccommodationsStore } from "@/lib/stores/accommodations-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bed, MapPin, Users, Star, Filter, Loader2, Search, Calendar, Group, Heart, Plus, User, MapPin as MapPinIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FilterState {
  locationQuery: string;
  startDate: string | null;
  endDate: string | null;
  adults: number;
  children: number;
  type: string | null;
  petsAllowed: string | null;
  isAccessible: boolean | null;
  hostHasChildren: boolean | null;
  hostHasPets: boolean | null;
  smokingAllowed: boolean | null;
  wifi: boolean | null;
  homeOfficeOk: boolean | null;
}

export default function UebernachtungenPage() {
  const {
    accommodations,
    loading,
    fetchAccommodations,
    filters,
    setFilters,
  } = useAccommodationsStore();

  const [filterState, setFilterState] = useState<FilterState>({
    locationQuery: '',
    startDate: null,
    endDate: null,
    adults: 2,
    children: 0,
    type: null,
    petsAllowed: null,
    isAccessible: null,
    hostHasChildren: null,
    hostHasPets: null,
    smokingAllowed: null,
    wifi: null,
    homeOfficeOk: null,
  });

  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showGuestsOverlay, setShowGuestsOverlay] = useState(false);

  useEffect(() => {
    fetchAccommodations();
  }, [fetchAccommodations]);

  const totalGuests = filterState.adults + filterState.children;

  return (
    <AppLayout>
      <div>
        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-8 pb-4">
          <div className="flex flex-col items-center text-center">
            {/* Gradient Heading */}
            <h1 className="text-5xl md:text-6xl font-semibold leading-tight mb-2">
              <span className="bg-gradient-to-r from-[#3C1642] via-[#6B2C7A] to-[#9C4DCC] bg-clip-text text-transparent">
                Entdecken.Erkunden.Erleben
              </span>
            </h1>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Finde einen Platz
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Entdecke kostenlose Unterkünfte und herzliche Gastfreundschaft.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-12">
              <Button variant="outline" className="gap-2 min-w-[180px]">
                <Heart className="h-4 w-4" />
                Von Freunden
              </Button>
              <Button className="gap-2 min-w-[180px]">
                <Plus className="h-4 w-4" />
                Erstellen
              </Button>
              <Button variant="outline" className="gap-2 min-w-[180px]">
                <User className="h-4 w-4" />
                Gastprofil
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-md border p-3">
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                  {/* Location */}
                  <div className="relative">
                    <button
                      onClick={() => setShowLocationInput(!showLocationInput)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors min-w-[140px]"
                    >
                      <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                      <div className="text-left">
                        <p className="text-xs font-semibold">Wohin</p>
                        <p className="text-sm truncate max-w-[100px]">
                          {filterState.locationQuery || 'Irgendwo'}
                        </p>
                      </div>
                    </button>
                    {showLocationInput && (
                      <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg p-3 w-64 z-50">
                        <Input
                          placeholder="Ort eingeben"
                          value={filterState.locationQuery}
                          onChange={(e) => setFilterState({ ...filterState, locationQuery: e.target.value })}
                          autoFocus
                          onBlur={() => setTimeout(() => setShowLocationInput(false), 200)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="hidden md:block w-px h-8 bg-border" />

                  {/* Start Date */}
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-xs font-semibold">Anreisetag</p>
                      <p className="text-sm">{filterState.startDate ? new Date(filterState.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : 'Datum'}</p>
                    </div>
                  </button>

                  <div className="hidden md:block w-px h-8 bg-border" />

                  {/* End Date */}
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-xs font-semibold">Abreisetag</p>
                      <p className="text-sm">{filterState.endDate ? new Date(filterState.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : 'Datum'}</p>
                    </div>
                  </button>

                  <div className="hidden md:block w-px h-8 bg-border" />

                  {/* Guests */}
                  <div className="relative">
                    <button
                      onClick={() => setShowGuestsOverlay(!showGuestsOverlay)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Group className="h-5 w-5 text-muted-foreground" />
                      <div className="text-left">
                        <p className="text-xs font-semibold">Weiteres</p>
                        <p className="text-sm">{totalGuests} {totalGuests === 1 ? 'Gast' : 'Gäste'}</p>
                      </div>
                    </button>

                    {/* Guests Overlay */}
                    {showGuestsOverlay && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowGuestsOverlay(false)} />
                        <div className="absolute top-full left-0 mt-2 bg-white border rounded-xl shadow-xl p-4 w-80 z-50">
                          <h3 className="font-semibold mb-4">Weiteres</h3>

                          {/* Adults */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-muted-foreground" />
                              <span>Erwachsene</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setFilterState({ ...filterState, adults: Math.max(1, filterState.adults - 1) })}
                                disabled={filterState.adults <= 1}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{filterState.adults}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setFilterState({ ...filterState, adults: filterState.adults + 1 })}
                              >
                                +
                              </Button>
                            </div>
                          </div>

                          {/* Children */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-muted-foreground" />
                              <span>Kinder</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setFilterState({ ...filterState, children: Math.max(0, filterState.children - 1) })}
                                disabled={filterState.children <= 0}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{filterState.children}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setFilterState({ ...filterState, children: filterState.children + 1 })}
                              >
                                +
                              </Button>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setShowGuestsOverlay(false)}
                          >
                            Fertig
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex-1" />

                  {/* Search Button */}
                  <Button size="lg" className="rounded-full px-6">
                    <Search className="h-5 w-5 mr-2" />
                    Suchen
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accommodations Grid */}
        <div className="container mx-auto px-4 py-8">
          {loading && accommodations.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : accommodations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bed className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Keine Unterkünfte gefunden. Sei der Erste!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accommodations.map((accommodation) => (
                <Card key={accommodation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {accommodation.images.length > 0 && (
                    <div className="relative aspect-video">
                      <Image
                        src={accommodation.images[0].url}
                        alt={accommodation.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{accommodation.title}</CardTitle>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {accommodation.location_city}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {accommodation.description}
                    </p>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                        {accommodation.type === 'komplette_unterkunft' && 'Komplett'}
                        {accommodation.type === 'zimmer' && 'Zimmer'}
                        {accommodation.type === 'bett' && 'Bett'}
                        {accommodation.type === 'couch' && 'Couch'}
                        {accommodation.type === 'zelt' && 'Zelt'}
                        {accommodation.type === 'camperplatz' && 'Camper'}
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                        {accommodation.offer_type === 'kostenlos' ? 'Kostenlos' : 'Gegen Arbeit'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!accommodation.host_avatar_url && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                            {accommodation.host_name.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {accommodation.host_name}
                        </span>
                      </div>
                      {accommodation.host_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{accommodation.host_rating}</span>
                        </div>
                      )}
                    </div>

                    {accommodation.max_guests && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        <Users className="mr-1 inline h-3 w-3" />
                        Bis zu {accommodation.max_guests} Gäste
                      </p>
                    )}

                    <Button className="mt-4 w-full" asChild>
                      <Link href={`/uebernachtungen/${accommodation.id}`}>
                        Ansehen
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
