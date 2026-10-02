import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Btn } from './ui';

export default function Drawer({ onClose, children }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, []);
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-espresso/50 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full w-full max-w-[500px] animate-slide-in overflow-auto border-l border-cream-200 bg-cream p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <Btn sm className="float-right" onClick={onClose}><X size={14} /> Close</Btn>
        {children}
      </div>
    </div>
  );
}
