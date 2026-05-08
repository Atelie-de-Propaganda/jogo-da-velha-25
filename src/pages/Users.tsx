import { useState, useMemo } from 'react';
import { Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import { getUsers, saveUser, deleteUser } from '../data/dataService';
import type { ArsenalUser, UserRole } from '../types/arsenal';
import { ROLE_LABELS } from '../types/arsenal';
import { useAuth } from '../contexts/AuthContext';
import ConfirmDialog from '../components/arsenal/ConfirmDialog';
import ModuleHeader from '../components/arsenal/ModuleHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Navigate } from 'react-router-dom';

const EMPTY: ArsenalUser = {
  id: '', name: '', email: '', role: 'equipe_interna', active: true, created_at: '',
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'text-[#FFE600] bg-[#FFE600]/10 border-[#FFE600]/30',
  ti_externo: 'text-blue-400 bg-blue-900/30 border-blue-900/50',
  equipe_interna: 'text-green-400 bg-green-900/30 border-green-900/50',
};

function UserForm({ initial, onSave, onClose, isNew }: {
  initial: ArsenalUser;
  onSave: (u: ArsenalUser) => void;
  onClose: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState<ArsenalUser>({ ...initial });
  const [password, setPassword] = useState('');
  const inputCls = "w-full bg-[#2a2a28] border border-[#3a3a38] text-white text-sm px-3 py-2 rounded outline-none focus:border-[#FFE600] transition-colors";
  const labelCls = "block text-xs text-[#D8D59D] mb-1";
  function set(key: keyof ArsenalUser, val: string | boolean) { setForm(p => ({ ...p, [key]: val })); }

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className={labelCls}>Nome completo <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>E-mail <span className="text-red-400">*</span></label>
          <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Perfil de acesso <span className="text-red-400">*</span></label>
          <select className={inputCls} value={form.role} onChange={e => set('role', e.target.value as UserRole)} required>
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {isNew && (
          <div>
            <label className={labelCls}>Senha inicial <span className="text-red-400">*</span></label>
            <input
              type="password"
              className={inputCls}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required={isNew}
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className={`${labelCls} mb-0`}>Usuário ativo</label>
          <button
            type="button"
            onClick={() => set('active', !form.active)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.active ? 'bg-[#FFE600]' : 'bg-[#3a3a38]'}`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${form.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="bg-[#2a2a28] border border-[#3a3a38] rounded p-3">
        <p className="text-xs text-[#a0a09e] font-medium mb-2">Permissões por perfil:</p>
        <div className="space-y-1 text-xs text-[#606060]">
          <p><span className="text-[#FFE600]">Admin</span> — Acesso total: CRUD em todos os módulos, gerenciamento de usuários.</p>
          <p><span className="text-blue-400">TI Externo</span> — Visualização e edição técnica, pode revelar senhas de equipamentos.</p>
          <p><span className="text-green-400">Equipe Interna</span> — Consulta apenas. Senhas sempre mascaradas.</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-[#2a2a28]">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#a0a09e] border border-[#3a3a38] rounded hover:bg-[#2a2a28] transition-colors">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm bg-[#FFE600] text-[#1A1A19] font-semibold rounded hover:bg-[#FFE600]/90 transition-colors">Salvar</button>
      </div>
    </form>
  );
}

export default function Users() {
  const { user: currentUser, isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;

  const [users, setUsers] = useState<ArsenalUser[]>(() => getUsers());
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | ''>('');
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<ArsenalUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArsenalUser | null>(null);

  function refresh() { setUsers(getUsers()); }

  const filtered = useMemo(() => {
    let list = [...users];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u => [u.name, u.email].some(f => f.toLowerCase().includes(q)));
    }
    if (filterRole) list = list.filter(u => u.role === filterRole);
    return list;
  }, [users, search, filterRole]);

  function handleSave(u: ArsenalUser) {
    if (!currentUser) return;
    saveUser(u, currentUser.id, currentUser.name);
    refresh();
    setDialogMode(null);
  }

  function handleDelete() {
    if (!deleteTarget || !currentUser) return;
    deleteUser(deleteTarget.id, deleteTarget.name, currentUser.id, currentUser.name);
    refresh();
    setDeleteTarget(null);
  }

  function handleToggleActive(u: ArsenalUser) {
    if (!currentUser) return;
    saveUser({ ...u, active: !u.active }, currentUser.id, currentUser.name);
    refresh();
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    admin: users.filter(u => u.role === 'admin').length,
    ti: users.filter(u => u.role === 'ti_externo').length,
    equipe: users.filter(u => u.role === 'equipe_interna').length,
  };

  return (
    <div>
      <ModuleHeader
        title="Usuários"
        count={filtered.length}
        onAdd={() => { setSelected({ ...EMPTY }); setDialogMode('add'); }}
        addLabel="Novo usuário"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, cls: 'text-white' },
          { label: 'Ativos', value: stats.active, cls: 'text-green-400' },
          { label: 'Inativos', value: stats.total - stats.active, cls: 'text-[#a0a09e]' },
          { label: 'Admins', value: stats.admin, cls: 'text-[#FFE600]' },
        ].map(s => (
          <div key={s.label} className="arsenal-card rounded p-3 text-center">
            <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
            <div className="text-xs text-[#a0a09e] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-[#222221] border border-[#3a3a38] text-sm text-white px-3 py-1.5 rounded outline-none focus:border-[#FFE600] placeholder:text-[#606060]"
        />
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value as UserRole | '')}
          className="bg-[#222221] border border-[#3a3a38] text-sm text-[#a0a09e] px-3 py-1.5 rounded outline-none focus:border-[#FFE600]"
        >
          <option value="">Todos os perfis</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="arsenal-card rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#1f1f1e] border-b border-[#2a2a28]">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Usuário</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Perfil</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Cadastrado em</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Status</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f1e]">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[#606060] text-sm">Nenhum usuário encontrado.</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="arsenal-table-row">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2a2a28] border border-[#3a3a38] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-[#D8D59D]">
                        {u.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white flex items-center gap-1">
                        {u.name}
                        {u.id === currentUser?.id && <span className="text-xs text-[#FFE600] bg-[#FFE600]/10 px-1 rounded">você</span>}
                      </div>
                      <div className="text-xs text-[#606060]">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded border ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#a0a09e]">
                  {format(new Date(u.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${u.active ? 'text-green-400 bg-green-900/30' : 'text-[#606060] bg-[#2a2a28]'}`}>
                    {u.active ? <><UserCheck className="w-3 h-3" />Ativo</> : <><UserX className="w-3 h-3" />Inativo</>}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleActive(u)}
                      disabled={u.id === currentUser?.id}
                      className="p-1.5 text-[#a0a09e] hover:text-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title={u.active ? 'Desativar' : 'Ativar'}
                    >
                      {u.active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => { setSelected(u); setDialogMode('edit'); }}
                      className="p-1.5 text-[#a0a09e] hover:text-[#FFE600] transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(u)}
                      disabled={u.id === currentUser?.id}
                      className="p-1.5 text-[#a0a09e] hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogMode !== null} onOpenChange={open => { if (!open) setDialogMode(null); }}>
        <DialogContent className="bg-[#222221] border-[#3a3a38] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#FFE600]">
              {dialogMode === 'add' ? 'Novo Usuário' : `Editar: ${selected?.name}`}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <UserForm
              initial={selected}
              onSave={handleSave}
              onClose={() => setDialogMode(null)}
              isNew={dialogMode === 'add'}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null); }}
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir o usuário "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        confirmLabel="Excluir usuário"
      />
    </div>
  );
}
