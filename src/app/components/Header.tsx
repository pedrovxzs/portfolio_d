import { Menu, X, Lock } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => scrollToSection("hero")}
            className="text-2xl font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            Meu Portfólio
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("portfolio")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Trabalhos
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Sobre Mim
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
            >
              Contato
            </button>
            <Link
              to="/admin/login"
              className="text-foreground/50 hover:text-foreground transition-colors p-2"
              title="Painel Admin"
            >
              <Lock size={18} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-foreground"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            <button
              onClick={() => scrollToSection("portfolio")}
              className="text-foreground hover:text-primary transition-colors text-left"
            >
              Trabalhos
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-foreground hover:text-primary transition-colors text-left"
            >
              Sobre Mim
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity w-fit"
            >
              Contato
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
