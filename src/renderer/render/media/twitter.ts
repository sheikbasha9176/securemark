﻿import { parse } from '../../../parser';
import { Cache } from 'spica/cache';
import { sanitize } from 'dompurify';
import DOM, { define } from 'typed-dom';

declare global {
  interface Window {
    twttr?: { widgets: { load: (el: HTMLElement) => void; }; };
  }
}

const cache = new Cache<string, HTMLElement>(10);

let isWidgetScriptRequested = !!window.twttr;

export function twitter(url: URL): HTMLElement | undefined {
  if (!['https://twitter.com'].includes(url.origin)) return;
  if (!url.pathname.match(/^\/\w+\/status\/[0-9]{15,}(?!\w)/)) return;
  if (cache.has(url.href)) {
    const el = cache.get(url.href)!.cloneNode(true);
    window.twttr && void window.twttr.widgets.load(el);
    return el;
  }
  return DOM.div({ style: 'position: relative;' }, [DOM.em(`loading ${url.href}`)], (f, tag) => {
    const outer = f(tag);
    void $.ajax(`https://publish.twitter.com/oembed?url=${url.href.replace('?', '&')}`, {
      dataType: 'jsonp',
      timeout: 10 * 1e3,
      cache: true,
      success({ html }): void {
        outer.innerHTML = sanitize(`<div style="margin-top: -10px; margin-bottom: -10px;">${html}</div>`, { ADD_TAGS: ['script'] });
        const script = outer.querySelector('script');
        script && void script.remove();
        void cache.set(url.href, outer.cloneNode(true));
        if (window.twttr) return void window.twttr.widgets.load(outer);
        if (isWidgetScriptRequested) return;
        if (!script || !script.getAttribute('src')!.startsWith('https://platform.twitter.com/')) return;
        if (document.querySelector(`script[src="${script.getAttribute('src')}"]`)) return;
        isWidgetScriptRequested = true;
        void $.ajax(script.src, {
          dataType: 'script',
          cache: true,
          complete: () => isWidgetScriptRequested = !!window.twttr,
        });
      },
      error({ status, statusText }) {
        assert(Number.isSafeInteger(status));
        void define(outer, [parse(`*[]( ${url.href} )*\n\n\`\`\`\n${status}\n${statusText}\n\`\`\``)]);
      },
    });
    return outer;
  }).element;
}