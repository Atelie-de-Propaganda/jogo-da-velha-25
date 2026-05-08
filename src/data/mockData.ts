import type {
  ArsenalUser, Machine, NetworkDevice, Supplier,
  CCTVDevice, CCTVMaintenance, License, HistoryEvent,
} from '../types/arsenal';

export const DEMO_USERS: ArsenalUser[] = [
  { id: 'u1', name: 'Carlos Mendes', email: 'admin@arsenal.com', role: 'admin', active: true, created_at: '2024-01-15T10:00:00Z' },
  { id: 'u2', name: 'Ricardo TI', email: 'ti@arsenal.com', role: 'ti_externo', active: true, created_at: '2024-02-01T10:00:00Z' },
  { id: 'u3', name: 'Ana Lima', email: 'equipe@arsenal.com', role: 'equipe_interna', active: true, created_at: '2024-02-10T10:00:00Z' },
  { id: 'u4', name: 'Beatriz Souza', email: 'beatriz@atelie.com.br', role: 'equipe_interna', active: true, created_at: '2024-03-01T10:00:00Z' },
  { id: 'u5', name: 'Felipe Moraes', email: 'felipe@atelie.com.br', role: 'equipe_interna', active: false, created_at: '2024-01-20T10:00:00Z' },
];

export const DEMO_MACHINES: Machine[] = [
  {
    id: 'm1', name: 'iMac Elias', type: 'desktop', brand: 'Apple', model: 'iMac 27" 2021',
    serial_number: 'C02ZD1XVMD6T', patrimony_number: 'PAT-001', responsible_user: 'Elias Costa',
    location: 'Sala de Criação', status: 'em_uso', acquisition_date: '2021-06-15',
    os: 'macOS', os_version: 'Ventura 13.6', notes: 'Máquina principal da criação.',
    credentials: { login: 'elias', password: 'Atelie@2024' },
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-11-01T14:30:00Z',
  },
  {
    id: 'm2', name: 'MacBook Ana', type: 'notebook', brand: 'Apple', model: 'MacBook Pro M2 14"',
    serial_number: 'FVFXG3J2Q05P', patrimony_number: 'PAT-002', responsible_user: 'Ana Lima',
    location: 'Sala de Atendimento', status: 'em_uso', acquisition_date: '2023-03-20',
    os: 'macOS', os_version: 'Sonoma 14.2',
    credentials: { login: 'ana.lima', password: 'MacBook@2023' },
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-10-15T10:00:00Z',
  },
  {
    id: 'm3', name: 'Impressora Recepção', type: 'impressora', brand: 'HP', model: 'LaserJet Pro M428fdw',
    serial_number: 'VNB3K21049', responsible_user: 'Recepção',
    location: 'Recepção', status: 'em_uso', acquisition_date: '2022-08-10',
    credentials: { login: 'admin', password: 'hp@2022' },
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-09-05T11:00:00Z',
  },
  {
    id: 'm4', name: 'Dell Criação 01', type: 'desktop', brand: 'Dell', model: 'OptiPlex 7090',
    serial_number: 'DLLX9KP2', patrimony_number: 'PAT-004', responsible_user: 'Bruno Carvalho',
    location: 'Sala de Criação', status: 'em_uso', acquisition_date: '2022-02-05',
    os: 'Windows', os_version: '11 Pro',
    credentials: { login: 'bruno', password: 'Dell@4321' },
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-08-20T09:00:00Z',
  },
  {
    id: 'm5', name: 'Notebook Estoque', type: 'notebook', brand: 'Lenovo', model: 'ThinkPad E14',
    serial_number: 'LNV2023X77', responsible_user: 'TI',
    location: 'Estoque TI', status: 'estoque', acquisition_date: '2021-11-30',
    os: 'Windows', os_version: '10 Pro',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-06-01T09:00:00Z',
  },
  {
    id: 'm6', name: 'iPhone Direção', type: 'celular', brand: 'Apple', model: 'iPhone 15 Pro',
    serial_number: 'DNPX3RQWYZ12', patrimony_number: 'PAT-006', responsible_user: 'Carlos Mendes',
    location: 'Diretoria', status: 'em_uso', acquisition_date: '2023-10-01',
    credentials: { login: 'carlos', password: 'Apple@iP15' },
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-10-01T09:00:00Z',
  },
  {
    id: 'm7', name: 'TV Sala Reunião', type: 'tv', brand: 'Samsung', model: 'Smart TV 65" QN65Q80C',
    serial_number: 'SMTV2023B12', patrimony_number: 'PAT-007', responsible_user: 'TI',
    location: 'Sala de Reunião', status: 'em_uso', acquisition_date: '2023-01-15',
    credentials: { login: 'admin', password: 'samsung123' },
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-01-15T09:00:00Z',
  },
  {
    id: 'm8', name: 'Desktop Manutenção', type: 'desktop', brand: 'Dell', model: 'OptiPlex 5070',
    serial_number: 'DLLX4TY9', responsible_user: 'TI',
    location: 'Sala TI', status: 'manutencao', acquisition_date: '2020-06-10',
    os: 'Windows', os_version: '10 Pro',
    notes: 'HD com problema, aguardando peça.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-11-15T14:00:00Z',
  },
];

