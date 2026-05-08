import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Monitor, Network, Building2,
  Camera, FileKey2, History, Users, Settings,
  ChevronLeft, ChevronRight, LogOut, Shield,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS } from '../../types/arsenal';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Máquinas', path: '/machines', icon: Monitor },
  { label: 'Rede e Servidor', path: '/network', icon: Network },
  { label: 'Fornecedores', path: '/suppliers', icon: Building2 },
  { label: 'CFTV', path: '/cctv', icon: Camera },
  { label: 'Licenças', path: '/licenses', icon: FileKey2 },
  { label: 'Histórico', path: '/history', icon: History },
  { label: 'Usuários', path: '/users', icon: Users, adminOnly: true },
  { label: 'Configurações', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside
      className={`flex flex-col h-screen bg-[#1A1A19] border-r border-[#2a2a28] transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-[#2a2a28] ${collapsed ? 'px-3 py-4 justify-center' : 'px-4 py-4'}`}>
        {collapsed ? (
          <Shield className="w-6 h-6 text-[#FFE600]" />
        ) : (
          <div>
            <div className="text-[#FFE600] font-bold text-xl tracking-widest uppercase">Arsenal</div>
            <div className="text-[#D8D59D] text-[10px] tracking-wider">Ateliê de Propaganda</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'text-[#FFE600] bg-[#FFE600]/10 border-r-2 border-[#FFE600]'
                  : 'text-[#a0a09e] hover:text-white hover:bg-[#2a2a28]'
              } ${collapsed ? 'justify-center px-3' : ''}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#FFE600]' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-[#2a2a28]">
        {!collapsed && user && (
          <div className="px-4 py-3">
            <div className="text-xs text-white font-medium truncate">{user.name}</div>
            <div className="text-[10px] text-[#D8D59D] mt-0.5">{ROLE_LABELS[user.role]}</div>
          </div>
        )}
        <div className={`flex ${collapsed ? 'flex-col items-center gap-1 py-2' : 'items-center justify-between px-4 pb-3'}`}>
          {!collapsed && (
            <button
              onClick={logout}
              className="flex items-center gap-2 text-xs text-[#a0a09e] hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          )}
          {collapsed && (
            <button
              onClick={logout}
              title="Sair"
              className="p-2 text-[#a0a09e] hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expandir' : 'Recolher'}
            className="p-1.5 text-[#a0a09e] hover:text-[#FFE600] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
