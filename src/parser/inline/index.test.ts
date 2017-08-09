﻿import { loop } from '../../combinator/loop';
import { index } from './index';
import { inspect } from '../debug.test';

describe('Unit: parser/inline/index', () => {
  describe('index', () => {
    const parser = loop(index);

    it('invalid', () => {
      assert.deepStrictEqual(inspect(parser('[]')), void 0);
      assert.deepStrictEqual(inspect(parser('[a]')), void 0);
      assert.deepStrictEqual(inspect(parser('[#]')), void 0);
      assert.deepStrictEqual(inspect(parser('[# a]')), void 0);
      assert.deepStrictEqual(inspect(parser('[#a ]')), void 0);
      assert.deepStrictEqual(inspect(parser('[#a\nb]')), void 0);
    });

    it('ab', () => {
      assert.deepStrictEqual(inspect(parser('[#a]')), [['<a href="#index:a" rel="noopener">a</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[#a b]')), [['<a href="#index:a-b" rel="noopener">a b</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[#\\]]')), [['<a href="#index:]" rel="noopener">]</a>'], '']);
    });

  });

});
