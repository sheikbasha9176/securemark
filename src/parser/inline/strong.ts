﻿import { StrongParser, inline } from '../inline';
import { union, some, validate, verify, surround, lazy, fmap } from '../../combinator';
import { defrag, trimEdgeEnd, hasTightText } from '../util';
import { html } from 'typed-dom';

export const strong: StrongParser = lazy(() => verify(fmap(trimEdgeEnd(validate(
  /^\*\*\S[\s\S]*?\*\*/,
  surround('**', defrag(some(union([inline]), '**')), '**'))),
  ns => [html('strong', ns)]),
  ([el]) => hasTightText(el)));
