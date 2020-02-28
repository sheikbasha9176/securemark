import { HeadingParser } from '../block';
import { union, open, some, block, line, focus, trim, context, fmap } from '../../combinator';
import { defrag } from '../util';
import { inline, indexer, indexee } from '../inline';
import { str } from '../source';
import { html } from 'typed-dom';

export const heading: HeadingParser = block(focus(
  /^#{1,6}[^\S\n][^\n]*(?:\n#{1,6}(?:[^\S\n][^\n]*)?)*(?:$|\n)/,
  context({ syntax: { inline: { media: false } } },
  some(line(indexee(fmap(open(
    str(/^#+/),
    trim(some(union([indexer, inline]))), true),
    ([sym, ...ns]: [string, ...(HTMLElement | string)[]]) => [defrag(html(`h${sym.length}` as 'h1', ns))])))))));
