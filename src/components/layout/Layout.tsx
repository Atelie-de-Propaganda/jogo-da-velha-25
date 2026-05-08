import Sidebar from './Sidebar';
import Header from './Header';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/machines': 'Máquinas e Dispositivos',
  '/network': 'Rede e Servidor',
  '/suppliers': 'Fornecedores e Contratos',
  '/cctv': 'CFTV',
  '/licenses': 'Licenças de Software',
  '/history': 'Histórico Global',
  '/users': 'Usuários',
  '/settings': 'Configurações',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Arsenal';

  return (
    <div className="flex h-screen overflow-hidden bg-[#1A1A19]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
