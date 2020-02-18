import { UListParser } from '../block';
import { union, inits, some, block, line, validate, open, convert, indent, trim, context, lazy, fmap } from '../../combinator';
import { defrag } from '../util';
import { olist_ } from './olist';
import { ilist_ } from './ilist';
import { inline } from '../inline';
import { html } from 'typed-dom';
import { unshift } from 'spica/array';

export const ulist: UListParser = lazy(() => block(fmap(validate(
  /^-(?:[^\S\n]|\n[^\S\n]*\S)/,
  context({ syntax: { inline: { media: false } } },
  some(union([
    fmap(
      inits([
        line(open(/^-(?:$|\s)/, trim(some(inline)), true)),
        indent(union([ulist_, olist_, ilist_]))
      ]),
      ns => [defrag(html('li', fillFirstLine(ns)))]),
  ])))),
  es => [html('ul', es)])));

export const ulist_: UListParser = convert(
  source => source.replace(/^-(?=$|\n)/, `$& `),
  ulist);

export function fillFirstLine(ns: (HTMLElement | Node)[]): Node[] {
  return ns[0] && 'id' in ns[0] && ['UL', 'OL'].includes(ns[0].tagName)
    ? unshift([html('br')], ns)
    : ns;
}
