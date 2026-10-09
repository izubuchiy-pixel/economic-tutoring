// Mechanical merge of individually researched, reviewed public source records.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const research=path.resolve(root,'../../outputs/hp-university-curricula/2026-10-10');
const order=['waseda','keio','gakushuin','meiji','aoyama-gakuin','rikkyo','chuo','hosei','kansai','kwansei-gakuin','doshisha','ritsumeikan','nihon','toyo','komazawa','senshu','kyoto-sangyo','kindai','konan','ryukoku','sophia'];
const universities=['keio','gmarch','kansai','other'].flatMap(name=>JSON.parse(fs.readFileSync(path.join(research,name+'.json'),'utf8')).universities);
if(universities.length!==21||new Set(universities.map(u=>u.slug)).size!==21)throw new Error('Need exactly 21 unique universities');
for(const u of universities)if(!order.includes(u.slug))throw new Error('Unexpected university '+u.slug);
universities.sort((a,b)=>order.indexOf(a.slug)-order.indexOf(b.slug));
// Public build excludes local evidence paths and redundant internal metadata.
const publicUniversities=universities.map(u=>({
 slug:u.slug,school:u.school,faculty:u.faculty,yearLabel:u.yearLabel,scopeNote:u.scopeNote,
 sources:u.sources.map(s=>({id:s.id,title:s.title,url:s.url,year:s.year,evidence:s.evidence})),
 courses:u.courses.map(c=>({...c,studyFocus:c.studyFocus.replace(/^ET復習案：\s*/, '')}))
}));
const merged={schemaVersion:1,confirmedAt:'2026年10月10日',universities:publicUniversities};
fs.writeFileSync(path.join(root,'tools/university-curricula.json'),JSON.stringify(merged,null,2)+'\n');
console.log('Merged 21 universities, '+universities.reduce((n,u)=>n+u.courses.length,0)+' course groups.');
