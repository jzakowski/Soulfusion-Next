// Bubble Create Post Modal - Instagram-style post creator
"use client"

import { useState, useRef } from "react";
import { X, ImageIcon, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useBubbleStore } from "@/lib/stores/bubble-store";
import { apiClient } from "@/lib/api/client";

interface BubbleCreatePostProps {
  bubbleId: string;
  onClose: () => void;
  onPostCreated: () => void;
  allowBubbleSelection?: boolean; // Allow user to change bubble
}

export function BubbleCreatePost({ bubbleId, onClose, onPostCreated, allowBubbleSelection = false }: BubbleCreatePostProps) {
  const { creatingPost, createPost, bubbles } = useBubbleStore();

  const [selectedBubbleId, setSelectedBubbleId] = useState(bubbleId);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedImages.length + files.length > 10) {
      alert("Maximal 10 Bilder möglich");
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      alert("Bitte gib einen Text ein oder füge ein Bild hinzu");
      return;
    }

    // Upload images first
    const imageUrls: string[] = [];
    for (const image of selectedImages) {
      try {
        const presigned = await apiClient.getPresignedUpload({
          file_name: `bubble-${Date.now()}-${image.name}`,
          file_type: image.type,
          file_size: image.size,
        });

        await fetch(presigned.upload_url, {
          method: 'PUT',
          body: image,
          headers: { 'Content-Type': image.type },
        });

        imageUrls.push(presigned.file_url);
        setUploadProgress((imageUrls.length / selectedImages.length) * 100);
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }

    // Create post
    const result = await createPost(selectedBubbleId, content, imageUrls, isAnonymous);

    if (result) {
      onPostCreated();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Neuer Beitrag</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Bubble Selector (if allowed) */}
          {allowBubbleSelection && (
            <div>
              <Label htmlFor="bubble">Bubble</Label>
              <select
                id="bubble"
                value={selectedBubbleId}
                onChange={(e) => setSelectedBubbleId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              >
                {bubbles.filter(b => b.is_visible !== false && b.is_hidden !== true).map((bubble) => (
                  <option key={bubble.id} value={bubble.id}>
                    {bubble.icon} {bubble.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="anonymous">Anonym posten</Label>
              <p className="text-xs text-gray-500">Dein Name wird nicht angezeigt</p>
            </div>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>

          {/* Text Content */}
          <Textarea
            placeholder="Was möchtest du teilen?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none"
            maxLength={5000}
          />

          {/* Character count */}
          <div className="text-right text-xs text-gray-500">
            {content.length}/5000
          </div>

          {/* Image Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Bilder hinzufügen
            </Button>
          </div>

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={creatingPost || (!content.trim() && selectedImages.length === 0)}
            className="w-full"
          >
            {creatingPost ? 'Wird gepostet...' : 'Posten'}
          </Button>
        </div>
      </div>
    </div>
  );
}
