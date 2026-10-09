import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const mathGuide = '/guides/economics-math-basics';
const statisticsGuide = '/guides/university-statistics-study-order';
const routeCache = new Map();

// These are the subjects of the existing ET examples, not syllabus summaries.
const universityExamples = {
  waseda: { micro: '需要・供給と均衡', macro: 'GDPと所得の式' },
  keio: { micro: '予算制約と選択', macro: '消費と所得決定' },
  rikkyo: { micro: '外部性と社会的費用', macro: '失業率と指標の読み方' },
  'kwansei-gakuin': { micro: '売上・費用と利潤', macro: 'GDPと成長率' },
  sophia: { micro: '税と市場均衡', macro: 'IS-LMの連立式' },
};

function existingSection(href) {
  if (!routeCache.has(href)) {
    const [route, anchor] = href.split('#');
    const file = path.join(root, route.replace(/^\//, ''), 'index.html');
    const exists = fs.existsSync(file) && (!anchor ||
      fs.readFileSync(file, 'utf8').includes(`id="${anchor}"`));
    routeCache.set(href, exists);
  }
  return routeCache.get(href);
}

/** Filter categories describe the named course, not unverified syllabus units. */
export function courseCategories(course) {
  const name = String(course?.name ?? '').normalize('NFKC').toLowerCase();
  const categories = [];
  const add = category => { if (!categories.includes(category)) categories.push(category); };
  if (/数学|微分|積分|線形代数|mathematics|calculus|linear algebra/.test(name)) add('math');
  // This otherwise ambiguous name has mathematical topics confirmed in the source.
  if (/数量経済分析/.test(name) && /微分|積分|線形代数/.test(course?.topics ?? '')) add('math');
  if (/ミクロ|micro|ゲーム理論|game theory/.test(name)) add('micro');
  if (/マクロ|macro/.test(name)) add('macro');
  if (/統計|statistics/.test(name)) add('statistics');
  if (/計量経済|econometrics/.test(name)) add('econometrics');
  if (/データ|情報|\bdata\b|information/.test(name)) add('data');
  return categories.length ? categories : ['other'];
}

function subjectExample(university, subject) {
  const title = universityExamples[university?.slug]?.[subject];
  const href = `/universities/${university?.slug}/${subject}economics/#route`;
  if (title && existingSection(href)) {
    return { href, label: `${subject === 'micro' ? 'ミクロ' : 'マクロ'}の復習例：${title}` };
  }
  return subject === 'micro'
    ? { href: '/guides/micro-marginal-rate-substitution', label: 'ミクロの復習例：予算制約と選択' }
    : { href: '/guides/macro-is-lm-shifts', label: 'マクロの復習例：IS-LMの均衡とシフト' };
}

/**
 * Local learning links stay separate from the untouched university evidence.
 * The index is accepted for the renderer API; matching uses stable names instead.
 */
export function courseStudyLinks(university, course, index) {
  const name = String(course?.name ?? '');
  const focus = `${course?.topics ?? ''} ${course?.studyFocus ?? ''}`;
  const categories = courseCategories(course);
  const links = [];
  const add = (href, label) => {
    if (!links.some(link => link.href === href)) links.push({ href, label });
  };
  const addSection = (href, label) => {
    if (existingSection(href)) add(href, label);
  };

  if (university?.slug === 'keio' && name === '数学概論Ⅰ・Ⅱ') {
    addSection('/universities/keio/economics-math/#math1', '数学概論Ⅰの単元別案内（確認した担当例）');
    addSection('/universities/keio/economics-math/#math2', '数学概論Ⅱの単元別案内（確認した担当例）');
  } else if (university?.slug === 'keio' && name === '微分積分') {
    addSection('/universities/keio/economics-math/#calculus', '微分積分の単元別案内（確認した担当例）');
  } else if (university?.slug === 'keio' && name === '微分積分入門') {
    add(`${mathGuide}#foundations`, '数学の前提を確認：代入・式変形');
    addSection('/universities/keio/economics-math/#calculus', '秋の微分積分への接続を確認（担当例）');
  }

  if (/ゲーム理論|game theory/i.test(name)) {
    add('/guides/game-theory-nash-equilibrium', 'ゲーム理論の復習例：利得表とナッシュ均衡');
  } else if (categories.includes('micro')) {
    const link = subjectExample(university, 'micro');
    add(link.href, link.label);
  }
  if (categories.includes('macro')) {
    const link = subjectExample(university, 'macro');
    add(link.href, link.label);
  }

  if (categories.includes('math')) {
    const hasMathSection = links.some(link => /\/economics-math\/#(?:math1|math2|calculus)$/.test(link.href));
    if (/行列|連立方程式|線形代数/.test(focus)) {
      add('/guides/matrix-linear-equations', '数学の復習例：行列と連立方程式');
    }
    if (!hasMathSection && !links.some(link => link.href === '/guides/matrix-linear-equations')) {
      add(`${mathGuide}#foundations`, '数学の前提を確認：代入・式変形');
    }
    if (/偏微分/.test(focus)) {
      add(`${mathGuide}#partial`, '数学の復習例：何を固定するかと偏微分');
    } else if (/微分/.test(focus) && !hasMathSection) {
      add(`${mathGuide}#derivative`, '数学の復習例：1変数の微分と変化率');
    }
    if (/証明/.test(focus)) {
      add('/#proof-example', '自作授業例：積の微分の証明を一手ずつ確認');
    }
    if (/極限|ε.?δ|イプシロン/.test(focus)) {
      add('/guides/epsilon-delta-definition', '極限の定義を読む補助ガイド（授業で扱う場合）');
    }
  }

  if (categories.includes('statistics')) {
    add(statisticsGuide, '統計の復習例：分布・標準誤差・検定');
  }
  if (categories.includes('econometrics')) {
    add('/guides/econometrics-regression-basics', '計量の復習例：回帰係数の解釈と限界');
    if (/統計|確率|推定/.test(focus)) {
      add(statisticsGuide, '統計の前提を確認：分布・標準誤差・検定');
    }
  }
  if (categories.includes('data')) {
    add(statisticsGuide, '数値を読む前提の復習例：分布と統計指標');
  }

  if (!links.length) {
    add('/subjects#subjects-list', 'ETの対応科目と確認事項を見る');
    add('/subjects#contact', 'この科目の対応可否を資料で相談する');
  }
  return links;
}
