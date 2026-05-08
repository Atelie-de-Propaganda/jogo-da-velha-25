import { useState, useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getNetworkDevices, saveNetworkDevice, deleteNetworkDevice } from '../data/dataService';
import { exportCSV } from '../lib/csvExport';
import type { NetworkDevice, NetworkDeviceType } from '../types/arsenal';
import { NETWORK_TYPE_LABELS } from '../types/arsenal';
import { useAuth } from '../contexts/AuthContext';
import PasswordField from '../components/arsenal/PasswordField';
import ConfirmDialog from '../components/arsenal/ConfirmDialog';
import ModuleHeader from '../components/arsenal/ModuleHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const EMPTY: NetworkDevice = {
  id: '', name: '', type: 'servidor', brand: '', model: '',
  ip_address: '', management_ip: '', dns: '', gateway: '',
  network_segment: '', os: '', location: '',
  credentials: { login: '', password: '' }, notes: '',
  created_at: '', updated_at: '',
};

const TYPE_COLORS: Record<NetworkDeviceType, string> = {
  servidor: 'text-purple-400 bg-purple-900/30 border-purple-900/50',
  roteador: 'text-blue-400 bg-blue-900/30 border-blue-900/50',
  switch: 'text-cyan-400 bg-cyan-900/30 border-cyan-900/50',
  firewall: 'text-red-400 bg-red-900/30 border-red-900/50',
  access_point: 'text-green-400 bg-green-900/30 border-green-900/50',
  outros: 'text-gray-400 bg-gray-900/30 border-gray-700',
};

