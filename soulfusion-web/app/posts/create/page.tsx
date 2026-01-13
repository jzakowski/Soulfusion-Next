"use client"

import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePostsStore } from "@/lib/stores/posts-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useRouter } from "next/navigation";
import {
  X,
  Image as ImageIcon,
  Video,
  Mic,
  Plus,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import type { PostFormData, PostAudience, PostType } from "@/types/features/post";

// Bubbles data - would come from API
const mockBubbles = [
  { id: "1", name: "Reisen", color: "#3b82f6" },
  { id: "2", name: "Musik", color: "#8b5cf6" },
  { id: "3", name: "Sport", color: "#10b981" },
  { id: "4", name: "Essen", color: "#f59e0b" },
  { id: "5", name: "Kunst", color: "#ec4899" },
  { id: "6", name: "Natur", color: "#06b6d4" },
  { id: "7", name: "Technologie", color: "#6366f1" },
  { id: "8", name: "Spiritualität", color: "#a855f7" },
];

type Step = "content" | "media" | "details" | "review";

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createPost, uploading } = usePostsStore();
  const { addToast } = useUIStore();

  const [currentStep, setCurrentStep] = useState<Step>("content");
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    text: "",
    type: "text",
    audience: "public",
    bubble_id: undefined,
    tags: [],
    location: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const steps: Step[] = ["content", "media", "details", "review"];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith("image/"));

    if (validFiles.length !== files.length) {
      addToast({
        message: "Nur Bilddateien sind erlaubt",
        variant: "error",
      });
    }

    if (images.length + validFiles.length > 10) {
      addToast({
        message: "Maximal 10 Bilder erlaubt",
        variant: "error",
      });
      return;
    }

    setImages(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        addToast({
          message: "Nur Videodateien sind erlaubt",
          variant: "error",
        });
        return;
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        addToast({
          message: "Video darf maximal 100MB groß sein",
          variant: "error",
        });
        return;
      }
      setVideoFile(file);
      setFormData(prev => ({ ...prev, type: "video" }));
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        addToast({
          message: "Nur Audiodateien sind erlaubt",
          variant: "error",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        addToast({
          message: "Audio darf maximal 10MB groß sein",
          variant: "error",
        });
        return;
      }
      setAudioFile(file);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (
      trimmedTag &&
      !formData.tags?.includes(trimmedTag) &&
      (formData.tags?.length || 0) < 10
    ) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), trimmedTag],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag),
    }));
  };

  const handleSubmit = async () => {
    try {
      const mediaFiles = {
        images,
        video: videoFile,
        audio: audioFile,
      };

      await createPost(formData, mediaFiles);

      addToast({
        message: "Beitrag erfolgreich erstellt!",
        variant: "success",
      });

      router.push("/");
    } catch (error) {
      addToast({
        message: "Fehler beim Erstellen des Beitrags",
        variant: "error",
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "content":
        return formData.text?.trim().length > 0 || formData.title?.trim().length > 0;
      case "media":
        return true; // Media is optional
      case "details":
        return true; // All details are optional
      case "review":
        return true;
      default:
        return false;
    }
  };

  const selectedBubble = mockBubbles.find(b => b.id === formData.bubble_id);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Neuer Beitrag</h1>
              <p className="text-sm text-muted-foreground">
                Schritt {currentStepIndex + 1} von {steps.length}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Abbrechen
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={((currentStepIndex + 1) / steps.length) * 100} />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span className={currentStepIndex >= 0 ? "text-primary font-medium" : ""}>Inhalt</span>
            <span className={currentStepIndex >= 1 ? "text-primary font-medium" : ""}>Medien</span>
            <span className={currentStepIndex >= 2 ? "text-primary font-medium" : ""}>Details</span>
            <span className={currentStepIndex >= 3 ? "text-primary font-medium" : ""}>Überprüfung</span>
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {currentStep === "content" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel (optional)</Label>
                  <Input
                    id="title"
                    placeholder="Gib deinem Beitrag einen Titel"
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    maxLength={200}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(formData.title?.length || 0)} / 200
                  </p>
                </div>

                <div>
                  <Label htmlFor="text">Was möchtest du teilen? *</Label>
                  <Textarea
                    id="text"
                    placeholder="Erzähle deine Geschichte..."
                    value={formData.text || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    rows={8}
                    maxLength={5000}
                    className="resize-none"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(formData.text?.length || 0)} / 5000
                  </p>
                </div>

                <div>
                  <Label htmlFor="location">Standort (optional)</Label>
                  <Input
                    id="location"
                    placeholder="z.B. Berlin, Deutschland"
                    value={formData.location || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {currentStep === "media" && (
              <div className="space-y-6">
                {/* Images */}
                <div>
                  <Label className="mb-2 block">Bilder</Label>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={preview}
                          alt={`Vorschau ${index + 1}`}
                          className="h-full w-full rounded-md object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute right-1 top-1 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {images.length < 10 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                          <p className="mt-1 text-xs text-muted-foreground">
                            {images.length > 0 ? "Mehr" : "Bild"} hinzufügen
                          </p>
                        </div>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>

                {/* Video */}
                <div>
                  <Label className="mb-2 block">Video</Label>
                  {videoFile ? (
                    <div className="relative rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="h-5 w-5 text-primary" />
                          <span className="text-sm">{videoFile.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setVideoFile(null);
                            setFormData(prev => ({ ...prev, type: "text" }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 p-8 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      <Video className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Video hinzufügen (max. 100MB)
                      </span>
                    </button>
                  )}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoSelect}
                  />
                </div>

                {/* Audio */}
                <div>
                  <Label className="mb-2 block">Audio Nachricht</Label>
                  {audioFile ? (
                    <div className="relative rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mic className="h-5 w-5 text-primary" />
                          <span className="text-sm">{audioFile.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAudioFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 p-8 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      <Mic className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Audio hinzufügen (max. 10MB)
                      </span>
                    </button>
                  )}
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleAudioSelect}
                  />
                </div>
              </div>
            )}

            {currentStep === "details" && (
              <div className="space-y-6">
                {/* Audience */}
                <div>
                  <Label htmlFor="audience">Sichtbarkeit</Label>
                  <Select
                    value={formData.audience}
                    onValueChange={(value: PostAudience) =>
                      setFormData({ ...formData, audience: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">🌍 Öffentlich</SelectItem>
                      <SelectItem value="friends">👥 Freunde</SelectItem>
                      <SelectItem value="members">👤 Mitglieder</SelectItem>
                      <SelectItem value="private">🔒 Privat</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Wer kann deinen Beitrag sehen?
                  </p>
                </div>

                {/* Bubble */}
                <div>
                  <Label htmlFor="bubble">Bubble (optional)</Label>
                  <Select
                    value={formData.bubble_id || "none"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        bubble_id: value === "none" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Keine Bubble ausgewählt" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine Bubble</SelectItem>
                      {mockBubbles.map((bubble) => (
                        <SelectItem key={bubble.id} value={bubble.id}>
                          <span
                            className="mr-2 inline-block h-3 w-3 rounded-full"
                            style={{ backgroundColor: bubble.color }}
                          />
                          {bubble.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ordne deinen Beitrag einer Community zu
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags">Tags (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Tag hinzufügen"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || (formData.tags?.length || 0) >= 10}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.tags && formData.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(formData.tags?.length || 0)} / 10 Tags
                  </p>
                </div>
              </div>
            )}

            {currentStep === "review" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <h3 className="font-semibold">Überprüfe deinen Beitrag</h3>
                </div>

                {/* Content Preview */}
                {(formData.title || formData.text) && (
                  <div className="rounded-md border p-4">
                    {formData.title && (
                      <h4 className="mb-2 text-lg font-semibold">
                        {formData.title}
                      </h4>
                    )}
                    {formData.text && (
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {formData.text}
                      </p>
                    )}
                    {formData.location && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        📍 {formData.location}
                      </p>
                    )}
                  </div>
                )}

                {/* Media Preview */}
                {(imagePreviews.length > 0 || videoFile || audioFile) && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Medien</h4>
                    <div className="flex flex-wrap gap-2">
                      {imagePreviews.length > 0 && (
                        <Badge variant="secondary">
                          <ImageIcon className="mr-1 h-3 w-3" />
                          {imagePreviews.length} Bild(er)
                        </Badge>
                      )}
                      {videoFile && (
                        <Badge variant="secondary">
                          <Video className="mr-1 h-3 w-3" />
                          Video
                        </Badge>
                      )}
                      {audioFile && (
                        <Badge variant="secondary">
                          <Mic className="mr-1 h-3 w-3" />
                          Audio
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Details Preview */}
                <div>
                  <h4 className="mb-2 text-sm font-medium">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sichtbarkeit:</span>
                      <span className="font-medium">
                        {formData.audience === "public" && "🌍 Öffentlich"}
                        {formData.audience === "friends" && "👥 Freunde"}
                        {formData.audience === "members" && "👤 Mitglieder"}
                        {formData.audience === "private" && "🔒 Privat"}
                      </span>
                    </div>
                    {selectedBubble && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Bubble:</span>
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: `${selectedBubble.color}20`,
                            color: selectedBubble.color,
                          }}
                        >
                          {selectedBubble.name}
                        </Badge>
                      </div>
                    )}
                    {formData.tags && formData.tags.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Tags: </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {formData.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 rounded-md border p-3">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {user?.display_name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{user?.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Veröffentlicht als {user?.username}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentStep(steps[currentStepIndex - 1])
                }
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>

              {currentStepIndex < steps.length - 1 ? (
                <Button
                  onClick={() =>
                    setCurrentStep(steps[currentStepIndex + 1])
                  }
                  disabled={!canProceed()}
                >
                  Weiter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={uploading || !canProceed()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Veröffentlichen...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Veröffentlichen
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
