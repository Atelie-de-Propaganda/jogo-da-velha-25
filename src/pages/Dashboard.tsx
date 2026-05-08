import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Network, Building2, Camera, FileKey2, AlertTriangle, History, Users, ArrowRight } from 'lucide-react';
import { getMachines, getNetworkDevices, getSuppliers, getCCTVDevices, getLicenses, getHistory, getExpiryStatus } from '../data/dataService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MODULE_LABELS } from '../types/arsenal';
import { useAuth } from '../contexts/AuthContext';

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub?: string;
  to: string;
  alert?: number;
}

function StatCard({ icon: Icon, label, value, sub, to, alert }: StatCardProps) {
  return (
    <Link
      to={to}
      className="arsenal-card rounded p-4 flex items-start gap-4 hover:border-[#3a3a38] transition-colors group"
    >
      <div className="p-2.5 bg-[#FFE600]/10 rounded flex-shrink-0">
        <Icon className="w-5 h-5 text-[#FFE600]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{value}</span>
          {alert != null && alert > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
              <AlertTriangle className="w-3 h-3" />
              {alert} alerta{alert > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="text-sm text-[#a0a09e] mt-0.5">{label}</div>
        {sub && <div className="text-xs text-[#606060] mt-0.5">{sub}</div>}
      </div>
      <ArrowRight className="w-4 h-4 text-[#3a3a38] group-hover:text-[#FFE600] transition-colors flex-shrink-0 mt-1" />
    </Link>
  );
}

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  machines: Monitor,
  network: Network,
  suppliers: Building2,
  cftv: Camera,
  licenses: FileKey2,
  users: Users,
  auth: Users,
};

export default function Dashboard() {
  const { isAdmin } = useAuth();

  const data = useMemo(() => {
    const machines = getMachines();
    const network = getNetworkDevices();
    const suppliers = getSuppliers();
    const cctv = getCCTVDevices();
    const licenses = getLicenses();
    const history = getHistory().slice(0, 10);

    const supplierAlerts = suppliers.filter(s => {
      const st = getExpiryStatus(s.contract_end);
      return st === 'danger' || st === 'warning' || st === 'expired';
    }).length;

    const licenseAlerts = licenses.filter(l => {
      const st = getExpiryStatus(l.renewal_date);
      return st === 'danger' || st === 'warning' || st === 'expired';
    }).length;

    return { machines, network, suppliers, cctv, licenses, history, supplierAlerts, licenseAlerts };
  }, []);

  const expiring = useMemo(() => {
    const items: Array<{ name: string; type: string; date: string; path: string }> = [];
    data.suppliers.forEach(s => {
      if (s.contract_end && (getExpiryStatus(s.contract_end) === 'danger' || getExpiryStatus(s.contract_end) === 'warning' || getExpiryStatus(s.contract_end) === 'expired')) {
        items.push({ name: s.trade_name, type: 'Contrato', date: s.contract_end, path: '/suppliers' });
      }
    });
    data.licenses.forEach(l => {
      if (l.renewal_date && (getExpiryStatus(l.renewal_date) === 'danger' || getExpiryStatus(l.renewal_date) === 'warning' || getExpiryStatus(l.renewal_date) === 'expired')) {
        items.push({ name: l.software_name, type: 'Licença', date: l.renewal_date, path: '/licenses' });
      }
    });
    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <StatCard icon={Monitor} label="Máquinas" value={data.machines.length}
          sub={`${data.machines.filter(m => m.status === 'em_uso').length} em uso`}
          to="/machines" />
        <StatCard icon={Network} label="Rede e Servidor" value={data.network.length}
          sub="dispositivos de rede"
          to="/network" />
        <StatCard icon={Building2} label="Fornecedores" value={data.suppliers.length}
          to="/suppliers" alert={data.supplierAlerts} />
        <StatCard icon={Camera} label="CFTV" value={data.cctv.length}
          sub={`${data.cctv.reduce((acc, c) => acc + c.camera_count, 0)} câmeras`}
          to="/cctv" />
        <StatCard icon={FileKey2} label="Licenças" value={data.licenses.length}
          to="/licenses" alert={data.licenseAlerts} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Expiry alerts */}
        {expiring.length > 0 && (
          <div className="arsenal-card rounded p-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Vencimentos Próximos</h3>
              <span className="ml-auto text-xs text-amber-400 bg-amber-900/30 border border-amber-900/50 px-2 py-0.5 rounded">
                {expiring.length} item{expiring.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {expiring.map((item, i) => {
                const status = getExpiryStatus(item.date);
                return (
                  <Link
                    key={i}
                    to={item.path}
                    className="flex items-center justify-between py-2 border-b border-[#2a2a28] last:border-0 hover:text-[#FFE600] transition-colors group"
                  >
                    <div>
                      <span className="text-sm text-white group-hover:text-[#FFE600]">{item.name}</span>
                      <span className="text-xs text-[#606060] ml-2">{item.type}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      status === 'expired' ? 'expiry-danger' :
                      status === 'danger' ? 'expiry-danger' : 'expiry-warning'
                    }`}>
                      {format(new Date(item.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Machine status breakdown */}
        <div className="arsenal-card rounded p-4">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-[#FFE600]" />
            <h3 className="text-sm font-semibold text-white">Status das Máquinas</h3>
          </div>
          <div className="space-y-2">
            {[
              { status: 'em_uso', label: 'Em uso', cls: 'bg-green-500' },
              { status: 'estoque', label: 'Estoque', cls: 'bg-blue-500' },
              { status: 'manutencao', label: 'Manutenção', cls: 'bg-yellow-500' },
              { status: 'descartado', label: 'Descartado', cls: 'bg-red-500' },
            ].map(({ status, label, cls }) => {
              const count = data.machines.filter(m => m.status === status).length;
              const pct = data.machines.length ? Math.round((count / data.machines.length) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cls.replace('bg-', '') }}></div>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cls}`}></div>
                  <span className="text-sm text-[#a0a09e] w-24">{label}</span>
                  <div className="flex-1 bg-[#2a2a28] rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${cls}`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="text-sm text-white w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent history */}
      <div className="arsenal-card rounded p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#FFE600]" />
            <h3 className="text-sm font-semibold text-white">Últimas Atividades</h3>
          </div>
          <Link to="/history" className="text-xs text-[#a0a09e] hover:text-[#FFE600] transition-colors">
            Ver histórico completo →
          </Link>
        </div>
        <div className="space-y-0">
          {data.history.map((event, i) => {
            const Icon = MODULE_ICONS[event.module] || History;
            return (
              <div key={event.id} className={`flex items-start gap-3 py-2.5 ${i < data.history.length - 1 ? 'border-b border-[#1f1f1e]' : ''}`}>
                <div className="p-1.5 bg-[#2a2a28] rounded flex-shrink-0 mt-0.5">
                  <Icon className="w-3 h-3 text-[#a0a09e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm text-white">{event.action}</span>
                    <span className="text-xs text-[#a0a09e]">em {event.asset_name}</span>
                    <span className="text-xs text-[#D8D59D] bg-[#2a2a28] px-1.5 py-0.5 rounded">
                      {MODULE_LABELS[event.module]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#606060]">por {event.user_name}</span>
                    <span className="text-[#3a3a38]">·</span>
                    <span className="text-xs text-[#606060]">
                      {format(new Date(event.timestamp), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick links for admin */}
      {isAdmin && (
        <div className="arsenal-card rounded p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#FFE600]" />
            <h3 className="text-sm font-semibold text-white">Administração</h3>
          </div>
          <div className="flex gap-3">
            <Link
              to="/users"
              className="flex items-center gap-2 px-3 py-2 bg-[#2a2a28] border border-[#3a3a38] rounded text-sm text-[#a0a09e] hover:text-white hover:border-[#FFE600] transition-colors"
            >
              <Users className="w-4 h-4" />
              Gerenciar usuários
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-2 px-3 py-2 bg-[#2a2a28] border border-[#3a3a38] rounded text-sm text-[#a0a09e] hover:text-white hover:border-[#FFE600] transition-colors"
            >
              Configurações
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
