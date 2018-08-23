﻿import { Parser } from '../../combinator';
import { CharParser } from '../source';
import { text } from 'typed-dom';

export function char(char: '#'): CharParser.SharpParser;
export function char(char: '`'): CharParser.BackquoteParser;
export function char(char: string): Parser<Text, []> {
  return source => {
    if (source.length === 0) return;
    switch (source[0]) {
      case char:
        return [[text(source.slice(0, 1))], source.slice(1)];
      default:
        return;
    }
  };
};