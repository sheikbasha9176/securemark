﻿import { AutolinkParser } from '../../inline';
import { sequence, some, subline, rewrite, verify } from '../../../combinator';
import '../../source/unescapable';
import { account } from './account';
import { hashtag_ } from './hashtag';
import { html } from 'typed-dom';

export const channel: AutolinkParser.ChannelParser = subline(
  rewrite(
    sequence<AutolinkParser.ChannelParser>([
      verify(account, ([node]) => node instanceof HTMLAnchorElement),
      verify(some(hashtag_), ns => ns.every(node => node instanceof HTMLAnchorElement)),
    ]),
    source => [[html('a', { class: 'channel', rel: 'noopener' }, source)], '']));