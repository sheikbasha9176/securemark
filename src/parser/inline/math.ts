﻿import { MathParser } from '../inline';
import { combine, some, bracket, transform } from '../../combinator';
import { line } from '../source/line';
import { escsource } from '../source/escapable';
import { match } from '../source/validation';
import { isTightVisible } from './util/verification';
import { Cache } from 'spica/cache';
import { html } from 'typed-dom';

export const cache = new Cache<string, HTMLElement>(100); // for rerendering in editing

const syntax = /^\$[^\s$][^\n]*?\$(?!\d)/;

export const math: MathParser = source => {
  if (!match(source, '$', syntax)) return;
  return transform(
    line(bracket('$', some(combine<MathParser>([escsource]), /^\$|^\n/), /^\$(?![$\d])/), false),
    (ns, rest) => {
      const el = html('span', { class: 'math' }, `$${ns.reduce((acc, n) => acc + n.textContent, '')}$`);
      if (cache.has(el.textContent!)) return [[cache.get(el.textContent!)!.cloneNode(true)], rest];
      if (!isTightVisible(html('span', el.textContent!.slice(1, -1)))) return;
      void el.setAttribute('data-src', el.textContent!);
      return [[el], rest];
    })
    (source);
};
