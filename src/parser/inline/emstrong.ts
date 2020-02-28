import { EmStrongParser, inline } from '../inline';
import { union, some, creator, surround, lazy, fmap } from '../../combinator';
import { isTight, trimEnd, defrag } from '../util';
import { emphasis } from './emphasis';
import { strong } from './strong';
import { str } from '../source';
import { html } from 'typed-dom';
import { shift, unshift, push } from 'spica/array';

export const emstrong: EmStrongParser = lazy(() => creator(surround(
  str('***'),
  union([some(inline, '*')]),
  str(/^\*{1,3}/), false,
  ([as, bs, cs], rest, context) => {
    if (!isTight(bs, 0, bs.length)) return [unshift(as, bs), cs[0] + rest];
    switch (cs[0]) {
      case '*':
        return fmap(
          strong,
          ms =>
            typeof ms[0] === 'object'
              ? void ms[0].prepend(defrag(html('em', trimEnd(bs)))) || ms
              : push(unshift(as, bs), shift(ms)[1]))
          ('**' + rest, context) || [push(unshift(as, bs), cs), rest];
      case '**':
        return fmap(
          emphasis,
          ms =>
            typeof ms[0] === 'object'
              ? void ms[0].prepend(defrag(html('strong', trimEnd(bs)))) || ms
              : push(unshift(as, bs), shift(ms)[1]))
          ('*' + rest, context) || [push(unshift(as, bs), cs), rest];
      case '***':
        return [[html('em', [defrag(html('strong', trimEnd(bs)))])], rest];
    }
    assert(false);
  },
  ([as, bs], rest) => [unshift(as, bs), rest])));
