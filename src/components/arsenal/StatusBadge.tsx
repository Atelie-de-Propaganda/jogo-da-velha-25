import type { DeviceStatus } from '../../types/arsenal';
import { DEVICE_STATUS_LABELS } from '../../types/arsenal';

interface StatusBadgeProps {
  status: DeviceStatus;
}

const STATUS_CLASSES: Record<DeviceStatus, string> = {
  em_uso: 'status-em-uso',
  estoque: 'status-estoque',
  manutencao: 'status-manutencao',
  descartado: 'status-descartado',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded font-medium ${STATUS_CLASSES[status]}`}>
      {DEVICE_STATUS_LABELS[status]}
    </span>
  );
}
