import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Monitor, Network, Building2, Camera, FileKey2 } from 'lucide-react';
import { globalSearch, type SearchResult } from '../../data/dataService';

const TYPE_ICONS: Record<SearchResult['type'], React.ComponentType<{ className?: string }>> = {
  machine: Monitor,
  network: Network,
  supplier: Building2,
  cctv: Camera,
  license: FileKey2,
};

const TYPE_LABELS: Record<SearchResult['type'], string> = {
  machine: 'Máquina',
  network: 'Rede',
  supplier: 'Fornecedor',
  cctv: 'CFTV',
  license: 'Licença',
};

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length >= 2) {
      setResults(globalSearch(query));
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(result: SearchResult) {
    navigate(result.path);
    setQuery('');
    setOpen(false);
  }

  return (
    <header className="flex items-center gap-4 px-6 py-3 border-b border-[#2a2a28] bg-[#1f1f1e]">
      <h1 className="text-base font-medium text-white">{title}</h1>

      <div className="ml-auto relative" ref={dropdownRef}>
        <div className="flex items-center gap-2 bg-[#2a2a28] border border-[#3a3a38] rounded px-3 py-1.5 w-64 focus-within:border-[#FFE600] transition-colors">
          <Search className="w-3.5 h-3.5 text-[#a0a09e] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Busca global..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="bg-transparent text-sm text-white placeholder:text-[#606060] outline-none w-full"
          />
          {query && (
            <button onClick={() => { setQuery(''); setOpen(false); }}>
              <X className="w-3.5 h-3.5 text-[#a0a09e] hover:text-white" />
            </button>
          )}
        </div>

        {open && results.length > 0 && (
          <div className="absolute top-full right-0 mt-1 w-96 bg-[#222221] border border-[#3a3a38] rounded shadow-xl z-50 max-h-80 overflow-y-auto">
            {results.map(r => {
              const Icon = TYPE_ICONS[r.type];
              return (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => handleSelect(r)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#2a2a28] transition-colors text-left"
                >
                  <div className="mt-0.5 p-1.5 bg-[#2a2a28] rounded">
                    <Icon className="w-3.5 h-3.5 text-[#FFE600]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{r.label}</div>
                    <div className="text-xs text-[#a0a09e] truncate">{r.subtitle}</div>
                  </div>
                  <span className="text-[10px] text-[#D8D59D] mt-1 bg-[#2a2a28] px-1.5 py-0.5 rounded flex-shrink-0">
                    {TYPE_LABELS[r.type]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {open && query.length >= 2 && results.length === 0 && (
          <div className="absolute top-full right-0 mt-1 w-64 bg-[#222221] border border-[#3a3a38] rounded shadow-xl z-50 px-4 py-3">
            <p className="text-sm text-[#a0a09e]">Nenhum resultado encontrado.</p>
          </div>
        )}
      </div>
    </header>
  );
}
