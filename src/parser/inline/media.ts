import { Array, location, encodeURI } from 'spica/global';
import { MediaParser } from '../inline';
import { union, inits, tails, some, subline, verify, surround, guard, fmap, bind } from '../../combinator';
import { text } from '../source';
import { link, attributes, uri, attrs } from './link';
import { attribute } from './html';
import { defrag, dup, trimNodeEnd, hasTightText } from '../util';
import { URL } from 'spica/url';
import { Cache } from 'spica/cache';
import { concat } from 'spica/concat';
import { html, define } from 'typed-dom';

const { origin } = location;

export const cache = new Cache<string, HTMLElement>(10);

export const media: MediaParser = subline(bind(fmap(verify(fmap(surround(
  /^!(?=(?:\[.*?\])?{(?![{}]).+?})/,
  guard(config => config.syntax?.inline?.media ?? true,
  tails([
    dup(surround('[', trimNodeEnd(defrag(some(union([text]), /^\\?\n|^]/))), ']', false)),
    dup(surround(/^{(?![{}])/, inits([uri, some(defrag(attribute))]), /^ ?}/)),
  ])),
  ''),
  ns => concat([...Array(2 - ns.length)].map(() => []), ns)),
  ([text]) => text.length === 0 || hasTightText(text[0])),
  ([text, param]: (HTMLElement | Text)[][]) => [text[0]?.textContent || '', ...param.map(t => t.textContent!)]),
  ([text, INSECURE_URL, ...params]: string[], rest) => {
    assert(INSECURE_URL === INSECURE_URL.trim());
    const url = new URL(INSECURE_URL, origin);
    if (!['http:', 'https:'].includes(url.protocol)) return;
    const media = void 0
      || cache.get(url.resource)?.cloneNode(true)
      || html('img', { class: 'media', 'data-src': INSECURE_URL.replace(/\s+/g, encodeURI), alt: text });
    if (cache.has(url.resource) && media.hasAttribute('alt')) {
      assert(['IMG', 'AUDIO', 'VIDEO'].includes(media.tagName));
      void define(media, { alt: text });
    }
    void define(media, attrs(attributes, params, [...media.classList], 'media'));
    return fmap(link as MediaParser, ([link]) => [define(link, { target: '_blank' }, [media])])
      (`{ ${INSECURE_URL}${params.map(p => ' ' + p).join('')} }${rest}`, {});
  }));
