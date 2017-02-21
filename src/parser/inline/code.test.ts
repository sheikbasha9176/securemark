﻿import { loop } from '../../combinator/loop';
import { code } from './code';
import { inspect } from '../debug.test';

describe('Unit: parser/code', () => {
  describe('code', () => {
    it('invalid', () => {
      const parser = loop(code);
      assert.deepStrictEqual(inspect(parser('')), void 0);
      assert.deepStrictEqual(inspect(parser('`')), void 0);
      assert.deepStrictEqual(inspect(parser('``')), void 0);
      assert.deepStrictEqual(inspect(parser('`\n`')), void 0);
      assert.deepStrictEqual(inspect(parser('`a\nb`')), void 0);
      assert.deepStrictEqual(inspect(parser('a`b`')), void 0);
    });

    it('ab', () => {
      const parser = loop(code);
      assert.deepStrictEqual(inspect(parser('`a`')), [['<code>a</code>'], '']);
      assert.deepStrictEqual(inspect(parser('`ab`')), [['<code>ab</code>'], '']);
    });

    it('escape', () => {
      const parser = loop(code);
      assert.deepStrictEqual(inspect(parser('`\\`')), [['<code>\\</code>'], '']);
      assert.deepStrictEqual(inspect(parser('`\\\\`')), [['<code>\\\\</code>'], '']);
      assert.deepStrictEqual(inspect(parser('`&nbsp;`')), [['<code>&amp;nbsp;</code>'], '']);
      assert.deepStrictEqual(inspect(parser('` `` `')), [['<code></code>', '<code></code>'], '']);
      assert.deepStrictEqual(inspect(parser('`` ` ``')), [['<code>`</code>'], '']);
    });

    it('nest', () => {
      const parser = loop(code);
      assert.deepStrictEqual(inspect(parser('`<u>`')), [['<code>&lt;u&gt;</code>'], '']);
      assert.deepStrictEqual(inspect(parser('`*u*`')), [['<code>*u*</code>'], '']);
    });

    it('trim', () => {
      const parser = loop(code);
      assert.deepStrictEqual(inspect(parser('` a b `')), [['<code>a b</code>'], '']);
    });

  });

});
