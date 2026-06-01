import type { Lead, Campaign, Transaction } from '../types';

export class AIAnalyzer {
  static generateInsights(leads: Lead[], campaigns: Campaign[], transactions: Transaction[]): string {
    const insights: string[] = [];
    
    // 1. Análise de Leads Estagnados
    const staleLeads = leads.filter(l => l.status === 'proposal' || l.status === 'contacted');
    if (staleLeads.length > 0) {
      insights.push(`**Atenção de Vendas:** Existem ${staleLeads.length} leads nas etapas de Contato/Negociação que precisam de acompanhamento (follow-up). Acione-os pelo WhatsApp hoje para tentar fechamento.`);
    }

    // 2. Análise de Campanhas (Melhor e Pior CPL/ROI)
    if (campaigns.length > 0) {
      const activeCampaigns = campaigns.filter(c => c.status === 'active');
      if (activeCampaigns.length > 0) {
        // Encontrar a campanha com menor CPA (Custo por Aquisição/Lead) simulado
        const sorted = [...activeCampaigns].sort((a, b) => {
          const cpaA = a.spent / (a.conversions || 1);
          const cpaB = b.spent / (b.conversions || 1);
          return cpaA - cpaB;
        });

        const bestCampaign = sorted[0];
        const cpa = (bestCampaign.spent / (bestCampaign.conversions || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        insights.push(`**Escala de Campanhas:** A campanha "${bestCampaign.name}" está com o melhor desempenho (CPA de ${cpa}). Recomendo realocar orçamento para ela nas próximas 48 horas para maximizar o ROI.`);
        
        if (sorted.length > 1) {
          const worstCampaign = sorted[sorted.length - 1];
          insights.push(`**Alerta de Custo:** A campanha "${worstCampaign.name}" está com custo alto por conversão. Considere pausar ou alterar os criativos.`);
        }
      }
    }

    // 3. Análise Financeira e Previsão
    if (transactions.length > 0) {
      const revenueThisMonth = transactions
        .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.amount, 0);

      const expensesThisMonth = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.amount, 0);

      if (revenueThisMonth > expensesThisMonth * 2) {
        insights.push(`**Saúde Financeira:** Excelente gestão neste mês. A receita de ${revenueThisMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} cobre com grande margem os custos. É um ótimo momento para investir em tráfego ou contratação.`);
      } else if (revenueThisMonth < expensesThisMonth) {
        insights.push(`**Risco Financeiro:** Os custos superam a receita no mês atual. Revise os gastos de agência e foque na conversão dos leads em negociação para virar o jogo.`);
      }
    }

    // 4. Fechamento Heurístico
    if (insights.length === 0) {
      insights.push(`Não encontrei dados suficientes para gerar insights complexos. Adicione leads, campanhas ou transações para análises mais profundas.`);
    }

    return insights.join('\n\n');
  }
}
