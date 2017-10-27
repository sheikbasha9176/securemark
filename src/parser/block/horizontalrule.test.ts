﻿import { loop } from '../../combinator/loop';
import { horizontalrule } from './horizontalrule';
import { inspect } from '../debug.test';

describe('Unit: parser/block/horizontalrule', () => {
  describe('newline', () => {
    const parser = loop(horizontalrule);

    it('invalid', () => {
      assert.deepStrictEqual(inspect(parser('')), undefined);
      assert.deepStrictEqual(inspect(parser('\n')), undefined);
      assert.deepStrictEqual(inspect(parser('-')), undefined);
      assert.deepStrictEqual(inspect(parser('--')), undefined);
      assert.deepStrictEqual(inspect(parser('--\n-')), undefined);
      assert.deepStrictEqual(inspect(parser('---\na')), undefined);
      assert.deepStrictEqual(inspect(parser('***')), undefined);
    });

    it('valid', () => {
      assert.deepStrictEqual(inspect(parser('---')), [['<hr>'], '']);
      assert.deepStrictEqual(inspect(parser('---\n')), [['<hr>'], '']);
      assert.deepStrictEqual(inspect(parser('---\n\n')), [['<hr>'], '\n']);
      assert.deepStrictEqual(inspect(parser('  -   - -')), [['<hr>'], '']);
      assert.deepStrictEqual(inspect(parser('  -   - - ')), [['<hr>'], '']);
      assert.deepStrictEqual(inspect(parser('  -   - - \n')), [['<hr>'], '']);
      assert.deepStrictEqual(inspect(parser('----')), [['<hr>'], '']);
      assert.deepStrictEqual(inspect(parser('  -   - --')), [['<hr>'], '']);
      assert.deepStrictEqual(inspect(parser('  -   - -- ')), [['<hr>'], '']);
      assert.deepStrictEqual(inspect(parser('  -   - -- \n')), [['<hr>'], '']);
    });

  });

});
