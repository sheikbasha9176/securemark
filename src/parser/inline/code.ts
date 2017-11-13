﻿import { CodeParser } from '../inline';
import { combine, loop, bracket, transform } from '../../combinator';
import { unescsource } from '../source/unescapable';
import { backquote } from '../source/backquote';
import { squash } from '../squash';
import { validate } from '../source/validation';

const syntax = /^(`+)[^\n]+?\1/;

export const code: CodeParser = (source: string) => {
  if (!validate(source, '`')) return;
  const [whole, keyword] = source.match(syntax) || ['', ''];
  if (!whole) return;
  return transform(
    bracket(
      keyword,
      loop(combine<Text, CodeParser.InnerParsers>([loop(backquote), unescsource]), `^${keyword}(?!\`)`),
      keyword),
    (ns, rest) => {
      const el = document.createElement('code');
      void el.appendChild(squash(ns));
      el.textContent = el.textContent!.trim();
      if (el.textContent! === '') return;
      void el.setAttribute('data-src', source.slice(0, source.length - rest.length));
      return [[el], rest];
    })
    (source);
};
