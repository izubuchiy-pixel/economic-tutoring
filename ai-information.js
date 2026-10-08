// Only copies the selected public prompt. No AI API, uploads, logging or account access.
document.querySelector('[data-copy-ai-question]')?.addEventListener('click', async () => {
  const input = document.querySelector('#ai-question-template');
  const status = document.querySelector('.ai-copy-status');
  try {
    await navigator.clipboard.writeText(input.value);
    status.textContent = 'コピーしました。情報ファイルを添付したAIに貼り付けてください。';
  } catch {
    input.focus();
    input.select();
    status.textContent = '自動コピーができませんでした。選択された文章を手動でコピーしてください。';
  }
});
