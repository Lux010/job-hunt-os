const TOKEN_KEY = 'jhos_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = t => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch('/api' + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function uploadResume(file) {
  const token = getToken();
  const fd = new FormData();
  fd.append('resume', file);
  const res = await fetch('/api/resume/upload', {
    method: 'POST',
    headers: token ? { Authorization: 'Bearer ' + token } : {},
    body: fd
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export function downloadCSV() {
  const token = getToken();
  fetch('/api/csv/export.csv', {
    headers: token ? { Authorization: 'Bearer ' + token } : {}
  })
    .then(res => {
      if (!res.ok) throw new Error('export failed');
      return res.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'job-hunt-os.csv';
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch(err => alert(err.message));
}
