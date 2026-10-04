import { Star } from 'lucide-react';
import { LABELS } from '../utils/feedbackStore';

export default function Stars({ value, onChange }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} role="radio" aria-checked={n === value} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)} className="cursor-pointer p-0.5 transition hover:scale-110">
          <Star size={22} className={n <= value ? 'fill-[#C27A1E] text-[#C27A1E]' : 'text-[#dccfbd]'} />
        </button>
      ))}
      <span className="ml-2 w-36 text-xs text-ink-muted">{value ? LABELS[value - 1] : 'Not rated'}</span>
    </div>
  );
}
