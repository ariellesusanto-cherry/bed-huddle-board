/**
 * Bundles the Vite build output into one self-contained HTML file so the
 * prototype can be opened from a single link with no server.
 *
 * Usage: npm run build && node scripts/build-standalone.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const assets = join('dist', 'assets');
const files = readdirSync(assets);
const js = files.find((f) => f.endsWith('.js'));
const css = files.find((f) => f.endsWith('.css'));

if (!js || !css) {
  throw new Error('Run `npm run build` first — dist/assets is missing output.');
}

const styles = readFileSync(join(assets, css), 'utf8');
const script = readFileSync(join(assets, js), 'utf8');

if (script.includes('</script')) {
  throw new Error('Bundle contains a closing script tag; inlining is unsafe.');
}

// No <!doctype>, <html>, <head> or <body> tags: the Artifact host supplies them.
const html = `<title>Patient Flow Board</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">
<style>
${styles}
</style>
<div id="root"></div>
<script type="module">
${script}
</script>
`;

writeFileSync(join('artifact', 'patient-flow-board.html'), html);
console.log(
  `Wrote artifact/patient-flow-board.html (${(html.length / 1024).toFixed(0)} KB)`,
);
