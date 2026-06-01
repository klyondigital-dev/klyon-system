import React, { useState } from 'react';
import { Search, Bell, Calendar, ChevronDown, Check, Menu } from 'lucide-react';
import clsx from 'clsx';
import { NotificationCenter } from './NotificationCenter';

import type { Client } from '../types';

interface HeaderProps {
  activeTab: string;
  onLogout?: () => void;
  clients: Client[];
  selectedClientId: string;
  onClientSelect: (id: string) => void;
  onMobileMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onLogout, clients, selectedClientId, onClientSelect, onMobileMenuToggle }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const clientList = [
    { id: 'all', name: 'Todos os Clientes' },
    ...clients.map(c => ({ id: c.id, name: c.company }))
  ];

  const selectedClientName = clientList.find(c => c.id === selectedClientId)?.name || 'Todos os Clientes';

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard de Performance';
      case 'crm':
        return 'CRM & Clientes Ativos';
      case 'finance':
        return 'Gestão Financeira & Vendas';
      case 'campaigns':
        return 'Acompanhamento de Anúncios';
      case 'reports':
        return 'Relatórios Gerenciais';
      case 'automations':
        return 'Fluxos de Automações';
      default:
        return 'Painel de Controle';
    }
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-20 bg-primary/80 backdrop-blur-md border-b border-white/[0.04] sticky top-0 flex items-center justify-between px-4 md:px-8 z-20 print:hidden">
      {/* Breadcrumbs / Page Title */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button 
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Klyon Digital</span>
          <h1 className="text-lg md:text-xl font-display font-semibold text-white mt-0.5">{getBreadcrumb()}</h1>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-4">
        {/* Client Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] text-sm text-gray-300 hover:text-white transition-all duration-200 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-glow-cyan animate-pulse"></span>
            <span className="font-medium max-w-[130px] md:max-w-none truncate">{selectedClientName}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-white/[0.08] shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <span className="block text-[10px] uppercase font-bold text-gray-500 px-3 py-1.5 tracking-wider">Filtrar por Conta</span>
                {clientList.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      onClientSelect(client.id);
                      setDropdownOpen(false);
                    }}
                    className={clsx(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                      selectedClientId === client.id
                        ? "bg-neon-indigo/15 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <span>{client.name}</span>
                    {selectedClientId === client.id && <Check size={12} className="text-neon-indigo" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Date Display (Hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400 bg-white/[0.02] border border-white/[0.04] py-2 px-3.5 rounded-xl">
          <Calendar size={14} className="text-gray-500" />
          <span className="capitalize">{today}</span>
        </div>

        {/* Notifications - Live Component */}
        <NotificationCenter />

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer text-xs font-medium ml-2"
          >
            Sair
          </button>
        )}
      </div>
    </header>
  );
};
