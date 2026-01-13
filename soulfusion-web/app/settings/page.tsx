"use client"

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Bell,
  Lock,
  Eye,
  Palette,
  Globe,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";

type Tab = "profile" | "notifications" | "privacy" | "appearance" | "account";

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: "profile", label: "Profil", icon: User },
  { id: "notifications", label: "Benachrichtigungen", icon: Bell },
  { id: "privacy", label: "Privatsphäre", icon: Lock },
  { id: "appearance", label: "Darstellung", icon: Palette },
  { id: "account", label: "Konto", icon: User },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    display_name: user?.display_name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    city: user?.city || "",
    country: user?.country || "",
    gender: user?.gender || "",
    relationship_status: user?.relationship_status || "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    like_notifications: true,
    comment_notifications: true,
    follow_notifications: true,
    event_reminders: true,
    marketing_emails: false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profile_visibility: "public",
    show_email: false,
    show_location: true,
    allow_messages: "everyone",
    show_online_status: true,
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: "light",
    language: "de",
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await apiClient.updateProfile(profileData);
      console.log("Profile updated:", response);

      // Update user in store
      const updatedUser = { ...user, ...profileData } as any;
      setUser(updatedUser);

      addToast({
        message: "Profil erfolgreich aktualisiert!",
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      addToast({
        message: "Fehler beim Speichern",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
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
          <div>
            <h1 className="text-2xl font-bold">Einstellungen</h1>
            <p className="text-sm text-muted-foreground">
              Verwalte dein Konto und Präferenzen
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profil bearbeiten</CardTitle>
                  <CardDescription>
                    Aktualisiere deine öffentlichen Informationen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="display_name">Anzeigename *</Label>
                      <Input
                        id="display_name"
                        value={profileData.display_name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, display_name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Benutzername *</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) =>
                          setProfileData({ ...profileData, username: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      rows={4}
                      placeholder="Erzähle etwas über dich..."
                      className="resize-none"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="city">Stadt</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) =>
                          setProfileData({ ...profileData, city: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Land</Label>
                      <Input
                        id="country"
                        value={profileData.country}
                        onChange={(e) =>
                          setProfileData({ ...profileData, country: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="gender">Geschlecht</Label>
                      <select
                        id="gender"
                        value={profileData.gender}
                        onChange={(e) =>
                          setProfileData({ ...profileData, gender: e.target.value })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Nicht angeben</option>
                        <option value="männlich">Männlich</option>
                        <option value="weiblich">Weiblich</option>
                        <option value="divers">Divers</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="relationship_status">Beziehungsstatus</Label>
                      <select
                        id="relationship_status"
                        value={profileData.relationship_status}
                        onChange={(e) =>
                          setProfileData({ ...profileData, relationship_status: e.target.value })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Nicht angeben</option>
                        <option value="single">Single</option>
                        <option value="in_beziehung">In einer Beziehung</option>
                        <option value="verheiratet">Verheiratet</option>
                        <option value="es_ist_kompliziert">Es ist kompliziert</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Speichern...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Speichern
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Benachrichtigungen</CardTitle>
                  <CardDescription>
                    Wähle, welche Benachrichtigungen du erhalten möchtest
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Push-Benachrichtigungen</h3>
                    <NotificationItem
                      label="Push-Benachrichtigungen aktivieren"
                      checked={notifications.push_notifications}
                      onChange={(checked) =>
                        setNotifications({ ...notifications, push_notifications: checked })
                      }
                    />
                    <NotificationItem
                      label="Likes und Kommentare"
                      checked={notifications.like_notifications}
                      onChange={(checked) =>
                        setNotifications({ ...notifications, like_notifications: checked })
                      }
                    />
                    <NotificationItem
                      label="Neue Follower"
                      checked={notifications.follow_notifications}
                      onChange={(checked) =>
                        setNotifications({ ...notifications, follow_notifications: checked })
                      }
                    />
                    <NotificationItem
                      label="Event-Erinnerungen"
                      checked={notifications.event_reminders}
                      onChange={(checked) =>
                        setNotifications({ ...notifications, event_reminders: checked })
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">E-Mail</h3>
                    <NotificationItem
                      label="E-Mail Benachrichtigungen"
                      checked={notifications.email_notifications}
                      onChange={(checked) =>
                        setNotifications({ ...notifications, email_notifications: checked })
                      }
                    />
                    <NotificationItem
                      label="Marketing-E-Mails"
                      checked={notifications.marketing_emails}
                      onChange={(checked) =>
                        setNotifications({ ...notifications, marketing_emails: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <Card>
                <CardHeader>
                  <CardTitle>Privatsphäre</CardTitle>
                  <CardDescription>
                    Kontrolliere, wer deine Inhalte sehen kann
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Profilsichtbarkeit</Label>
                    <select
                      value={privacy.profile_visibility}
                      onChange={(e) =>
                        setPrivacy({ ...privacy, profile_visibility: e.target.value })
                      }
                      className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="public">🌍 Öffentlich</option>
                      <option value="members">👤 Nur Mitglieder</option>
                      <option value="friends">👥 Nur Freunde</option>
                      <option value="private">🔒 Privat</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <NotificationItem
                      label="E-Mail-Adresse anzeigen"
                      checked={privacy.show_email}
                      onChange={(checked) =>
                        setPrivacy({ ...privacy, show_email: checked })
                      }
                    />
                    <NotificationItem
                      label="Standort anzeigen"
                      checked={privacy.show_location}
                      onChange={(checked) =>
                        setPrivacy({ ...privacy, show_location: checked })
                      }
                    />
                    <NotificationItem
                      label="Online-Status anzeigen"
                      checked={privacy.show_online_status}
                      onChange={(checked) =>
                        setPrivacy({ ...privacy, show_online_status: checked })
                      }
                    />
                  </div>

                  <div>
                    <Label>Nachrichten empfangen von</Label>
                    <select
                      value={privacy.allow_messages}
                      onChange={(e) =>
                        setPrivacy({ ...privacy, allow_messages: e.target.value })
                      }
                      className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="everyone">Allen</option>
                      <option value="members">Nur Mitgliedern</option>
                      <option value="friends">Nur Freunden</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <Card>
                <CardHeader>
                  <CardTitle>Darstellung</CardTitle>
                  <CardDescription>
                    Passe das Aussehen der App an
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Design</Label>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {[
                        { value: "light", label: "Hell", icon: "☀️" },
                        { value: "dark", label: "Dunkel", icon: "🌙" },
                        { value: "auto", label: "Auto", icon: "🔄" },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => setAppearance({ ...appearance, theme: theme.value })}
                          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                            appearance.theme === theme.value
                              ? "border-primary bg-primary/10"
                              : "border-input hover:bg-accent"
                          }`}
                        >
                          <span className="text-2xl">{theme.icon}</span>
                          <span className="text-sm font-medium">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="language">Sprache</Label>
                    <select
                      id="language"
                      value={appearance.language}
                      onChange={(e) =>
                        setAppearance({ ...appearance, language: e.target.value })
                      }
                      className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="de">🇩🇪 Deutsch</option>
                      <option value="en">🇬🇧 English</option>
                      <option value="es">🇪🇸 Español</option>
                      <option value="fr">🇫🇷 Français</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <Card>
                <CardHeader>
                  <CardTitle>Konto</CardTitle>
                  <CardDescription>
                    Verwalte deine Kontoeinstellungen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>E-Mail</Label>
                    <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
                    <Button variant="outline" className="mt-2" size="sm">
                      E-Mail ändern
                    </Button>
                  </div>

                  <div>
                    <Label>Passwort</Label>
                    <p className="mt-1 text-sm text-muted-foreground">••••••••</p>
                    <Button variant="outline" className="mt-2" size="sm">
                      Passwort ändern
                    </Button>
                  </div>

                  <div>
                    <Label>Mitglied seit</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString("de-DE")
                        : "Unbekannt"}
                    </p>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="mb-2 font-medium text-destructive">Gefährliche Zone</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Diese Aktionen können nicht rückgängig gemacht werden
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button variant="outline">
                        Konto deaktivieren
                      </Button>
                      <Button variant="destructive">
                        Konto löschen
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleLogout}
                    >
                      Abmelden
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function NotificationItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="cursor-pointer" htmlFor={`switch-${label}`}>
        {label}
      </Label>
      <Switch
        id={`switch-${label}`}
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
}
