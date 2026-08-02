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
