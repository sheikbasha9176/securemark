﻿import { loop } from '../../parser/loop';
import { emphasis } from './emphasis';
import { inspect } from '../debug.test';

describe('Unit: syntax/emphasis', () => {
  describe('emphasis', () => {
    it('invalid', () => {
      const parser = loop(emphasis);
      assert.deepStrictEqual(inspect(parser('')), void 0);
      assert.deepStrictEqual(inspect(parser('*')), void 0);
      assert.deepStrictEqual(inspect(parser('**')), void 0);
      assert.deepStrictEqual(inspect(parser('**a**')), void 0);
      assert.deepStrictEqual(inspect(parser('*<u>*')), void 0);
      assert.deepStrictEqual(inspect(parser('a*a*')), void 0);
    });

    it('ab', () => {
      const parser = loop(emphasis);
      assert.deepStrictEqual(inspect(parser('*a*')), [['<em>a</em>'], '']);
      assert.deepStrictEqual(inspect(parser('*ab*')), [['<em>ab</em>'], '']);
      assert.deepStrictEqual(inspect(parser('*a\nb*')), [['<em>ab</em>'], '']);
    });

    it('nest', () => {
      const parser = loop(emphasis);
      assert.deepStrictEqual(inspect(parser('*<a>*')), [['<em>&lt;a&gt;</em>'], '']);
      assert.deepStrictEqual(inspect(parser('*\\<a>*')), [['<em>&lt;a&gt;</em>'], '']);
      assert.deepStrictEqual(inspect(parser('*\\<u>*')), [['<em>&lt;u&gt;</em>'], '']);
      assert.deepStrictEqual(inspect(parser('*<u></u>*')), [['<em><u></u></em>'], '']);
      assert.deepStrictEqual(inspect(parser('*`<u>`*')), [['<em><code>&lt;u&gt;</code></em>'], '']);
      assert.deepStrictEqual(inspect(parser('*[](#)*')), [['<em><a href="#">#</a></em>'], '']);
    });

  });

});
