﻿import { MarkdownParser } from '../../markdown.d';
import { combine, some } from '../combinator';
import { pretext } from './block/pretext';
import { extension } from './block/extension';
import { visibleline, invisibleline } from './source/line';

import SegmentParser = MarkdownParser.SegmentParser;

export function segment(source: string): string[] {
  const segments: string[] = [];
  while (source.length > 0) {
    const [, rest = ''] = combine<SegmentParser>([pretext, extension, some(visibleline), some(invisibleline)])(source) || [];
    assert(source.slice(1).endsWith(rest));
    void segments.push(source.slice(0, source.length - rest.length));
    source = rest;
  }
  return segments;
}
