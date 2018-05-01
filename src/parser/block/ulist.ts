﻿import { UListParser } from '../block';
import { union, inits, some, match, surround, indent, transform, trim } from '../../combinator';
import { block } from '../source/block';
import { line } from '../source/line';
import { olist_ } from './olist';
import { inline } from '../inline';
import { compress } from '../util';
import { html } from 'typed-dom';

const cache = new Map<string, RegExp>();

export const ulist: UListParser = block(match(
  /^([-+*])(?=\s|$)/,
  ([whole, flag], rest) => {
    const opener = cache.has(flag)
      ? cache.get(flag)!
      : cache.set(flag, new RegExp(`^\\${flag}(?:[^\\S\\n]+|(?=\\n|$))`)).get(flag)!;
    return transform(
      some(transform(
        inits<UListParser>([
          line(surround(opener, compress(trim(some(inline))), '', false), true, true),
          indent(union([ulist, olist_]))
        ]),
        (ns, rest) =>
          ns.length === 1 && [HTMLUListElement, HTMLOListElement].some(C => ns[0] instanceof C)
            ? undefined
            : [[html('li', ns)], rest])),
      (es, rest) =>
        [[html('ul', es)], rest])
      (whole + rest);
  }));
