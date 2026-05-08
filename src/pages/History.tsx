import { useState, useMemo } from 'react';
import { getHistory } from '../data/dataService';
import type { HistoryEvent, HistoryModule } from '../types/arsenal';
import { MODULE_LABELS } from '../types/arsenal';
import { Monitor, Network, Building2, Camera, FileKey2, Users, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MODULE_ICONS: Record<HistoryModule, React.ComponentType<{ className?: string }>> = {
  machines: Monitor,
  network: Network,
  suppliers: Building2,
  cftv: Camera,
  licenses: FileKey2,
  users: Users,
  auth: Shield,
};

const MODULE_COLORS: Record<HistoryModule, string> = {
  machines: 'text-blue-400 bg-blue-900/30',
  network: 'text-green-400 bg-green-900/30',
  suppliers: 'text-yellow-400 bg-yellow-900/30',
  cftv: 'text-purple-400 bg-purple-900/30',
  licenses: 'text-cyan-400 bg-cyan-900/30',
  users: 'text-orange-400 bg-orange-900/30',
  auth: 'text-[#FFE600] bg-[#FFE600]/10',
};

export default function History() {
  const [filterModule, setFilterModule] = useState<HistoryModule | ''>('');
  const [filterUser, setFilterUser] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  const allEvents = useMemo(() => getHistory(), []);

  const filtered = useMemo(() => {
    let list = [...allEvents];
    if (filterModule) list = list.filter(e => e.module === filterModule);
    if (filterUser) {
      const q = filterUser.toLowerCase();
      list = list.filter(e => e.user_name.toLowerCase().includes(q));
    }
    if (filterDateFrom) list = list.filter(e => e.timestamp >= filterDateFrom);
    if (filterDateTo) list = list.filter(e => e.timestamp <= filterDateTo + 'T23:59:59Z');
    return list;
  }, [allEvents, filterModule, filterUser, filterDateFrom, filterDateTo]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const uniqueUsers = useMemo(() => [...new Set(allEvents.map(e => e.user_name))].sort(), [allEvents]);

  function clearFilters() {
    setFilterModule('');
    setFilterUser('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setPage(1);
  }

  const hasFilters = filterModule || filterUser || filterDateFrom || filterDateTo;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Histórico Global</h2>
          <p className="text-sm text-[#a0a09e] mt-0.5">{filtered.length} evento{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#a0a09e] hover:text-white border border-[#3a3a38] px-3 py-1.5 rounded transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterModule}
          onChange={e => { setFilterModule(e.target.value as HistoryModule | ''); setPage(1); }}
          className="bg-[#222221] border border-[#3a3a38] text-sm text-[#a0a09e] px-3 py-1.5 rounded outline-none focus:border-[#FFE600]"
        >
          <option value="">Todos os módulos</option>
          {Object.entries(MODULE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select
          value={filterUser}
          onChange={e => { setFilterUser(e.target.value); setPage(1); }}
          className="bg-[#222221] border border-[#3a3a38] text-sm text-[#a0a09e] px-3 py-1.5 rounded outline-none focus:border-[#FFE600]"
        >
          <option value="">Todos os usuários</option>
          {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <input
          type="date"
          value={filterDateFrom}
          onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }}
          className="bg-[#222221] border border-[#3a3a38] text-sm text-[#a0a09e] px-3 py-1.5 rounded outline-none focus:border-[#FFE600]"
          title="De"
        />
        <input
          type="date"
          value={filterDateTo}
          onChange={e => { setFilterDateTo(e.target.value); setPage(1); }}
          className="bg-[#222221] border border-[#3a3a38] text-sm text-[#a0a09e] px-3 py-1.5 rounded outline-none focus:border-[#FFE600]"
          title="Até"
        />
      </div>

      {/* Timeline */}
      <div className="arsenal-card rounded overflow-hidden">
        {paginated.length === 0 ? (
          <div className="py-12 text-center text-[#606060] text-sm">Nenhum evento encontrado.</div>
        ) : (
          <div className="divide-y divide-[#1f1f1e]">
            {paginated.map((event: HistoryEvent) => {
              const Icon = MODULE_ICONS[event.module];
              const colors = MODULE_COLORS[event.module];
              return (
                <div key={event.id} className="flex items-start gap-4 px-4 py-3 hover:bg-[#1f1f1e] transition-colors">
                  <div className={`p-2 rounded flex-shrink-0 mt-0.5 ${colors}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-white">{event.action}</span>
                          <span className="text-xs text-[#D8D59D] bg-[#2a2a28] px-1.5 py-0.5 rounded">{MODULE_LABELS[event.module]}</span>
                        </div>
                        <div className="text-xs text-[#a0a09e] mt-0.5">{event.description}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-[#606060]">
                          {format(new Date(event.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                        <div className="text-xs text-[#D8D59D] mt-0.5">{event.user_name}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-[#606060]">
            Exibindo {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-[#3a3a38] text-[#a0a09e] rounded hover:bg-[#2a2a28] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-sm rounded transition-colors ${
                    page === p
                      ? 'bg-[#FFE600] text-[#1A1A19] font-semibold'
                      : 'border border-[#3a3a38] text-[#a0a09e] hover:bg-[#2a2a28]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-[#3a3a38] text-[#a0a09e] rounded hover:bg-[#2a2a28] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
