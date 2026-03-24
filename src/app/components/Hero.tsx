import { ArrowDown } from "lucide-react";

export function Hero() {
  const scrollToPortfolio = () => {
    const element = document.getElementById("portfolio");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center pt-20 px-6"
    >
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block px-6 py-2 bg-secondary rounded-full mb-6">
          <span className="text-sm text-secondary-foreground">
            Bem-vindo ao meu portfólio
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
          Criando Arte &
          <br />
          <span className="text-primary">Experiências Únicas</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Artista digital e designer apaixonado por transformar ideias em
          trabalhos visuais incríveis. Explore minha coleção de projetos e criações.
        </p>
        
        <button
          onClick={scrollToPortfolio}
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
        >
          Ver Meus Trabalhos
          <ArrowDown size={20} />
        </button>

        {/* Decorative elements */}
        <div className="mt-20 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="h-32 bg-secondary rounded-2xl"></div>
          <div className="h-32 bg-accent rounded-2xl"></div>
          <div className="h-32 bg-[#F0E6FF] rounded-2xl"></div>
        </div>
      </div>
    </section>
  );
}
