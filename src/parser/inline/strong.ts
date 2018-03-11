﻿import { StrongParser, inline } from '../inline';
import { combine, some, surround, transform } from '../../combinator';
import { squash } from '../squash';
import { hasText } from './util/verification';
import { html } from 'typed-dom';

const closer = /^\*\*/;

export const strong: StrongParser = source =>
  transform(
    surround(
      '**',
      some(combine<StrongParser>([inline]), closer),
      '**'),
    (ns, rest) => {
      const el = html('strong', squash(ns));
      if (!hasText(el)) return;
      return [[el], rest];
    })
    (source);
