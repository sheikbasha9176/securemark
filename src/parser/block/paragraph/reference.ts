﻿import { ParagraphParser } from '../../block';
import { union, match, validate, eval } from '../../../combinator';
import { line } from '../../source/line';
import '../../source/unescapable';
import { inline } from '../../inline';
import { html } from 'typed-dom';

export const reference: ParagraphParser.ReferenceParser = line(validate(
  /^(>+)[^>\s].*/,
  union<ParagraphParser.ReferenceParser>([
    match(
      /^(>+)[0-9a-z]+\s*$/,
      ([ref, { length: level }], rest) =>
        [[html('a', { class: 'reference', rel: 'noopener', 'data-level': `${level}` }, ref.trim()), html('br')], rest]),
    () =>
      [[...eval(inline(`*Invalid syntax: Reference syntax: Use lower-case alphanumeric characters in reference syntax.*`)), html('br')], ''],
  ])
), true, true);
