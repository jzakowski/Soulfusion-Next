"use client"

import { X, Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface GuestGuidelinesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const guidelines = [
  {
    title: "Nur bei echtem Interesse anfragen",
    description: "Stelle eine Anfrage nur dann, wenn du wirklich vorhast, zu kommen – so bleibt es fair und übersichtlich für alle.",
  },
  {
    title: "Absagen rechtzeitig mitteilen",
    description: "Wenn sich deine Pläne ändern, sag bitte so früh wie möglich Bescheid. Dein Gastgeber verlässt sich auf dich.",
  },
  {
    title: "Ehrlich mit Schäden umgehen",
    description: "Sollte etwas kaputtgehen, sprich sofort offen mit deinem Gastgeber darüber. Ehrlichkeit schafft Vertrauen.",
  },
  {
    title: "Privatsphäre respektieren",
    description: "Jeder Mensch hat eigene Gewohnheiten und Rückzugsräume. Bitte respektiere die Privatsphäre und den Lebensstil deines Gastgebers.",
  },
  {
    title: "Ein Ausgleich ist willkommen",
    description: "Es besteht kein Zwang, aber eine kleine Spende oder ein anderer Ausgleich ist ein schöner Ausdruck von Wertschätzung.",
  },
  {
    title: "Verbindlich und pünktlich sein",
    description: "Halte dich an Absprachen und sei zuverlässig. Das schafft ein gutes Miteinander.",
  },
  {
    title: "Sauberkeit und Ordnung",
    description: "Hinterlasse die Unterkunft so, dass sich dein Gastgeber und mögliche nächste Gäste wohlfühlen.",
  },
  {
    title: "Offene Kommunikation",
    description: "Teile Besonderheiten (z. B. Allergien, Ernährungsweisen oder spezielle Bedürfnisse) im Vorfeld mit. Nur so kann dein Gastgeber gut auf dich eingehen.",
  },
  {
    title: "Rücksicht nehmen",
    description: "Achte auf Ruhezeiten, Nachbarn und gemeinsame Räume – kleine Gesten der Rücksicht machen viel aus.",
  },
  {
    title: "Community-Gedanke leben",
    description: "Sei offen, freundlich und neugierig. SoulFusion lebt von Begegnungen und Gemeinschaft – du bist Teil davon!",
  },
];

export function GuestGuidelinesDialog({ open, onOpenChange }: GuestGuidelinesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 border-0 bg-transparent">
        {/* Visually hidden title for screen readers */}
        <DialogTitle className="sr-only">Gäste-Bedingungen</DialogTitle>

        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 rounded-t-xl">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-full bg-black/20 p-2 hover:bg-black/30 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center">
              <Lightbulb className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Gäste-Bedingungen</h3>
              <p className="text-white/90 text-sm">Damit unser Miteinander gut funktioniert</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="p-6 max-h-[calc(90vh-140px)] bg-background rounded-b-xl">
          {/* Introduction */}
          <div className="mb-6 p-5 bg-muted rounded-lg border">
            <p className="text-muted-foreground leading-relaxed">
              Damit unser Miteinander gut funktioniert, bitten wir dich als Gast, diese Punkte zu beachten:
            </p>
          </div>

          {/* Guidelines List */}
          <div className="space-y-4">
            {guidelines.map((guideline, index) => (
              <div
                key={index}
                className="p-5 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <Badge className="mt-1 h-8 w-8 rounded-full flex items-center justify-center bg-primary/20 text-primary border-primary/50 shrink-0">
                    {index + 1}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary mb-2">{guideline.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {guideline.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-6 p-5 bg-primary/10 rounded-lg border border-primary/30">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm font-medium text-primary">
                SoulFusion lebt von Begegnungen und Gemeinschaft – du bist Teil davon!
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
