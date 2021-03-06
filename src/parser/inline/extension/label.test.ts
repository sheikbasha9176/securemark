import { label } from './label';
import { some } from '../../../combinator';
import { inspect } from '../../../debug.test';

describe('Unit: parser/inline/extension/label', () => {
  describe('label', () => {
    const parser = (source: string) => some(label)(source, {});

    it('invalid', () => {
      assert.deepStrictEqual(inspect(parser('[]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a-]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a--]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a-0')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a-0.]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a-.0]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a-0b]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a-b')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a-b-]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a-b-1]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a-b-0.]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a-b-.0]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a$-b]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$$a-b]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$$$-b]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a-0.0.0.0]')), undefined);
      assert.deepStrictEqual(inspect(parser('[$a-1.1.1.1]')), undefined);
    });

    it('basic', () => {
      assert.deepStrictEqual(inspect(parser('[$a-b]')), [['<a class="label" data-label="a-b">$a-b</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[$a-b-0]')), [['<a class="label" data-label="a-b-0">$a-b-0</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[$a-b-0.0]')), [['<a class="label" data-label="a-b-0.0">$a-b-0.0</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[$a-b-0.0.0]')), [['<a class="label" data-label="a-b-0.0.0">$a-b-0.0.0</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[$a-0]')), [['<a class="label" data-label="a-0">$a-0</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[$-b]')), [['<a class="label" data-label="$-b">$-b</a>'], '']);
      assert.deepStrictEqual(inspect(parser('[$-0]')), [['<a class="label" data-label="$-0">$-0</a>'], '']);
      assert.deepStrictEqual(inspect(parser('$a-b')), [['<a class="label" data-label="a-b">$a-b</a>'], '']);
      assert.deepStrictEqual(inspect(parser('$-b')), [['<a class="label" data-label="$-b">$-b</a>'], '']);
    });

  });

});
