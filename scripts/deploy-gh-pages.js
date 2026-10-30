// Script för att bygga och publicera webbappen till gh-pages på GitHub
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function run(cmd, cwd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

console.log('1. Bygger paket och webbapp...');
run('pnpm --filter @stallbacken/shared build');
run('pnpm --filter @stallbacken/web build');

const distPath = path.resolve('apps/web/dist');
fs.writeFileSync(path.join(distPath, '.nojekyll'), '');

console.log('2. Publicerar till gh-pages bransch...');
try {
  run('git fetch origin gh-pages');
} catch {}

const worktreeDir = path.resolve('../HTG-gh-pages');
if (fs.existsSync(worktreeDir)) {
  fs.rmSync(worktreeDir, { recursive: true, force: true });
}

run(`git worktree add "${worktreeDir}" gh-pages`);
fs.cpSync(distPath, worktreeDir, { recursive: true, force: true });

run('git add -A', worktreeDir);
try {
  run('git commit -m "dist: uppdatera GitHub Pages"', worktreeDir);
  run('git push origin gh-pages', worktreeDir);
} catch {
  console.log('Inga nya ändringar att publicera.');
}

run(`git worktree remove "${worktreeDir}"`);
console.log('Klart! Webbsidan är uppdaterad på https://0hellsten.github.io/HTG/');
