import { useState } from 'react';
import { Shield, Database, Trash2, RefreshCw, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../types/arsenal';
import ConfirmDialog from '../components/arsenal/ConfirmDialog';

const STORAGE_KEYS = [
  'arsenal_machines', 'arsenal_network', 'arsenal_suppliers',
  'arsenal_cctv', 'arsenal_cctv_maintenances', 'arsenal_licenses',
  'arsenal_history', 'arsenal_users',
];

export default function Settings() {
  const { user, isAdmin } = useAuth();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  function handleResetData() {
    STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    setResetDone(true);
    setResetConfirm(false);
    setTimeout(() => window.location.reload(), 1500);
  }

  function getStorageSize(): string {
    let total = 0;
    STORAGE_KEYS.forEach(key => {
      total += (localStorage.getItem(key) ?? '').length;
    });
    return `${(total / 1024).toFixed(1)} KB`;
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <div className="arsenal-card rounded p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-[#FFE600]" />
          <h3 className="text-sm font-semibold text-white">Minha Conta</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#D8D59D]">Nome</p>
            <p className="text-sm text-white mt-1">{user?.name}</p>
          </div>
          <div>
            <p className="text-xs text-[#D8D59D]">E-mail</p>
            <p className="text-sm text-white mt-1">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-[#D8D59D]">Perfil de acesso</p>
            <div className="mt-1">
              <span className={`text-xs px-2 py-0.5 rounded border ${
                user?.role === 'admin' ? 'text-[#FFE600] bg-[#FFE600]/10 border-[#FFE600]/30' :
                user?.role === 'ti_externo' ? 'text-blue-400 bg-blue-900/30 border-blue-900/50' :
                'text-green-400 bg-green-900/30 border-green-900/50'
              }`}>
                {user ? ROLE_LABELS[user.role] : ''}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-[#D8D59D]">Revelação de senhas</p>
            <p className="text-sm mt-1">
              {user?.role === 'admin' || user?.role === 'ti_externo'
                ? <span className="text-green-400">Permitida</span>
                : <span className="text-[#606060]">Não permitida</span>
              }
            </p>
          </div>
        </div>
      </div>

      {/* Permissions matrix */}
      <div className="arsenal-card rounded p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-[#FFE600]" />
          <h3 className="text-sm font-semibold text-white">Matriz de Permissões</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2a2a28]">
                <th className="text-left py-2 text-[#a0a09e] font-medium">Ação</th>
                <th className="text-center py-2 text-[#FFE600] font-medium">Admin</th>
                <th className="text-center py-2 text-blue-400 font-medium">TI Externo</th>
                <th className="text-center py-2 text-green-400 font-medium">Equipe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1e]">
              {[
                ['Ver máquinas e rede', true, true, true],
                ['Editar máquinas e rede', true, true, false],
                ['Ver fornecedores', true, false, false],
                ['Revelar senhas', true, true, false],
                ['Exportar CSV', true, false, false],
                ['Gerenciar usuários', true, false, false],
                ['Ver histórico global', true, true, true],
                ['Deletar registros', true, false, false],
              ].map(([action, admin, ti, equipe]) => (
                <tr key={String(action)} className="py-2">
                  <td className="py-2 text-[#a0a09e]">{String(action)}</td>
                  <td className="py-2 text-center">{admin ? '✓' : <span className="text-[#3a3a38]">—</span>}</td>
                  <td className="py-2 text-center">{ti ? '✓' : <span className="text-[#3a3a38]">—</span>}</td>
                  <td className="py-2 text-center">{equipe ? '✓' : <span className="text-[#3a3a38]">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data management */}
      <div className="arsenal-card rounded p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-[#FFE600]" />
          <h3 className="text-sm font-semibold text-white">Dados do Sistema</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-[#2a2a28]">
            <div>
              <p className="text-sm text-white">Armazenamento local</p>
              <p className="text-xs text-[#606060]">Dados salvos no navegador (localStorage)</p>
            </div>
            <span className="text-sm font-mono text-[#D8D59D]">{getStorageSize()}</span>
          </div>

          {isAdmin && (
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white">Resetar dados de demonstração</p>
                <p className="text-xs text-[#606060] mt-0.5">Apaga todos os dados e restaura os dados de exemplo iniciais.</p>
              </div>
              {resetDone ? (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <RefreshCw className="w-3 h-3" />Recarregando...
                </span>
              ) : (
                <button
                  onClick={() => setResetConfirm(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-red-900/50 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Resetar dados
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div className="arsenal-card rounded p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-[#D8D59D]" />
          <h3 className="text-sm font-semibold text-white">Sobre o Arsenal</h3>
        </div>
        <div className="space-y-2 text-xs text-[#606060]">
          <p>Sistema de Gestão de Ativos e Infraestrutura</p>
          <p>Versão 1.0.0 — Ateliê de Propaganda</p>
          <p className="text-[#3a3a38]">Stack: React + TypeScript + Tailwind CSS + Supabase</p>
        </div>
      </div>

      <ConfirmDialog
        open={resetConfirm}
        onOpenChange={setResetConfirm}
        title="Resetar todos os dados?"
        description="Esta ação apagará todos os registros e restaurará os dados de demonstração. O sistema será recarregado. Esta ação não pode ser desfeita."
        onConfirm={handleResetData}
        confirmLabel="Sim, resetar"
      />
    </div>
  );
}
