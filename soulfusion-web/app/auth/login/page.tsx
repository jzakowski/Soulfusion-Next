"use client"

import { useState, useEffect, Suspense } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const magicLinkToken = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const { login, verifyMagicLink, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  // Handle magic link verification
  useEffect(() => {
    if (magicLinkToken) {
      handleVerifyMagicLink(magicLinkToken);
    }
  }, [magicLinkToken]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !magicLinkToken) {
      router.push("/");
    }
  }, [isAuthenticated, magicLinkToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email);
      setIsSuccess(true);
      addToast({
        message: "Magic Link gesendet! Prüfe deine Emails.",
        variant: "success",
      });
    } catch (err) {
      setError("Fehler beim Senden des Magic Links");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyMagicLink = async (token: string) => {
    try {
      await verifyMagicLink(token);
      addToast({
        message: "Erfolgreich eingeloggt!",
        variant: "success",
      });
      router.push("/");
    } catch (err) {
      setError("Ungültiger oder abgelaufener Magic Link");
      router.push("/auth/login");
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Willkommen bei SoulFusion</CardTitle>
            <p className="text-muted-foreground">
              Melde dich mit deiner Email an
            </p>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Magic Link gesendet!</h3>
                <p className="text-sm text-muted-foreground">
                  Wir haben einen Magic Link an <strong>{email}</strong> gesendet.
                  <br />
                  Prüfe deine Emails und klicke auf den Link zum Einloggen.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                >
                  Andere Email verwenden
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="deine@email.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Senden...
                    </>
                  ) : (
                    "Magic Link senden"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Wir senden dir einen Link zum Einloggen. Kein Passwort nötig.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// Wrap with Suspense to avoid useSearchParams SSR issue
export default function LoginPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
