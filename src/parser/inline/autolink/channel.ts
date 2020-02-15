import { AutolinkParser } from '../../inline';
import { inits, some, fmap } from '../../../combinator';
import { stringify } from '../../util';
import { account } from './account';
import { hashtag } from './hashtag';
import { html } from 'typed-dom';

export const channel: AutolinkParser.ChannelParser = fmap(
  inits([
    account,
    some(hashtag),
  ]),
  ns =>
    ns.length > 1
      ? [html('a', { class: 'channel', rel: 'noopener' }, stringify(ns))]
      : ns);
