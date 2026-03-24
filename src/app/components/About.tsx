import { Palette, Sparkles, Heart } from "lucide-react";

export function About() {
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
            <p className="text-lg text-foreground mb-6 leading-relaxed">
              Olá! Sou um artista apaixonado por criar experiências visuais que
              inspiram e emocionam. Com anos de experiência em design e arte
              digital, transformo ideias em realidade através de cores, formas e
              criatividade.
            </p>
            <p className="text-lg text-foreground mb-6 leading-relaxed">
              Meu trabalho é uma mistura de técnicas tradicionais e modernas,
              sempre buscando inovar e explorar novas possibilidades artísticas.
              Cada projeto é uma oportunidade de contar uma história única.
            </p>
            <p className="text-lg text-foreground leading-relaxed">
              Acredito que a arte tem o poder de transformar espaços e pessoas,
              e é essa crença que me motiva a criar todos os dias.
            </p>
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
