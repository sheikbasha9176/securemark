import { IListParser } from '../block';
import { union, inits, some, block, line, validate, surround, convert, indent, trim, lazy, fmap } from '../../combinator';
import { defrag } from '../util';
import { ulist_, fillFirstLine } from './ulist';
import { olist_ } from './olist';
import { inline } from '../inline';
import { html } from 'typed-dom';

export const ilist: IListParser = lazy(() => block(fmap(validate(
  /^[-+*](?:[^\S\n]|\n[^\S\n]*\S)/,
  some(union([
    fmap(
      inits([
        line(surround(/^[-+*](?:$|\s)/, trim(some(inline)), '', false)),
        indent(union([ulist_, olist_, ilist_]))
      ]),
      ns => [defrag(html('li', fillFirstLine(ns)))]),
  ]))),
  es => [html('ul', { class: 'invalid', 'data-invalid-syntax': 'list', 'data-invalid-message': 'Use - instead of + or *' }, es)])));

export const ilist_: IListParser = convert(
  source => source.replace(/^[-+*](?=$|\n)/, `$& `),
  ilist);
