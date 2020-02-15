import { ParagraphParser } from '../block';
import { subsequence, some, block, rewrite, convert, trim, fmap } from '../../combinator';
import { mention } from './paragraph/mention';
import { inline } from '../inline';
import { anyline } from '../source';
import { defrag, isVisible } from '../util';
import { concat } from 'spica/concat';
import { html, define } from 'typed-dom';

export const blankline = /^(?:\\?\s)*\\?(?:\n|$)/gm;

export const paragraph: ParagraphParser = block(fmap(
  convert(source => source.replace(blankline, ''),
  some(subsequence([
    fmap(
      some(mention),
      es => es.reduce((acc, el) => concat(acc, [el, html('br')]), [])),
    fmap(
      rewrite(
        some(anyline, '>'),
        trim(some(inline))),
      ns => concat(ns, [html('br')])),
  ]))),
  ns =>
    ns.length > 0
      ? [format(defrag(html('p', ns)))].map(el =>
          isVisible(el)
            ? el
            : define(el, {
                class: 'invalid',
                'data-invalid-syntax': 'paragraph',
                'data-invalid-message': 'All paragraphs must have a visible content',
              }))
      : []));

function format<T extends Node>(node: T): T {
  assert(node.lastChild instanceof HTMLBRElement);
  void node.lastChild?.remove();
  assert(node.lastChild instanceof HTMLBRElement === false);
  return node;
}
