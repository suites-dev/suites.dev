/**
 * Classify successful code copies without sending the code itself to GA.
 * These events measure intent to try Suites, not a completed installation.
 * @param {string} pathname
 * @param {string} code
 */
export function copiedCodeEvent(pathname, code) {
  // Expressive Code stores newlines as DEL characters in data-code.
  code = code.replace(/\x7f/g, '\n');
  const route = pathname.replace(/^\/docs\/v\d+\//, '/docs/').replace(/\/$/, '');
  if (!route.startsWith('/docs/')) return;

  if (/^\s*(?:pnpm\s+add|npm\s+(?:install|i)|yarn\s+add)\b[^\n]*@suites\/unit(?=\s|$)/m.test(code)) {
    return { name: 'installation_copy', params: { page_path: pathname } };
  }

  const framework = route.match(/^\/docs\/guides\/(nestjs|inversify|injectionjs)$/)?.[1];
  if (framework && /\bTestBed\s*\.\s*(?:solitary|sociable)\s*\(/.test(code)) {
    return { name: 'test_example_copy', params: { page_path: pathname, framework } };
  }
}
