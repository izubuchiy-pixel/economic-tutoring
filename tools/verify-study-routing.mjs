import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { courseCategories, courseStudyLinks } from './university-study-routing.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceFile = path.join(root, 'tools/university-curricula.json');
const source = fs.readFileSync(sourceFile, 'utf8');
const { universities } = JSON.parse(source);
const allowedCategories = new Set(['math', 'micro', 'macro', 'statistics', 'econometrics', 'data', 'other']);
const counts = { universities: universities.length, courses: 0, links: 0, categories: {} };

function targetFile(href) {
  const route = href.split('#')[0];
  if (route.endsWith('/')) return path.join(root, route, 'index.html');
  return path.join(root, `${route}.html`);
}

for (const university of universities) {
  for (const [index, course] of university.courses.entries()) {
    counts.courses++;
    const categories = courseCategories(course);
    const links = courseStudyLinks(university, course, index);
    const context = `${university.slug}: ${course.name}`;
    assert.ok(categories.length && new Set(categories).size === categories.length, context);
    categories.forEach(category => {
      assert.ok(allowedCategories.has(category), `${context}: ${category}`);
      counts.categories[category] = (counts.categories[category] ?? 0) + 1;
    });
    assert.ok(links.length, context);
    assert.equal(new Set(links.map(link => link.href)).size, links.length, context);
    counts.links += links.length;
    for (const { href, label } of links) {
      assert.ok(href.startsWith('/') && label, context);
      assert.ok(!href.includes('#curriculum'), `${context}: must leave the official course accordion`);
      const file = targetFile(href);
      assert.ok(fs.existsSync(file), `${context}: missing ${file}`);
      const anchor = href.split('#')[1];
      if (anchor) assert.ok(fs.readFileSync(file, 'utf8').includes(`id="${anchor}"`), `${context}: missing #${anchor}`);
      if (/epsilon-delta/.test(href)) assert.match(`${course.topics ?? ''} ${course.studyFocus ?? ''}`, /極限|ε.?δ|イプシロン/, context);
      if (href === '/#proof-example') assert.match(`${course.topics ?? ''} ${course.studyFocus ?? ''}`, /証明/, context);
    }
    if (/財政|金融|経済史|社会経済|資本の原理/.test(course.name)) {
      assert.ok(links.every(link => link.href.startsWith('/subjects#')), `${context}: no matching guide claimed`);
    }
  }
}

assert.deepEqual(courseCategories({ name: 'ミクロ・マクロ経済学入門' }), ['micro', 'macro']);
assert.deepEqual(courseCategories({ name: '経済数学基礎／統計学基礎' }), ['math', 'statistics']);
assert.deepEqual(courseCategories({ name: '統計情報処理Ⅰ' }), ['statistics', 'data']);
assert.deepEqual(courseCategories({ name: '金融論', studyFocus: 'ミクロと統計を確認' }), ['other']);

const keio = universities.find(university => university.slug === 'keio');
assert.ok(courseStudyLinks(keio, keio.courses[0], 0).some(link => link.href.endsWith('#math1')));
assert.ok(courseStudyLinks(keio, keio.courses[0], 0).some(link => link.href.endsWith('#math2')));
assert.ok(courseStudyLinks(keio, keio.courses[2], 2).some(link => link.href.endsWith('#calculus')));
assert.ok(courseStudyLinks(keio, keio.courses[2], 2).some(link => link.href === '/#proof-example'));
assert.equal(fs.readFileSync(sourceFile, 'utf8'), source, 'Official source data must stay untouched');
console.log(JSON.stringify({ status: 'PASS', ...counts }, null, 2));
