import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>© 2026 Meu Portfólio. Feito com</span>
            <Heart size={16} className="text-primary fill-primary" />
          </div>
          
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/dennyszsz/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/in/denisl%C3%A3nia-ferreira-479b25234/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
