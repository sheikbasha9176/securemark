import { AutolinkParser } from '../../inline';
import { validate, focus, creator } from '../../../combinator';
import { html } from 'typed-dom';

// https://example.com/hashtags/a must be a hashtag page or a redirect page going there.

export const hashtag: AutolinkParser.HashtagParser = creator(validate('#', focus(
  /^#(?![0-9]+(?![A-Za-z0-9]|[^\x00-\x7F\s]))(?:[A-Za-z0-9]|[^\x00-\x7F\s])+/,
  (tag, { origin = '' }) =>
    [[html('a', { class: 'hashtag', href: `${origin}/hashtags/${tag.slice(1)}`, rel: 'noopener' }, tag)], ''])));
