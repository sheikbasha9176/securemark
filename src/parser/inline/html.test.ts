﻿import { html } from './html';
import { some } from '../../combinator';
import { inspect } from '../../debug.test';

describe('Unit: parser/inline/html', () => {
  describe('html', () => {
    const parser = some(html);

    it('xss', () => {
      assert.deepStrictEqual(inspect(parser('<script>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;script&gt;</span>'], '']);
      assert.deepStrictEqual(inspect(parser('<script>alert()<script>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;script&gt;</span>'], 'alert()<script>']);
      assert.deepStrictEqual(inspect(parser('<script>alert()</script>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;script&gt;</span>'], 'alert()</script>']);
      assert.deepStrictEqual(inspect(parser('<script src="."></script>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;script src="."&gt;</span>'], '</script>']);
      assert.deepStrictEqual(inspect(parser('<small onclick="alert()">')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;small onclick="alert()"&gt;</span>'], '']);
      assert.deepStrictEqual(inspect(parser('<small onclick="alert()"></small>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;small onclick="alert()"&gt;</span>'], '</small>']);
      assert.deepStrictEqual(inspect(parser('<small><small onclick="alert()"></small></small>')), [['<small><span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;small onclick="alert()"&gt;</span></small>'], '</small>']);
      assert.deepStrictEqual(inspect(parser('<bdo dir="rtl\\"><">a</bdo>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;bdo dir="rtl\\"&gt;&lt;"&gt;</span>'], 'a</bdo>']);
    });

    it('invalid', () => {
      assert.deepStrictEqual(inspect(parser('')), undefined);
      assert.deepStrictEqual(inspect(parser('<small>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;small&gt;</span>'], '']);
      assert.deepStrictEqual(inspect(parser('<small></small>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;small&gt;</span>'], '</small>']);
      assert.deepStrictEqual(inspect(parser('<small> </small>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;small&gt;</span>'], ' </small>']);
      assert.deepStrictEqual(inspect(parser('<small>\n</small>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;small&gt;</span>'], '\n</small>']);
      assert.deepStrictEqual(inspect(parser('<small>a')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;small&gt;</span>'], 'a']);
      assert.deepStrictEqual(inspect(parser('<small>a</BDO>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;small&gt;</span>'], 'a</BDO>']);
      assert.deepStrictEqual(inspect(parser('<SMALL>a</SMALL>')), undefined);
      assert.deepStrictEqual(inspect(parser('<SMALL>a</bdo>')), undefined);
      assert.deepStrictEqual(inspect(parser('</small>')), undefined);
      assert.deepStrictEqual(inspect(parser('a')), undefined);
      assert.deepStrictEqual(inspect(parser('a<small>')), undefined);
      assert.deepStrictEqual(inspect(parser('a<small>b</small>')), undefined);
    });

    it('basic', () => {
      assert.deepStrictEqual(inspect(parser('<small>a</small>')), [['<small>a</small>'], '']);
      assert.deepStrictEqual(inspect(parser('<small>a</small>a')), [['<small>a</small>'], 'a']);
      assert.deepStrictEqual(inspect(parser('<small>a </small>')), [['<small>a</small>'], '']);
      assert.deepStrictEqual(inspect(parser('<small> a</small>')), [['<small>a</small>'], '']);
      assert.deepStrictEqual(inspect(parser('<small> a </small>')), [['<small>a</small>'], '']);
      assert.deepStrictEqual(inspect(parser('<small>\na\n</small>')), [['<small>a</small>'], '']);
      assert.deepStrictEqual(inspect(parser('<small> \na \n</small>')), [['<small>a</small>'], '']);
      assert.deepStrictEqual(inspect(parser('<small>\\\na\\\n</small>')), [['<small>a</small>'], '']);
      assert.deepStrictEqual(inspect(parser('<small>a\nb</small>')), [['<small>a<span class="linebreak"> </span>b</small>'], '']);
      assert.deepStrictEqual(inspect(parser('<wbr>a')), [['<wbr>'], 'a']);
    });

    it('nest', () => {
      assert.deepStrictEqual(inspect(parser('<small><small>a</small></small>')), [['<small><small>a</small></small>'], '']);
      assert.deepStrictEqual(inspect(parser('<small>a<small>b</small>c</small>')), [['<small>a<small>b</small>c</small>'], '']);
      assert.deepStrictEqual(inspect(parser('<small>`a`</small>')), [['<small><code data-src="`a`">a</code></small>'], '']);
    });

    it('escape', () => {
      assert.deepStrictEqual(inspect(parser('<a>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;a&gt;</span>'], '']);
      assert.deepStrictEqual(inspect(parser('<small><a></a></small>')), [['<small><span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;a&gt;</span>&lt;/a&gt;</small>'], '']);
      assert.deepStrictEqual(inspect(parser('<small>a<a>b</a>c</small>')), [['<small>a<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;a&gt;</span>b&lt;/a&gt;c</small>'], '']);
      assert.deepStrictEqual(inspect(parser('<img>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;img&gt;</span>'], '']);
      assert.deepStrictEqual(inspect(parser('<small><img></small>')), [['<small><span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;img&gt;</span></small>'], '']);
      assert.deepStrictEqual(inspect(parser('<img />')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;img /&gt;</span>'], '']);
      assert.deepStrictEqual(inspect(parser('<small><img /></small>')), [['<small><span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;img /&gt;</span></small>'], '']);
    });

    it('attribute', () => {
      assert.deepStrictEqual(inspect(parser('<small constructor>a</small>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;small constructor&gt;</span>'], 'a</small>']);
      assert.deepStrictEqual(inspect(parser('<small toString>a</small>')), undefined);
      assert.deepStrictEqual(inspect(parser('<bdo>a</bdo>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;bdo&gt;</span>'], 'a</bdo>']);
      assert.deepStrictEqual(inspect(parser('<bdo >a</bdo>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;bdo &gt;</span>'], 'a</bdo>']);
      assert.deepStrictEqual(inspect(parser('<bdo constructor>a</bdo>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;bdo constructor&gt;</span>'], 'a</bdo>']);
      assert.deepStrictEqual(inspect(parser('<bdo toString>a</bdo>')), undefined);
      assert.deepStrictEqual(inspect(parser('<bdo dir>a</bdo>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;bdo dir&gt;</span>'], 'a</bdo>']);
      assert.deepStrictEqual(inspect(parser('<bdo dir=>a</bdo>')), undefined);
      assert.deepStrictEqual(inspect(parser('<bdo dir=rtl>a</bdo>')), undefined);
      assert.deepStrictEqual(inspect(parser('<bdo dir="">a</bdo>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;bdo dir=""&gt;</span>'], 'a</bdo>']);
      assert.deepStrictEqual(inspect(parser('<bdo dir="rtl" dir="rtl">a</bdo>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;bdo dir="rtl" dir="rtl"&gt;</span>'], 'a</bdo>']);
      assert.deepStrictEqual(inspect(parser('<bdo dir="rtl">a</bdo>')), [['<bdo dir="rtl">a</bdo>'], '']);
      assert.deepStrictEqual(inspect(parser('<bdo dir="rtl" >a</bdo>')), [['<bdo dir="rtl">a</bdo>'], '']);
      assert.deepStrictEqual(inspect(parser('<wbr constructor>')), [['<span class="invalid" data-invalid-syntax="html" data-invalid-type="syntax">&lt;wbr constructor&gt;</span>'], '']);
    });

  });

});
