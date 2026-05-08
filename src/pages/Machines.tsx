import { useState, useMemo } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { getMachines, saveMachine, deleteMachine } from '../data/dataService';
import { exportCSV } from '../lib/csvExport';
import type { Machine, DeviceType, DeviceStatus } from '../types/arsenal';
import {
  DEVICE_TYPE_LABELS, DEVICE_STATUS_LABELS,
} from '../types/arsenal';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/arsenal/StatusBadge';
import PasswordField from '../components/arsenal/PasswordField';
import ConfirmDialog from '../components/arsenal/ConfirmDialog';
import ModuleHeader from '../components/arsenal/ModuleHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EMPTY: Machine = {
  id: '', name: '', type: 'desktop', brand: '', model: '',
  serial_number: '', patrimony_number: '', responsible_user: '', location: '',
  status: 'em_uso', acquisition_date: '', os: '', os_version: '',
  notes: '', credentials: { login: '', password: '' },
  created_at: '', updated_at: '',
};

function Field({ label, value, required }: { label: string; value?: string | null; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-[#D8D59D] mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {typeof value === 'undefined' ? null : (
        <p className="text-sm text-white">{value || <span className="text-[#606060]">—</span>}</p>
      )}
    </div>
  );
}

function MachineForm({
  initial, onSave, onClose,
}: { initial: Machine; onSave: (m: Machine) => void; onClose: () => void }) {
  const [form, setForm] = useState<Machine>({ ...initial });

  function set(key: keyof Machine, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  function setCredential(key: 'login' | 'password', val: string) {
    setForm(prev => ({ ...prev, credentials: { ...(prev.credentials ?? { login: '', password: '' }), [key]: val } }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  const inputCls = "w-full bg-[#2a2a28] border border-[#3a3a38] text-white text-sm px-3 py-2 rounded outline-none focus:border-[#FFE600] transition-colors";
  const labelCls = "block text-xs text-[#D8D59D] mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Nome/Apelido <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="ex: iMac Elias" required />
        </div>
        <div>
          <label className={labelCls}>Tipo <span className="text-red-400">*</span></label>
          <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value as DeviceType)} required>
            {Object.entries(DEVICE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status <span className="text-red-400">*</span></label>
          <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value as DeviceStatus)} required>
            {Object.entries(DEVICE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Marca <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.brand} onChange={e => set('brand', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Modelo <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.model} onChange={e => set('model', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Número de Série <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.serial_number} onChange={e => set('serial_number', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Número de Patrimônio</label>
          <input className={inputCls} value={form.patrimony_number ?? ''} onChange={e => set('patrimony_number', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Usuário Responsável <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.responsible_user} onChange={e => set('responsible_user', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Localização <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="ex: Sala de Criação" required />
        </div>
        <div>
          <label className={labelCls}>Data de Aquisição</label>
          <input type="date" className={inputCls} value={form.acquisition_date} onChange={e => set('acquisition_date', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Sistema Operacional</label>
          <input className={inputCls} value={form.os ?? ''} onChange={e => set('os', e.target.value)} placeholder="ex: macOS, Windows" />
        </div>
        <div>
          <label className={labelCls}>Versão do SO</label>
          <input className={inputCls} value={form.os_version ?? ''} onChange={e => set('os_version', e.target.value)} placeholder="ex: Sonoma 14.2" />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Observações</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
        </div>
        <div className="col-span-2 border-t border-[#2a2a28] pt-4">
          <p className="text-xs text-[#D8D59D] mb-3 font-medium">Credenciais de acesso</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Login</label>
              <input className={inputCls} value={form.credentials?.login ?? ''} onChange={e => setCredential('login', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Senha</label>
              <input type="password" className={inputCls} value={form.credentials?.password ?? ''} onChange={e => setCredential('password', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-[#2a2a28]">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#a0a09e] border border-[#3a3a38] rounded hover:bg-[#2a2a28] transition-colors">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 text-sm bg-[#FFE600] text-[#1A1A19] font-semibold rounded hover:bg-[#FFE600]/90 transition-colors">
          Salvar
        </button>
      </div>
    </form>
  );
}

function MachineDetail({ machine }: { machine: Machine }) {
  const fieldCls = "grid grid-cols-2 gap-x-4 gap-y-3";
  return (
    <Tabs defaultValue="info" className="mt-1">
      <TabsList className="bg-[#2a2a28] border border-[#3a3a38] h-8">
        <TabsTrigger value="info" className="text-xs data-[state=active]:bg-[#FFE600] data-[state=active]:text-[#1A1A19]">Informações</TabsTrigger>
        <TabsTrigger value="credentials" className="text-xs data-[state=active]:bg-[#FFE600] data-[state=active]:text-[#1A1A19]">Credenciais</TabsTrigger>
      </TabsList>
      <TabsContent value="info" className="mt-4">
        <div className={fieldCls}>
          <Field label="Tipo" value={DEVICE_TYPE_LABELS[machine.type]} />
          <Field label="Status" />
          <div><StatusBadge status={machine.status} /></div>
          <Field label="Marca" value={machine.brand} />
          <Field label="Modelo" value={machine.model} />
          <Field label="Número de Série" value={machine.serial_number} />
          <Field label="Patrimônio" value={machine.patrimony_number || '—'} />
          <Field label="Responsável" value={machine.responsible_user} />
          <Field label="Localização" value={machine.location} />
          <Field label="Aquisição" value={machine.acquisition_date ? format(new Date(machine.acquisition_date), 'dd/MM/yyyy', { locale: ptBR }) : '—'} />
          <Field label="Sistema Operacional" value={machine.os ? `${machine.os} ${machine.os_version ?? ''}`.trim() : '—'} />
        </div>
        {machine.notes && (
          <div className="mt-4">
            <p className="text-xs text-[#D8D59D] mb-1">Observações</p>
            <p className="text-sm text-white bg-[#2a2a28] p-3 rounded">{machine.notes}</p>
          </div>
        )}
      </TabsContent>
      <TabsContent value="credentials" className="mt-4">
        {machine.credentials ? (
          <div className="space-y-4 bg-[#2a2a28] p-4 rounded border border-[#3a3a38]">
            <div>
              <p className="text-xs text-[#D8D59D] mb-1">Login</p>
              <p className="text-sm font-mono text-white">{machine.credentials.login || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[#D8D59D] mb-1">Senha</p>
              <PasswordField
                value={machine.credentials.password}
                module="machines"
                assetId={machine.id}
                assetName={machine.name}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#606060]">Nenhuma credencial cadastrada.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}

export default function Machines() {
  const { user } = useAuth();
  const [machines, setMachines] = useState<Machine[]>(() => getMachines());
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<DeviceType | ''>('');
  const [filterStatus, setFilterStatus] = useState<DeviceStatus | ''>('');
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<Machine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Machine | null>(null);
  const [sortKey, setSortKey] = useState<keyof Machine>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function refresh() { setMachines(getMachines()); }

  const filtered = useMemo(() => {
    let list = [...machines];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        [m.name, m.brand, m.model, m.serial_number, m.location, m.responsible_user].some(f => f?.toLowerCase().includes(q))
      );
    }
    if (filterType) list = list.filter(m => m.type === filterType);
    if (filterStatus) list = list.filter(m => m.status === filterStatus);
    list.sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [machines, search, filterType, filterStatus, sortKey, sortDir]);

  function handleSort(key: keyof Machine) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function handleSave(machine: Machine) {
    if (!user) return;
    saveMachine(machine, user.id, user.name);
    refresh();
    setDialogMode(null);
  }

  function handleDelete() {
    if (!deleteTarget || !user) return;
    deleteMachine(deleteTarget.id, deleteTarget.name, user.id, user.name);
    refresh();
    setDeleteTarget(null);
  }

  function handleExport() {
    exportCSV('arsenal-maquinas.csv', filtered.map(m => ({
      Nome: m.name, Tipo: DEVICE_TYPE_LABELS[m.type], Marca: m.brand, Modelo: m.model,
      Série: m.serial_number, Patrimônio: m.patrimony_number ?? '',
      Responsável: m.responsible_user, Localização: m.location,
      Status: DEVICE_STATUS_LABELS[m.status], Aquisição: m.acquisition_date,
      SO: `${m.os ?? ''} ${m.os_version ?? ''}`.trim(), Observações: m.notes ?? '',
    })));
  }

  function SortIcon({ col }: { col: keyof Machine }) {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />;
  }

  const thCls = "px-4 py-2.5 text-left text-xs font-medium text-[#a0a09e] uppercase tracking-wider cursor-pointer hover:text-white select-none";

  return (
    <div>
      <ModuleHeader
        title="Máquinas e Dispositivos"
        count={filtered.length}
        onAdd={() => { setSelected({ ...EMPTY }); setDialogMode('add'); }}
        onExport={handleExport}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <input
            type="text"
            placeholder="Buscar por nome, marca, série, localização..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-[#222221] border border-[#3a3a38] text-sm text-white px-3 py-1.5 rounded outline-none focus:border-[#FFE600] placeholder:text-[#606060]"
          />
        </div>
        <div className="flex items-center gap-1 text-[#a0a09e]">
          <Filter className="w-3.5 h-3.5" />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as DeviceType | '')}
          className="bg-[#222221] border border-[#3a3a38] text-sm text-[#a0a09e] px-3 py-1.5 rounded outline-none focus:border-[#FFE600]"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(DEVICE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as DeviceStatus | '')}
          className="bg-[#222221] border border-[#3a3a38] text-sm text-[#a0a09e] px-3 py-1.5 rounded outline-none focus:border-[#FFE600]"
        >
          <option value="">Todos os status</option>
          {Object.entries(DEVICE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="arsenal-card rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1f1f1e] border-b border-[#2a2a28]">
              <tr>
                <th className={thCls} onClick={() => handleSort('name')}>
                  <span className="flex items-center">Nome <SortIcon col="name" /></span>
                </th>
                <th className={thCls} onClick={() => handleSort('type')}>
                  <span className="flex items-center">Tipo <SortIcon col="type" /></span>
                </th>
                <th className={thCls}>Marca / Modelo</th>
                <th className={thCls} onClick={() => handleSort('location')}>
                  <span className="flex items-center">Localização <SortIcon col="location" /></span>
                </th>
                <th className={thCls} onClick={() => handleSort('responsible_user')}>
                  <span className="flex items-center">Responsável <SortIcon col="responsible_user" /></span>
                </th>
                <th className={thCls}>Status</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-[#a0a09e] uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1e]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#606060] text-sm">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : filtered.map(machine => (
                <tr
                  key={machine.id}
                  className="arsenal-table-row cursor-pointer"
                  onClick={() => { setSelected(machine); setDialogMode('view'); }}
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-white">{machine.name}</div>
                    <div className="text-xs text-[#606060]">{machine.serial_number}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#a0a09e]">{DEVICE_TYPE_LABELS[machine.type]}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-white">{machine.brand}</div>
                    <div className="text-xs text-[#606060]">{machine.model}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#a0a09e]">{machine.location}</td>
                  <td className="px-4 py-3 text-sm text-[#a0a09e]">{machine.responsible_user}</td>
                  <td className="px-4 py-3"><StatusBadge status={machine.status} /></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setSelected(machine); setDialogMode('edit'); }}
                        className="p-1.5 text-[#a0a09e] hover:text-[#FFE600] transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(machine)}
                        className="p-1.5 text-[#a0a09e] hover:text-red-400 transition-colors"
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
      </div>

      {/* View / Edit / Add dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={open => { if (!open) setDialogMode(null); }}>
        <DialogContent className="bg-[#222221] border-[#3a3a38] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#FFE600]">
              {dialogMode === 'add' ? 'Nova Máquina' : dialogMode === 'edit' ? `Editar: ${selected?.name}` : selected?.name}
            </DialogTitle>
          </DialogHeader>
          {dialogMode === 'view' && selected && <MachineDetail machine={selected} />}
          {(dialogMode === 'add' || dialogMode === 'edit') && selected && (
            <MachineForm initial={selected} onSave={handleSave} onClose={() => setDialogMode(null)} />
          )}
          {dialogMode === 'view' && (
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[#2a2a28]">
              <button
                onClick={() => setDialogMode('edit')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[#3a3a38] text-[#a0a09e] hover:text-white rounded transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </button>
              <button
                onClick={() => { setDeleteTarget(selected); setDialogMode(null); }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-red-900/50 text-red-400 hover:bg-red-900/20 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null); }}
        title="Excluir máquina"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        confirmLabel="Excluir"
      />
    </div>
  );
}
