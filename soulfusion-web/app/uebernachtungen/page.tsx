"use client"

import { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAccommodationsStore } from "@/lib/stores/accommodations-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed, MapPin, Users, Star, Filter, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function UebernachtungenPage() {
  const {
    accommodations,
    loading,
    fetchAccommodations,
    filters,
    setFilters,
  } = useAccommodationsStore();

  useEffect(() => {
    fetchAccommodations();
  }, [fetchAccommodations]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Übernachtungen</h1>
            <p className="text-muted-foreground">
              Finde kostenlose Unterkünfte und Gastgeber
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Create Accommodation CTA */}
        <Card className="mb-8 bg-primary/10">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-semibold">Biete eine Unterkunft an?</h3>
              <p className="text-sm text-muted-foreground">
                Hil anderen Reisenden und werde Teil der Community
              </p>
            </div>
            <Button asChild>
              <Link href="/uebernachtungen/erstellen">Angebot erstellen</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Accommodations Grid */}
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
              <Card key={accommodation.id} className="overflow-hidden">
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
                      {accommodation.host_avatar_url && (
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
    </AppLayout>
  );
}
