import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

// Only these authored entry pages may join tracked HTML in the static build.
// Do not pick up unrelated untracked drafts or social asset folders.
export const entryPages = [
  'parents/index.html',
  'universities/index.html',
  'universities/sophia/economics-math/index.html',
  'universities/kwansei-gakuin/economics-math/index.html',
  'universities/rikkyo/economics-math/index.html'
];
export function siteFiles(root) {
  const tracked = execFileSync('git', ['ls-files', '*.html'], {cwd: root, encoding: 'utf8'}).trim().split('\n').filter(Boolean);
  return [...new Set([...tracked, ...entryPages.filter(f => fs.existsSync(`${root}/${f}`))])];
}
