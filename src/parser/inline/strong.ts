﻿import { StrongParser, inline } from '../inline';
import { combine, some, surround, transform, build } from '../../combinator';
import { compress, hasText } from '../util';
import { html } from 'typed-dom';

export const strong: StrongParser = transform(build(() =>
  surround('**', compress(some(combine<StrongParser>([inline]), '**')), '**')),
  (ns, rest) => {
    const el = html('strong', ns);
    return hasText(el)
      ? [[el], rest]
      : undefined;
  });
