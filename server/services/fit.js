function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9+#. -]/g, ' ').replace(/\s+/g, ' ').trim();
}

function skillMatches(skill, jdText) {
  const s = skill.trim();
  if (!s) return false;
  if (s.includes(' ')) return tokenize(jdText).includes(tokenize(s));
  return new RegExp('\\b' + s.replace(/[.+]/g, '\\$&') + '\\b', 'i').test(jdText);
}

export function keywordScore(jd, skills) {
  const jdNorm = tokenize(jd);
  const results = skills.map(skill => ({ skill, present: skillMatches(skill, jdNorm) }));
  const matched = results.filter(r => r.present).map(r => r.skill);
  const missing = results.filter(r => !r.present).map(r => r.skill);
  const score = skills.length ? Math.round((matched.length / skills.length) * 100) : 0;
  return {
    score,
    summary: `Matched ${matched.length} of ${skills.length} tracked skills against this job description.`,
    strengths: matched.slice(0, 5),
    missing: missing.slice(0, 8)
  };
}

async function aiScore(jd, skills) {
  const base = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const res = await fetch(base.replace(/\/$/, '') + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a fair technical recruiter. Given a candidate skill list and a job description, ' +
            'estimate how well the candidate fits. Reply with JSON only: ' +
            '{"score": 0-100 integer, "summary": one sentence, "strengths": [up to 5 strings], "missing": [up to 5 strings]}.'
        },
        { role: 'user', content: 'Candidate skills: ' + skills.join(', ') + '\n\nJob description:\n' + jd }
      ]
    })
  });
  if (!res.ok) throw new Error('AI API returned ' + res.status);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const jsonStr = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
  const parsed = JSON.parse(jsonStr);
  return {
    score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
    summary: parsed.summary || 'Fit analysis complete.',
    strengths: (parsed.strengths || []).slice(0, 5),
    missing: (parsed.missing || []).slice(0, 8)
  };
}

export async function scoreFit(jd, skills) {
  if (process.env.OPENAI_API_KEY) {
    try {
      const r = await aiScore(jd, skills);
      r.usedAI = true;
      return r;
    } catch (err) {
      console.warn('[fit] AI scoring failed, using keyword matcher:', err.message);
    }
  }
  const r = keywordScore(jd, skills);
  r.usedAI = false;
  return r;
}
