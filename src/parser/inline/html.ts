﻿import { Result } from '../../parser';
import { HTMLParser, InlineParser, PlainTextParser, inline, squash } from '../inline';
import { combine } from '../../combinator/combine';
import { loop } from '../../combinator/loop';
import { plaintext } from './plaintext';

type SubParsers = [InlineParser] | [PlainTextParser];

const syntax = /^(<([a-z]+)>)/i;
const inlinetags = Object.freeze('small|q|cite|code|mark|ruby|rt|rp|bdi|bdo|wbr'.split('|'));
assert(inlinetags.every(t => /[a-z]+/.test(t)));
assert(inlinetags.every(t => ['script', 'style', 'link', 'a', 'img'].indexOf(t) === -1));
assert(inlinetags.every(t => ['ins', 'del', 'strong', 'em', 'sup', 'sub', 's', 'u'].indexOf(t) === -1));
const cache = new Map<string, RegExp>();

export const html: HTMLParser = function (source: string): Result<HTMLElement, SubParsers> {
  if (!source.startsWith('<')) return;
  const [whole, opentag, tagname] = source.match(syntax) || ['', '', ''];
  if (!whole) return;
  if (['wbr'].indexOf(tagname.toLowerCase()) !== -1) return [[document.createElement(tagname.toLowerCase())], source.slice(opentag.length)];
  if (inlinetags.indexOf(tagname.toLowerCase()) === -1) return;
  if (!cache.has(tagname)) {
    void cache.set(tagname, new RegExp(`^</${tagname}>`, 'i'));
  }
  const [cs, rest] = tagname.toLowerCase() === 'code'
    ? loop(combine<SubParsers, HTMLElement | Text>([plaintext]), cache.get(tagname)!)(source.slice(opentag.length)) || [[], source.slice(opentag.length)]
    : loop(combine<SubParsers, HTMLElement | Text>([inline]), cache.get(tagname)!)(source.slice(opentag.length)) || [[], source.slice(opentag.length)];
  const el = document.createElement(tagname);
  void el.appendChild(squash(cs));
  const closetag = `</${tagname}>`;
  return rest.slice(0, closetag.length).toLowerCase() === closetag
    ? [[el], rest.slice(closetag.length)]
    : void 0;
};
