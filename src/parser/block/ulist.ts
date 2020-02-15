import { UListParser } from '../block';
import { union, inits, some, block, line, validate, surround, convert, indent, trim, update, lazy, fmap } from '../../combinator';
import { defrag } from '../util';
import { olist_ } from './olist';
import { ilist_ } from './ilist';
import { inline } from '../inline';
import { concat } from 'spica/concat';
import { html } from 'typed-dom';

const opener = /^-(?:$|\s)/;

export const ulist: UListParser = lazy(() => block(fmap(validate(
  /^-(?:[^\S\n]|\n[^\S\n]*\S)/,
  update({ syntax: { inline: { media: false } } },
  some(union([
    fmap(
      inits([
        line(surround(opener, trim(some(inline)), '', false)),
        indent(union([ulist_, olist_, ilist_]))
      ]),
      ns => [defrag(html('li', fillFirstLine(ns)))]),
  ])))),
  es => [html('ul', es)])));

export const ulist_: UListParser = convert(
  source => source.replace(/^-(?=$|\n)/, `$& `),
  ulist);

export function fillFirstLine(ns: Node[]): Node[] {
  return ['UL', 'OL'].includes(ns[0]?.nodeName)
    ? concat([html('br')], ns)
    : ns;
}
