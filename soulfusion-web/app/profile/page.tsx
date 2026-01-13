"use client"

import { useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, MapPin, Calendar, Camera } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const { openModal } = useUIStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      loadUser();
    }
  }, [isAuthenticated, user, loadUser]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">Bitte einloggen</h1>
          <p className="mb-8 text-muted-foreground">
            Du musst eingeloggt sein, um dein Profil zu sehen
          </p>
          <Button asChild>
            <a href="/auth/login">Zum Login</a>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mein Profil</h1>
            <p className="text-muted-foreground">Verwalte dein Profil und Einstellungen</p>
          </div>
          <Button onClick={() => openModal('edit-profile')}>Bearbeiten</Button>
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              {/* Avatar */}
              <div className="relative">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                    {user?.display_name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary p-0 text-primary-foreground hover:bg-primary/90">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold">{user?.display_name}</h2>
                <p className="text-muted-foreground">{user?.username && `@${user.username}`}</p>
                <p className="text-muted-foreground">{user?.bio}</p>

                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {user?.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user.city}</span>
                      {user?.country && `, ${user.country}`}
                    </div>
                  )}
                  {user?.birthdate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(user.birthdate).toLocaleDateString('de-DE')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Infos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
              </div>
              {user?.gender && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Geschlecht</label>
                  <p className="mt-1">{user.gender}</p>
                </div>
              )}
              {user?.relationship_status && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Beziehungsstatus</label>
                  <p className="mt-1">{user.relationship_status}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interessen</CardTitle>
            </CardHeader>
            <CardContent>
              {user?.interests && user.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-secondary px-3 py-1 text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Keine Interessen angegeben
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gallery */}
        {user?.gallery_urls && user.gallery_urls.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Galerie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {user.gallery_urls.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-md"
                  >
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audio Intro */}
        {user?.intro_audio_url && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Audio Intro</CardTitle>
            </CardHeader>
            <CardContent>
              <audio controls className="w-full">
                <source src={user.intro_audio_url} type="audio/mpeg" />
                Dein Browser unterstützt das Audio Element nicht.
              </audio>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
