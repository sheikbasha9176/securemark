﻿import { EmphasisParser, inline } from '../inline';
import { union, some, surround, transform, build } from '../../combinator';
import { strong } from './strong';
import { compress, hasText } from '../util';
import { html } from 'typed-dom';

export const emphasis: EmphasisParser = transform(build(() =>
  surround<EmphasisParser>('*', compress(some(union([strong, some(inline, '*')]))), '*')),
  (ns, rest) => {
    const el = html('em', ns);
    return hasText(el)
      ? [[el], rest]
      : undefined;
  });
