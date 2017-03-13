﻿import { Result } from '../../parser';
import { CodeParser, PlainTextParser, squash } from '../inline';
import { combine } from '../../combinator/combine';
import { loop } from '../../combinator/loop';
import { plaintext } from './plaintext';

type SubParsers = [PlainTextParser];

const syntax = /^(`+)[^\n]+?\1/;

export const code: CodeParser = function (source: string): Result<HTMLElement, SubParsers> {
  if (!source.startsWith('`')) return;
  const [whole, keyword] = source.match(syntax) || ['', ''];
  if (!whole) return;
  const [cs, rest] = loop(combine<SubParsers, Text>([plaintext]), `^${keyword}`)(source.slice(keyword.length)) || [[], ''];
  if (!rest.startsWith(keyword)) return;
  const el = document.createElement('code');
  void el.appendChild(squash(cs));
  if (el.textContent!.trim() === '') return;
  el.textContent = el.textContent!.trim();
  return [[el], rest.slice(keyword.length)];
};
