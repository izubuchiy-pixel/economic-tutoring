import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const read=file=>fs.readFileSync(fileURLToPath(new URL('../'+file,import.meta.url)),'utf8');
const math=read('guides/economics-math-basics.html');
const parents=read('parents/index.html');

// Check displayed results against independent evaluations of the examples.
const cost=q=>q*q+4;
const profit=q=>10*q-q*q-16;
const utility=x=>x*(12-2*x);
const checks=[
 ['C(3) = 3² + 4 = 13',cost(3),13],
 ['C(2) = 2² + 4 = 8',cost(2),8],
 ['20 − 13 = 7',cost(4)-cost(3),7],
 ['12 = 3qより q = 4',12-3*4,0],
 ['π′(2) = 4',8-2*2,4],
 ['2×3×2 = 12',2*3*2,12],
 ['q = 5で9',profit(5),9],
 ['最大値18',utility(3),18]
];
for(const [text,result,expected] of checks) {
 assert.ok(math.includes(text),'missing displayed result: '+text);
 assert.equal(result,expected,text);
}
for(let i=0;i<=600;i++) {
 const x=i/100;
 assert.ok(Math.abs(utility(x)-(18-2*(x-3)**2))<1e-10,'constraint identity');
 assert.ok(utility(x)<=18,'maximum on [0,6]');
 const q=i/10;
 assert.ok(Math.abs(profit(q)-(9-(q-5)**2))<1e-10,'profit identity');
 assert.ok(profit(q)<=9,'sampled profit maximum');
}
assert.equal(utility(0),0);
assert.equal(utility(6),0);
for(const section of ['prepare','learning-example','cost','progress','faq','share','contact']) assert.ok(parents.includes(`id="${section}"`));
for(const boundary of ['説明するための架空例','本人が同意した相手・情報・範囲に限って','無料の個別診断として募集していません','全プランに保護者向け定期報告が付くサービスではありません']) assert.ok(parents.includes(boundary),boundary);
assert.ok(parents.includes('href="/guides/economics-math-basics"'));
assert.ok(math.includes('href="/parents/#share"'));
assert.ok(math.includes('初回相談・体験は60分3,000円'));
console.log(JSON.stringify({ok:true,exampleChecks:checks.length,identities:'profit and utility checked algebraically in page and numerically here',parentSections:7,policyBoundaries:4}));
