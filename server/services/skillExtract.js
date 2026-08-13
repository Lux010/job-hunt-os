const AI_BASE = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const DICT = [
  'React', 'React Native', 'Next.js', 'Nuxt.js', 'Vue.js', 'Angular', 'Svelte', 'Redux',
  'TypeScript', 'JavaScript', 'jQuery', 'HTML5', 'CSS3', 'Sass', 'SCSS', 'Tailwind CSS',
  'Bootstrap', 'Material UI',
  'Node.js', 'Express', 'Nest.js', 'Fastify', 'GraphQL', 'REST API',
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'DynamoDB', 'SQL', 'NoSQL',
  'Prisma', 'Sequelize', 'Mongoose',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Firebase', 'Terraform', 'Nginx',
  'Linux', 'Jenkins', 'GitHub Actions', 'CI/CD',
  'Python', 'Django', 'Flask', 'FastAPI', 'Ruby', 'Rails', 'PHP', 'Laravel', 'Java',
  'Spring Boot', 'Kotlin', 'Swift', 'C#', 'C++', 'Go',
  'Jest', 'Mocha', 'Cypress', 'Playwright', 'Vitest', 'Testing Library', 'Selenium',
  'Git', 'GitHub', 'GitLab', 'Webpack', 'Vite', 'Babel', 'npm', 'pnpm', 'Yarn',
  'JIRA', 'Figma', 'Postman', 'Kafka', 'RabbitMQ', 'Elasticsearch',
  'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Machine Learning', 'LangChain', 'OpenAI',
  'Agile', 'Scrum'
];

function esc(s) {
  return s.replace(/[.+*?^${}()|[\]\\]/g, '\\$&');
}

export function keywordExtractSkills(text) {
  const lower = text.toLowerCase();
  return DICT.filter(skill => {
    if (skill === 'Go') return /\bGo\b/.test(text);
    return new RegExp('\\b' + esc(skill).toLowerCase() + '\\b').test(lower);
  });
}

async function aiExtractSkills(text) {
  const res = await fetch(AI_BASE + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content:
            'You extract the skills a job candidate lists on their resume. Reply with JSON only: ' +
            'an array of strings like ["React","Node.js","Docker"]. Use concise standard skill ' +
            'names (max 4 words), no duplicates, no empty strings, max 40 entries, ordered by ' +
            'how prominent they are in the resume.'
        },
        { role: 'user', content: text.slice(0, 6000) }
      ]
    })
  });
  if (!res.ok) throw new Error('AI API returned ' + res.status);
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const arrStr = raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1);
  const arr = JSON.parse(arrStr);
  if (!Array.isArray(arr)) throw new Error('AI did not return a list of skills');
  return arr.map(s => String(s).trim()).filter(Boolean).slice(0, 40);
}

export async function extractSkillsFromText(text) {
  if (process.env.OPENAI_API_KEY) {
    try {
      return { skills: await aiExtractSkills(text), source: 'ai' };
    } catch (err) {
      console.warn('[resume] AI extraction failed, using keyword matcher:', err.message);
    }
  }
  return { skills: keywordExtractSkills(text), source: 'keyword' };
}

export function mergeSkills(existing, candidates) {
  const seen = new Set((existing || []).map(s => String(s).toLowerCase()));
  const added = [];
  for (const c of candidates) {
    const key = c.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      added.push(c);
    }
  }
  return { skills: [...(existing || []), ...added], added };
}
