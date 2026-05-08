export type UserRole = 'admin' | 'ti_externo' | 'equipe_interna';

export interface ArsenalUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
}

// ─── Machines ───────────────────────────────────────────────────────────────

export type DeviceType =
  | 'desktop' | 'notebook' | 'impressora' | 'roteador'
  | 'switch' | 'servidor' | 'celular' | 'tv' | 'monitor' | 'outros';

export type DeviceStatus = 'em_uso' | 'estoque' | 'manutencao' | 'descartado';

export interface Credential {
  login: string;
  password: string;
}

export interface Machine {
  id: string;
  name: string;
  type: DeviceType;
  brand: string;
  model: string;
  serial_number: string;
  patrimony_number?: string;
  responsible_user: string;
  location: string;
  status: DeviceStatus;
  acquisition_date: string;
  os?: string;
  os_version?: string;
  notes?: string;
  credentials?: Credential;
  created_at: string;
  updated_at: string;
}

// ─── Network ─────────────────────────────────────────────────────────────────

export type NetworkDeviceType =
  | 'servidor' | 'roteador' | 'switch' | 'firewall' | 'access_point' | 'outros';

export interface NetworkDevice {
  id: string;
  name: string;
  type: NetworkDeviceType;
  brand: string;
  model: string;
  ip_address: string;
  management_ip?: string;
  dns?: string;
  gateway?: string;
  network_segment?: string;
  os?: string;
  location: string;
  credentials?: Credential;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export type SupplierType = 'telefonia' | 'internet' | 'ti' | 'cftv' | 'outros';

export interface Supplier {
  id: string;
  corporate_name: string;
  trade_name: string;
  type: SupplierType;
  commercial_contact_name: string;
  commercial_contact_phone: string;
  commercial_contact_email: string;
  technical_contact_name?: string;
  technical_contact_phone?: string;
  technical_contact_email?: string;
  contract_number?: string;
  contract_start?: string;
  contract_end?: string;
  monthly_value?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ─── CFTV ────────────────────────────────────────────────────────────────────

export interface CCTVDevice {
  id: string;
  name: string;
  brand: string;
  model: string;
  ip_address: string;
  port: string;
  credentials?: Credential;
  camera_count: number;
  camera_locations: string;
  maintenance_supplier_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CCTVMaintenance {
  id: string;
  cctv_id: string;
  date: string;
  description: string;
  technician: string;
  created_at: string;
}

// ─── Licenses ────────────────────────────────────────────────────────────────

export type LicenseType = 'perpetua' | 'anual' | 'mensal' | 'open_source';

export interface License {
  id: string;
  software_name: string;
  version?: string;
  type: LicenseType;
  license_key?: string;
  seats: number;
  renewal_date?: string;
  responsible_user: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ─── History ─────────────────────────────────────────────────────────────────

export type HistoryModule =
  | 'machines' | 'network' | 'suppliers' | 'cftv' | 'licenses' | 'users' | 'auth';

export interface HistoryEvent {
  id: string;
  timestamp: string;
  user_name: string;
  user_id: string;
  module: HistoryModule;
  asset_id: string;
  asset_name: string;
  action: string;
  description: string;
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  desktop: 'Desktop',
  notebook: 'Notebook',
  impressora: 'Impressora',
  roteador: 'Roteador',
  switch: 'Switch',
  servidor: 'Servidor',
  celular: 'Celular Corporativo',
  tv: 'TV',
  monitor: 'Monitor',
  outros: 'Outros',
};

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  em_uso: 'Em uso',
  estoque: 'Estoque',
  manutencao: 'Manutenção',
  descartado: 'Descartado',
};

export const NETWORK_TYPE_LABELS: Record<NetworkDeviceType, string> = {
  servidor: 'Servidor',
  roteador: 'Roteador',
  switch: 'Switch',
  firewall: 'Firewall',
  access_point: 'Access Point',
  outros: 'Outros',
};

export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  telefonia: 'Telefonia',
  internet: 'Internet',
  ti: 'TI',
  cftv: 'CFTV',
  outros: 'Outros',
};

export const LICENSE_TYPE_LABELS: Record<LicenseType, string> = {
  perpetua: 'Perpétua',
  anual: 'Assinatura Anual',
  mensal: 'Assinatura Mensal',
  open_source: 'Open Source',
};

export const MODULE_LABELS: Record<HistoryModule, string> = {
  machines: 'Máquinas',
  network: 'Rede',
  suppliers: 'Fornecedores',
  cftv: 'CFTV',
  licenses: 'Licenças',
  users: 'Usuários',
  auth: 'Autenticação',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  ti_externo: 'TI Externo',
  equipe_interna: 'Equipe Interna',
};
