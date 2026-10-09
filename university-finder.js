/* Browser-local directory search. Official courses and learning-entry links stay distinct. */
(() => {
  'use strict';

  const finder = document.querySelector('[data-university-finder]');
  if (!finder) return;

  const query = finder.querySelector('#university-query');
  const subject = finder.querySelector('#university-subject');
  const reset = finder.querySelector('[data-finder-reset]');
  const status = finder.querySelector('[data-finder-status]');
  const empty = finder.querySelector('[data-finder-empty]');
  const directory = finder.closest('[data-university-directory]') || document;
  const cards = Array.from(directory.querySelectorAll('article[data-university]'));
  if (!query || !subject || !reset || !status || !empty || !cards.length) return;

  const normalize = (value) => String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u30a1-\u30f6]/g, (character) => String.fromCharCode(character.charCodeAt(0) - 0x60))
    .replace(/慶応/g, '慶應')
    .replace(/\s+/g, ' ')
    .trim();
  const categories = (element) => new Set((element.dataset.categories || '').split(/\s+/).filter(Boolean));
  const openedByFinder = new Map();
  const notes = [];
  let composing = false;

  // Keep the unenhanced page usable if initialization ever encounters incomplete markup.
  const initialHidden = new Map();
  const rememberHidden = (element) => {
    if (!initialHidden.has(element)) initialHidden.set(element, element.hidden);
  };

  try {
    const records = cards.map((card) => {
      rememberHidden(card);
      const heading = card.querySelector('h3');
      const schoolSearch = normalize(card.dataset.universitySearch || `${heading ? heading.textContent : ''} ${card.dataset.university}`);
      const rows = Array.from(card.querySelectorAll('[data-course-entry]')).map((element) => {
        rememberHidden(element);
        return { element, search: normalize(element.dataset.search || element.textContent), categories: categories(element) };
      });
      const disclosures = Array.from(card.querySelectorAll('.curriculum-directory details')).map((element) => {
        const summary = element.querySelector('summary');
        const countNote = document.createElement('span');
        countNote.className = 'university-finder-course-count';
        countNote.hidden = true;
        if (summary) summary.appendChild(countNote);
        notes.push(countNote);
        return { element, countNote, rows: rows.filter((row) => element.contains(row.element)) };
      });
      return {
        card,
        schoolSearch,
        search: normalize(`${card.dataset.search || ''} ${schoolSearch}`),
        categories: categories(card),
        rows,
        disclosures,
        guideCount: card.querySelectorAll('.university-entry-links a[href]').length
      };
    });

    const jumps = Array.from(directory.querySelectorAll('.entry-jumps a[href^="#"]'));
    const groups = Array.from(directory.querySelectorAll('[data-university-group]')).map((element) => {
      rememberHidden(element);
      const links = jumps.filter((link) => link.getAttribute('href') === `#${element.id}`);
      links.forEach(rememberHidden);
      return { element, cards: records.filter((record) => element.contains(record.card)), links };
    });

    const render = () => {
      const terms = normalize(query.value).split(' ').filter(Boolean);
      const selected = subject.value;
      let universityCount = 0;
      let courseCount = 0;
      let guideCount = 0;

      records.forEach((record) => {
        const universityQuery = terms.every((term) => record.schoolSearch.includes(term));
        const courseFiltering = Boolean(selected) || !universityQuery;
        let matchedCourses = 0;

        record.rows.forEach((row) => {
          // A school-name token and course-name token may match different fields,
          // but all course-name tokens must match the same official course group.
          const textMatches = terms.every((term) => record.schoolSearch.includes(term) || row.search.includes(term));
          const subjectMatches = !selected || row.categories.has(selected);
          row.element.hidden = !(textMatches && subjectMatches);
          if (!row.element.hidden) matchedCourses += 1;
        });

        const visible = record.rows.length
          ? matchedCourses > 0
          : terms.every((term) => record.search.includes(term)) && (!selected || record.categories.has(selected));
        record.card.hidden = !visible;

        record.disclosures.forEach((disclosure) => {
          const matchingRows = disclosure.rows.filter((row) => !row.element.hidden).length;
          const autoOpen = visible && courseFiltering && matchingRows > 0;
          disclosure.countNote.hidden = !autoOpen;
          if (autoOpen) {
            if (!openedByFinder.has(disclosure.element)) openedByFinder.set(disclosure.element, disclosure.element.open);
            disclosure.element.open = true;
            disclosure.countNote.textContent = `（条件に一致：${matchingRows}科目群）`;
          } else if (openedByFinder.has(disclosure.element)) {
            disclosure.element.open = openedByFinder.get(disclosure.element);
            openedByFinder.delete(disclosure.element);
          }
        });

        if (visible) {
          universityCount += 1;
          courseCount += matchedCourses;
          guideCount += record.guideCount;
        }
      });

      groups.forEach((group) => {
        group.element.hidden = !group.cards.some((record) => !record.card.hidden);
        group.links.forEach((link) => { link.hidden = group.element.hidden; });
      });

      empty.hidden = universityCount > 0;
      const result = universityCount > 0
        ? `${universityCount}大学・公式授業情報${courseCount}科目群を表示。学習の入口${guideCount}件は各大学の案内リンクへ。`
        : '条件に合う大学・公式授業情報は0件です。大学名や授業名を短くするか、条件をリセットしてください。';
      // Avoid duplicate live-region announcements after composition and input events.
      if (status.textContent !== result) status.textContent = result;
    };

    const clear = () => {
      query.value = '';
      subject.value = '';
      composing = false;
      render();
      query.focus();
    };

    query.addEventListener('compositionstart', () => { composing = true; });
    query.addEventListener('compositionend', () => { composing = false; render(); });
    query.addEventListener('input', (event) => { if (!composing && !event.isComposing) render(); });
    query.addEventListener('search', () => { if (!composing) render(); });
    subject.addEventListener('change', render);
    reset.addEventListener('click', (event) => { event.preventDefault(); clear(); });
    const form = finder.tagName === 'FORM' ? finder : finder.querySelector('form');
    if (form) {
      form.addEventListener('submit', (event) => { event.preventDefault(); render(); });
      form.addEventListener('reset', (event) => { event.preventDefault(); clear(); });
    }
    window.addEventListener('pageshow', render);

    render();
    finder.hidden = false;
    finder.dataset.finderReady = 'true';
  } catch (error) {
    initialHidden.forEach((hidden, element) => { element.hidden = hidden; });
    openedByFinder.forEach((open, element) => { element.open = open; });
    notes.forEach((note) => note.remove());
    finder.hidden = true;
    // No network, stored query, or URL mutation is required for the fallback.
    console.warn('University finder unavailable; the complete directory remains visible.', error);
  }
})();