export const DEMO_NETWORK: NetworkDevice[] = [
  {
    id: 'n1', name: 'Servidor Principal', type: 'servidor', brand: 'Dell', model: 'PowerEdge R740',
    ip_address: '192.168.1.10', management_ip: '192.168.1.10',
    dns: '8.8.8.8, 8.8.4.4', gateway: '192.168.1.1',
    network_segment: 'Rede Interna (192.168.1.0/24)',
    os: 'Windows Server 2022', location: 'Sala de Servidores',
    credentials: { login: 'administrator', password: 'SrvAtelie@2023!' },
    notes: 'Servidor principal de arquivos e domínio.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-11-01T10:00:00Z',
  },
  {
    id: 'n2', name: 'Roteador Principal', type: 'roteador', brand: 'Mikrotik', model: 'hEX RB750Gr3',
    ip_address: '192.168.1.1', management_ip: '192.168.1.1',
    dns: '8.8.8.8', gateway: '189.40.xx.1',
    network_segment: 'Gateway Internet',
    location: 'Rack Principal',
    credentials: { login: 'admin', password: 'Mikro@Atelie2024' },
    notes: 'Roteador principal, gerencia NAT e firewall.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-10-20T10:00:00Z',
  },
  {
    id: 'n3', name: 'Switch Core', type: 'switch', brand: 'TP-Link', model: 'TL-SG1024DE',
    ip_address: '192.168.1.2', management_ip: '192.168.1.2',
    location: 'Rack Principal',
    credentials: { login: 'admin', password: 'Switch@Core2024' },
    notes: '24 portas, VLAN configurada para rede de visitantes.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-09-10T10:00:00Z',
  },
  {
    id: 'n4', name: 'AP Criação', type: 'access_point', brand: 'Ubiquiti', model: 'UniFi U6-Lite',
    ip_address: '192.168.1.51', management_ip: '192.168.1.1',
    network_segment: 'Wireless Interna',
    location: 'Sala de Criação',
    credentials: { login: 'admin', password: 'unifi@2024' },
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-07-01T10:00:00Z',
  },
  {
    id: 'n5', name: 'NAS Backup', type: 'servidor', brand: 'Synology', model: 'DS923+',
    ip_address: '192.168.1.20', management_ip: '192.168.1.20',
    location: 'Sala de Servidores',
    credentials: { login: 'admin', password: 'NasSync@2024' },
    notes: 'Backup diário automático às 02h. Capacidade 16TB.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-11-05T10:00:00Z',
  },
];

export const DEMO_SUPPLIERS: Supplier[] = [
  {
    id: 's1', corporate_name: 'Claro S.A.', trade_name: 'Claro Empresas',
    type: 'internet',
    commercial_contact_name: 'Paulo Figueiredo', commercial_contact_phone: '(11) 98765-4321', commercial_contact_email: 'paulo.figueiredo@claro.com.br',
    technical_contact_name: 'Suporte Técnico Claro', technical_contact_phone: '0800 721 1234', technical_contact_email: 'suporte@claro.com.br',
    contract_number: 'CLR-2022-8871', contract_start: '2022-03-01', contract_end: '2025-02-28',
    monthly_value: 890.00, notes: 'Fibra 500Mbps dedicada. Uptime garantido 99.5%.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-10-01T09:00:00Z',
  },
  {
    id: 's2', corporate_name: 'Vivo S.A.', trade_name: 'Vivo Empresas',
    type: 'telefonia',
    commercial_contact_name: 'Mariana Costa', commercial_contact_phone: '(11) 97654-3210', commercial_contact_email: 'mariana.costa@vivo.com.br',
    contract_number: 'VIV-2023-4421', contract_start: '2023-01-01', contract_end: '2026-01-15',
    monthly_value: 1450.00, notes: '8 linhas corporativas com plano de dados ilimitado.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-09-01T09:00:00Z',
  },
  {
    id: 's3', corporate_name: 'TechSolutions LTDA', trade_name: 'TechSolutions',
    type: 'ti',
    commercial_contact_name: 'Ricardo Alves', commercial_contact_phone: '(11) 3456-7890', commercial_contact_email: 'ricardo@techsolutions.com.br',
    technical_contact_name: 'Suporte TechSolutions', technical_contact_phone: '(11) 3456-7891', technical_contact_email: 'suporte@techsolutions.com.br',
    contract_number: 'TS-2024-0112', contract_start: '2024-01-01', contract_end: '2025-01-15',
    monthly_value: 2200.00, notes: 'Suporte técnico presencial mensal + remoto ilimitado.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-11-01T09:00:00Z',
  },
  {
    id: 's4', corporate_name: 'SecureCam Brasil LTDA', trade_name: 'SecureCam',
    type: 'cftv',
    commercial_contact_name: 'Fernanda Rocha', commercial_contact_phone: '(11) 2233-4455', commercial_contact_email: 'fernanda@securecam.com.br',
    technical_contact_name: 'Equipe Técnica SecureCam', technical_contact_phone: '(11) 2233-4456', technical_contact_email: 'tecnico@securecam.com.br',
    contract_number: 'SC-2023-0089', contract_start: '2023-06-01', contract_end: '2026-05-31',
    monthly_value: 580.00, notes: 'Manutenção trimestral das câmeras e DVR.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-06-01T09:00:00Z',
  },
];

