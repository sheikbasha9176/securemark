import { window, document } from 'spica/global';
import { parse } from '../../../parser';
import { sanitize } from 'dompurify';
import { HTML, define } from 'typed-dom';
import { Cache } from 'spica/cache';

declare global {
  interface Window {
    twttr?: {
      ready: (f: () => void) => unknown;
      widgets: {
        load: (el: HTMLElement) => void;
      };
    };
  }
}

const origins = new Set([
  'https://twitter.com',
]);
const cache = new Cache<string, HTMLElement>(10);

export function twitter(url: URL): HTMLElement | undefined {
  if (!origins.has(url.origin)) return;
  if (url.pathname.split('/').pop()!.includes('.')) return;
  if (!url.pathname.match(/^\/\w+\/status\/[0-9]{15,}(?!\w)/)) return;
  if (cache.has(url.href)) {
    const el = cache.get(url.href)!.cloneNode(true);
    window.twttr?.widgets.load(el);
    return el;
  }
  return HTML.div({ class: 'media', style: 'position: relative;' }, [HTML.em(`loading ${url.href}`)], (h, tag) => {
    const outer = h(tag);
    $.ajax(`https://publish.twitter.com/oembed?url=${url.href.replace('?', '&')}&omit_script=true`, {
      dataType: 'jsonp',
      timeout: 10 * 1e3,
      cache: true,
      success({ html }): void {
        outer.innerHTML = sanitize(`<div style="margin-top: -10px; margin-bottom: -10px;">${html}</div>`);
        cache.set(url.href, outer.cloneNode(true));
        if (window.twttr) return void window.twttr.widgets.load(outer);
        const id = 'twitter-wjs';
        if (document.getElementById(id)) return;
        document.body.appendChild(h('script', {
          id,
          src: 'https://platform.twitter.com/widgets.js',
        }));
      },
      error({ status, statusText }) {
        assert(Number.isSafeInteger(status));
        define(outer, [parse(`*{ ${url.href} }*\n\n\`\`\`\n${status}\n${statusText}\n\`\`\``)]);
      },
    });
    return outer;
  }).element;
}
