import { parse } from '../../../parser';
import { cache } from '../../../parser/inline/media';
import { sanitize } from 'dompurify';
import { HTML, define } from 'typed-dom';

const origins = new Set([
  'https://www.slideshare.net',
]);

export function slideshare(url: URL): HTMLElement | undefined {
  if (!origins.has(url.origin)) return;
  if (url.pathname.split('/').pop()!.includes('.')) return;
  if (!url.pathname.match(/^\/[^/?#]+\/[^/?#]+/)) return;
  if (cache.has(url.href)) return cache.get(url.href)!.cloneNode(true);
  return HTML.div({ class: 'media', style: 'position: relative;' }, [HTML.em(`loading ${url.href}`)], (html, tag) => {
    const outer = html(tag);
    $.ajax(`https://www.slideshare.net/api/oembed/2?url=${url.href}&format=json`, {
      dataType: 'jsonp',
      timeout: 10 * 1e3,
      cache: true,
      success({ html }) {
        outer.innerHTML = sanitize(`<div style="position: relative; padding-top: 83%;">${html}</div>`, { ADD_TAGS: ['iframe'] });
        const iframe = outer.querySelector('iframe')!;
        iframe.setAttribute('style', 'position: absolute; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%;');
        iframe.parentElement!.style.paddingTop = `${(+iframe.height / +iframe.width) * 100}%`;
        outer.appendChild(iframe.nextElementSibling!);
        outer.lastElementChild!.removeAttribute('style');
        cache.set(url.href, outer.cloneNode(true));
      },
      error({ status, statusText }) {
        assert(Number.isSafeInteger(status));
        define(outer, [parse(`*{ ${url.href} }*\n\n\`\`\`\n${status}\n${statusText}\n\`\`\``)]);
      },
    });
    return outer;
  }).element;
}
