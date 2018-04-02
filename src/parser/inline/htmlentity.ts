﻿import { HTMLEntityParser } from '../inline';
import { match } from '../../combinator';
import { html } from 'typed-dom';

const syntax = /^&(?:[0-9a-z]+|#[0-9]{1,8}|#x[0-9a-f]{1,8});/i;

export const htmlentity: HTMLEntityParser = match(syntax, ([entity], source) =>
  [[document.createTextNode(parse(entity))], source.slice(entity.length)]);

const parser = html('span');
function parse(str: string): string {
  parser.innerHTML = str;
  return parser.textContent!;
}
