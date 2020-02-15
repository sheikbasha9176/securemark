import { CodeParser } from '../inline';
import { validate, creator, backtracker, match } from '../../combinator';
import { html, text } from 'typed-dom';

export const code: CodeParser = creator(validate('`', backtracker(match(
  /^(`+)(?!`)(?:([^\n]*?[^`\n])\1(?!`))?/,
  ([whole, , body]) => rest =>
    body
      ? [[html('code', { 'data-src': whole }, body.trim() || body)], rest]
      : [[text(whole)], rest]))));
