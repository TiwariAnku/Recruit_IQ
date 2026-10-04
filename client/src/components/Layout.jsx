import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Loader2 } from 'lucide-react';
import { useS } from '../context/StoreContext';

export default function Layout() {
  const { notice, busy } = useS();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="mx-auto w-full max-w-[1320px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
      {busy && <div role="status" className="fixed bottom-5 left-1/2 z-50 flex max-w-[92vw] -translate-x-1/2 animate-pop items-center gap-2.5 rounded-xl bg-espresso px-4 py-3 text-sm text-nude-light shadow-lift"><Loader2 size={16} className="animate-spin" /> {busy}</div>}
      {notice && <div role="status" className={`fixed bottom-5 right-5 z-50 max-w-sm animate-pop rounded-xl px-4 py-3 text-sm shadow-lift ${notice.type === 'err' ? 'bg-[#C4513F] text-white' : 'bg-espresso text-nude-light'}`}>{notice.msg}</div>}
    </div>
  );
}
