import React, { useState } from 'react';
import { api, downloadCSV, uploadResume } from '../api.js';

export default function Settings({ user, setUser, refresh }) {
  const [skills, setSkills] = useState(user.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const [resMsg, setResMsg] = useState(null);
  const [resErr, setResErr] = useState(null);
  const [resBusy, setResBusy] = useState(false);

  async function handleResumeUpload() {
    if (!file) return;
    setResBusy(true);
    setResMsg(null);
    setResErr(null);
    try {
      const r = await uploadResume(file);
      setSkills(r.skills);
      setUser({ ...user, skills: r.skills });
      const via = r.source === 'ai' ? 'AI' : 'keyword matching';
      const addedTxt = r.added.length
        ? `${r.added.length} skill(s) added (${r.added.join(', ')})`
        : 'no new skills needed — everything was already tracked';
      setResMsg(`Parsed ${r.chars.toLocaleString()} characters from your ${r.kind.toUpperCase()}. ` +
        `${r.foundCount} skill(s) found via ${via} — ${addedTxt}.`);
      setFile(null);
    } catch (err) {
      setResErr(err.message);
    } finally {
      setResBusy(false);
    }
  }

  async function saveSkills() {
    setBusy(true);
    setMsg('');
    try {
      const r = await api('/user/skills', { method: 'PUT', body: { skills } });
      setUser({ ...user, skills: r.skills });
      setMsg('Skills saved. The Fit Checker now uses these.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  function addSkill() {
    const s = newSkill.trim();
    if (!s) return;
    if (!skills.includes(s)) setSkills([...skills, s]);
    setNewSkill('');
  }

  function removeSkill(s) {
    setSkills(skills.filter(x => x !== s));
  }

  return (
    <div>
      <h2 className="section-title">Settings <span>— skills, resume &amp; data</span></h2>

      <div className="panel">
        <h3>Resume &amp; AI skills</h3>
        <p style={{ color: 'var(--muted)', fontSize: '.84rem', marginBottom: '.9rem' }}>
          Upload your resume and AI will read it and add the skills it finds automatically.
          You can still add and remove skills manually below.
        </p>
        <div className="export-row">
          <div>
            <b style={{ fontSize: '.9rem' }}>Resume file</b>
            <p style={{ color: 'var(--muted)', fontSize: '.8rem', marginTop: '.15rem' }}>
              PDF, DOCX or TXT (max 3&nbsp;MB). Without an AI API key, a keyword matcher is used instead.
            </p>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              disabled={resBusy}
              onChange={e => {
                setFile(e.target.files[0] || null);
                setResMsg(null);
                setResErr(null);
              }}
              style={{ maxWidth: 340 }}
            />
          </div>
          <button className="btn-grad" onClick={handleResumeUpload} disabled={resBusy || !file}>
            {resBusy ? 'Analyzing…' : 'Extract skills'}
          </button>
        </div>
        {resMsg && <p style={{ marginTop: '.8rem', fontSize: '.84rem', color: 'var(--green)' }}>{resMsg}</p>}
        {resErr && <p style={{ marginTop: '.8rem', fontSize: '.84rem', color: 'var(--red)' }}>{resErr}</p>}
      </div>

      <div className="panel">
        <h3>Your skills</h3>
        <p style={{ color: 'var(--muted)', fontSize: '.84rem', marginBottom: '.9rem' }}>
          Used by the Fit Checker to score job descriptions against your profile.
        </p>
        <div className="skill-editor">
          {skills.map(s => (
            <span className="skill-pill" key={s}>
              {s}
              <button type="button" aria-label={'Remove ' + s} onClick={() => removeSkill(s)}>×</button>
            </span>
          ))}
        </div>
        <div className="add-skill">
          <input
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="Add a skill (e.g. GraphQL)"
          />
          <button className="btn-ghost" onClick={addSkill}>Add</button>
        </div>
        <button className="btn-grad" onClick={saveSkills} disabled={busy} style={{ marginTop: '1rem' }}>
          {busy ? 'Saving…' : 'Save skills'}
        </button>
        {msg && <p style={{ marginTop: '.8rem', fontSize: '.84rem', color: 'var(--cyan)' }}>{msg}</p>}
      </div>

      <div className="panel">
        <h3>Your data</h3>
        <div className="export-row">
          <div>
            <b style={{ fontSize: '.9rem' }}>Export applications</b>
            <p style={{ color: 'var(--muted)', fontSize: '.8rem', marginTop: '.15rem' }}>
              Download everything as a CSV — great for backups or spreadsheets.
            </p>
          </div>
          <button className="btn-ghost" onClick={downloadCSV}>Download CSV</button>
        </div>
      </div>

      <div className="panel">
        <h3>Follow-up reminders</h3>
        <p style={{ color: 'var(--muted)', fontSize: '.84rem', lineHeight: 1.6 }}>
          The server checks every morning (default 09:00) for applications still in <b>Applied</b> for more than{' '}
          7 days and emails you a digest. Configure <code>SMTP_HOST</code>, <code>SMTP_USER</code>,{' '}
          <code>SMTP_PASS</code> and <code>REMINDER_CRON</code> in <code>.env</code> to enable email;
          otherwise digests are written to the server log.
        </p>
      </div>
    </div>
  );
}
