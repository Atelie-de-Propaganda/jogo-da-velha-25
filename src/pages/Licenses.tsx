import { useState, useMemo } from 'react';
import { Pencil, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { getLicenses, saveLicense, deleteLicense, getExpiryStatus } from '../data/dataService';
import { exportCSV } from '../lib/csvExport';
import type { License, LicenseType } from '../types/arsenal';
import { LICENSE_TYPE_LABELS } from '../types/arsenal';
import { useAuth } from '../contexts/AuthContext';
import ExpiryBadge from '../components/arsenal/ExpiryBadge';
import ConfirmDialog from '../components/arsenal/ConfirmDialog';
import ModuleHeader from '../components/arsenal/ModuleHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { logPasswordReveal } from '../data/dataService';

const EMPTY: License = {
  id: '', software_name: '', version: '', type: 'anual',
  license_key: '', seats: 1, renewal_date: '', responsible_user: '', notes: '',
  created_at: '', updated_at: '',
};

const TYPE_COLORS: Record<LicenseType, string> = {
  perpetua: 'text-green-400 bg-green-900/30 border-green-900/50',
  anual: 'text-blue-400 bg-blue-900/30 border-blue-900/50',
  mensal: 'text-cyan-400 bg-cyan-900/30 border-cyan-900/50',
  open_source: 'text-gray-400 bg-gray-900/30 border-gray-700',
};

function LicenseKeyField({ license }: { license: License }) {
  const [revealed, setRevealed] = useState(false);
  const { user, canRevealPasswords } = useAuth();
  if (!license.license_key) return <span className="text-[#606060] text-sm">—</span>;

  function handleReveal() {
    if (!revealed && user) {
      logPasswordReveal(user.id, user.name, 'licenses', license.id, license.software_name);
    }
    setRevealed(!revealed);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm text-white">{revealed ? license.license_key : '••••-••••-••••-••••'}</span>
      {canRevealPasswords && (
        <button onClick={handleReveal} className="text-[#a0a09e] hover:text-[#FFE600] transition-colors">
          {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}

function LicenseForm({ initial, onSave, onClose }: { initial: License; onSave: (l: License) => void; onClose: () => void }) {
  const [form, setForm] = useState<License>({ ...initial });
  const inputCls = "w-full bg-[#2a2a28] border border-[#3a3a38] text-white text-sm px-3 py-2 rounded outline-none focus:border-[#FFE600] transition-colors";
  const labelCls = "block text-xs text-[#D8D59D] mb-1";
  function set(key: keyof License, val: string | number) { setForm(p => ({ ...p, [key]: val })); }

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Software <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.software_name} onChange={e => set('software_name', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Versão</label>
          <input className={inputCls} value={form.version ?? ''} onChange={e => set('version', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Tipo <span className="text-red-400">*</span></label>
          <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value as LicenseType)} required>
            {Object.entries(LICENSE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Assentos <span className="text-red-400">*</span></label>
          <input type="number" min={1} className={inputCls} value={form.seats} onChange={e => set('seats', parseInt(e.target.value))} required />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Chave / Número de Série</label>
          <input className={inputCls} value={form.license_key ?? ''} onChange={e => set('license_key', e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" />
        </div>
        <div>
          <label className={labelCls}>Data de Renovação</label>
          <input type="date" className={inputCls} value={form.renewal_date ?? ''} onChange={e => set('renewal_date', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Responsável <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.responsible_user} onChange={e => set('responsible_user', e.target.value)} required />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Observações</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-[#2a2a28]">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#a0a09e] border border-[#3a3a38] rounded hover:bg-[#2a2a28] transition-colors">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm bg-[#FFE600] text-[#1A1A19] font-semibold rounded hover:bg-[#FFE600]/90 transition-colors">Salvar</button>
      </div>
    </form>
  );
}

export default function Licenses() {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<License[]>(() => getLicenses());
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<LicenseType | ''>('');
  const [filterAlert, setFilterAlert] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<License | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<License | null>(null);

  function refresh() { setLicenses(getLicenses()); }

  const filtered = useMemo(() => {
    let list = [...licenses];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l => [l.software_name, l.version, l.responsible_user].some(f => f?.toLowerCase().includes(q)));
    }
    if (filterType) list = list.filter(l => l.type === filterType);
    if (filterAlert) list = list.filter(l => ['danger', 'warning', 'expired'].includes(getExpiryStatus(l.renewal_date) ?? ''));
    return list;
  }, [licenses, search, filterType, filterAlert]);

  const alertCount = useMemo(() =>
    licenses.filter(l => ['danger', 'warning', 'expired'].includes(getExpiryStatus(l.renewal_date) ?? '')).length,
    [licenses]);

  function handleSave(l: License) {
    if (!user) return;
    saveLicense(l, user.id, user.name);
    refresh();
    setDialogMode(null);
  }
  function handleDelete() {
    if (!deleteTarget || !user) return;
    deleteLicense(deleteTarget.id, deleteTarget.software_name, user.id, user.name);
    refresh();
    setDeleteTarget(null);
  }

  return (
    <div>
      <ModuleHeader
        title="Licenças de Software"
        count={filtered.length}
        onAdd={() => { setSelected({ ...EMPTY }); setDialogMode('add'); }}
        onExport={() => exportCSV('arsenal-licencas.csv', filtered.map(l => ({
          Software: l.software_name, Versão: l.version ?? '', Tipo: LICENSE_TYPE_LABELS[l.type],
          Assentos: l.seats, Renovação: l.renewal_date ?? '', Responsável: l.responsible_user,
        })))}
      >
        {alertCount > 0 && (
          <button
            onClick={() => setFilterAlert(!filterAlert)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ${
              filterAlert
                ? 'bg-amber-900/30 text-amber-400 border-amber-900/50'
                : 'text-amber-400 border-amber-900/50 hover:bg-amber-900/30'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            {alertCount} alerta{alertCount > 1 ? 's' : ''}
          </button>
        )}
      </ModuleHeader>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por software, responsável..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-[#222221] border border-[#3a3a38] text-sm text-white px-3 py-1.5 rounded outline-none focus:border-[#FFE600] placeholder:text-[#606060]"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as LicenseType | '')}
          className="bg-[#222221] border border-[#3a3a38] text-sm text-[#a0a09e] px-3 py-1.5 rounded outline-none focus:border-[#FFE600]"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(LICENSE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="arsenal-card rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1f1f1e] border-b border-[#2a2a28]">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Software</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Assentos</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Responsável</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Renovação</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1e]">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#606060] text-sm">Nenhuma licença encontrada.</td></tr>
              ) : filtered.map(l => {
                const status = getExpiryStatus(l.renewal_date);
                const hasAlert = status === 'danger' || status === 'warning' || status === 'expired';
                return (
                  <tr key={l.id} className="arsenal-table-row cursor-pointer" onClick={() => { setSelected(l); setDialogMode('view'); }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {hasAlert && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                        <div>
                          <div className="text-sm font-medium text-white">{l.software_name}</div>
                          {l.version && <div className="text-xs text-[#606060]">v{l.version}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${TYPE_COLORS[l.type]}`}>{LICENSE_TYPE_LABELS[l.type]}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{l.seats}</td>
                    <td className="px-4 py-3 text-sm text-[#a0a09e]">{l.responsible_user}</td>
                    <td className="px-4 py-3">
                      {l.type === 'open_source' || l.type === 'perpetua'
                        ? <span className="text-xs text-[#606060]">Não aplicável</span>
                        : <ExpiryBadge date={l.renewal_date} />
                      }
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelected(l); setDialogMode('edit'); }} className="p-1.5 text-[#a0a09e] hover:text-[#FFE600] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteTarget(l)} className="p-1.5 text-[#a0a09e] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogMode !== null} onOpenChange={open => { if (!open) setDialogMode(null); }}>
        <DialogContent className="bg-[#222221] border-[#3a3a38] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#FFE600]">
              {dialogMode === 'add' ? 'Nova Licença' : dialogMode === 'edit' ? `Editar: ${selected?.software_name}` : selected?.software_name}
            </DialogTitle>
          </DialogHeader>
          {dialogMode === 'view' && selected && (
            <div className="mt-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-[#D8D59D]">Versão</p><p className="text-sm text-white">{selected.version || '—'}</p></div>
                <div><p className="text-xs text-[#D8D59D]">Tipo</p>
                  <span className={`text-xs px-2 py-0.5 rounded border ${TYPE_COLORS[selected.type]}`}>{LICENSE_TYPE_LABELS[selected.type]}</span>
                </div>
                <div><p className="text-xs text-[#D8D59D]">Assentos</p><p className="text-2xl font-bold text-[#FFE600]">{selected.seats}</p></div>
                <div><p className="text-xs text-[#D8D59D]">Responsável</p><p className="text-sm text-white">{selected.responsible_user}</p></div>
                <div><p className="text-xs text-[#D8D59D]">Renovação</p>
                  {selected.type === 'open_source' || selected.type === 'perpetua'
                    ? <span className="text-xs text-[#606060]">Não aplicável</span>
                    : <ExpiryBadge date={selected.renewal_date} />
                  }
                </div>
              </div>
              <div className="bg-[#2a2a28] p-4 rounded border border-[#3a3a38]">
                <p className="text-xs text-[#D8D59D] mb-2">Chave de Licença</p>
                <LicenseKeyField license={selected} />
              </div>
              {selected.notes && <div className="bg-[#2a2a28] p-3 rounded text-sm text-white">{selected.notes}</div>}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a28]">
                <button onClick={() => setDialogMode('edit')} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[#3a3a38] text-[#a0a09e] hover:text-white rounded transition-colors"><Pencil className="w-3.5 h-3.5" />Editar</button>
                <button onClick={() => { setDeleteTarget(selected); setDialogMode(null); }} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-red-900/50 text-red-400 hover:bg-red-900/20 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" />Excluir</button>
              </div>
            </div>
          )}
          {(dialogMode === 'add' || dialogMode === 'edit') && selected && (
            <LicenseForm initial={selected} onSave={handleSave} onClose={() => setDialogMode(null)} />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null); }}
        title="Excluir licença"
        description={`Tem certeza que deseja excluir a licença "${deleteTarget?.software_name}"?`}
        onConfirm={handleDelete}
        confirmLabel="Excluir"
      />
    </div>
  );
}
