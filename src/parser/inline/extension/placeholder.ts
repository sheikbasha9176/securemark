import { ExtensionParser, inline } from '../../inline';
import { union, some, creator, backtracker, surround, update, lazy, fmap } from '../../../combinator';
import { str } from '../../source';
import { defrag, startTight } from '../../util';
import { html } from 'typed-dom';

// Already used symbols: !@$&*<
export const placeholder: ExtensionParser.PlaceholderParser = lazy(() => creator(fmap(surround(
  /^\[[:^]/,
  update({ syntax: { inline: {
    link: false,
    media: false,
    annotation: false,
    reference: false,
    extension: false,
    autolink: false,
  }}},
  startTight(some(union([inline]), ']'))),
  backtracker(str(']'))),
  ns =>
    [html('span', { class: 'invalid', 'data-invalid-syntax': 'extension', 'data-invalid-message': 'Invalid flag' }, defrag(ns))])));
