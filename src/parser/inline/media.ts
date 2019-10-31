import { MediaParser } from '../inline';
import { MarkdownParser } from '../../../markdown';
import { Result, union, inits, tails, some, subline, verify, surround, check, configure, fmap, bind } from '../../combinator';
import { text } from '../source';
import { link, attributes, uri, attrs } from './link';
import { attribute } from './html';
import { sanitize } from '../string/uri';
import { defrag, dup, trimNodeEnd, hasTightText } from '../util';
import { Cache } from 'spica/cache';
import { concat } from 'spica/concat';
import { html, text as txt, define } from 'typed-dom';

export const cache = new Cache<string, HTMLElement>(10);

export const media: MediaParser = subline(configure({ syntax: { inline: { link: undefined } } }, bind(fmap(verify(fmap(surround(
  /^!(?=(?:\[.*?\])?{.+?})/,
  check(config => config?.syntax?.inline?.media ?? true,
  tails([
    dup(surround('[', trimNodeEnd(defrag(some(union([text]), /^\\?\n|^]/))), ']', false)),
    dup(surround('{', inits([uri, some(defrag(attribute))]), /^ ?}/)),
  ])),
  ''),
  ns => concat([...Array(2 - ns.length)].map(() => []), ns)),
  ([[text = txt('')]]) => text.textContent === '' || hasTightText(text)),
  ([[text = txt('')], param]: (HTMLElement | Text)[][]) => [text.textContent!, ...param.map(t => t.textContent!)]),
  ([text, INSECURE_URL, ...params]: string[], rest, config) => {
    const path = sanitize(INSECURE_URL.trim());
    if (path === '' && INSECURE_URL !== '') return;
    const uri = new URL(path, window.location.href);
    if (uri.protocol === 'tel:') return;
    const el = cache.has(uri.href)
      ? cache.get(uri.href)!.cloneNode(true)
      : html('img', { class: 'media', 'data-src': path, alt: text });
    if (cache.has(uri.href) && el.hasAttribute('alt')) {
      assert(['IMG', 'AUDIO', 'VIDEO'].includes(el.tagName));
      void define(el, { alt: text });
    }
    void define(el, attrs(attributes, params, new Set(el.classList), 'media'));
    return fmap(
      link,
      ([link]) =>
        [define(link, { target: '_blank' }, [el])])
      (`{ ${INSECURE_URL}${params.map(p => ' ' + p).join('')} }${rest}`, config) as Result<HTMLAnchorElement, any, MarkdownParser.Config, MarkdownParser.State>;
  })));
