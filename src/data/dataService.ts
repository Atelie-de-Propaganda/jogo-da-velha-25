import type {
  Machine, NetworkDevice, Supplier, CCTVDevice, CCTVMaintenance,
  License, HistoryEvent, ArsenalUser, HistoryModule,
} from '../types/arsenal';
import {
  DEMO_MACHINES, DEMO_NETWORK, DEMO_SUPPLIERS, DEMO_CCTV,
  DEMO_CCTV_MAINTENANCES, DEMO_LICENSES, DEMO_HISTORY, DEMO_USERS,
} from './mockData';

function loadOrInit<T>(key: string, defaults: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T[];
  } catch { /* ignore */ }
  const data = [...defaults];
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

const KEYS = {
  machines: 'arsenal_machines',
  network: 'arsenal_network',
  suppliers: 'arsenal_suppliers',
  cctv: 'arsenal_cctv',
  cctv_maintenances: 'arsenal_cctv_maintenances',
  licenses: 'arsenal_licenses',
  history: 'arsenal_history',
  users: 'arsenal_users',
};

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ─── History ─────────────────────────────────────────────────────────────────

export function getHistory(): HistoryEvent[] {
  return loadOrInit<HistoryEvent>(KEYS.history, DEMO_HISTORY)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addHistory(
  userId: string,
  userName: string,
  module: HistoryModule,
  assetId: string,
  assetName: string,
  action: string,
  description: string,
): void {
  const events = loadOrInit<HistoryEvent>(KEYS.history, DEMO_HISTORY);
  events.unshift({
    id: uid(),
    timestamp: new Date().toISOString(),
    user_id: userId,
    user_name: userName,
    module,
    asset_id: assetId,
    asset_name: assetName,
    action,
    description,
  });
  save(KEYS.history, events);
}

// ─── Machines ────────────────────────────────────────────────────────────────

export function getMachines(): Machine[] {
  return loadOrInit<Machine>(KEYS.machines, DEMO_MACHINES);
}

export function saveMachine(machine: Machine, userId: string, userName: string): void {
  const list = getMachines();
  const existing = list.findIndex(m => m.id === machine.id);
  const now = new Date().toISOString();
  if (existing >= 0) {
    list[existing] = { ...machine, updated_at: now };
    addHistory(userId, userName, 'machines', machine.id, machine.name, 'Registro atualizado', `Atualizou dados de ${machine.name}.`);
  } else {
    list.push({ ...machine, id: uid(), created_at: now, updated_at: now });
    addHistory(userId, userName, 'machines', machine.id, machine.name, 'Registro criado', `Cadastrou ${machine.name}.`);
  }
  save(KEYS.machines, list);
}

export function deleteMachine(id: string, name: string, userId: string, userName: string): void {
  const list = getMachines().filter(m => m.id !== id);
  addHistory(userId, userName, 'machines', id, name, 'Registro removido', `Removeu ${name} do sistema.`);
  save(KEYS.machines, list);
}

export function logPasswordReveal(
  userId: string, userName: string,
  module: HistoryModule, assetId: string, assetName: string,
): void {
  addHistory(userId, userName, module, assetId, assetName,
    'Credenciais reveladas', `Visualizou credenciais de acesso de ${assetName}.`);
}

// ─── Network ─────────────────────────────────────────────────────────────────

export function getNetworkDevices(): NetworkDevice[] {
  return loadOrInit<NetworkDevice>(KEYS.network, DEMO_NETWORK);
}

export function saveNetworkDevice(device: NetworkDevice, userId: string, userName: string): void {
  const list = getNetworkDevices();
  const existing = list.findIndex(d => d.id === device.id);
  const now = new Date().toISOString();
  if (existing >= 0) {
    list[existing] = { ...device, updated_at: now };
    addHistory(userId, userName, 'network', device.id, device.name, 'Registro atualizado', `Atualizou dados de ${device.name}.`);
  } else {
    list.push({ ...device, id: uid(), created_at: now, updated_at: now });
    addHistory(userId, userName, 'network', device.id, device.name, 'Registro criado', `Cadastrou ${device.name}.`);
  }
  save(KEYS.network, list);
}

export function deleteNetworkDevice(id: string, name: string, userId: string, userName: string): void {
  const list = getNetworkDevices().filter(d => d.id !== id);
  addHistory(userId, userName, 'network', id, name, 'Registro removido', `Removeu ${name} do sistema.`);
  save(KEYS.network, list);
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export function getSuppliers(): Supplier[] {
  return loadOrInit<Supplier>(KEYS.suppliers, DEMO_SUPPLIERS);
}

export function saveSupplier(supplier: Supplier, userId: string, userName: string): void {
  const list = getSuppliers();
  const existing = list.findIndex(s => s.id === supplier.id);
  const now = new Date().toISOString();
  if (existing >= 0) {
    list[existing] = { ...supplier, updated_at: now };
    addHistory(userId, userName, 'suppliers', supplier.id, supplier.trade_name, 'Registro atualizado', `Atualizou dados de ${supplier.trade_name}.`);
  } else {
    list.push({ ...supplier, id: uid(), created_at: now, updated_at: now });
    addHistory(userId, userName, 'suppliers', supplier.id, supplier.trade_name, 'Registro criado', `Cadastrou fornecedor ${supplier.trade_name}.`);
  }
  save(KEYS.suppliers, list);
}

export function deleteSupplier(id: string, name: string, userId: string, userName: string): void {
  const list = getSuppliers().filter(s => s.id !== id);
  addHistory(userId, userName, 'suppliers', id, name, 'Registro removido', `Removeu fornecedor ${name} do sistema.`);
  save(KEYS.suppliers, list);
}

// ─── CFTV ────────────────────────────────────────────────────────────────────

export function getCCTVDevices(): CCTVDevice[] {
  return loadOrInit<CCTVDevice>(KEYS.cctv, DEMO_CCTV);
}

export function saveCCTVDevice(device: CCTVDevice, userId: string, userName: string): void {
  const list = getCCTVDevices();
  const existing = list.findIndex(d => d.id === device.id);
  const now = new Date().toISOString();
  if (existing >= 0) {
    list[existing] = { ...device, updated_at: now };
    addHistory(userId, userName, 'cftv', device.id, device.name, 'Registro atualizado', `Atualizou dados de ${device.name}.`);
  } else {
    list.push({ ...device, id: uid(), created_at: now, updated_at: now });
    addHistory(userId, userName, 'cftv', device.id, device.name, 'Registro criado', `Cadastrou ${device.name}.`);
  }
  save(KEYS.cctv, list);
}

export function deleteCCTVDevice(id: string, name: string, userId: string, userName: string): void {
  const list = getCCTVDevices().filter(d => d.id !== id);
  addHistory(userId, userName, 'cftv', id, name, 'Registro removido', `Removeu ${name} do sistema.`);
  save(KEYS.cctv, list);
}

export function getCCTVMaintenances(cctvId?: string): CCTVMaintenance[] {
  const all = loadOrInit<CCTVMaintenance>(KEYS.cctv_maintenances, DEMO_CCTV_MAINTENANCES);
  return cctvId ? all.filter(m => m.cctv_id === cctvId) : all;
}

export function saveCCTVMaintenance(maintenance: CCTVMaintenance, userId: string, userName: string, deviceName: string): void {
  const list = getCCTVMaintenances();
  const now = new Date().toISOString();
  list.unshift({ ...maintenance, id: uid(), created_at: now });
  addHistory(userId, userName, 'cftv', maintenance.cctv_id, deviceName, 'Manutenção registrada', maintenance.description);
  save(KEYS.cctv_maintenances, list);
}

// ─── Licenses ────────────────────────────────────────────────────────────────

export function getLicenses(): License[] {
  return loadOrInit<License>(KEYS.licenses, DEMO_LICENSES);
}

export function saveLicense(license: License, userId: string, userName: string): void {
  const list = getLicenses();
  const existing = list.findIndex(l => l.id === license.id);
  const now = new Date().toISOString();
  if (existing >= 0) {
    list[existing] = { ...license, updated_at: now };
    addHistory(userId, userName, 'licenses', license.id, license.software_name, 'Registro atualizado', `Atualizou dados de ${license.software_name}.`);
  } else {
    list.push({ ...license, id: uid(), created_at: now, updated_at: now });
    addHistory(userId, userName, 'licenses', license.id, license.software_name, 'Registro criado', `Cadastrou licença ${license.software_name}.`);
  }
  save(KEYS.licenses, list);
}

export function deleteLicense(id: string, name: string, userId: string, userName: string): void {
  const list = getLicenses().filter(l => l.id !== id);
  addHistory(userId, userName, 'licenses', id, name, 'Registro removido', `Removeu licença ${name} do sistema.`);
  save(KEYS.licenses, list);
}

// ─── Users ───────────────────────────────────────────────────────────────────

export function getUsers(): ArsenalUser[] {
  return loadOrInit<ArsenalUser>(KEYS.users, DEMO_USERS);
}

export function saveUser(user: ArsenalUser, adminId: string, adminName: string): void {
  const list = getUsers();
  const existing = list.findIndex(u => u.id === user.id);
  if (existing >= 0) {
    list[existing] = { ...user };
    addHistory(adminId, adminName, 'users', user.id, user.name, 'Usuário atualizado', `Atualizou dados do usuário ${user.name}.`);
  } else {
    list.push({ ...user, id: uid(), created_at: new Date().toISOString() });
    addHistory(adminId, adminName, 'users', user.id, user.name, 'Usuário criado', `Criou usuário ${user.name} com perfil ${user.role}.`);
  }
  save(KEYS.users, list);
}

export function deleteUser(id: string, name: string, adminId: string, adminName: string): void {
  const list = getUsers().filter(u => u.id !== id);
  addHistory(adminId, adminName, 'users', id, name, 'Usuário removido', `Removeu usuário ${name} do sistema.`);
  save(KEYS.users, list);
}

// ─── Global search ───────────────────────────────────────────────────────────

export interface SearchResult {
  type: 'machine' | 'network' | 'supplier' | 'cctv' | 'license';
  id: string;
  label: string;
  subtitle: string;
  path: string;
}

export function globalSearch(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  getMachines().forEach(m => {
    if ([m.name, m.brand, m.model, m.serial_number, m.location, m.responsible_user].some(f => f?.toLowerCase().includes(q))) {
      results.push({ type: 'machine', id: m.id, label: m.name, subtitle: `${m.brand} ${m.model} · ${m.location}`, path: '/machines' });
    }
  });
  getNetworkDevices().forEach(d => {
    if ([d.name, d.brand, d.model, d.ip_address, d.location].some(f => f?.toLowerCase().includes(q))) {
      results.push({ type: 'network', id: d.id, label: d.name, subtitle: `${d.ip_address} · ${d.location}`, path: '/network' });
    }
  });
  getSuppliers().forEach(s => {
    if ([s.corporate_name, s.trade_name, s.commercial_contact_name, s.contract_number].some(f => f?.toLowerCase().includes(q))) {
      results.push({ type: 'supplier', id: s.id, label: s.trade_name, subtitle: `${s.corporate_name}`, path: '/suppliers' });
    }
  });
  getCCTVDevices().forEach(c => {
    if ([c.name, c.brand, c.model, c.ip_address].some(f => f?.toLowerCase().includes(q))) {
      results.push({ type: 'cctv', id: c.id, label: c.name, subtitle: `${c.ip_address} · ${c.camera_count} câmeras`, path: '/cctv' });
    }
  });
  getLicenses().forEach(l => {
    if ([l.software_name, l.version, l.responsible_user].some(f => f?.toLowerCase().includes(q))) {
      results.push({ type: 'license', id: l.id, label: l.software_name, subtitle: `${l.type} · ${l.seats} assentos`, path: '/licenses' });
    }
  });

  return results.slice(0, 20);
}

// ─── Expiry helpers ──────────────────────────────────────────────────────────

export function daysUntilExpiry(dateStr?: string): number | null {
  if (!dateStr) return null;
  const expiry = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(dateStr?: string): 'expired' | 'danger' | 'warning' | 'ok' | null {
  const days = daysUntilExpiry(dateStr);
  if (days === null) return null;
  if (days < 0) return 'expired';
  if (days <= 15) return 'danger';
  if (days <= 30) return 'warning';
  return 'ok';
}
