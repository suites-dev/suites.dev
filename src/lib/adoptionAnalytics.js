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

/**
 * Observe the success feedback emitted by Expressive Code after copying.
 * @param {Document} root
 * @param {() => string} pathname
 * @param {(name: string, params: Record<string, string>) => void} send
 */
export function observeCodeCopies(root, pathname, send) {
  const view = root.defaultView;
  if (!view) return () => {};
  const observer = new view.MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof view.HTMLElement) || !node.matches('.feedback')) continue;
        const button = node.parentElement?.matches('.expressive-code .copy')
          ? node.parentElement.querySelector('button[data-code]')
          : null;
        if (!button) continue;
        const event = copiedCodeEvent(pathname(), button.getAttribute('data-code') ?? '');
        if (event) send(event.name, event.params);
      }
    }
  });
  observer.observe(root.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}
