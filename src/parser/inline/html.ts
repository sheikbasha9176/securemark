﻿import { HTMLParser, inline } from '../inline';
import { SubParsers } from '../../combinator/data/parser';
import { union, inits, sequence, some, subline, rewrite, focus, validate, verify, surround, match, lazy, fmap } from '../../combinator';
import { unescsource } from '../source/unescapable';
import { escsource } from '../source/escapable';
import { char } from '../source/char';
import { defrag, dup, trimNode, hasTightText } from '../util';
import { html as htm } from 'typed-dom';

const attributes: Record<string, Record<string, ReadonlyArray<string | undefined>> | undefined> = {
  bdo: {
    dir: Object.freeze(['ltr', 'rtl']),
  },
};

export const html: HTMLParser = lazy(() => validate(/^<[a-z]+[ >]/, union([
  match(
    /^(?=<(sup|sub|small|bdi|bdo)(?: [^\n]*?)?>)/,
    ([, tag]) =>
      verify(fmap(
        sequence<SubParsers<HTMLParser>[0]>([
          dup(surround(`<${tag}`, some(defrag(union([attribute]))), /^ ?>/, false)),
          dup(surround(``, trimNode(defrag(some(union([inline]), `</${tag}>`))), `</${tag}>`)),
        ]),
        ([attrs, contents]: [Text[], (HTMLElement | Text)[]]) =>
          [htm(tag as 'span', attr(attributes[tag], attrs.map(t => t.textContent!), new Set(), 'html'), contents)]),
        ([el]) => !el.matches('.invalid') && hasTightText(el)),
    1),
  match(
    /^(?=<(wbr)(?: [^\n]*?)?>)/,
    ([, tag]) =>
      verify(fmap(
        sequence<SubParsers<HTMLParser>[1]>([
          dup(surround(`<${tag}`, some(defrag(union([attribute]))), /^ ?>/, false)),
        ]),
        ([attrs]) =>
          [htm(tag as 'span', attr(attributes[tag], attrs.map(t => t.textContent!), new Set(), 'html'), [])]),
        ([el]) => !el.matches('.invalid')),
    1),
  rewrite(
    sequence<SubParsers<HTMLParser>[2]>([
      dup(surround(/<[a-z]+/, some(defrag(union([attribute]))), /^ ?\/?>/, false)),
    ]),
    source =>
      [[htm('span', { class: 'invalid', 'data-invalid-syntax': 'html', 'data-invalid-type': 'syntax' }, source)], '']),
])));

export const attribute: HTMLParser.ParamParser.AttributeParser = subline(verify(
  surround(
    ' ',
    inits([
      defrag(focus(/^[a-z]+(?:-[a-z]+)*/, some(unescsource))),
      char('='),
      defrag(rewrite(
        surround('"', some(escsource, '"'), '"', false),
        some(escsource))),
    ]),
    ''),
  ts => ts.length !== 2));

export function attr(
  spec: Record<string, ReadonlyArray<string | undefined>> | undefined,
  params: string[],
  classes: Set<string>,
  syntax: string,
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {
  };
  const attrs: Map<string, string | undefined> = new Map(params.map<[string, string | undefined]>(
    arg => [arg.split('=', 1)[0], arg.includes('=') ? arg.slice(arg.split('=', 1)[0].length + 2, -1) : undefined]));
  if (!spec && params.length > 0 || attrs.size !== params.length) {
    void classes.add('invalid');
  }
  if (spec) {
    if (!Object.entries(spec).filter(([, v]) => Object.isFrozen(v)).every(([k]) => attrs.has(k))) {
      void classes.add('invalid');
    }
    for (const [key, value] of attrs) {
      spec.hasOwnProperty(key) && spec[key].includes(value)
        ? result[key] = value
        : void classes.add('invalid');
    }
  }
  if (classes.has('invalid')) {
    result.class = [...classes].join(' ');
    result['data-invalid-syntax'] = syntax;
    result['data-invalid-type'] = 'parameter';
  }
  return result;
}
