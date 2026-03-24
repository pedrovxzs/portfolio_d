import { Mail, MessageSquare } from "lucide-react";

export function Contact() {
  return (
    <section id="contact" className="py-20 px-6 bg-muted">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-6 py-2 bg-white rounded-full mb-4">
            <span className="text-sm text-primary">Contato</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Vamos Trabalhar Juntos?
          </h2>
          <p className="text-lg text-muted-foreground">
            Entre em contato para discutir seu próximo projeto
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <a
                href="mailto:dennysgusmao@gmail.com"
                className="w-full text-center px-4 py-6 bg-primary text-primary-foreground rounded-2xl inline-flex items-center justify-center gap-2"
              >
                <Mail size={20} />
                <span className="ml-2">dennysgusmao@gmail.com</span>
              </a>
              <a
                href="https://instagram.com/dennyszsz"
                target="_blank"
                rel="noreferrer"
                className="w-full text-center px-4 py-6 bg-accent text-foreground rounded-2xl inline-flex items-center justify-center gap-2"
              >
                <MessageSquare size={20} />
                <span className="ml-2">@dennyszsz</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
