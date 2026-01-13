"use client"

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Users,
  Star,
  Bed,
  Calendar,
  Home,
  Check,
  X,
  ArrowLeft,
  Loader2,
  Mail
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock accommodation data - would come from API
const mockAccommodation = {
  id: "1",
  title: "Gemütliches Zimmer in Berlin-Mitte",
  description: "Hey! Ich habe ein gemütliches Zimmer in meiner Wohnung frei. Du teilst dir das Bad mit mir. Die Wohnung ist zentral gelegen, gute Anbindung an öffentliche Verkehrsmittel. Es gibt alles was man braucht: Supermärkte, Cafés, Bars in der Nähe.\n\nIch freue mich auf nette Leute aus aller Welt! Lass uns dich unbedingt kennenlernen.",
  type: "zimmer",
  offer_type: "kostenlos",
  location_city: "Berlin",
  location_country: "Deutschland",
  max_guests: 2,
  amenities: ["WiFi", "Küche", "Bad", "Trockner", "Waschmaschine"],
  house_rules: ["Rauchen verboten", "Keine Partys", "Ruhzeiten nach 22 Uhr"],
  check_in: "Flexibel",
  check_out: "Bis 12 Uhr",
  host_name: "Sarah",
  host_rating: 4.8,
  host_reviews_count: 42,
  host_member_since: "2023-01-15",
  host_avatar_url: "",
  host_verified: true,
  images: [
    { url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800" },
    { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800" },
    { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800" },
  ],
  available_dates: {
    from: "2024-01-15",
    to: "2024-03-31",
  },
};

export default function AccommodationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [accommodation, setAccommodation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setAccommodation(mockAccommodation);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleRequest = () => {
    setRequestSent(true);
    // In real app, this would send a request to the host
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

  if (!accommodation) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Unterkunft nicht gefunden</p>
              <Button className="mt-4" asChild>
                <Link href="/uebernachtungen">Zurück</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const typeLabels: Record<string, string> = {
    komplette_unterkunft: "Komplett",
    zimmer: "Zimmer",
    bett: "Bett",
    couch: "Couch",
    zelt: "Zelt",
    camperplatz: "Camper",
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{accommodation.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {accommodation.location_city}, {accommodation.location_country}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={accommodation.images[selectedImage].url}
                    alt={accommodation.title}
                    fill
                    className="object-cover"
                  />
                </div>
                {accommodation.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2 p-2">
                    {accommodation.images.map((image: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative aspect-square overflow-hidden rounded-md ${
                          selectedImage === index ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={`Bild ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Beschreibung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{accommodation.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Ausstattung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {accommodation.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* House Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Hausregeln</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {accommodation.house_rules.map((rule: string) => (
                    <li key={rule} className="flex items-center gap-2 text-sm">
                      <X className="h-4 w-4 text-red-600" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Anfrage senden</CardTitle>
                  <Badge variant="secondary">
                    {accommodation.offer_type === 'kostenlos' ? 'Kostenlos' : 'Gegen Arbeit'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Art der Unterkunft</p>
                  <p className="text-lg">{typeLabels[accommodation.type]}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Bis zu {accommodation.max_guests} Gäste</span>
                </div>

                <div>
                  <p className="text-sm font-medium">Verfügbarkeit</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(accommodation.available_dates.from).toLocaleDateString('de-DE')} -{" "}
                      {new Date(accommodation.available_dates.to).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>

                {requestSent ? (
                  <Button className="w-full" disabled>
                    <Check className="mr-2 h-4 w-4" />
                    Anfrage gesendet
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleRequest}>
                    <Mail className="mr-2 h-4 w-4" />
                    Anfrage senden
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Host Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dein Gastgeber</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                    {accommodation.host_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{accommodation.host_name}</p>
                    {accommodation.host_verified && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Verifiziert
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{accommodation.host_rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({accommodation.host_reviews_count} Bewertungen)
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  Mitglied seit {new Date(accommodation.host_member_since).toLocaleDateString('de-DE')}
                </p>

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/profile/${accommodation.host_name.toLowerCase()}`}>
                    Profil ansehen
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Check-in Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">An- & Abreise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in:</span>
                  <span className="font-medium">{accommodation.check_in}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out:</span>
                  <span className="font-medium">{accommodation.check_out}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
