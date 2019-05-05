import { BlockquoteParser } from '../block';
import { union, some, block, validate, rewrite, surround, convert, lazy, fmap } from '../../combinator';
import { contentline } from '../source/line';
import { autolink } from '../autolink';
import { parse } from '../api/parse';
import { defrag, suppress } from '../util';
import { html } from 'typed-dom';

export const segment: BlockquoteParser.SegmentParser = block(union([
  validate(/^(?=>+(?:[^\S\n]|\n\s*\S))/, some(contentline)),
  validate(/^!(?=>+(?:[^\S\n]|\n\s*\S))/, some(contentline)),
]));

export const blockquote: BlockquoteParser = lazy(() => block(rewrite(segment, union([
  surround(/^(?=>)/, text, ''),
  surround(/^!(?=>)/, source, ''),
]))));

const opener = /^(?=>>+(?:\s|$))/;

const indent = block(surround(opener, some(contentline, /^>(?:\s|$)/), ''), false);

function unindent(source: string): string {
  return source
    .replace(/\n$/, '')
    .replace(/^>(?:$|\s|(?=>+(?:$|\s)))/mg, '');
}

const text: BlockquoteParser.TextParser = lazy(() => fmap(
  some(union([
    rewrite(
      indent,
      convert(unindent, text)),
    rewrite(
      some(contentline, opener),
      convert(unindent, fmap(defrag(some(autolink)), ns => [html('pre', ns)]))),
  ])),
  ns => [html('blockquote', ns)]));

const source: BlockquoteParser.SourceParser = lazy(() => fmap(
  some(union([
    rewrite(
      indent,
      convert(unindent, source)),
    rewrite(
      some(contentline, opener),
      convert(unindent, source => [[suppress(parse(source))], ''])),
  ])),
  ns => [html('blockquote', ns)]));
