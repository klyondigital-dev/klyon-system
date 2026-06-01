import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { ShoppingBag, Code, Megaphone, Wrench, Briefcase, Printer, MonitorSmartphone } from 'lucide-react';

export const Catalog: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const services = [
    {
      category: "Desenvolvimento & Web",
      icon: <MonitorSmartphone size={20} className="text-neon-cyan" />,
      items: [
        { 
          name: "Landing Page & Site Institucional", 
          price: "A partir de R$ 599,90", 
          type: "unico",
          description: "Ideal para empresas que desejam presença digital profissional, moderna e estratégica.",
          features: "Design Responsivo • Estrutura Profissional • Integração com WhatsApp • Otimização Visual • Alta Conversão"
        },
        { 
          name: "Site Institucional + Landing Page (com SEO)", 
          price: "R$ 799,90", 
          type: "unico",
          description: "Estruturado para empresas que desejam maior autoridade e posicionamento no Google.",
          features: "Tudo do plano padrão • SEO Estratégico • Performance Otimizada • Estrutura para ranqueamento • Indexação Google • Melhor alcance orgânico"
        },
        { 
          name: "Portfólio Empresarial", 
          price: "R$ 499,90", 
          type: "unico",
          description: "Apresentação profissional da sua empresa para gerar mais autoridade e conversão.",
          features: "Design Premium • Estrutura Comercial Estratégica • PDF Profissional • Visual Moderno e Impactante • Ideal para reuniões e fechamento de clientes"
        },
        { 
          name: "Manutenção de Sites e Landing Pages", 
          price: "R$ 59,90", 
          type: "mensal",
          description: "Mantenha seu projeto atualizado, seguro e funcionando perfeitamente.",
          features: "Atualizações • Correções Técnicas • Monitoramento • Suporte Contínuo • Ajustes Estratégicos"
        }
      ]
    },
    {
      category: "Marketing & Tráfego",
      icon: <Megaphone size={20} className="text-neon-pink" />,
      items: [
        { 
          name: "Gestão de Tráfego Pago", 
          price: "R$ 699,90", 
          type: "mensal", 
          description: "Mão de obra e preparação estratégica para captação e conversão de clientes.",
          note: "🎁 Bônus de 1ª vez: Oferecemos R$ 100,00 de brinde para iniciar seus anúncios!",
          features: "Gestão Completa de Anúncios • Estratégia de Conversão • Segmentação Inteligente • Otimização de Campanhas • Relatórios de Performance"
        },
        { 
          name: "Plano 1 - Essencial (Redes Sociais)", 
          price: "R$ 499,90", 
          type: "mensal",
          description: "Para: comércio local e autônomos começando no digital.",
          features: "12 posts/mês (feed) • 8 stories/mês • Legendas estratégicas + hashtags • Calendário editorial mensal • Gestão de comentários/DMs • Relatório mensal simples (Sem vídeos)"
        },
        { 
          name: "Plano 2 - Profissional (Redes Sociais)", 
          price: "R$ 849,90", 
          type: "mensal",
          description: "Para: clínicas e escritórios já estabelecidos querendo crescer.",
          features: "Tudo do Essencial + 16 posts/mês • 2 Reels profissionais (com filmmaker) • 12 stories/mês • 1 capa de destaque • Planejamento estratégico de conteúdo • Relatório mensal completo"
        },
        { 
          name: "Plano 3 - Performance (Redes Sociais)", 
          price: "R$ 999,90", 
          type: "mensal",
          description: "Para: marcas que querem autoridade e presença dominante na cidade.",
          features: "Tudo do Profissional + 20 posts/mês • 3 Reels (com filmmaker) • 16 stories/mês + interativos • Reunião estratégica mensal (1h) • Suporte prioritário via WhatsApp • Revisão de posicionamento trimestral"
        }
      ]
    },
    {
      category: "Consultoria Estratégica",
      icon: <Briefcase size={20} className="text-neon-indigo" />,
      items: [
        { 
          name: "Reuniões de Alinhamento Estratégico", 
          price: "R$ 249,90", 
          type: "avulso",
          description: "Sessões focadas para direcionamento, planejamento e resolução de gargalos.",
          features: "Análise de Cenário • Definição de Metas • Plano de Ação Prático"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <ShoppingBag className="text-neon-cyan" /> Catálogo de Serviços
          </h1>
          <p className="text-gray-400 mt-1">Tabela de preços oficial da Klyon Digital.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-lg font-semibold transition-colors border border-white/[0.05] no-print"
        >
          <Printer size={16} /> Salvar PDF Comercial
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-8">
        
        {services.map((category, idx) => (
          <GlassCard key={idx} className="p-6 border border-white/[0.05] print:border-gray-200 print:shadow-none print:bg-white print:text-black print:mb-8" glow={idx === 0}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.05] print:border-gray-300">
              <div className="w-10 h-10 rounded-lg bg-white/[0.02] flex items-center justify-center border border-white/[0.05] print:bg-gray-100 print:border-gray-300">
                {category.icon}
              </div>
              <h2 className="text-lg font-display font-bold text-white print:text-black">{category.category}</h2>
            </div>
            
            <div className="space-y-6">
              {category.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex flex-col gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all print:p-0 print:mb-6 print:border-none print:bg-transparent">
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-100 print:text-gray-800 text-lg">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-400 mt-1 print:text-gray-600">{item.description}</p>
                      )}
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="block font-display font-bold text-neon-cyan text-xl print:text-black">{item.price}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                        {item.type === 'mensal' ? 'Por Mês' : item.type === 'unico' ? 'Pagamento Único' : 'Por Reunião'}
                      </span>
                    </div>
                  </div>

                  {item.features && (
                    <div className="mt-2 pt-3 border-t border-white/[0.05] print:border-gray-200">
                      <p className="text-xs text-gray-300 print:text-gray-600 leading-relaxed">
                        <strong className="text-neon-indigo print:text-gray-800">Incluso:</strong> {item.features}
                      </p>
                    </div>
                  )}

                  {item.note && (
                    <div className="mt-1 bg-rose-500/10 text-rose-300 print:bg-gray-100 print:text-gray-600 p-2 rounded text-xs">
                      {item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        ))}

        {/* Rodapé Corporativo / Termos (Apenas na Impressão e na Tela) */}
        <div className="col-span-1 lg:col-span-2 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 print:bg-gray-50 print:border-gray-200">
          
          <div>
            <h3 className="text-sm font-bold text-white print:text-black mb-3">Termos Comerciais (Sites & Landing Pages)</h3>
            <ul className="text-xs text-gray-400 print:text-gray-700 space-y-2 list-disc list-inside">
              <li><strong>Valores Únicos:</strong> O desenvolvimento do site/landing page é pago uma única vez.</li>
              <li><strong>Hospedagem (Brinde):</strong> Oferecemos 12 meses de hospedagem gratuita como cortesia da agência.</li>
              <li><strong>Domínio:</strong> A compra e renovação do domínio (ex: suaempresa.com.br) é de responsabilidade do cliente (validade de 12 meses, não pode ser alterado após registro).</li>
              <li><strong>Plano de Manutenção (R$ 59,90/mês):</strong> Opcional. Garante suporte contínuo, estabilidade e direito a pequenas modificações.</li>
              <li><strong>Sem Manutenção:</strong> Oferecemos garantia e direito a modificações gratuitas apenas nos primeiros <strong>15 dias</strong> após o lançamento oficial.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white print:text-black mb-3">Termos Comerciais (Tráfego Pago & Retenção)</h3>
            <ul className="text-xs text-gray-400 print:text-gray-700 space-y-2 list-disc list-inside">
              <li><strong>Gestão de Tráfego (Mão de obra):</strong> O valor de R$ 699,90 é referente apenas aos serviços da agência (preparação, estratégia e operação).</li>
              <li><strong>Investimento em Anúncios:</strong> O orçamento das campanhas (verba injetada no Google/Meta) é à parte e definido pelo cliente conforme a sua disponibilidade.</li>
              <li><strong>Brinde de Boas-Vindas:</strong> Para o primeiro mês de Tráfego Pago, a agência fornece um bônus de <strong>R$ 100,00</strong> para ser investido em anúncios.</li>
              <li><strong>Descontos Especiais:</strong> Clientes que fecharem pacotes trimestrais ou semestrais possuem descontos significativos no valor da mensalidade de gestão.</li>
            </ul>
          </div>

        </div>

        {/* Rodapé Final PDF */}
        <div className="hidden print:block col-span-2 text-center text-xs text-gray-500 mt-6 pt-6 border-t border-gray-300">
          <p><strong>Klyon Digital</strong> - Transformando presença online em resultados reais.</p>
          <p>Valores sujeitos a alteração. Consulte nosso time comercial para orçamentos personalizados e pacotes fechados.</p>
          <p>www.klyon.digital | contato@klyon.digital</p>
        </div>

      </div>
    </div>
  );
};
