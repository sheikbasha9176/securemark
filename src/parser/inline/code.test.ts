﻿import { code } from './code';
import { some } from '../../combinator';
import { inspect } from '../../debug.test';

describe('Unit: parser/inline/code', () => {
  describe('code', () => {
    const parser = some(code);

    it('invalid', () => {
      assert.deepStrictEqual(inspect(parser('')), undefined);
      assert.deepStrictEqual(inspect(parser('`')), undefined);
      assert.deepStrictEqual(inspect(parser('``')), undefined);
      assert.deepStrictEqual(inspect(parser('` `')), undefined);
      assert.deepStrictEqual(inspect(parser('`a``')), undefined);
      assert.deepStrictEqual(inspect(parser('`\n`')), undefined);
      assert.deepStrictEqual(inspect(parser('`a\nb`')), undefined);
      assert.deepStrictEqual(inspect(parser('`a\\\nb`')), undefined);
      assert.deepStrictEqual(inspect(parser('a`b`')), undefined);
    });

    it('basic', () => {
      assert.deepStrictEqual(inspect(parser('`a`')), [['<code data-src="`a`">a</code>'], '']);
      assert.deepStrictEqual(inspect(parser('`ab`')), [['<code data-src="`ab`">ab</code>'], '']);
      assert.deepStrictEqual(inspect(parser('`a`b')), [['<code data-src="`a`">a</code>'], 'b']);
    });

    it('escape', () => {
      assert.deepStrictEqual(inspect(parser('`\\`')), [['<code data-src="`\\`">\\</code>'], '']);
      assert.deepStrictEqual(inspect(parser('`\\\\`')), [['<code data-src="`\\\\`">\\\\</code>'], '']);
      assert.deepStrictEqual(inspect(parser('`&nbsp;`')), [['<code data-src="`&amp;nbsp;`">&amp;nbsp;</code>'], '']);
      assert.deepStrictEqual(inspect(parser('` `` `')), [['<code data-src="` `` `">``</code>'], '']);
      assert.deepStrictEqual(inspect(parser('`` ` ``')), [['<code data-src="`` ` ``">`</code>'], '']);
    });

    it('nest', () => {
      assert.deepStrictEqual(inspect(parser('`<wbr>`')), [['<code data-src="`<wbr>`">&lt;wbr&gt;</code>'], '']);
      assert.deepStrictEqual(inspect(parser('`*u*`')), [['<code data-src="`*u*`">*u*</code>'], '']);
    });

    it('trim', () => {
      assert.deepStrictEqual(inspect(parser('` a b `')), [['<code data-src="` a b `">a b</code>'], '']);
    });

  });

});