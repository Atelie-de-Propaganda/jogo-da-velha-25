import { useState, useMemo } from 'react';
import { Pencil, Trash2, Plus, Clock } from 'lucide-react';
import { getCCTVDevices, saveCCTVDevice, deleteCCTVDevice, getCCTVMaintenances, saveCCTVMaintenance, getSuppliers } from '../data/dataService';
import { exportCSV } from '../lib/csvExport';
import type { CCTVDevice, CCTVMaintenance } from '../types/arsenal';
import { useAuth } from '../contexts/AuthContext';
import PasswordField from '../components/arsenal/PasswordField';
import ConfirmDialog from '../components/arsenal/ConfirmDialog';
import ModuleHeader from '../components/arsenal/ModuleHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EMPTY_DEVICE: CCTVDevice = {
  id: '', name: '', brand: '', model: '', ip_address: '', port: '80',
  camera_count: 1, camera_locations: '', maintenance_supplier_id: '',
  credentials: { login: '', password: '' }, notes: '',
  created_at: '', updated_at: '',
};

const EMPTY_MAINTENANCE: CCTVMaintenance = {
  id: '', cctv_id: '', date: '', description: '', technician: '', created_at: '',
};

function DeviceForm({ initial, onSave, onClose }: { initial: CCTVDevice; onSave: (d: CCTVDevice) => void; onClose: () => void }) {
  const [form, setForm] = useState<CCTVDevice>({ ...initial });
  const suppliers = getSuppliers().filter(s => s.type === 'cftv' || s.type === 'ti' || s.type === 'outros');
  const inputCls = "w-full bg-[#2a2a28] border border-[#3a3a38] text-white text-sm px-3 py-2 rounded outline-none focus:border-[#FFE600] transition-colors";
  const labelCls = "block text-xs text-[#D8D59D] mb-1";
  function set(key: keyof CCTVDevice, val: string | number) { setForm(p => ({ ...p, [key]: val })); }
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
          <label className={labelCls}>Marca</label>
          <input className={inputCls} value={form.brand} onChange={e => set('brand', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Modelo</label>
          <input className={inputCls} value={form.model} onChange={e => set('model', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Endereço IP <span className="text-red-400">*</span></label>
          <input className={inputCls} value={form.ip_address} onChange={e => set('ip_address', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Porta</label>
          <input className={inputCls} value={form.port} onChange={e => set('port', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Número de Câmeras <span className="text-red-400">*</span></label>
          <input type="number" min={1} className={inputCls} value={form.camera_count} onChange={e => set('camera_count', parseInt(e.target.value))} required />
        </div>
        <div>
          <label className={labelCls}>Empresa de Manutenção</label>
          <select className={inputCls} value={form.maintenance_supplier_id ?? ''} onChange={e => set('maintenance_supplier_id', e.target.value)}>
            <option value="">Selecionar...</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.trade_name}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Localização das Câmeras</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={form.camera_locations} onChange={e => set('camera_locations', e.target.value)} placeholder="ex: Recepção (2), Entrada (1)..." />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Observações</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
        </div>
        <div className="col-span-2 border-t border-[#2a2a28] pt-3">
          <p className="text-xs font-medium text-[#D8D59D] mb-3">Credenciais de acesso</p>
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

function MaintenanceForm({ cctvId, cctvName, onSave, onClose }: { cctvId: string; cctvName: string; onSave: (m: CCTVMaintenance) => void; onClose: () => void }) {
  const [form, setForm] = useState<CCTVMaintenance>({ ...EMPTY_MAINTENANCE, cctv_id: cctvId });
  const inputCls = "w-full bg-[#2a2a28] border border-[#3a3a38] text-white text-sm px-3 py-2 rounded outline-none focus:border-[#FFE600] transition-colors";
  const labelCls = "block text-xs text-[#D8D59D] mb-1";

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-3">
      <p className="text-xs text-[#a0a09e]">Registrar manutenção em: <strong className="text-white">{cctvName}</strong></p>
      <div>
        <label className={labelCls}>Data <span className="text-red-400">*</span></label>
        <input type="date" className={inputCls} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
      </div>
      <div>
        <label className={labelCls}>Técnico <span className="text-red-400">*</span></label>
        <input className={inputCls} value={form.technician} onChange={e => setForm(p => ({ ...p, technician: e.target.value }))} required />
      </div>
      <div>
        <label className={labelCls}>Descrição <span className="text-red-400">*</span></label>
        <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-[#2a2a28]">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#a0a09e] border border-[#3a3a38] rounded hover:bg-[#2a2a28] transition-colors">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm bg-[#FFE600] text-[#1A1A19] font-semibold rounded hover:bg-[#FFE600]/90 transition-colors">Registrar</button>
      </div>
    </form>
  );
}

export default function CCTV() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<CCTVDevice[]>(() => getCCTVDevices());
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view' | 'maintenance' | null>(null);
  const [selected, setSelected] = useState<CCTVDevice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CCTVDevice | null>(null);
  const [maintenances, setMaintenances] = useState<CCTVMaintenance[]>(() => getCCTVMaintenances());
  const suppliers = useMemo(() => getSuppliers(), []);

  function refresh() {
    setDevices(getCCTVDevices());
    setMaintenances(getCCTVMaintenances());
  }

  function handleSave(device: CCTVDevice) {
    if (!user) return;
    saveCCTVDevice(device, user.id, user.name);
    refresh();
    setDialogMode(null);
  }

  function handleDelete() {
    if (!deleteTarget || !user) return;
    deleteCCTVDevice(deleteTarget.id, deleteTarget.name, user.id, user.name);
    refresh();
    setDeleteTarget(null);
  }

  function handleSaveMaintenance(m: CCTVMaintenance) {
    if (!user || !selected) return;
    saveCCTVMaintenance(m, user.id, user.name, selected.name);
    refresh();
    setDialogMode('view');
  }

  return (
    <div>
      <ModuleHeader
        title="CFTV"
        count={devices.length}
        onAdd={() => { setSelected({ ...EMPTY_DEVICE }); setDialogMode('add'); }}
        onExport={() => exportCSV('arsenal-cftv.csv', devices.map(d => ({
          Nome: d.name, Marca: d.brand, Modelo: d.model, IP: d.ip_address,
          Porta: d.port, Câmeras: d.camera_count, Localizações: d.camera_locations,
        })))}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.length === 0 && (
          <div className="col-span-2 text-center py-12 text-[#606060] text-sm">Nenhum equipamento cadastrado.</div>
        )}
        {devices.map(device => {
          const deviceMaintenances = maintenances.filter(m => m.cctv_id === device.id);
          const lastMaintenance = deviceMaintenances[0];
          const supplierName = device.maintenance_supplier_id
            ? suppliers.find(s => s.id === device.maintenance_supplier_id)?.trade_name : null;

          return (
            <div
              key={device.id}
              className="arsenal-card rounded p-4 cursor-pointer hover:border-[#3a3a38] transition-colors"
              onClick={() => { setSelected(device); setDialogMode('view'); }}
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">{device.name}</h3>
                  <p className="text-xs text-[#606060]">{device.brand} {device.model}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-[#FFE600]">{device.camera_count}</div>
                  <div className="text-xs text-[#a0a09e]">câmeras</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-xs text-[#606060]">IP</p>
                  <p className="text-xs font-mono text-[#D8D59D]">{device.ip_address}:{device.port}</p>
                </div>
                {supplierName && (
                  <div>
                    <p className="text-xs text-[#606060]">Manutenção</p>
                    <p className="text-xs text-[#a0a09e]">{supplierName}</p>
                  </div>
                )}
              </div>
              {lastMaintenance && (
                <div className="bg-[#2a2a28] rounded px-3 py-2 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-[#606060] flex-shrink-0" />
                  <div>
                    <span className="text-xs text-[#606060]">Última manutenção: </span>
                    <span className="text-xs text-[#a0a09e]">
                      {format(new Date(lastMaintenance.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-[#2a2a28]" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => { setSelected(device); setDialogMode('maintenance'); }}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-[#a0a09e] hover:text-[#FFE600] border border-[#3a3a38] hover:border-[#FFE600]/50 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" />Manutenção
                </button>
                <button onClick={() => { setSelected(device); setDialogMode('edit'); }} className="p-1.5 text-[#a0a09e] hover:text-[#FFE600] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => setDeleteTarget(device)} className="p-1.5 text-[#a0a09e] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={dialogMode !== null && dialogMode !== 'maintenance'} onOpenChange={open => { if (!open) setDialogMode(null); }}>
        <DialogContent className="bg-[#222221] border-[#3a3a38] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#FFE600]">
              {dialogMode === 'add' ? 'Novo Equipamento CFTV' : dialogMode === 'edit' ? `Editar: ${selected?.name}` : selected?.name}
            </DialogTitle>
          </DialogHeader>

          {dialogMode === 'view' && selected && (
            <Tabs defaultValue="info">
              <TabsList className="bg-[#2a2a28] border border-[#3a3a38] h-8">
                <TabsTrigger value="info" className="text-xs data-[state=active]:bg-[#FFE600] data-[state=active]:text-[#1A1A19]">Informações</TabsTrigger>
                <TabsTrigger value="credentials" className="text-xs data-[state=active]:bg-[#FFE600] data-[state=active]:text-[#1A1A19]">Credenciais</TabsTrigger>
                <TabsTrigger value="history" className="text-xs data-[state=active]:bg-[#FFE600] data-[state=active]:text-[#1A1A19]">Manutenções ({maintenances.filter(m => m.cctv_id === selected.id).length})</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-[#D8D59D]">Marca / Modelo</p><p className="text-sm text-white">{selected.brand} {selected.model}</p></div>
                  <div><p className="text-xs text-[#D8D59D]">IP / Porta</p><p className="text-sm font-mono text-white">{selected.ip_address}:{selected.port}</p></div>
                  <div><p className="text-xs text-[#D8D59D]">Câmeras</p><p className="text-2xl font-bold text-[#FFE600]">{selected.camera_count}</p></div>
                  {selected.maintenance_supplier_id && (
                    <div><p className="text-xs text-[#D8D59D]">Manutenção</p>
                      <p className="text-sm text-white">{suppliers.find(s => s.id === selected.maintenance_supplier_id)?.trade_name || '—'}</p>
                    </div>
                  )}
                </div>
                {selected.camera_locations && (
                  <div><p className="text-xs text-[#D8D59D] mb-1">Localização das Câmeras</p>
                    <p className="text-sm text-white bg-[#2a2a28] p-3 rounded">{selected.camera_locations}</p>
                  </div>
                )}
                {selected.notes && <div className="bg-[#2a2a28] p-3 rounded text-sm text-white">{selected.notes}</div>}
              </TabsContent>
              <TabsContent value="credentials" className="mt-4">
                {selected.credentials ? (
                  <div className="space-y-4 bg-[#2a2a28] p-4 rounded border border-[#3a3a38]">
                    <div><p className="text-xs text-[#D8D59D] mb-1">Login</p><p className="text-sm font-mono text-white">{selected.credentials.login || '—'}</p></div>
                    <div><p className="text-xs text-[#D8D59D] mb-1">Senha</p>
                      <PasswordField value={selected.credentials.password} module="cftv" assetId={selected.id} assetName={selected.name} />
                    </div>
                  </div>
                ) : <p className="text-sm text-[#606060]">Nenhuma credencial cadastrada.</p>}
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs text-[#a0a09e]">Histórico de manutenções</p>
                  <button
                    onClick={() => setDialogMode('maintenance')}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-[#FFE600] text-[#1A1A19] font-medium rounded hover:bg-[#FFE600]/90"
                  >
                    <Plus className="w-3 h-3" />Registrar
                  </button>
                </div>
                {maintenances.filter(m => m.cctv_id === selected.id).length === 0 ? (
                  <p className="text-sm text-[#606060]">Nenhuma manutenção registrada.</p>
                ) : (
                  <div className="space-y-2">
                    {maintenances.filter(m => m.cctv_id === selected.id).map(m => (
                      <div key={m.id} className="bg-[#2a2a28] p-3 rounded border-l-2 border-[#FFE600]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-[#FFE600]">{format(new Date(m.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          <span className="text-xs text-[#606060]">por {m.technician}</span>
                        </div>
                        <p className="text-sm text-white">{m.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          {(dialogMode === 'add' || dialogMode === 'edit') && selected && (
            <DeviceForm initial={selected} onSave={handleSave} onClose={() => setDialogMode(null)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === 'maintenance'} onOpenChange={open => { if (!open) setDialogMode(selected ? 'view' : null); }}>
        <DialogContent className="bg-[#222221] border-[#3a3a38] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#FFE600]">Registrar Manutenção</DialogTitle>
          </DialogHeader>
          {selected && (
            <MaintenanceForm
              cctvId={selected.id}
              cctvName={selected.name}
              onSave={handleSaveMaintenance}
              onClose={() => setDialogMode(selected ? 'view' : null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null); }}
        title="Excluir equipamento CFTV"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        confirmLabel="Excluir"
      />
    </div>
  );
}
