import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Webhook, Plus, Copy, Trash2, Link as LinkIcon, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { webhooksApi } from '../api';
import type { WebhookLink, Client } from '../types';

interface WebhooksManagerProps {
  clients: Client[];
}

export const WebhooksManager: React.FC<WebhooksManagerProps> = ({ clients }) => {
  const [links, setLinks] = useState<WebhookLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [source, setSource] = useState('Elementor');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const data = await webhooksApi.getAll();
      setLinks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedClientId) return;

    try {
      const newLink = await webhooksApi.create({
        name,
        clientId: selectedClientId,
        source
      });
      setLinks([newLink, ...links]);
      setShowModal(false);
      setName('');
      setSelectedClientId('');
    } catch (err) {
      console.error('Erro ao criar webhook', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este Webhook? Os leads enviados para essa URL serão perdidos.')) return;
    try {
      await webhooksApi.delete(id);
      setLinks(links.filter(l => l.id !== id));
    } catch (err) {
      console.error('Erro ao remover', err);
    }
  };

  const copyToClipboard = (urlId: string) => {
    const fullUrl = `http://localhost:3000/api/webhooks/custom/${urlId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(urlId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Webhook className="text-neon-cyan" />
            Gerenciador de Webhooks
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Gere URLs exclusivas para conectar o Typeform, Elementor, ou qualquer formulário e captar leads automaticamente.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 border border-neon-cyan/30 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-glow-cyan"
        >
          <Plus size={18} /> Novo Webhook
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin"></div>
          </div>
        ) : links.length === 0 ? (
          <div className="col-span-full text-center py-20 border border-white/[0.05] rounded-2xl bg-white/[0.01]">
            <Webhook className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-bold mb-2">Nenhum webhook gerado</h3>
            <p className="text-gray-500 text-sm">Crie seu primeiro link para começar a receber leads via API.</p>
          </div>
        ) : (
          links.map((link) => {
            const clientName = clients.find(c => c.id === link.clientId)?.company || 'Agência';
            
            return (
              <GlassCard key={link.id} className="p-5 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <CheckCircle2 size={10} /> Ativo
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1 pr-16 truncate">{link.name}</h3>
                <p className="text-xs text-neon-cyan font-medium mb-4">{clientName} • {link.source}</p>

                <div className="bg-black/40 rounded-lg p-3 border border-white/[0.05] mb-4 flex items-center justify-between group-hover:border-neon-cyan/30 transition-colors">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <LinkIcon size={14} className="text-gray-500 shrink-0" />
                    <span className="text-xs text-gray-400 font-mono truncate">
                      .../api/webhooks/custom/{link.urlId}
                    </span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(link.urlId)}
                    className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors ml-2 shrink-0"
                    title="Copiar URL Completa"
                  >
                    {copiedId === link.urlId ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.05]">
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Leads Recebidos</span>
                    <span className="text-xl font-display font-bold text-white">{link.leadsCount}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(link.id)}
                    className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors"
                    title="Deletar Webhook"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Modal Criar Webhook */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Novo Webhook</h3>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Nome Identificador</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
                    placeholder="Ex: Landing Page Imóveis Alto Padrão"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Cliente Vinculado</label>
                  <select 
                    required
                    value={selectedClientId}
                    onChange={e => setSelectedClientId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-neon-cyan"
                  >
                    <option value="" disabled>Selecione o Cliente</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Fonte (Origem)</label>
                  <select 
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-neon-cyan"
                  >
                    <option value="Elementor">Elementor Forms</option>
                    <option value="Typeform">Typeform</option>
                    <option value="ActiveCampaign">ActiveCampaign</option>
                    <option value="Custom API">Custom API</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-neon-cyan text-black rounded-xl font-bold hover:bg-cyan-400 transition-colors shadow-glow-cyan"
                  >
                    Gerar URL
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
