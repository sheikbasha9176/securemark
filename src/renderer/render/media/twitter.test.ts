﻿import { twitter } from './twitter';

describe('Unit: renderer/render/media/twitter', () => {
  describe('twitter', () => {
    it('result', () => {
      assert(!twitter('http://twitter.com/hourenso_u/status/856828123882676225'));
      assert(twitter('https://twitter.com/hourenso_u/status/856828123882676225'));
    });

  });

});
