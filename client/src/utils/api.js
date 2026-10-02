// API helper – the Express server saves files into server/uploads/resumes
export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const abs = (u) => (/^(https?:|blob:)/.test(u) ? u : API + u);

export async function uploadFiles(files) {
  const fd = new FormData();
  files.forEach((f) => fd.append('resumes', f));
  const r = await fetch(API + '/api/resumes/upload', { method: 'POST', body: fd });
  if (!r.ok) { const e = new Error((await r.json().catch(() => ({}))).error || 'Upload failed'); e.server = true; throw e; }
  return (await r.json()).files;
}
export async function listFiles() {
  const r = await fetch(API + '/api/resumes');
  if (!r.ok) throw new Error('list failed');
  return (await r.json()).files;
}
