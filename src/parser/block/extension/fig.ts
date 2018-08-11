﻿import { ExtensionParser } from '../../block';
import { union, sequence, some, block, line, focus } from '../../../combinator';
import { contentline } from '../../source/line';
import { figure } from './figure';
import { segment as seg_pre } from '../pretext';
import { segment as seg_math } from '../math';
import { segment as seg_example } from '../extension/example';
import { label } from '../../inline';

import FigureParser = ExtensionParser.FigureParser;

export const segment: FigureParser = block(union([
  sequence([
    line(label),
    union([
      seg_pre,
      seg_math,
      seg_example,
      some(contentline),
    ]),
  ]),
  () => undefined,
]));

export const fig: FigureParser = block(focus(segment, source => {
  const bracket = (source.match(/^[^\n]*\n!?>+\s/) && source.match(/^~{3,}(?=\s*)$/gm) || [])
    .reduce((max, bracket) => bracket > max ? bracket : max, '~~') + '~';
  return figure(`${bracket}figure ${source}\n${bracket}`);
}));
