﻿import { segment } from './segment';

describe('Unit: parser/api/segment', () => {
  describe('segment', () => {
    it('basic', () => {
      assert.deepStrictEqual(segment(''), []);
      assert.deepStrictEqual(segment('a'), ['a']);
      assert.deepStrictEqual(segment('a\n'), ['a\n']);
      assert.deepStrictEqual(segment('a\n\n'), ['a\n', '\n']);
      assert.deepStrictEqual(segment('a\n\n\n'), ['a\n', '\n\n']);
      assert.deepStrictEqual(segment('a\nb'), ['a\nb']);
      assert.deepStrictEqual(segment('a\nb\n'), ['a\nb\n']);
      assert.deepStrictEqual(segment('a\nb\n\n'), ['a\nb\n', '\n']);
      assert.deepStrictEqual(segment('a\nb\n\n\n'), ['a\nb\n', '\n\n']);
      assert.deepStrictEqual(segment('a\nb\n\nc\n\nd'), ['a\nb\n', '\n', 'c\n', '\n', 'd']);
      assert.deepStrictEqual(segment('a '), ['a ']);
      assert.deepStrictEqual(segment(' a'), [' a']);
      assert.deepStrictEqual(segment(' a '), [' a ']);
    });

    it('newline', () => {
      assert.deepStrictEqual(segment('\n'), ['\n']);
      assert.deepStrictEqual(segment('\n\n'), ['\n\n']);
      assert.deepStrictEqual(segment('\n\n\n'), ['\n\n\n']);
      assert.deepStrictEqual(segment('\n\n\n\n'), ['\n\n\n\n']);
      assert.deepStrictEqual(segment(' '), [' ']);
      assert.deepStrictEqual(segment(' \n'), [' \n']);
      assert.deepStrictEqual(segment(' \n \n \n '), [' \n \n \n ']);
      assert.deepStrictEqual(segment('a\n'), ['a\n']);
      assert.deepStrictEqual(segment('a\n '), ['a\n', ' ']);
      assert.deepStrictEqual(segment('a\n\n '), ['a\n', '\n ']);
      assert.deepStrictEqual(segment('a\n\n\n '), ['a\n', '\n\n ']);
      assert.deepStrictEqual(segment('a\n\n\n\n '), ['a\n', '\n\n\n ']);
      assert.deepStrictEqual(segment('a\n\n\n\n\n '), ['a\n', '\n\n\n\n ']);
      assert.deepStrictEqual(segment('a\n\n\n\n\n\n '), ['a\n', '\n\n\n\n\n ']);
      assert.deepStrictEqual(segment('a\n\\\nb'), ['a\n', '\\\n', 'b']);
    });

    it('pretext', () => {
      assert.deepStrictEqual(segment('```'), ['```']);
      assert.deepStrictEqual(segment('```\n```'), ['```\n```']);
      assert.deepStrictEqual(segment('```\n\n\n```'), ['```\n\n\n```']);
      assert.deepStrictEqual(segment('```\n````\n```'), ['```\n````\n```']);
      assert.deepStrictEqual(segment('````\n```\n````'), ['````\n```\n````']);
      assert.deepStrictEqual(segment('```\n\n\n```\n\n'), ['```\n\n\n```\n', '\n']);
    });

    it('math', () => {
      assert.deepStrictEqual(segment('$$'), ['$$']);
      assert.deepStrictEqual(segment('$$\n$$'), ['$$\n$$']);
      assert.deepStrictEqual(segment('$$\n\n\n$$'), ['$$\n\n\n$$']);
      assert.deepStrictEqual(segment('$$\n\n\n$$\n\n'), ['$$\n\n\n$$\n', '\n']);
    });

    it('extension', () => {
      assert.deepStrictEqual(segment('~~~'), ['~~~']);
      assert.deepStrictEqual(segment('~~~\n~~~'), ['~~~\n~~~']);
      assert.deepStrictEqual(segment('~~~\n\n\n~~~'), ['~~~\n\n\n~~~']);
      assert.deepStrictEqual(segment('~~~\n~~~~\n~~~'), ['~~~\n~~~~\n~~~']);
      assert.deepStrictEqual(segment('~~~~\n~~~\n~~~~'), ['~~~~\n~~~\n~~~~']);
      assert.deepStrictEqual(segment('~~~\n\n\n~~~\n\n'), ['~~~\n\n\n~~~\n', '\n']);
      assert.deepStrictEqual(segment('~~~\n```\n~~~\n```\n~~~'), ['~~~\n```\n~~~\n```\n~~~']);
      assert.deepStrictEqual(segment('~~~\ninvalid\n\ncaption\n~~~'), ['~~~\ninvalid\n\ncaption\n~~~']);
    });

    it('mixed', () => {
      assert.deepStrictEqual(segment('```\n\n\n'), ['```\n', '\n\n']);
      assert.deepStrictEqual(segment('~~~\n\n\n'), ['~~~\n', '\n\n']);
      assert.deepStrictEqual(segment('```\n\n\n~~~\n\n\n```'), ['```\n\n\n~~~\n\n\n```']);
      assert.deepStrictEqual(segment('~~~\n\n\n```\n\n\n~~~'), ['~~~\n\n\n```\n\n\n~~~']);
      assert.deepStrictEqual(segment('```\n```\n\n~~~\n~~~'), ['```\n```\n', '\n', '~~~\n~~~']);
      assert.deepStrictEqual(segment('~~~\n~~~\n\n```\n```'), ['~~~\n~~~\n', '\n', '```\n```']);
      assert.deepStrictEqual(segment(' ```\n\n\n```'), [' ```\n', '\n\n', '```']);
      assert.deepStrictEqual(segment(' ~~~\n\n\n~~~'), [' ~~~\n', '\n\n', '~~~']);
    });

    it('blockquote', () => {
      assert.deepStrictEqual(segment('> ```\n\n\n```'), ['> ```\n', '\n\n', '```']);
      assert.deepStrictEqual(segment('!> ```\n\n\n```'), ['!> ```\n', '\n\n', '```']);
    });

  });

});