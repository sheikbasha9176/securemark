﻿import { DListParser } from '../block';
import { union, inits, some, fmap, surround, verify, block, line, rewrite, trim, build } from '../../combinator';
import { anyline, contentline } from '../source/line';
import { inblock } from '../inblock';
import { indexer, defineIndex } from './indexer';
import { compress, hasMedia } from '../util';
import { concat } from 'spica/concat';
import { html } from 'typed-dom';

export const dlist: DListParser = block(fmap(build(() =>
  some(inits<DListParser>([
    some(term),
    some(desc)
  ]))),
  es => [html('dl', fillTrailingDescription(es))]));

const term: DListParser.TermParser = line(rewrite(contentline, verify(
  fmap<DListParser.TermParser>(build(() =>
    surround(/^~(?=\s|$)/, compress(trim(some(union([indexer, inblock])))), '', false)),
    ns => {
      const dt = html('dt', ns);
      void defineIndex(dt);
      return [dt];
    }),
  ([el]) => !hasMedia(el))));

const desc: DListParser.DescriptionParser = block(
  fmap<DListParser.DescriptionParser>(build(() =>
    rewrite(
      surround(/^:(?=\s|$)|/, some(anyline, /^[~:](?=\s|$)/), '', false),
      surround(/^:(?=\s|$)|/, compress(trim(some(union([inblock])))), '', false))),
    ns => [html('dd', ns)]),
  false);

function fillTrailingDescription(es: HTMLElement[]): HTMLElement[] {
  return es.length > 0 && es[es.length - 1].tagName.toLowerCase() === 'dt'
    ? concat(es, [html('dd')])
    : es;
}