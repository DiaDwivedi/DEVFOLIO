// Terminal typing animation -- vanilla JS, no dependencies.
// Types out a command, then reveals a mock API response.

const typedLineEl = document.getElementById('typed-line');
const outputEl = document.getElementById('terminal-output');

const command = 'curl /score/1 -H "Authorization: Bearer <token>"';

const response =
`{
  "user_id": 1,
  "financial_stability_score": 63.1,
  "features": {
    "spending_volatility": 0.601,
    "savings_rate": 0.242
  }
}`;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function typeText(el, text, speed, onDone) {
  let i = 0;
  function step() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(step, speed);
    } else if (onDone) {
      onDone();
    }
  }
  step();
}

function highlightJSON(json) {
  // Minimal, safe highlighting: wrap keys and values in spans.
  return json
    .replace(/"([^"]+)":/g, '<span class="key">"$1"</span>:')
    .replace(/: ("[^"]*"|[\d.]+)/g, ': <span class="val">$1</span>');
}

function revealOutput() {
  outputEl.innerHTML = highlightJSON(response);
}

if (prefersReducedMotion) {
  // Respect reduced motion: show final state immediately, no animation.
  typedLineEl.textContent = command;
  revealOutput();
} else {
  typeText(typedLineEl, command, 35, () => {
    setTimeout(revealOutput, 400);
  });
}

// ---------------------------------------------------------------------
// Live Persona demo -- a real TF-IDF + cosine similarity implementation
// running entirely client-side, in vanilla JS. Same algorithm as the
// Python version, reimplemented from scratch for the browser.
// ---------------------------------------------------------------------

const MOVIES = [
  { id: 1, title: "Galaxy Raiders", genres: "sci-fi action adventure", tags: "space battle heist rebellion" },
  { id: 2, title: "The Last Cipher", genres: "thriller mystery", tags: "psychological twist detective conspiracy" },
  { id: 3, title: "Quiet Harbor", genres: "drama romance", tags: "small town slow burn family healing" },
  { id: 4, title: "Nightfall Protocol", genres: "action thriller", tags: "espionage twist betrayal chase" },
  { id: 5, title: "Orbit's Edge", genres: "sci-fi drama", tags: "space isolation survival philosophical" },
  { id: 6, title: "Laugh Track", genres: "comedy", tags: "workplace friendship awkward heartfelt" },
  { id: 7, title: "The Silent Ledger", genres: "thriller drama", tags: "psychological corporate conspiracy twist" },
  { id: 8, title: "Wildfire Season", genres: "drama action", tags: "survival family disaster resilience" },
  { id: 9, title: "Second Chances", genres: "romance drama", tags: "slow burn healing reunion family" },
  { id: 10, title: "Deep Signal", genres: "sci-fi mystery", tags: "first contact conspiracy discovery isolation" },
];

function tokenize(text) {
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

// Build TF-IDF vectors for the whole catalog, once.
function buildTfidfVectors(items) {
  const docs = items.map((m) => tokenize(`${m.genres} ${m.tags}`));
  const vocab = [...new Set(docs.flat())];

  // Document frequency: how many docs contain each term.
  const df = {};
  vocab.forEach((term) => {
    df[term] = docs.filter((doc) => doc.includes(term)).length;
  });

  const N = docs.length;

  return docs.map((doc) => {
    const tf = {};
    doc.forEach((term) => { tf[term] = (tf[term] || 0) + 1; });

    const vector = {};
    vocab.forEach((term) => {
      const termFreq = (tf[term] || 0) / doc.length;
      const idf = Math.log(N / (df[term] || 1)) + 1; // +1 avoids zero for common terms
      vector[term] = termFreq * idf;
    });
    return vector;
  });
}

function cosineSimilarity(vecA, vecB) {
  const terms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, magA = 0, magB = 0;
  terms.forEach((term) => {
    const a = vecA[term] || 0;
    const b = vecB[term] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

const tfidfVectors = buildTfidfVectors(MOVIES);

function recommend(movieId, topK = 3) {
  const idx = MOVIES.findIndex((m) => m.id === movieId);
  if (idx === -1) return [];

  const scores = MOVIES
    .map((movie, i) => ({
      movie,
      score: i === idx ? -1 : cosineSimilarity(tfidfVectors[idx], tfidfVectors[i]),
    }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scores;
}

// Wire up the UI
const movieSelect = document.getElementById('movie-select');
const recommendBtn = document.getElementById('recommend-btn');
const demoOutput = document.getElementById('demo-output');

if (movieSelect && recommendBtn && demoOutput) {
  MOVIES.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.title;
    movieSelect.appendChild(opt);
  });

  demoOutput.innerHTML = '<p class="placeholder">Pick a title and click "Get recommendations" — the similarity is computed live, right here in your browser.</p>';

  recommendBtn.addEventListener('click', () => {
    const selectedId = parseInt(movieSelect.value, 10);
    const results = recommend(selectedId, 3);

    demoOutput.innerHTML = results.map((r) => `
      <div class="result-row">
        <span>${r.movie.title}</span>
        <span class="score">${(r.score * 100).toFixed(1)}% match</span>
      </div>
    `).join('');
  });
}

// ---------------------------------------------------------------------
// Scroll reveal for project cards, using IntersectionObserver.
// ---------------------------------------------------------------------
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const projectEls = document.querySelectorAll('.project');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  projectEls.forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll('.project').forEach((el) => el.classList.add('is-visible'));
}