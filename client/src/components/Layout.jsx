import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useS } from '../context/StoreContext';

export default function Layout() {
  const { notice } = useS();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="mx-auto w-full max-w-[1320px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
      {notice && <div role="status" className={`fixed bottom-5 right-5 z-50 max-w-sm animate-pop rounded-xl px-4 py-3 text-sm shadow-lift ${notice.type === 'err' ? 'bg-[#C4513F] text-white' : 'bg-espresso text-nude-light'}`}>{notice.msg}</div>}
    </div>
  );
}