export const DEMO_CCTV: CCTVDevice[] = [
  {
    id: 'c1', name: 'DVR Principal', brand: 'Intelbras', model: 'MHDX 3116',
    ip_address: '192.168.1.100', port: '8080',
    credentials: { login: 'admin', password: 'Atelie@CFTV2023' },
    camera_count: 16,
    camera_locations: 'Recepção (2), Entrada (2), Estacionamento (3), Corredor (2), Sala de Criação (2), Sala de Reunião (2), Sala Servidores (1), Financeiro (2)',
    maintenance_supplier_id: 's4',
    notes: 'Gravação 24/7, retenção de 30 dias. HD 4TB.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-10-15T10:00:00Z',
  },
  {
    id: 'c2', name: 'NVR Externo', brand: 'Hikvision', model: 'DS-7608NI-K2',
    ip_address: '192.168.1.101', port: '8000',
    credentials: { login: 'admin', password: 'HIK@Extern2024' },
    camera_count: 4,
    camera_locations: 'Fachada (2), Garagem (2)',
    maintenance_supplier_id: 's4',
    notes: 'Câmeras IP externas com visão noturna 50m.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-08-10T10:00:00Z',
  },
];

export const DEMO_CCTV_MAINTENANCES: CCTVMaintenance[] = [
  {
    id: 'cm1', cctv_id: 'c1', date: '2024-09-15',
    description: 'Manutenção preventiva trimestral. Limpeza das câmeras e verificação de conexões.',
    technician: 'Técnico João (SecureCam)',
    created_at: '2024-09-15T15:00:00Z',
  },
  {
    id: 'cm2', cctv_id: 'c1', date: '2024-06-12',
    description: 'Substituição de câmera na Recepção (CAM-01) por dano físico.',
    technician: 'Técnico João (SecureCam)',
    created_at: '2024-06-12T11:00:00Z',
  },
  {
    id: 'cm3', cctv_id: 'c2', date: '2024-10-20',
    description: 'Verificação de alinhamento das câmeras externas. Ajuste de ângulo câmera fachada.',
    technician: 'Técnico Pedro (SecureCam)',
    created_at: '2024-10-20T14:00:00Z',
  },
];

export const DEMO_LICENSES: License[] = [
  {
    id: 'l1', software_name: 'Adobe Creative Cloud', version: '2024',
    type: 'anual', license_key: 'ADBE-CC24-XXXX-XXXX-1234',
    seats: 5, renewal_date: '2025-04-30',
    responsible_user: 'Carlos Mendes',
    notes: '5 assentos para equipe de criação.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-04-30T09:00:00Z',
  },
  {
    id: 'l2', software_name: 'Microsoft 365 Business', version: 'E3',
    type: 'anual', license_key: 'M365-BIZ-XXXX-XXXX-5678',
    seats: 15, renewal_date: '2025-06-15',
    responsible_user: 'Carlos Mendes',
    notes: 'Inclui Teams, Exchange, SharePoint.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-06-15T09:00:00Z',
  },
  {
    id: 'l3', software_name: 'AutoCAD LT', version: '2024',
    type: 'anual', license_key: 'ACAD-LT24-XXXX-YYYY-9012',
    seats: 2, renewal_date: '2025-01-20',
    responsible_user: 'Elias Costa',
    notes: 'Licenças para projetos de sinalização.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-01-20T09:00:00Z',
  },
  {
    id: 'l4', software_name: 'Kaspersky Endpoint Security', version: '12',
    type: 'anual', license_key: 'KASP-EP12-XXXX-ZZZZ-3456',
    seats: 20, renewal_date: '2025-03-10',
    responsible_user: 'Ricardo TI',
    notes: 'Proteção para todos os workstations.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-03-10T09:00:00Z',
  },
  {
    id: 'l5', software_name: 'Slack', version: 'Pro',
    type: 'mensal', seats: 20,
    renewal_date: '2025-05-10',
    responsible_user: 'Carlos Mendes',
    notes: 'Comunicação interna da equipe.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2025-04-10T09:00:00Z',
  },
  {
    id: 'l6', software_name: 'Git (GitHub Enterprise)', version: 'Cloud',
    type: 'mensal', seats: 10,
    renewal_date: '2025-05-15',
    responsible_user: 'Ricardo TI',
    notes: 'Repositórios privados.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2025-04-15T09:00:00Z',
  },
  {
    id: 'l7', software_name: 'Linux Ubuntu Server', version: '22.04 LTS',
    type: 'open_source', seats: 1,
    responsible_user: 'Ricardo TI',
    notes: 'Sistema do NAS de backup.',
    created_at: '2024-01-10T09:00:00Z', updated_at: '2024-01-10T09:00:00Z',
  },
];

