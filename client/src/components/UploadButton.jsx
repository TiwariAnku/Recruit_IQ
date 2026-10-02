import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useS } from '../context/StoreContext';
import { Btn } from './ui';

// Opens the system file explorer; selected CVs are saved via the API (server/uploads/resumes)
export default function UploadButton({ onDone, className = '', label = 'Upload Resume' }) {
  const S = useS(), ref = useRef(null);
  const pick = async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    await S.upload(files);
    onDone?.();
  };
  return (
    <>
      <input ref={ref} type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="hidden" onChange={pick} />
      <Btn v="pr" className={className} onClick={() => ref.current.click()}><Upload size={16} /> {label}</Btn>
    </>
  );
}
