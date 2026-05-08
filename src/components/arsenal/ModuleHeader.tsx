import { Plus, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ModuleHeaderProps {
  title: string;
  count: number;
  onAdd?: () => void;
  addLabel?: string;
  onExport?: () => void;
  children?: React.ReactNode;
}

export default function ModuleHeader({
  title, count, onAdd, addLabel = 'Novo registro', onExport, children,
}: ModuleHeaderProps) {
  const { isAdmin } = useAuth();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm text-[#a0a09e] mt-0.5">{count} registro{count !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {isAdmin && onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[#3a3a38] text-[#a0a09e] hover:text-white hover:border-[#D8D59D] rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#FFE600] text-[#1A1A19] font-medium rounded hover:bg-[#FFE600]/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
