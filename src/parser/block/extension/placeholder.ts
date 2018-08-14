﻿import { ExtensionParser } from '../../block';
import { some, block, focus, rewrite, eval } from '../../../combinator';
import { inline } from '../../inline';
import { html } from 'typed-dom';

export const segment: ExtensionParser.PlaceholderParser = block(focus(
  /^(~{3,})[^\n]*\n(?:[^\n]*\n)*?\1[^\S\n]*(?:\n|$)/,
  _ => [[], '']));

export const placeholder: ExtensionParser.PlaceholderParser = block(rewrite(segment,
  () => [[html('p', { class: 'invalid' }, eval(some(inline)('Invalid syntax: Extension syntax: ~~~.')))], '']));
