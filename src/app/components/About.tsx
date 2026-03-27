import { useEffect, useMemo, useState } from "react";
import { Palette, Sparkles, Heart } from "lucide-react";

export function About() {
  const [aboutContent, setAboutContent] = useState("");

  useEffect(() => {
    const loadAboutContent = async () => {
      try {
        const response = await fetch("/api/about", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { content?: string };
        setAboutContent(data.content?.trim() ?? "");
      } catch (error) {
        console.error("Erro ao carregar Sobre Mim:", error);
      }
    };

    void loadAboutContent();
  }, []);

  const paragraphs = useMemo(() => {
    const fallback = [
      "Olá! Sou um artista apaixonado por criar experiências visuais que inspiram e emocionam. Com anos de experiência em design e arte digital, transformo ideias em realidade através de cores, formas e criatividade.",
      "Meu trabalho é uma mistura de técnicas tradicionais e modernas, sempre buscando inovar e explorar novas possibilidades artísticas. Cada projeto é uma oportunidade de contar uma história única.",
      "Acredito que a arte tem o poder de transformar espaços e pessoas, e é essa crença que me motiva a criar todos os dias.",
    ];

    if (!aboutContent) {
      return fallback;
    }

    const dynamicParagraphs = aboutContent
      .split(/\n\s*\n/g)
      .map((part) => part.trim())
      .filter(Boolean);

    return dynamicParagraphs.length > 0 ? dynamicParagraphs : fallback;
  }, [aboutContent]);

  return (
    <section id="about" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-6 py-2 bg-secondary rounded-full mb-4">
            <span className="text-sm text-secondary-foreground">Sobre Mim</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Conheça Minha História
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            {paragraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 20)}`}
                className={`text-lg text-foreground leading-relaxed ${
                  index < paragraphs.length - 1 ? "mb-6" : ""
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-secondary p-6 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl">
                  <Palette className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Design Criativo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Especializado em criar designs únicos e memoráveis que se
                    destacam
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-accent p-6 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl">
                  <Sparkles className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Atenção aos Detalhes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Cada elemento é cuidadosamente pensado para criar harmonia
                    visual
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#F0E6FF] p-6 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl">
                  <Heart className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Paixão Pelo Que Faço
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Amor genuíno pela arte e dedicação em cada projeto
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
