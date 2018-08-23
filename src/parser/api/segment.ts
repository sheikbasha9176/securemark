﻿import { MarkdownParser } from '../../../markdown.d';
import { normalize } from './normalization';
import { exec, union, some } from '../../combinator';
import { segment as pretext } from '../block/pretext';
import { segment as math } from '../block/math';
import { segment as extension } from '../block/extension';
import { contentline, blankline } from '../source/line';

import SegmentParser = MarkdownParser.SegmentParser;

export function segment(source: string): string[] {
  assert(source === normalize(source));
  const segments: string[] = [];
  while (source.length > 0) {
    const result = union<SegmentParser>([
      pretext,
      math,
      extension,
      some(contentline),
      some(blankline)
    ])(source);
    const rest = result
      ? exec(result)
      : '';
    assert(source.slice(1).endsWith(rest));
    void segments.push(source.slice(0, source.length - rest.length));
    source = rest;
  }
  return segments;
}