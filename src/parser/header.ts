import { undefined } from 'spica/global';
import { MarkdownParser } from '../../markdown';
import { block, focus, validate } from '../combinator';
import { segment } from './segment';
import { html } from 'typed-dom';

export const header: MarkdownParser.HeaderParser = block(validate('---', focus(
  // Must check the next line of the block.
  /^---[^\S\v\f\r\n]*\r?\n(?:[a-z][a-z0-9]*(?:-[a-z][a-z0-9]*)*:[ \t]+\S[^\v\f\r\n]*\r?\n){1,100}---[^\S\v\f\r\n]*(?:$|\r?\n(?=[^\S\v\f\r\n]*(?:$|\r?\n)))/,
  // TODO: Set the specified base URL.
  source =>
    segment(source)[0] === source
      ? [[html('div', { class: 'header' }, source.slice(source.indexOf('\n') + 1, source.lastIndexOf('\n', -1)))], '']
      : undefined)));
