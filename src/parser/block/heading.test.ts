﻿import { heading } from './heading';
import { some } from '../../combinator';
import { inspect } from '../../debug.test';

describe('Unit: parser/block/heading', () => {
  describe('heading', () => {
    const parser = some(heading);

    it('invalid', () => {
      assert.deepStrictEqual(inspect(parser('')), undefined);
      assert.deepStrictEqual(inspect(parser('\n')), undefined);
      assert.deepStrictEqual(inspect(parser('#')), undefined);
      assert.deepStrictEqual(inspect(parser('# ')), undefined);
      assert.deepStrictEqual(inspect(parser('#\n')), undefined);
      assert.deepStrictEqual(inspect(parser('#a\n')), undefined);
      assert.deepStrictEqual(inspect(parser('#a \n')), undefined);
      assert.deepStrictEqual(inspect(parser('#a\n#')), undefined);
      assert.deepStrictEqual(inspect(parser('#a\\\n#')), undefined);
      assert.deepStrictEqual(inspect(parser('# a\nb')), undefined);
      assert.deepStrictEqual(inspect(parser('# *a\nb*')), undefined);
      assert.deepStrictEqual(inspect(parser('# !http://host')), undefined);
      assert.deepStrictEqual(inspect(parser('####### a')), undefined);
    });

    it('basic', () => {
      assert.deepStrictEqual(inspect(parser('# a')), [['<h1 id="index:a">a</h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a ')), [['<h1 id="index:a">a</h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a b  c \n')), [['<h1 id="index:a-b-c">a b  c</h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a\n')), [['<h1 id="index:a">a</h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# *a*`b`${c}$')), [['<h1 id="index:a`b`${c}$"><em>a</em><code data-src="`b`">b</code><span class="math notranslate" data-src="${c}$">${c}$</span></h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a\\')), [['<h1 id="index:a">a</h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a\\\n')), [['<h1 id="index:a">a</h1>'], '']);
      assert.deepStrictEqual(inspect(parser('###### a')), [['<h6 id="index:a">a</h6>'], '']);
    });

    it('index', () => {
      assert.deepStrictEqual(inspect(parser('# [#a]')), [['<h1 id="index:a"><a href="#index:a" rel="noopener">a</a></h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a[#b]')), [['<h1 id="index:ab">a<a href="#index:b" rel="noopener">b</a></h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a [#b]')), [['<h1 id="index:b">a</h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a [#b] ')), [['<h1 id="index:b">a</h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a [#b]\\')), [['<h1 id="index:a-b">a <a href="#index:b" rel="noopener">b</a></h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a [#b c]')), [['<h1 id="index:b-c">a</h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a [#*b*`c`$d$]')), [['<h1 id="index:b`c`$d$">a</h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a [#b] [#c]')), [['<h1 id="index:c">a <a href="#index:b" rel="noopener">b</a></h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a  [#b] \n')), [['<h1 id="index:b">a</h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a \\[#b]')), [['<h1 id="index:a-[#b]">a [#b]</h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# A')), [['<h1 id="index:a">A</h1>'], '']);
      assert.deepStrictEqual(inspect(parser('# a [#B]')), [['<h1 id="index:b">a</h1>'], '']);
    });

  });

});