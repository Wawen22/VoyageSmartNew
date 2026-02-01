import { Link } from "react-router-dom";
import { Plane, Twitter, Instagram, Github, Linkedin, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background text-foreground py-16 border-t border-[#735324]/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          
          {/* Brand & Slogan */}
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
             <Link to="/" className="flex items-center gap-4 group">
              <img 
                src="/logo-voyage_smart.png" 
                alt="VoyageSmart" 
                className="w-24 h-24 object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-4xl font-sans font-bold italic tracking-tight text-[#735324] text-3d-modern">VoyageSmart</span>
            </Link>
            <p className="text-[#735324]/80 text-sm max-w-sm leading-relaxed font-medium">
              Il tuo compagno di viaggio intelligente. 
              Organizza itinerari, dividi le spese e collabora in tempo reale.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <SocialLink href="#" icon={Twitter} />
            <SocialLink href="#" icon={Instagram} />
            <SocialLink href="#" icon={Github} />
            <SocialLink href="#" icon={Linkedin} />
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-[#735324]/10 w-full" />

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#735324]/60">
          <p>© {currentYear} VoyageSmart. Fatto con <Heart className="w-3 h-3 inline text-[#735324] mx-1" /> per i viaggiatori.</p>
          
          <nav className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-[#735324] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#735324] transition-colors">Termini di Servizio</Link>
            <Link to="/cookies" className="hover:text-[#735324] transition-colors">Cookie Policy</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="p-3 rounded-xl bg-[#735324]/5 text-[#735324] hover:bg-[#735324]/10 hover:scale-110 transition-all duration-300"
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}
