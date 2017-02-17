﻿import { loop } from '../../parser/loop';
import { plaintext } from './plaintext';
import { inspect } from '../debug.test';

describe('Unit: syntax/pretext', () => {
  describe('pretext', () => {
    it('invalid', () => {
      const parser = loop(plaintext);
      assert.deepStrictEqual(inspect(parser('')), void 0);
    });

    it('ab', () => {
      const parser = loop(plaintext);
      assert.deepStrictEqual(inspect(parser('a')), [['a'], '']);
      assert.deepStrictEqual(inspect(parser('ab')), [['ab'], '']);
    });

    it('`', () => {
      const parser = loop(plaintext);
      assert.deepStrictEqual(inspect(parser('``')), [['`', '`'], '']);
    });

    it('newline', () => {
      const parser = loop(plaintext);
      assert.deepStrictEqual(inspect(parser('\n\n')), [['\n', '\n'], '']);
    });

    it('\\', () => {
      const parser = loop(plaintext);
      assert.deepStrictEqual(inspect(parser('\\')), [['\\'], '']);
      assert.deepStrictEqual(inspect(parser('\\\\')), [['\\\\'], '']);
      assert.deepStrictEqual(inspect(parser('\\\\\\')), [['\\\\\\'], '']);
      assert.deepStrictEqual(inspect(parser('\\\\\\\\')), [['\\\\\\\\'], '']);
      assert.deepStrictEqual(inspect(parser('\\0')), [['\\0'], '']);
      assert.deepStrictEqual(inspect(parser('\\a')), [['\\a'], '']);
      assert.deepStrictEqual(inspect(parser('\\\n')), [['\\', '\n'], '']);
    });

    it('escape', () => {
      const parser = loop(plaintext);
      assert.deepStrictEqual(inspect(parser('\\!')), [['\\!'], '']);
      assert.deepStrictEqual(inspect(parser('\\[')), [['\\['], '']);
      assert.deepStrictEqual(inspect(parser('\\~')), [['\\~'], '']);
      assert.deepStrictEqual(inspect(parser('\\*')), [['\\*'], '']);
      assert.deepStrictEqual(inspect(parser('\\`')), [['\\', '`'], '']);
      assert.deepStrictEqual(inspect(parser('\\<')), [['\\&lt;'], '']);
      assert.deepStrictEqual(inspect(parser('\\\\!')), [['\\\\!'], '']);
    });

    it('tag', () => {
      const parser = loop(plaintext);
      assert.deepStrictEqual(inspect(parser('<')), [['&lt;'], '']);
      assert.deepStrictEqual(inspect(parser('<<')), [['&lt;&lt;'], '']);
      assert.deepStrictEqual(inspect(parser('<a')), [['&lt;a'], '']);
      assert.deepStrictEqual(inspect(parser('<a>')), [['&lt;a&gt;'], '']);
      assert.deepStrictEqual(inspect(parser('<a></a>')), [['&lt;a&gt;&lt;/a&gt;'], '']);
      assert.deepStrictEqual(inspect(parser('<a>a')), [['&lt;a&gt;a'], '']);
      assert.deepStrictEqual(inspect(parser('<a>a</a>')), [['&lt;a&gt;a&lt;/a&gt;'], '']);
    });

  });

});
