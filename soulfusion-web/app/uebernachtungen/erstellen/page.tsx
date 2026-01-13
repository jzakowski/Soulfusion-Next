"use client"

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccommodationsStore } from "@/lib/stores/accommodations-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Loader2, Check } from "lucide-react";

const amenitiesList = [
  "WiFi",
  "Küche",
  "Bad",
  "Dusche",
  "WC",
  "Trockner",
  "Waschmaschine",
  "Parkplatz",
  "Garten",
  "Terrasse",
  "Balkon",
  "TV",
  "Klimaanlage",
  "Heizung",
  "Arbeitsplatz",
];

const houseRulesList = [
  { id: "no_smoking", label: "Rauchen verboten" },
  { id: "no_pets", label: "Keine Haustiere" },
  { id: "no_parties", label: "Keine Partys" },
  { id: "quiet_hours", label: "Ruhzeiten beachten" },
  { id: "shoes_off", label: "Schuhe aus" },
];

export default function CreateAccommodationPage() {
  const router = useRouter();
  const { createAccommodation, loading } = useAccommodationsStore();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    offer_type: "kostenlos",
    location_city: "",
    location_country: "Deutschland",
    max_guests: 1,
    check_in: "flexibel",
    check_out: "bis_12",
    amenities: [] as string[],
    house_rules: [] as string[],
  });

  const [customRule, setCustomRule] = useState("");
  const [customRules, setCustomRules] = useState<string[]>([]);

  const handleSubmit = async () => {
    try {
      await createAccommodation({
        ...formData,
        house_rules: [...formData.house_rules, ...customRules],
      });

      addToast({
        message: "Unterkunft erfolgreich erstellt!",
        variant: "success",
      });

      router.push("/uebernachtungen");
    } catch (error) {
      addToast({
        message: "Fehler beim Erstellen der Unterkunft",
        variant: "error",
      });
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const toggleHouseRule = (ruleId: string) => {
    setFormData(prev => ({
      ...prev,
      house_rules: prev.house_rules.includes(ruleId)
        ? prev.house_rules.filter(r => r !== ruleId)
        : [...prev.house_rules, ruleId],
    }));
  };

  const addCustomRule = () => {
    if (customRule.trim() && !customRules.includes(customRule.trim())) {
      setCustomRules([...customRules, customRule.trim()]);
      setCustomRule("");
    }
  };

  const removeCustomRule = (rule: string) => {
    setCustomRules(customRules.filter(r => r !== rule));
  };

  const isValid =
    formData.title.trim() &&
    formData.description.trim() &&
    formData.type &&
    formData.location_city;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
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
            <h1 className="text-2xl font-bold">Unterkunft anbieten</h1>
            <p className="text-sm text-muted-foreground">
              Teile dein Zuhause mit der Community
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Grundinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  placeholder="z.B. Gemütliches Zimmer in Berlin"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung *</Label>
                <Textarea
                  id="description"
                  placeholder="Beschreibe dein Zuhause, was Gästen erwartet, und was du suchst..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="type">Art der Unterkunft *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="komplette_unterkunft">Komplette Unterkunft</SelectItem>
                      <SelectItem value="zimmer">Zimmer</SelectItem>
                      <SelectItem value="bett">Bett</SelectItem>
                      <SelectItem value="couch">Couch</SelectItem>
                      <SelectItem value="zelt">Zeltplatz</SelectItem>
                      <SelectItem value="camperplatz">Camperplatz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="offer_type">Angebotstyp *</Label>
                  <Select
                    value={formData.offer_type}
                    onValueChange={(value: any) => setFormData({ ...formData, offer_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kostenlos">Kostenlos</SelectItem>
                      <SelectItem value="gegen_hand">Gegen Arbeit/Hilfe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">Stadt *</Label>
                  <Input
                    id="city"
                    placeholder="z.B. Berlin"
                    value={formData.location_city}
                    onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="country">Land *</Label>
                  <Input
                    id="country"
                    placeholder="z.B. Deutschland"
                    value={formData.location_country}
                    onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guests">Maximale Gästeanzahl *</Label>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  max={20}
                  value={formData.max_guests}
                  onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) || 1 })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Ausstattung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {amenitiesList.map((amenity) => (
                  <label
                    key={amenity}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-colors ${
                      formData.amenities.includes(amenity)
                        ? "border-primary bg-primary/10"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    <Checkbox
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* House Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Hausregeln</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {houseRulesList.map((rule) => (
                  <label
                    key={rule.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${
                      formData.house_rules.includes(rule.id)
                        ? "border-primary bg-primary/10"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    <Checkbox
                      checked={formData.house_rules.includes(rule.id)}
                      onChange={() => toggleHouseRule(rule.id)}
                    />
                    <span className="text-sm">{rule.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <Label>Eigene Regeln hinzufügen</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="z.B. Keine Lärmbelästigung nach 22 Uhr"
                    value={customRule}
                    onChange={(e) => setCustomRule(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomRule();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addCustomRule}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {customRules.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {customRules.map((rule) => (
                      <span
                        key={rule}
                        className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                      >
                        {rule}
                        <button
                          onClick={() => removeCustomRule(rule)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Check-in/Check-out */}
          <Card>
            <CardHeader>
              <CardTitle>An- & Abreise</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="checkin">Check-in</Label>
                <Select
                  value={formData.check_in}
                  onValueChange={(value) => setFormData({ ...formData, check_in: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flexibel">Flexibel</SelectItem>
                    <SelectItem value="ab_14">Ab 14 Uhr</SelectItem>
                    <SelectItem value="ab_15">Ab 15 Uhr</SelectItem>
                    <SelectItem value="ab_16">Ab 16 Uhr</SelectItem>
                    <SelectItem value="nach_vereinbarung">Nach Vereinbarung</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="checkout">Check-out</Label>
                <Select
                  value={formData.check_out}
                  onValueChange={(value) => setFormData({ ...formData, check_out: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bis_10">Bis 10 Uhr</SelectItem>
                    <SelectItem value="bis_11">Bis 11 Uhr</SelectItem>
                    <SelectItem value="bis_12">Bis 12 Uhr</SelectItem>
                    <SelectItem value="flexibel">Flexibel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Erstellen...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Veröffentlichen
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
