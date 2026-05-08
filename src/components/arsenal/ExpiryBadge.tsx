import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { daysUntilExpiry, getExpiryStatus } from '../../data/dataService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExpiryBadgeProps {
  date?: string;
  showDate?: boolean;
}

export default function ExpiryBadge({ date, showDate = true }: ExpiryBadgeProps) {
  const status = getExpiryStatus(date);
  const days = daysUntilExpiry(date);

  if (!status || !date) return <span className="text-[#606060] text-sm">—</span>;

  const formatted = format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });

  if (status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded expiry-danger font-medium">
        <XCircle className="w-3 h-3" />
        Vencido {showDate && `· ${formatted}`}
      </span>
    );
  }
  if (status === 'danger') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded expiry-danger font-medium">
        <AlertTriangle className="w-3 h-3" />
        {days}d {showDate && `· ${formatted}`}
      </span>
    );
  }
  if (status === 'warning') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded expiry-warning font-medium">
        <Clock className="w-3 h-3" />
        {days}d {showDate && `· ${formatted}`}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded expiry-ok">
      <CheckCircle className="w-3 h-3" />
      {showDate ? formatted : `${days}d`}
    </span>
  );
}
