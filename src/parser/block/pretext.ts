﻿import { Result } from '../../combinator/parser';
import { combine } from '../../combinator/combine';
import { loop } from '../../combinator/loop';
import { PreTextParser, consumeBlockEndEmptyLine } from '../block';
import { PlainTextParser, squash } from '../text';
import { plaintext } from '../text/plaintext';

type SubParsers = [PlainTextParser];

const syntax = /^(`{3,})([0-9a-z]*)\S*\s*?\n(?:[^\n]*\n)*?\1/;

export const pretext: PreTextParser = function (source: string): Result<HTMLPreElement, SubParsers> {
  if (!source.startsWith('```')) return;
  const [whole, keyword, lang] = source.match(syntax) || ['', '', ''];
  if (!whole) return;
  const el = document.createElement('pre');
  if (lang) {
    void el.setAttribute('class', `lang-${lang.toLowerCase()}`);
  }
  const closer = `^\n${keyword}\s*(?:\n|$)`;
  const [[, ...cs], rest] = loop(combine<SubParsers, Text>([plaintext]), closer)(`\n${source.slice(source.indexOf('\n') + 1)}`) || [[], ''];
  if (rest.search(closer) !== 0) return;
  void el.appendChild(squash(cs));
  return consumeBlockEndEmptyLine<HTMLPreElement, SubParsers>([el], source.slice(source.length - rest.length + 1 + keyword.length + 1));
};
