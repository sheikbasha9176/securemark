import { CodeParser } from '../inline';
import { validate, creator, match } from '../../combinator';
import { html } from 'typed-dom';

export const code: CodeParser = creator(validate('`', match(
  /^(`+)(?!`)(?:([^\n]*?[^`\n])\1(?!`))?/,
  ([whole, , body]) => rest =>
    body
      ? [[html('code', { 'data-src': whole }, body.trim() || body)], rest]
      : [[whole], rest])));
