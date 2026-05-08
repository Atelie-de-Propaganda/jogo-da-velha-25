import { useState, useMemo } from 'react';
import { Pencil, Trash2, Phone, Mail, AlertTriangle } from 'lucide-react';
import { getSuppliers, saveSupplier, deleteSupplier, getExpiryStatus, daysUntilExpiry } from '../data/dataService';
import { exportCSV } from '../lib/csvExport';
import type { Supplier, SupplierType } from '../types/arsenal';
import { SUPPLIER_TYPE_LABELS } from '../types/arsenal';
import { useAuth } from '../contexts/AuthContext';
import ExpiryBadge from '../components/arsenal/ExpiryBadge';
import ConfirmDialog from '../components/arsenal/ConfirmDialog';
import ModuleHeader from '../components/arsenal/ModuleHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EMPTY: Supplier = {
  id: '', corporate_name: '', trade_name: '', type: 'ti',
  commercial_contact_name: '', commercial_contact_phone: '', commercial_contact_email: '',
  technical_contact_name: '', technical_contact_phone: '', technical_contact_email: '',
  contract_number: '', contract_start: '', contract_end: '', monthly_value: undefined,
  notes: '', created_at: '', updated_at: '',
};

const TYPE_COLORS: Record<SupplierType, string> = {
  telefonia: 'text-blue-400 bg-blue-900/30 border-blue-900/50',
  internet: 'text-green-400 bg-green-900/30 border-green-900/50',
  ti: 'text-[#FFE600] bg-[#FFE600]/10 border-[#FFE600]/30',
  cftv: 'text-purple-400 bg-purple-900/30 border-purple-900/50',
  outros: 'text-gray-400 bg-gray-900/30 border-gray-700',
};

