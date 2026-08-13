import React, { useState } from 'react';
import { api } from '../api.js';

const EXAMPLE_JD = `We're looking for a Full Stack Developer to join our platform team. You'll build React + TypeScript frontends and Node.js APIs backed by MongoDB. Experience with Docker containers and CI/CD pipelines is a strong plus. You'll work in an Agile squad shipping weekly.`;

export default function FitChecker() {
  const [jd, setJd] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function check() {
    setError('');
    setBusy(true);
    try {
      const r = await api('/score', { method: 'POST', body: { jobDescription: jd } });
      setResult(r);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="section-title">Fit Checker <span>— score any job description against your skills</span></h2>
      <div className="fit-grid">
        <div className="panel">
          <h3>Paste a job description</h3>
          <textarea
            rows="12"
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste the full job description here…"
            style={{ marginBottom: '.8rem' }}
          ></textarea>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
            <button className="btn-grad" onClick={check} disabled={busy || jd.trim().length < 20}>
              {busy ? 'Scoring…' : 'Score my fit'}
            </button>
            <button className="btn-ghost" onClick={() => setJd(EXAMPLE_JD)}>Use example</button>
          </div>
          {error && <div className="error" style={{ marginTop: '1rem' }}>{error}</div>}
        </div>

        <div className="panel" style={{ alignSelf: 'start' }}>
          {!result ? (
            <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
              Your skills from Settings are matched against the description — paste a JD and hit "Score my fit".
              When an AI key is configured on the server, scoring uses AI for nuanced analysis.
            </p>
          ) : (
            <div>
              <div
                className="score-ring"
                style={{ '--pct': result.score }}
                role="img"
                aria-label={'Fit score ' + result.score + ' out of 100'}
              >
                <div className="inner">
                  <b>{result.score}</b>
                  <small>/ 100 fit</small>
                </div>
              </div>
              <p className="score-summary">{result.summary}</p>
              <div className="kw-block good">
                <h4>Strengths <span className="tag">{result.strengths.length} matched</span></h4>
                <div className="kws">
                  {result.strengths.length
                    ? result.strengths.map(s => <span className="kw good" key={s}>{s}</span>)
                    : <span className="kw">—</span>}
                </div>
              </div>
              <div className="kw-block warn">
                <h4>Upskill / call out <span className="tag">{result.missing.length} missing</span></h4>
                <div className="kws">
                  {result.missing.length
                    ? result.missing.map(s => <span className="kw warn" key={s}>{s}</span>)
                    : <span className="kw">Nothing missing 🎉</span>}
                </div>
              </div>
              <p className="used-ai">{result.usedAI ? 'Scored with AI' : 'Scored with keyword matching'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
