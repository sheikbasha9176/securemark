﻿import { ParagraphParser } from '../../block';
import { combine, loop } from '../../../combinator';
import { unescsource } from '../../source/unescapable';
import { squash } from '../../squash';
import { match } from '../../source/validation';
import { html } from 'typed-dom';

const syntax = /^>+[^>\s]\S*\s*?(?=\n|$)/;
const closer = /^\s/;

export const reference: ParagraphParser.ReferenceParser = source => {
  if (!match(source, '>', syntax)) return;
  const line = source.split('\n', 1)[0];
  const [ts = [], rest = undefined] = loop(combine<ParagraphParser.HashtagParser>([unescsource]), closer)(line) || [];
  if (rest === undefined) return;
  assert(rest.trim() === '');
  return [[html('a', { class: 'reference', rel: 'noopener' }, squash(ts))], source.slice(line.length + 1)];
};
