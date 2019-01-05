﻿import { ParagraphParser } from '../block';
import { subsequence, some, fmap, block, trim } from '../../combinator';
import { reference } from './paragraph/reference';
import { inline } from '../inline';
import { defrag, hasContent } from '../util';
import { html } from 'typed-dom';

export const paragraph: ParagraphParser = block(fmap(
  subsequence([
    some(reference),
    defrag(trim(some(inline))),
  ]),
  ns => [html('p', dropTrailingLinebreak(ns))].filter(hasContent)));

function dropTrailingLinebreak(ns: Node[]): Node[] {
  return ns.length > 0 && ns[ns.length - 1] instanceof HTMLBRElement
    ? ns.slice(0, -1)
    : ns;
}
