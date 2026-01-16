// Bubble Preferences Modal - Manage bubble visibility and preferences
"use client"

import { useState, useEffect } from "react";
import { X, Pin, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useBubbleStore } from "@/lib/stores/bubble-store";
import type { BubblePreference } from "@/lib/services/bubble-service";

interface BubblePreferencesModalProps {
  onClose: () => void;
}

export function BubblePreferencesModal({ onClose }: BubblePreferencesModalProps) {
  const { bubblePreferences, fetchBubblePreferences, updateBubblePreference } = useBubbleStore();

  const [localPreferences, setLocalPreferences] = useState<BubblePreference[]>([]);

  useEffect(() => {
    fetchBubblePreferences();
  }, []);

  useEffect(() => {
    setLocalPreferences(bubblePreferences);
  }, [bubblePreferences]);

  const handleToggle = async (pref: BubblePreference, field: 'is_visible' | 'is_hidden' | 'is_pinned') => {
    const updated = { ...pref, [field]: !pref[field] };

    // Update local state immediately for UI responsiveness
    setLocalPreferences(prev =>
      prev.map(p => p.id === pref.id ? updated : p)
    );

    // Sync with server
    await updateBubblePreference(pref.id, { [field]: !pref[field] });
  };

  const pinned = localPreferences.filter(p => p.is_pinned);
  const others = localPreferences.filter(p => !p.is_pinned);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Meine Bubbles</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Pinned Section */}
          {pinned.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                <Pin className="h-4 w-4" />
                GEPINNT
              </div>
              <div className="space-y-2">
                {pinned.map((pref) => (
                  <BubblePreferenceRow
                    key={pref.id}
                    pref={pref}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Bubbles Section */}
          <div>
            <div className="mb-3 text-sm font-medium text-gray-700">
              ALLE BUBBLES
            </div>
            {others.length === 0 && pinned.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Noch keine Bubbles. Tritt einigen bei!
              </p>
            ) : (
              <div className="space-y-2">
                {others.map((pref) => (
                  <BubblePreferenceRow
                    key={pref.id}
                    pref={pref}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
            <p className="font-medium mb-1">💡 Wie funktioniert das?</p>
            <p>Je mehr du mit einer Bubble interagierst (posten, liken, kommentieren), desto mehr wirst du davon im Feed sehen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BubblePreferenceRowProps {
  pref: BubblePreference;
  onToggle: (pref: BubblePreference, field: 'is_visible' | 'is_hidden' | 'is_pinned') => void;
}

function BubblePreferenceRow({ pref, onToggle }: BubblePreferenceRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{pref.icon}</span>
        <div>
          <p className="font-medium text-sm">{pref.name}</p>
          {pref.engagement_score > 0 && (
            <p className="text-xs text-gray-500">
              Engagement: {Math.round(pref.engagement_score)}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Pin Toggle */}
        <button
          onClick={() => onToggle(pref, 'is_pinned')}
          className={`p-2 rounded transition-colors ${
            pref.is_pinned ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          title="Anpinnen"
        >
          <Pin className="h-4 w-4" />
        </button>

        {/* Visible Toggle */}
        <button
          onClick={() => onToggle(pref, 'is_visible')}
          className={`p-2 rounded transition-colors ${
            pref.is_visible ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          title={pref.is_visible ? 'Sichtbar' : 'Ausgeblendet'}
        >
          {pref.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
