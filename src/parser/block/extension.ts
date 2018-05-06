﻿import { ExtensionParser } from '../block';
import { union, capture, rewrite } from '../../combinator';
import { figure } from './extension/figure';
import { placeholder } from './extension/placeholder';
import { block } from '../source/block';

export const segment: ExtensionParser = block(capture(
  /^(~{3,})([^\n]*)\n(?:([\s\S]*?)\n)?\1[^\S\n]*(?:\n|$)/,
  (_, rest) => [[], rest]));

export const extension: ExtensionParser = rewrite(
  segment,
  union([
    figure,
    placeholder,
  ]));
