import { User, Briefcase, UserCircle, FileText, Home, Users, Bell, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";

interface FooterItem {
  icon: React.ReactNode;
  title: string;
  description?: string;
  href?: string;
  onClick?: () => void;
}

interface FooterColumnProps {
  title: string;
  icon: React.ReactNode;
  items: FooterItem[];
}

function FooterColumn({ title, icon, items }: FooterColumnProps) {
  return (
    <div className="flex flex-col">
      {/* Titel mit Icon */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-primary">{icon}</div>
        <h3 className="text-xl font-bold text-primary">{title}</h3>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <FooterItem key={idx} {...item} />
        ))}
      </div>
    </div>
  );
}

function FooterItem({ icon, title, description, href, onClick }: FooterItem) {
  const content = (
    <>
      <div className="flex items-start gap-3 flex-1">
        <div className="text-primary/80 mt-0.5">
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-medium text-base">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-primary/50 flex-shrink-0" />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group w-full text-left"
    >
      {content}
    </button>
  );
}

interface AccommodationsFooterProps {
  isMobile?: boolean;
  onGuestGuidelinesClick?: () => void;
}

export function AccommodationsFooter({ isMobile = false, onGuestGuidelinesClick }: AccommodationsFooterProps) {
  // Items für Gäste
  const guestItems: FooterItem[] = [
    {
      icon: <UserCircle className="h-5 w-5" />,
      title: "Mein Profil verwalten",
      description: isMobile ? undefined : "Persönliche Daten und Einstellungen",
      href: "/profile",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Richtlinien für Gäste",
      description: isMobile ? undefined : "Wichtige Hinweise und Regeln",
      onClick: onGuestGuidelinesClick,
    },
  ];

  // Auf Desktop additional Item
  if (!isMobile) {
    guestItems.push({
      icon: <Home className="h-5 w-5" />,
      title: "Meine besuchten Unterkünfte",
      description: "Historie und Favoriten verwalten",
      onClick: () => {
        // TODO: Besuchte Unterkünfte anzeigen
        alert("Meine besuchten Unterkünfte - wird implementiert");
      },
    });
  }

  // Items für Gastgeber
  const hostItems: FooterItem[] = [
    {
      icon: <Briefcase className="h-5 w-5" />,
      title: "Unterkunft anbieten",
      description: isMobile ? undefined : "Neue Unterkunft hinzufügen",
      href: "/uebernachtungen/erstellen",
    },
    {
      icon: <UserCircle className="h-5 w-5" />,
      title: "Mein Profil verwalten",
      description: isMobile ? undefined : "Gastgeber-Details pflegen",
      onClick: () => {
        // TODO: Host-Profil bearbeiten
        alert("Mein Gastgeber-Profil - wird implementiert");
      },
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Meine Besucher",
      description: isMobile ? undefined : "Gäste und Bewertungen",
      onClick: () => {
        // TODO: Besucher anzeigen
        alert("Meine Besucher - wird implementiert");
      },
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: "Aktuelle Anfragen",
      description: isMobile ? undefined : "Buchungsanfragen bearbeiten",
      onClick: () => {
        // TODO: Anfragen anzeigen
        alert("Aktuelle Anfragen - wird implementiert");
      },
    },
  ];

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Zwei Spalten */}
        {isMobile ? (
          // Mobile: Stapel-Layout
          <div className="flex flex-col gap-8">
            <FooterColumn
              title="Für Gäste"
              icon={<User className="h-6 w-6" />}
              items={guestItems}
            />
            <FooterColumn
              title="Für Gastgeber"
              icon={<Briefcase className="h-6 w-6" />}
              items={hostItems}
            />
          </div>
        ) : (
          // Desktop: 2-spaltiges Layout
          <div className="grid grid-cols-2 gap-12 max-w-5xl mx-auto">
            <FooterColumn
              title="Für Gäste"
              icon={<User className="h-6 w-6" />}
              items={guestItems}
            />
            <FooterColumn
              title="Für Gastgeber"
              icon={<Briefcase className="h-6 w-6" />}
              items={hostItems}
            />
          </div>
        )}

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 SoulFusion. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
