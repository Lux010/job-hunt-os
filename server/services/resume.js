import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

export async function extractText(filename, buffer) {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (ext === 'txt') {
    const text = buffer.toString('utf8').trim();
    if (!text) throw Object.assign(new Error('That file has no text.'), { status: 422 });
    return { text, kind: 'txt' };
  }
  if (ext === 'pdf') {
    const data = await pdfParse(buffer);
    const text = (data.text || '').trim();
    if (!text) throw Object.assign(new Error('No extractable text found in that PDF.'), { status: 422 });
    return { text, kind: 'pdf' };
  }
  if (ext === 'docx') {
    const r = await mammoth.extractRawText({ buffer });
    const text = (r.value || '').trim();
    if (!text) throw Object.assign(new Error('No extractable text found in that document.'), { status: 422 });
    return { text, kind: 'docx' };
  }
  throw Object.assign(new Error('Unsupported file type — use PDF, DOCX or TXT.'), { status: 400 });
}
