﻿import { label } from './label';
import { some } from '../../../combinator';
import { inspect } from '../../../debug.test';

describe('Unit: parser/inline/extension/label', () => {
  describe('label', () => {
    const parser = some(label);

    it('invalid', () => {
      assert.deepStrictEqual(inspect(parser('[]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:a]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:a-]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:a--]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:a-0.]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:a-.0]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:a-0b]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:a-b-]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:a-b-1]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:a-b-0.]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:a-b-.0]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:a$-b]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:$a-b]')), undefined);
      assert.deepStrictEqual(inspect(parser('[:$$-b]')), undefined);
    });

    it('basic', () => {
      assert.deepStrictEqual(inspect(parser('[:a-b]')), [['<a href="#label:a-b" rel="noopener" class="label:a-b">a-b</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[:a-b-0]')), [['<a href="#label:a-b-0" rel="noopener" class="label:a-b-0">a-b-0</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[:a-b-0.0]')), [['<a href="#label:a-b-0.0" rel="noopener" class="label:a-b-0.0">a-b-0.0</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[:a-b-0.0.0]')), [['<a href="#label:a-b-0.0.0" rel="noopener" class="label:a-b-0.0.0">a-b-0.0.0</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[:a-0]')), [['<a href="#label:a-0" rel="noopener" class="label:a-0">a-0</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[:$-b]')), [['<a href="#label:$-b" rel="noopener" class="label:$-b">$-b</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[:$-1]')), [['<a href="#label:$-1" rel="noopener" class="label:$-1">$-1</a>'], '']);
    });

  });

});