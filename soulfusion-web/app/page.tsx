"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar,
  Home,
  Users,
  Heart,
  Sparkles,
  MessageCircle,
  MapPin,
  Star,
  ArrowRight,
  X
} from "lucide-react"

export default function LandingPage() {
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SoulFusion</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setShowLoginDialog(true)}>Anmelden</Button>
            <Button onClick={() => setShowLoginDialog(true)}>Registrieren</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background px-4">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-background/85 to-background" />
          <img
            src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1920&q=80"
            alt="Community"
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
            ✨ Willkommen in der Community
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Verbinde dich mit
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}gleichgesinnten Menschen
            </span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
            Entdecke Events, finde Unterkünfte, triff neue Leute – alles in einer Community, die dich wachsen lässt.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2 text-lg" onClick={() => setShowLoginDialog(true)}>
              Jetzt beitreten
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Link href="/events">
              <Button size="lg" variant="outline" className="text-lg">
                Events entdecken
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Alles für deine persönliche Reise
            </h2>
            <p className="text-lg text-muted-foreground">
              Eine Plattform, die Menschen verbindet und Erfahrungen ermöglicht
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Events */}
            <Card className="group overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Events</h3>
                <p className="mb-4 text-muted-foreground">
                  Finde Workshops, Retreats und Treffen in deiner Nähe. Lerne, wachse und vernetze dich.
                </p>
                <Link href="/events">
                  <Button variant="ghost" className="gap-2 group-hover:bg-primary/10">
                    Events ansehen
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Unterkünfte */}
            <Card className="group overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Unterkünfte</h3>
                <p className="mb-4 text-muted-foreground">
                  Finde ein Platz zum Übernachten oder biete dein Zuhause an. Gastfreundschaft pur.
                </p>
                <Link href="/uebernachtungen">
                  <Button variant="ghost" className="gap-2 group-hover:bg-primary/10">
                    Unterkünfte finden
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Bubbles */}
            <Card className="group overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Bubbles</h3>
                <p className="mb-4 text-muted-foreground">
                  Treffe Menschen mit ähnlichen Interessen in intimen Gruppen und tiefen Gesprächen.
                </p>
                <Link href="/bubbles">
                  <Button variant="ghost" className="gap-2 group-hover:bg-primary/10">
                    Bubbles entdecken
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Dating */}
            <Card className="group overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Dating</h3>
                <p className="mb-4 text-muted-foreground">
                  Finde besondere Verbindungen jenseits von Oberflächlichkeit. Ehrlich und authentisch.
                </p>
                <Link href="/dating">
                  <Button variant="ghost" className="gap-2 group-hover:bg-primary/10">
                    Dating entdecken
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Workshops */}
            <Card className="group overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Workshops</h3>
                <p className="mb-4 text-muted-foreground">
                  Entwickle dich weiter mit inspirierenden Workshops und Kursen. Wächst zusammen.
                </p>
                <Link href="/workshops">
                  <Button variant="ghost" className="gap-2 group-hover:bg-primary/10">
                    Workshops ansehen
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Club */}
            <Card className="group overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Club</h3>
                <p className="mb-4 text-muted-foreground">
                  Exklusive Veranstaltungen und besondere Erlebnisse für Mitglieder unserer Community.
                </p>
                <Link href="/club">
                  <Button variant="ghost" className="gap-2 group-hover:bg-primary/10">
                    Club entdecken
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-primary/5 py-24 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
            Teil einer wachsenden Community
          </h2>
          <p className="mb-12 text-lg text-muted-foreground">
            Verbinde dich mit Menschen, die ähnliche Werte teilen und gemeinsam an sich selbst wachsen wollen.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="mb-4 text-4xl font-bold text-primary">1000+</div>
              <div className="text-muted-foreground">Mitglieder</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 text-4xl font-bold text-primary">50+</div>
              <div className="text-muted-foreground">Events pro Monat</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 text-4xl font-bold text-primary">20+</div>
              <div className="text-muted-foreground">Standorte</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-12 text-primary-foreground">
            <h2 className="mb-4 text-3xl font-bold">
              Bereit, dich zu verbinden?
            </h2>
            <p className="mb-8 text-lg opacity-90">
              Schließe dich Tausenden von Menschen an, die gemeinsam an sich selbst wachsen und echte Verbindungen suchen.
            </p>
            <Button size="lg" variant="secondary" className="gap-2 text-lg" onClick={() => setShowLoginDialog(true)}>
              Jetzt kostenlos registrieren
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-bold">SoulFusion</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Eine Community für persönliches Wachstum und echte Verbindungen.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Entdecken</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/events" className="text-muted-foreground hover:text-primary">Events</Link></li>
                <li><Link href="/uebernachtungen" className="text-muted-foreground hover:text-primary">Unterkünfte</Link></li>
                <li><Link href="/bubbles" className="text-muted-foreground hover:text-primary">Bubbles</Link></li>
                <li><Link href="/dating" className="text-muted-foreground hover:text-primary">Dating</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Community</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/workshops" className="text-muted-foreground hover:text-primary">Workshops</Link></li>
                <li><Link href="/club" className="text-muted-foreground hover:text-primary">Club</Link></li>
                <li><Link href="/beitraege" className="text-muted-foreground hover:text-primary">Beiträge</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Rechtliches</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/impressum" className="text-muted-foreground hover:text-primary">Impressum</Link></li>
                <li><Link href="/datenschutz" className="text-muted-foreground hover:text-primary">Datenschutz</Link></li>
                <li><Link href="/agb" className="text-muted-foreground hover:text-primary">AGB</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SoulFusion. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>

      {/* Login/Register Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Willkommen bei SoulFusion</span>
              <button
                onClick={() => setShowLoginDialog(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Schließen</span>
              </button>
            </DialogTitle>
            <DialogDescription>
              Melde dich an oder registriere dich, um Teil der Community zu werden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="deine@email.de"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <Button className="w-full" size="lg">
              Magic Link senden
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Oder
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                Google
              </Button>
              <Button variant="outline" className="w-full">
                Apple
              </Button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Mit der Registrierung akzeptierst du unsere{" "}
            <Link href="/agb" className="underline hover:text-primary" onClick={(e) => { e.preventDefault(); window.location.href = '/agb'; }}>
              AGB
            </Link>{" "}
            und{" "}
            <Link href="/datenschutz" className="underline hover:text-primary" onClick={(e) => { e.preventDefault(); window.location.href = '/datenschutz'; }}>
              Datenschutzrichtlinie
            </Link>
            .
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