export const DEMO_HISTORY: HistoryEvent[] = [
  {
    id: 'h1', timestamp: '2025-05-08T14:30:00Z', user_name: 'Carlos Mendes', user_id: 'u1',
    module: 'machines', asset_id: 'm1', asset_name: 'iMac Elias',
    action: 'Credenciais reveladas',
    description: 'Visualizou credenciais de acesso do ativo iMac Elias.',
  },
  {
    id: 'h2', timestamp: '2025-05-08T11:15:00Z', user_name: 'Ricardo TI', user_id: 'u2',
    module: 'network', asset_id: 'n1', asset_name: 'Servidor Principal',
    action: 'Registro atualizado',
    description: 'Atualizou notas e credenciais do Servidor Principal.',
  },
  {
    id: 'h3', timestamp: '2025-05-07T16:45:00Z', user_name: 'Carlos Mendes', user_id: 'u1',
    module: 'licenses', asset_id: 'l1', asset_name: 'Adobe Creative Cloud',
    action: 'Registro criado',
    description: 'Cadastrou licença Adobe Creative Cloud com 5 assentos.',
  },
  {
    id: 'h4', timestamp: '2025-05-07T10:00:00Z', user_name: 'Carlos Mendes', user_id: 'u1',
    module: 'auth', asset_id: 'u2', asset_name: 'Ricardo TI',
    action: 'Usuário criado',
    description: 'Criou usuário Ricardo TI com perfil TI Externo.',
  },
  {
    id: 'h5', timestamp: '2025-05-06T09:20:00Z', user_name: 'Ricardo TI', user_id: 'u2',
    module: 'machines', asset_id: 'm8', asset_name: 'Desktop Manutenção',
    action: 'Status atualizado',
    description: 'Alterou status de "Em uso" para "Manutenção". Nota: HD com problema.',
  },
  {
    id: 'h6', timestamp: '2025-05-05T15:30:00Z', user_name: 'Carlos Mendes', user_id: 'u1',
    module: 'suppliers', asset_id: 's3', asset_name: 'TechSolutions',
    action: 'Contrato renovado',
    description: 'Atualizou data de vencimento do contrato para 15/01/2025.',
  },
  {
    id: 'h7', timestamp: '2025-05-04T11:00:00Z', user_name: 'Ricardo TI', user_id: 'u2',
    module: 'cftv', asset_id: 'c1', asset_name: 'DVR Principal',
    action: 'Manutenção registrada',
    description: 'Registrou manutenção preventiva trimestral realizada em 15/09.',
  },
  {
    id: 'h8', timestamp: '2025-05-03T14:00:00Z', user_name: 'Carlos Mendes', user_id: 'u1',
    module: 'machines', asset_id: 'm6', asset_name: 'iPhone Direção',
    action: 'Registro criado',
    description: 'Cadastrou iPhone 15 Pro como celular corporativo da Diretoria.',
  },
  {
    id: 'h9', timestamp: '2025-05-02T09:45:00Z', user_name: 'Ricardo TI', user_id: 'u2',
    module: 'network', asset_id: 'n5', asset_name: 'NAS Backup',
    action: 'Credenciais reveladas',
    description: 'Visualizou credenciais de acesso do NAS de Backup.',
  },
  {
    id: 'h10', timestamp: '2025-05-01T16:00:00Z', user_name: 'Carlos Mendes', user_id: 'u1',
    module: 'auth', asset_id: 'u1', asset_name: 'Carlos Mendes',
    action: 'Login',
    description: 'Login realizado com sucesso no sistema.',
  },
];
