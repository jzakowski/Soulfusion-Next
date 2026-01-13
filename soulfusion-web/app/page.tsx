"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiClient } from "@/lib/api/client"
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
  ArrowRight
} from "lucide-react"

export default function LandingPage() {
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false)
  const [comingSoonFeature, setComingSoonFeature] = useState("")
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [magicLinkError, setMagicLinkError] = useState("")

  const handleFeatureClick = (featureName: string) => {
    setComingSoonFeature(featureName)
    setShowComingSoonDialog(true)
  }

  const handleSendMagicLink = async () => {
    if (!email || !email.includes("@")) {
      setMagicLinkError("Bitte gib eine gültige E-Mail-Adresse ein.")
      return
    }

    setIsSending(true)
    setMagicLinkError("")

    try {
      const result = await apiClient.login(email)
      if (result.success) {
        setMagicLinkSent(true)
      } else {
        setMagicLinkError(result.message || "Etwas ist schiefgelaufen. Bitte versuche es später erneut.")
      }
    } catch (error) {
      setMagicLinkError("Etwas ist schiefgelaufen. Bitte versuche es später erneut.")
    } finally {
      setIsSending(false)
    }
  }

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
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
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
            <Button size="lg" variant="outline" className="text-lg" onClick={() => handleFeatureClick("Events")}>
              Events entdecken
            </Button>
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
                <Button variant="ghost" className="gap-2 group-hover:bg-primary/10" onClick={() => handleFeatureClick("Events")}>
                  Events ansehen
                  <ArrowRight className="h-4 w-4" />
                </Button>
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
                <Button variant="ghost" className="gap-2 group-hover:bg-primary/10" onClick={() => handleFeatureClick("Unterkünfte")}>
                  Unterkünfte finden
                  <ArrowRight className="h-4 w-4" />
                </Button>
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
                <Button variant="ghost" className="gap-2 group-hover:bg-primary/10" onClick={() => handleFeatureClick("Bubbles")}>
                  Bubbles entdecken
                  <ArrowRight className="h-4 w-4" />
                </Button>
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
                <Button variant="ghost" className="gap-2 group-hover:bg-primary/10" onClick={() => handleFeatureClick("Dating")}>
                  Dating entdecken
                  <ArrowRight className="h-4 w-4" />
                </Button>
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
                <Button variant="ghost" className="gap-2 group-hover:bg-primary/10" onClick={() => handleFeatureClick("Workshops")}>
                  Workshops ansehen
                  <ArrowRight className="h-4 w-4" />
                </Button>
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
                <Button variant="ghost" className="gap-2 group-hover:bg-primary/10" onClick={() => handleFeatureClick("Club")}>
                  Club entdecken
                  <ArrowRight className="h-4 w-4" />
                </Button>
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
      <Dialog open={showLoginDialog} onOpenChange={(open) => {
        if (!open) {
          // Reset states when dialog closes
          setEmail("")
          setMagicLinkSent(false)
          setMagicLinkError("")
        }
        setShowLoginDialog(open)
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Willkommen bei SoulFusion</DialogTitle>
            <DialogDescription>
              Melde dich an oder registriere dich, um Teil der Community zu werden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {magicLinkSent ? (
              <div className="py-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold">Magic Link versendet!</h3>
                <p className="text-sm text-muted-foreground">
                  Wir haben einen Magic Link an <strong>{email}</strong> geschickt. Prüfe deinen Posteingang.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setMagicLinkSent(false)
                    setEmail("")
                  }}
                >
                  Weitere E-Mail verwenden
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    E-Mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  {magicLinkError && (
                    <p className="text-sm text-red-500">{magicLinkError}</p>
                  )}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSendMagicLink}
                  disabled={isSending}
                >
                  {isSending ? "Wird gesendet..." : "Magic Link senden"}
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
              </>
            )}

            {!magicLinkSent && (
              <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </Button>
            </div>
            )}
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

      {/* Coming Soon Dialog */}
      <Dialog open={showComingSoonDialog} onOpenChange={setShowComingSoonDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{comingSoonFeature} ist bald verfügbar!</DialogTitle>
            <DialogDescription>
              Wir arbeiten hart daran, dieses Feature so schnell wie möglich für dich bereitzustellen.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                {comingSoonFeature === "Unterkünfte" &&
                  "Biete bald deinen Wohnraum an oder finde eine gemütliche Unterkunft für deinen nächsten Aufenthalt."
                }
                {comingSoonFeature === "Events" &&
                  "Entdecke demnächst inspirierende Workshops, Retreats und Community-Treffen in deiner Nähe."
                }
                {comingSoonFeature === "Bubbles" &&
                  "Treffe bald Menschen mit ähnlichen Interessen in kleinen, intimen Gruppen."
                }
                {comingSoonFeature === "Dating" &&
                  "Finde bald besondere Verbindungen jenseits von Oberflächlichkeit."
                }
                {comingSoonFeature === "Workshops" &&
                  "Entwickle dich bald weiter mit inspirierenden Workshops und Kursen."
                }
                {comingSoonFeature === "Club" &&
                  "Exklusive Veranstaltungen und besondere Erlebnisse kommen bald."
                }
              </p>

              <Button className="w-full" onClick={() => setShowComingSoonDialog(false)}>
                Verstanden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
