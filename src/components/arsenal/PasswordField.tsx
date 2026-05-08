import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logPasswordReveal } from '../../data/dataService';
import type { HistoryModule } from '../../types/arsenal';

interface PasswordFieldProps {
  value?: string;
  module: HistoryModule;
  assetId: string;
  assetName: string;
}

export default function PasswordField({ value, module, assetId, assetName }: PasswordFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const { user, canRevealPasswords } = useAuth();

  if (!value) return <span className="text-[#606060] text-sm">—</span>;

  function handleReveal() {
    if (!revealed && user) {
      logPasswordReveal(user.id, user.name, module, assetId, assetName);
    }
    setRevealed(!revealed);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm text-white">
        {revealed ? value : '••••••••'}
      </span>
      {canRevealPasswords && (
        <button
          onClick={handleReveal}
          className="text-[#a0a09e] hover:text-[#FFE600] transition-colors"
          title={revealed ? 'Ocultar' : 'Revelar senha'}
        >
          {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}
