﻿import { MediaParser } from '../inline';
import { combine, some, surround, transform, build } from '../../combinator';
import { line } from '../source/line';
import { text } from '../source/text';
import { escsource } from '../source/escapable';
import { parenthesis } from '../source/parenthesis';
import { sanitize } from '../string/url';
import { stringify } from '../util';
import { Cache } from 'spica/cache';
import { html } from 'typed-dom';

export const cache = new Cache<string, HTMLElement>(100);

export const media: MediaParser = line(transform(build(() =>
  line(surround('![', some(combine<MediaParser>([text]), ']'), ']'), false)),
  (ns, rest) => {
    const caption = stringify(ns).trim();
    return transform(
      line(surround('(', some(combine<MediaParser>([parenthesis, escsource]), /^\)|^\s/), ')'), false),
      (ns, rest) => {
        const url = sanitize(stringify(ns).replace(/\\(.)/g, '$1'));
        if (url === '') return;
        if (cache.has(url)) return [[cache.get(url)!.cloneNode(true)], rest];
        return [[html('img', { class: 'media', 'data-src': url, alt: caption })], rest];
      })
      (rest);
  }
), false);
