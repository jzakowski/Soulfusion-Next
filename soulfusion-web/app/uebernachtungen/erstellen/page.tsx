"use client"

import React, { useState, useRef } from "react";
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
import { ArrowLeft, Plus, X, Loader2, Check, Image as ImageIcon, Upload, ChevronRight } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

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

interface UploadedImage {
  file: File;
  url: string;
  uploading: boolean;
}

const steps = [
  { id: 1, title: "Grundinformationen & Fotos", description: "Erzähl uns von deiner Unterkunft" },
  { id: 2, title: "Ausstattung & Regeln", description: "Was bieten deine Gäste an?" },
  { id: 3, title: "An- & Abreise", description: "Letzte Details vor der Veröffentlichung" },
];

export default function CreateAccommodationPage() {
  const router = useRouter();
  const { createAccommodation, loading } = useAccommodationsStore();
  const { addToast } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    offer_type: "kostenlos",
    location_city: "",
    location_country: "Deutschland",
    location_postal: "",
    max_guests: 1,
    check_in: "flexibel",
    check_out: "bis_12",
    amenities: [] as string[],
    house_rules: [] as string[],
    private_bathroom: false,
    washing_machine_allowed: false,
    home_office_allowed: false,
  });

  const [customRule, setCustomRule] = useState("");
  const [customRules, setCustomRules] = useState<string[]>([]);

  const [mainImage, setMainImage] = useState<UploadedImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    // For development: return local blob URL
    // TODO: Implement proper S3 upload for production
    return URL.createObjectURL(file);

    /* Production upload when container is rebuilt:
    try {
      const response = await apiClient.getAccommodationUploadUrl(file.name, file.type);
      await fetch(response.upload_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      return response.file_url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
    */
  };

  const handleMainImageUpload = async (file: File) => {
    const newImage: UploadedImage = {
      file,
      url: URL.createObjectURL(file),
      uploading: true,
    };
    setMainImage(newImage);

    try {
      const uploadedUrl = await uploadImage(file);
      setMainImage({ file, url: uploadedUrl, uploading: false });
    } catch (error) {
      addToast({ message: "Fehler beim Hochladen des Bildes", variant: "error" });
      setMainImage(null);
    }
  };

  const handleGalleryImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: UploadedImage[] = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file),
      uploading: true,
    }));

    setGalleryImages(prev => [...prev, ...newImages]);
    setUploadingImage(true);

    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      setGalleryImages(prev =>
        prev.map((img, idx) => {
          const uploadedIndex = idx - (prev.length - files.length);
          if (uploadedIndex >= 0 && uploadedIndex < files.length) {
            return { file: files[uploadedIndex], url: uploadedUrls[uploadedIndex], uploading: false };
          }
          return img;
        })
      );
    } catch (error) {
      addToast({ message: "Fehler beim Hochladen einiger Bilder", variant: "error" });
      setGalleryImages(prev => prev.filter(img => !img.uploading));
    } finally {
      setUploadingImage(false);
    }
  };

  const removeMainImage = () => {
    setMainImage(null);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      let mainImageUrl = mainImage?.url && !mainImage.uploading ? mainImage.url : undefined;
      let galleryUrls = galleryImages
        .filter(img => !img.uploading)
        .map(img => img.url);

      await createAccommodation({
        title: formData.title,
        description: formData.description,
        type: formData.type as any,
        offer_type: formData.offer_type as any,
        location_city: formData.location_city,
        location_country: formData.location_country,
        location_postal: formData.location_postal,
        capacity: formData.max_guests,
        amenities: formData.amenities.map(name => ({ name, category: 'other' as const, available: true })),
        house_rules: [...formData.house_rules, ...customRules],
        main_image_url: mainImageUrl,
        gallery_urls: galleryUrls,
        private_bathroom: formData.private_bathroom,
        washing_machine_allowed: formData.washing_machine_allowed,
        home_office_allowed: formData.home_office_allowed,
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

  const isStep1Valid = formData.title.trim() && formData.description.trim() && formData.type && formData.location_city;
  const isStep2Valid = true; // Amenities and rules are optional
  const isStep3Valid = true; // Check-in/out and guests have defaults

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

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

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors shrink-0",
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="mt-2 text-center max-w-[120px]">
                    <p className={cn(
                      "text-xs font-medium leading-tight",
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 min-w-[60px] transition-colors shrink-0",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Basics & Images */}
          {currentStep === 1 && (
            <>
              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Fotos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Main Image */}
                  <div>
                    <Label>Hauptbild *</Label>
                    <div className="mt-2">
                      {mainImage ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary">
                          <img
                            src={mainImage.url}
                            alt="Hauptbild"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={removeMainImage}
                            className="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {mainImage.uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Loader2 className="h-8 w-8 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50 transition-colors">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMainImageUpload(file);
                            }}
                          />
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          <p className="mt-2 text-sm font-medium text-muted-foreground">
                            Hauptbild auswählen
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG bis 10MB
                          </p>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <Label>Weitere Fotos (optional)</Label>
                    <div className="mt-2">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 hover:border-primary/50 hover:bg-accent/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleGalleryImageUpload(e.target.files)}
                          disabled={uploadingImage}
                        />
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Weitere Bilder hinzufügen
                        </span>
                      </label>

                      {galleryImages.length > 0 && (
                        <div className="mt-3 grid grid-cols-4 gap-2">
                          {galleryImages.map((image, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                              <img
                                src={image.url}
                                alt={`Galerie ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => removeGalleryImage(index)}
                                className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              {image.uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                      <Label htmlFor="postal">Postleitzahl</Label>
                      <Input
                        id="postal"
                        placeholder="z.B. 10115"
                        value={formData.location_postal}
                        onChange={(e) => setFormData({ ...formData, location_postal: e.target.value })}
                      />
                    </div>
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
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 2: Amenities & Rules */}
          {currentStep === 2 && (
            <>
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

              {/* Additional Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Weitere Optionen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.private_bathroom}
                        onCheckedChange={(checked) => setFormData({ ...formData, private_bathroom: !!checked })}
                      />
                      <div>
                        <p className="font-medium">Eigenes Badezimmer</p>
                        <p className="text-sm text-muted-foreground">Gäste haben ein eigenes Badezimmer</p>
                      </div>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.washing_machine_allowed}
                        onCheckedChange={(checked) => setFormData({ ...formData, washing_machine_allowed: !!checked })}
                      />
                      <div>
                        <p className="font-medium">Waschmaschine nutzbar</p>
                        <p className="text-sm text-muted-foreground">Gäste dürfen die Waschmaschine benutzen</p>
                      </div>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.home_office_allowed}
                        onCheckedChange={(checked) => setFormData({ ...formData, home_office_allowed: !!checked })}
                      />
                      <div>
                        <p className="font-medium">Als Homeoffice nutzbar</p>
                        <p className="text-sm text-muted-foreground">Geeignet zum Arbeiten (WLAN, Schreibtisch)</p>
                      </div>
                    </div>
                  </label>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 3: Check-in/Check-out & Submit */}
          {currentStep === 3 && (
            <>
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

              {/* Guests */}
              <Card>
                <CardHeader>
                  <CardTitle>Gäste</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="guests">Maximale Gästeanzahl *</Label>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={20}
                    value={formData.max_guests}
                    onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) || 1 })}
                  />
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Zusammenfassung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="font-medium">Titel:</span> {formData.title || '-'}</p>
                  <p><span className="font-medium">Art:</span> {formData.type || '-'}</p>
                  <p><span className="font-medium">Ort:</span> {formData.location_city || '-'}</p>
                  <p><span className="font-medium">Gäste:</span> {formData.max_guests}</p>
                  <p><span className="font-medium">Ausstattung:</span> {formData.amenities.length} ausgewählt</p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? () => router.back() : prevStep}
              disabled={loading}
            >
              {currentStep === 1 ? 'Abbrechen' : 'Zurück'}
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={nextStep}
                disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)}
              >
                Weiter
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStep1Valid || loading}
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
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
