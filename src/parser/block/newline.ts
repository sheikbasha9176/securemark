﻿import { NewlineParser } from '../block';

const syntax = /^(?:[^\S\n]*?\\?\n)+/;

export const newline: NewlineParser = (source: string) => {
  const [whole = ''] = source.match(syntax) || [];
  if (!whole) return;
  return [[], source.slice(whole.length)];
};
