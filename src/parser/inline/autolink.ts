﻿import { AutolinkParser } from '../inline';
import { combine } from '../../combinator';
import { url } from './autolink/url';
import { account } from './autolink/account';
import { hashtag } from './autolink/hashtag';

export const autolink: AutolinkParser = combine<HTMLAnchorElement | HTMLImageElement | HTMLSpanElement | Text, AutolinkParser.InnerParsers>([
  url,
  account,
  hashtag,
]);
