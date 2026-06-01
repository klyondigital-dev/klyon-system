import React, { useState } from 'react';
import { LayoutDashboard, Users, Cpu, Landmark, FileText, Activity, ChevronLeft, ChevronRight, LogOut, Shield, Webhook, MessageCircle, Calendar, CheckSquare, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, mobileMenuOpen = false, setMobileMenuOpen }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'crm', label: 'CRM & Clientes', icon: Users },
    { id: 'catalog', label: 'Catálogo de Preços', icon: ShoppingBag },
    { id: 'inbox', label: 'Caixa de Entrada', icon: MessageCircle },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'finance', label: 'Financeiro', icon: Landmark },
    { id: 'campaigns', label: 'Anúncios', icon: Activity },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'automations', label: 'Automações', icon: Cpu },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
        />
      )}

      <div
        className={clsx(
          "fixed md:sticky top-0 h-screen bg-surface border-r border-white/[0.04] flex flex-col transition-all duration-300 z-50",
          collapsed ? "w-20" : "w-64",
          !mobileMenuOpen ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        )}
      >
      {/* Header / Brand Logo */}
      <div className="h-20 border-b border-white/[0.04] flex items-center justify-between px-5">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-indigo to-neon-cyan flex items-center justify-center font-display font-bold text-white shadow-glow-indigo text-lg">
              K
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Klyon <span className="text-gradient-purple-cyan text-sm align-super font-semibold">system</span>
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-indigo to-neon-cyan flex items-center justify-center font-display font-bold text-white shadow-glow-indigo text-lg mx-auto">
            K
          </div>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] text-gray-400 hover:text-white transition-colors cursor-pointer hidden md:block"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Menu Items */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (setMobileMenuOpen) setMobileMenuOpen(false);
              }}
              className={clsx(
                "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                isActive
                  ? "bg-gradient-to-r from-neon-indigo/[0.12] to-neon-cyan/[0.04] text-white border-l-2 border-neon-indigo"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent"
              )}
            >
              <Icon
                size={18}
                className={clsx(
                  "transition-colors",
                  isActive ? "text-neon-cyan" : "text-gray-400 group-hover:text-white"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              
              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-20 scale-0 group-hover:scale-100 bg-surface border border-white/[0.08] text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-150 shadow-xl pointer-events-none whitespace-nowrap z-40">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom User Area */}
      <div className="p-4 border-t border-white/[0.04]">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-neon-indigo/35 to-neon-pink/35 flex items-center justify-center border border-white/[0.1]">
                <Shield size={16} className="text-neon-indigo" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-semibold text-white truncate">Alan Klyon</h4>
                <span className="text-[11px] text-gray-500 block truncate">Diretor Comercial</span>
              </div>
            </div>
            <button onClick={onLogout} className="text-gray-500 hover:text-neon-pink transition-colors p-1 cursor-pointer" title="Sair do sistema">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div onClick={onLogout} title="Sair do sistema" className="w-10 h-10 mx-auto rounded-full bg-gradient-to-tr from-neon-indigo/35 to-neon-pink/35 flex items-center justify-center border border-white/[0.1] cursor-pointer hover:border-neon-pink/50 hover:text-neon-pink transition-colors">
            <LogOut size={16} className="text-gray-300 hover:text-neon-pink" />
          </div>
        )}
        </div>
      </div>
    </>
  );
};