function SupplierForm({ initial, onSave, onClose }: { initial: Supplier; onSave: (s: Supplier) => void; onClose: () => void }) {
  const [form, setForm] = useState<Supplier>({ ...initial });
  const inputCls = "w-full bg-[#2a2a28] border border-[#3a3a38] text-white text-sm px-3 py-2 rounded outline-none focus:border-[#FFE600] transition-colors";
  const labelCls = "block text-xs text-[#D8D59D] mb-1";
  function set(key: keyof Supplier, val: string | number | undefined) { setForm(p => ({ ...p, [key]: val })); }

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Razão Social <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.corporate_name} onChange={e => set('corporate_name', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Nome Fantasia <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.trade_name} onChange={e => set('trade_name', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Tipo de Serviço <span className="text-red-400">*</span></label>
          <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value as SupplierType)} required>
            {Object.entries(SUPPLIER_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Número do Contrato</label>
          <input className={inputCls} value={form.contract_number ?? ''} onChange={e => set('contract_number', e.target.value)} />
        </div>

        <div className="col-span-2">
          <p className="text-xs font-medium text-[#D8D59D] mb-3 mt-2 border-t border-[#2a2a28] pt-3">Contato Comercial</p>
        </div>
        <div>
          <label className={labelCls}>Nome <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.commercial_contact_name} onChange={e => set('commercial_contact_name', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Telefone <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.commercial_contact_phone} onChange={e => set('commercial_contact_phone', e.target.value)} required />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>E-mail <span className="text-red-400">*</span></label>
          <input type="email" className={inputCls} value={form.commercial_contact_email} onChange={e => set('commercial_contact_email', e.target.value)} required />
        </div>

        <div className="col-span-2">
          <p className="text-xs font-medium text-[#D8D59D] mb-3 mt-2 border-t border-[#2a2a28] pt-3">Contato Técnico</p>
        </div>
        <div>
          <label className={labelCls}>Nome</label>
          <input className={inputCls} value={form.technical_contact_name ?? ''} onChange={e => set('technical_contact_name', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Telefone</label>
          <input className={inputCls} value={form.technical_contact_phone ?? ''} onChange={e => set('technical_contact_phone', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>E-mail</label>
          <input type="email" className={inputCls} value={form.technical_contact_email ?? ''} onChange={e => set('technical_contact_email', e.target.value)} />
        </div>

        <div className="col-span-2">
          <p className="text-xs font-medium text-[#D8D59D] mb-3 mt-2 border-t border-[#2a2a28] pt-3">Contrato</p>
        </div>
        <div>
          <label className={labelCls}>Início do Contrato</label>
          <input type="date" className={inputCls} value={form.contract_start ?? ''} onChange={e => set('contract_start', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Vencimento do Contrato</label>
          <input type="date" className={inputCls} value={form.contract_end ?? ''} onChange={e => set('contract_end', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Valor Mensal (R$)</label>
          <input type="number" step="0.01" className={inputCls} value={form.monthly_value ?? ''} onChange={e => set('monthly_value', e.target.value ? parseFloat(e.target.value) : undefined)} />
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

export default function Suppliers() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getSuppliers());
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<SupplierType | ''>('');
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  function refresh() { setSuppliers(getSuppliers()); }

  const filtered = useMemo(() => {
    let list = [...suppliers];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => [s.corporate_name, s.trade_name, s.contract_number, s.commercial_contact_name].some(f => f?.toLowerCase().includes(q)));
    }
    if (filterType) list = list.filter(s => s.type === filterType);
    return list;
  }, [suppliers, search, filterType]);

  const alertCount = useMemo(() =>
    suppliers.filter(s => ['danger', 'warning', 'expired'].includes(getExpiryStatus(s.contract_end) ?? '')).length,
    [suppliers]);

  function handleSave(s: Supplier) {
    if (!user) return;
    saveSupplier(s, user.id, user.name);
    refresh();
    setDialogMode(null);
  }
  function handleDelete() {
    if (!deleteTarget || !user) return;
    deleteSupplier(deleteTarget.id, deleteTarget.trade_name, user.id, user.name);
    refresh();
    setDeleteTarget(null);
  }

  return (
    <div>
      <ModuleHeader
        title="Fornecedores e Contratos"
        count={filtered.length}
        onAdd={() => { setSelected({ ...EMPTY }); setDialogMode('add'); }}
        onExport={() => exportCSV('arsenal-fornecedores.csv', filtered.map(s => ({
          'Nome Fantasia': s.trade_name, 'Razão Social': s.corporate_name, Tipo: SUPPLIER_TYPE_LABELS[s.type],
          Contrato: s.contract_number ?? '', Vencimento: s.contract_end ?? '',
          'Valor Mensal': s.monthly_value ? `R$ ${s.monthly_value.toFixed(2)}` : '',
        })))}
      >
        {alertCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-900/30 border border-amber-900/50 px-2 py-1 rounded">
            <AlertTriangle className="w-3 h-3" />
            {alertCount} vencimento{alertCount > 1 ? 's' : ''}
          </span>
        )}
      </ModuleHeader>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome, contrato..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-[#222221] border border-[#3a3a38] text-sm text-white px-3 py-1.5 rounded outline-none focus:border-[#FFE600] placeholder:text-[#606060]"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as SupplierType | '')}
          className="bg-[#222221] border border-[#3a3a38] text-sm text-[#a0a09e] px-3 py-1.5 rounded outline-none focus:border-[#FFE600]"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(SUPPLIER_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="arsenal-card rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1f1f1e] border-b border-[#2a2a28]">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Fornecedor</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Contato Comercial</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Contrato</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Vencimento</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Valor/mês</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1e]">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#606060] text-sm">Nenhum registro encontrado.</td></tr>
              ) : filtered.map(s => {
                const expiryStatus = getExpiryStatus(s.contract_end);
                const hasAlert = expiryStatus === 'danger' || expiryStatus === 'warning' || expiryStatus === 'expired';
                return (
                  <tr key={s.id} className="arsenal-table-row cursor-pointer" onClick={() => { setSelected(s); setDialogMode('view'); }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {hasAlert && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                        <div>
                          <div className="text-sm font-medium text-white">{s.trade_name}</div>
                          <div className="text-xs text-[#606060]">{s.corporate_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${TYPE_COLORS[s.type]}`}>{SUPPLIER_TYPE_LABELS[s.type]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white">{s.commercial_contact_name}</div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-[#606060]"><Phone className="w-3 h-3" />{s.commercial_contact_phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#a0a09e] font-mono">{s.contract_number || '—'}</td>
                    <td className="px-4 py-3"><ExpiryBadge date={s.contract_end} /></td>
                    <td className="px-4 py-3 text-sm text-[#a0a09e]">
                      {s.monthly_value ? `R$ ${s.monthly_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelected(s); setDialogMode('edit'); }} className="p-1.5 text-[#a0a09e] hover:text-[#FFE600] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteTarget(s)} className="p-1.5 text-[#a0a09e] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
        <DialogContent className="bg-[#222221] border-[#3a3a38] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#FFE600]">
              {dialogMode === 'add' ? 'Novo Fornecedor' : dialogMode === 'edit' ? `Editar: ${selected?.trade_name}` : selected?.trade_name}
            </DialogTitle>
          </DialogHeader>

          {dialogMode === 'view' && selected && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-[#D8D59D]">Razão Social</p><p className="text-sm text-white">{selected.corporate_name}</p></div>
                <div><p className="text-xs text-[#D8D59D]">Tipo</p>
                  <span className={`text-xs px-2 py-0.5 rounded border ${TYPE_COLORS[selected.type]}`}>{SUPPLIER_TYPE_LABELS[selected.type]}</span>
                </div>
                <div><p className="text-xs text-[#D8D59D]">Contrato</p><p className="text-sm font-mono text-white">{selected.contract_number || '—'}</p></div>
                <div><p className="text-xs text-[#D8D59D]">Valor Mensal</p>
                  <p className="text-sm text-white">{selected.monthly_value ? `R$ ${selected.monthly_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}</p>
                </div>
                <div><p className="text-xs text-[#D8D59D]">Início</p>
                  <p className="text-sm text-white">{selected.contract_start ? format(new Date(selected.contract_start), 'dd/MM/yyyy', { locale: ptBR }) : '—'}</p>
                </div>
                <div><p className="text-xs text-[#D8D59D]">Vencimento</p><ExpiryBadge date={selected.contract_end} /></div>
              </div>
              <div className="border-t border-[#2a2a28] pt-4">
                <p className="text-xs font-medium text-[#D8D59D] mb-3">Contato Comercial</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-xs text-[#606060]">Nome</p><p className="text-sm text-white">{selected.commercial_contact_name}</p></div>
                  <div>
                    <p className="text-xs text-[#606060]">Telefone</p>
                    <a href={`tel:${selected.commercial_contact_phone}`} className="text-sm text-[#D8D59D] hover:text-[#FFE600] flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <Phone className="w-3 h-3" />{selected.commercial_contact_phone}
                    </a>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-[#606060]">E-mail</p>
                    <a href={`mailto:${selected.commercial_contact_email}`} className="text-sm text-[#D8D59D] hover:text-[#FFE600] flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <Mail className="w-3 h-3" />{selected.commercial_contact_email}
                    </a>
                  </div>
                </div>
              </div>
              {selected.technical_contact_name && (
                <div className="border-t border-[#2a2a28] pt-4">
                  <p className="text-xs font-medium text-[#D8D59D] mb-3">Contato Técnico</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><p className="text-xs text-[#606060]">Nome</p><p className="text-sm text-white">{selected.technical_contact_name}</p></div>
                    {selected.technical_contact_phone && <div>
                      <p className="text-xs text-[#606060]">Telefone</p>
                      <a href={`tel:${selected.technical_contact_phone}`} className="text-sm text-[#D8D59D] hover:text-[#FFE600] flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Phone className="w-3 h-3" />{selected.technical_contact_phone}
                      </a>
                    </div>}
                  </div>
                </div>
              )}
              {selected.notes && <div className="bg-[#2a2a28] p-3 rounded text-sm text-white border-t border-[#2a2a28] pt-4">{selected.notes}</div>}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a28]">
                <button onClick={() => setDialogMode('edit')} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[#3a3a38] text-[#a0a09e] hover:text-white rounded transition-colors"><Pencil className="w-3.5 h-3.5" />Editar</button>
                <button onClick={() => { setDeleteTarget(selected); setDialogMode(null); }} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-red-900/50 text-red-400 hover:bg-red-900/20 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" />Excluir</button>
              </div>
            </div>
          )}
          {(dialogMode === 'add' || dialogMode === 'edit') && selected && (
            <SupplierForm initial={selected} onSave={handleSave} onClose={() => setDialogMode(null)} />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null); }}
        title="Excluir fornecedor"
        description={`Tem certeza que deseja excluir "${deleteTarget?.trade_name}"?`}
        onConfirm={handleDelete}
        confirmLabel="Excluir"
      />
    </div>
  );
}