function NetworkForm({ initial, onSave, onClose }: { initial: NetworkDevice; onSave: (d: NetworkDevice) => void; onClose: () => void }) {
  const [form, setForm] = useState<NetworkDevice>({ ...initial });
  const inputCls = "w-full bg-[#2a2a28] border border-[#3a3a38] text-white text-sm px-3 py-2 rounded outline-none focus:border-[#FFE600] transition-colors";
  const labelCls = "block text-xs text-[#D8D59D] mb-1";

  function set(key: keyof NetworkDevice, val: string) { setForm(p => ({ ...p, [key]: val })); }
  function setCred(key: 'login' | 'password', val: string) {
    setForm(p => ({ ...p, credentials: { ...(p.credentials ?? { login: '', password: '' }), [key]: val } }));
  }

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Nome <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Tipo <span className="text-red-400">*</span></label>
          <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value as NetworkDeviceType)} required>
            {Object.entries(NETWORK_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Localização <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Marca</label>
          <input className={inputCls} value={form.brand} onChange={e => set('brand', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Modelo</label>
          <input className={inputCls} value={form.model} onChange={e => set('model', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Endereço IP <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.ip_address} onChange={e => set('ip_address', e.target.value)} placeholder="192.168.1.x" required />
        </div>
        <div>
          <label className={labelCls}>IP de Gerência</label>
          <input className={inputCls} value={form.management_ip ?? ''} onChange={e => set('management_ip', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>DNS</label>
          <input className={inputCls} value={form.dns ?? ''} onChange={e => set('dns', e.target.value)} placeholder="8.8.8.8, 8.8.4.4" />
        </div>
        <div>
          <label className={labelCls}>Gateway</label>
          <input className={inputCls} value={form.gateway ?? ''} onChange={e => set('gateway', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Segmento de Rede</label>
          <input className={inputCls} value={form.network_segment ?? ''} onChange={e => set('network_segment', e.target.value)} placeholder="192.168.1.0/24" />
        </div>
        <div>
          <label className={labelCls}>Sistema Operacional</label>
          <input className={inputCls} value={form.os ?? ''} onChange={e => set('os', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Observações</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
        </div>
        <div className="col-span-2 border-t border-[#2a2a28] pt-3">
          <p className="text-xs text-[#D8D59D] mb-3 font-medium">Credenciais de acesso</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Login</label>
              <input className={inputCls} value={form.credentials?.login ?? ''} onChange={e => setCred('login', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Senha</label>
              <input type="password" className={inputCls} value={form.credentials?.password ?? ''} onChange={e => setCred('password', e.target.value)} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-[#2a2a28]">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#a0a09e] border border-[#3a3a38] rounded hover:bg-[#2a2a28] transition-colors">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm bg-[#FFE600] text-[#1A1A19] font-semibold rounded hover:bg-[#FFE600]/90 transition-colors">Salvar</button>
      </div>
    </form>
  );
}

export default function Network() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<NetworkDevice[]>(() => getNetworkDevices());
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<NetworkDeviceType | ''>('');
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<NetworkDevice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NetworkDevice | null>(null);

  function refresh() { setDevices(getNetworkDevices()); }

  const filtered = useMemo(() => {
    let list = [...devices];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d => [d.name, d.ip_address, d.brand, d.model, d.location].some(f => f?.toLowerCase().includes(q)));
    }
    if (filterType) list = list.filter(d => d.type === filterType);
    return list;
  }, [devices, search, filterType]);

  function handleSave(device: NetworkDevice) {
    if (!user) return;
    saveNetworkDevice(device, user.id, user.name);
    refresh();
    setDialogMode(null);
  }

  function handleDelete() {
    if (!deleteTarget || !user) return;
    deleteNetworkDevice(deleteTarget.id, deleteTarget.name, user.id, user.name);
    refresh();
    setDeleteTarget(null);
  }

  return (
    <div>
      <ModuleHeader
        title="Rede e Servidor"
        count={filtered.length}
        onAdd={() => { setSelected({ ...EMPTY }); setDialogMode('add'); }}
        onExport={() => exportCSV('arsenal-rede.csv', filtered.map(d => ({
          Nome: d.name, Tipo: NETWORK_TYPE_LABELS[d.type], Marca: d.brand,
          Modelo: d.model, IP: d.ip_address, Localização: d.location,
          DNS: d.dns ?? '', Gateway: d.gateway ?? '', Segmento: d.network_segment ?? '',
        })))}
      />

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome, IP, marca..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-[#222221] border border-[#3a3a38] text-sm text-white px-3 py-1.5 rounded outline-none focus:border-[#FFE600] placeholder:text-[#606060]"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as NetworkDeviceType | '')}
          className="bg-[#222221] border border-[#3a3a38] text-sm text-[#a0a09e] px-3 py-1.5 rounded outline-none focus:border-[#FFE600]"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(NETWORK_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-[#606060] text-sm">Nenhum dispositivo encontrado.</div>
        )}
        {filtered.map(device => (
          <div
            key={device.id}
            className="arsenal-card rounded p-4 cursor-pointer hover:border-[#3a3a38] transition-colors"
            onClick={() => { setSelected(device); setDialogMode('view'); }}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">{device.name}</h3>
                <p className="text-xs text-[#606060] mt-0.5">{device.brand} {device.model}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${TYPE_COLORS[device.type]}`}>
                {NETWORK_TYPE_LABELS[device.type]}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606060] w-16">IP</span>
                <span className="text-xs font-mono text-[#D8D59D]">{device.ip_address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#606060] w-16">Local</span>
                <span className="text-xs text-[#a0a09e]">{device.location}</span>
              </div>
              {device.os && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#606060] w-16">SO</span>
                  <span className="text-xs text-[#a0a09e]">{device.os}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-[#2a2a28]" onClick={e => e.stopPropagation()}>
              <button onClick={() => { setSelected(device); setDialogMode('edit'); }} className="p-1.5 text-[#a0a09e] hover:text-[#FFE600] transition-colors" title="Editar">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeleteTarget(device)} className="p-1.5 text-[#a0a09e] hover:text-red-400 transition-colors" title="Excluir">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogMode !== null} onOpenChange={open => { if (!open) setDialogMode(null); }}>
        <DialogContent className="bg-[#222221] border-[#3a3a38] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#FFE600]">
              {dialogMode === 'add' ? 'Novo Dispositivo' : dialogMode === 'edit' ? `Editar: ${selected?.name}` : selected?.name}
            </DialogTitle>
          </DialogHeader>

          {dialogMode === 'view' && selected && (
            <>
              <Tabs defaultValue="info">
                <TabsList className="bg-[#2a2a28] border border-[#3a3a38] h-8">
                  <TabsTrigger value="info" className="text-xs data-[state=active]:bg-[#FFE600] data-[state=active]:text-[#1A1A19]">Informações</TabsTrigger>
                  <TabsTrigger value="credentials" className="text-xs data-[state=active]:bg-[#FFE600] data-[state=active]:text-[#1A1A19]">Credenciais</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Tipo', NETWORK_TYPE_LABELS[selected.type]], ['Localização', selected.location],
                      ['Marca', selected.brand], ['Modelo', selected.model],
                      ['IP', selected.ip_address], ['IP Gerência', selected.management_ip ?? '—'],
                      ['DNS', selected.dns ?? '—'], ['Gateway', selected.gateway ?? '—'],
                      ['Segmento', selected.network_segment ?? '—'], ['SO', selected.os ?? '—'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs text-[#D8D59D]">{label}</p>
                        <p className="text-sm text-white font-mono">{value}</p>
                      </div>
                    ))}
                  </div>
                  {selected.notes && <div className="bg-[#2a2a28] p-3 rounded text-sm text-white">{selected.notes}</div>}
                </TabsContent>
                <TabsContent value="credentials" className="mt-4">
                  {selected.credentials ? (
                    <div className="space-y-4 bg-[#2a2a28] p-4 rounded border border-[#3a3a38]">
                      <div>
                        <p className="text-xs text-[#D8D59D] mb-1">Login</p>
                        <p className="text-sm font-mono text-white">{selected.credentials.login || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#D8D59D] mb-1">Senha</p>
                        <PasswordField value={selected.credentials.password} module="network" assetId={selected.id} assetName={selected.name} />
                      </div>
                    </div>
                  ) : <p className="text-sm text-[#606060]">Nenhuma credencial cadastrada.</p>}
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[#2a2a28]">
                <button onClick={() => setDialogMode('edit')} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[#3a3a38] text-[#a0a09e] hover:text-white rounded transition-colors">
                  <Pencil className="w-3.5 h-3.5" />Editar
                </button>
                <button onClick={() => { setDeleteTarget(selected); setDialogMode(null); }} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-red-900/50 text-red-400 hover:bg-red-900/20 rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />Excluir
                </button>
              </div>
            </>
          )}
          {(dialogMode === 'add' || dialogMode === 'edit') && selected && (
            <NetworkForm initial={selected} onSave={handleSave} onClose={() => setDialogMode(null)} />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null); }}
        title="Excluir dispositivo"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        confirmLabel="Excluir"
      />
    </div>
  );
}
