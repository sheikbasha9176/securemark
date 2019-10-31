import { StrongParser, inline } from '../inline';
import { union, some, validate, verify, surround, check, configure, lazy, fmap } from '../../combinator';
import { defrag, trimNodeEnd, hasTightText } from '../util';
import { html } from 'typed-dom';

export const strong: StrongParser = lazy(() => verify(fmap(trimNodeEnd(validate(
  /^\*\*\S[\s\S]*?\*\*/,
  check(config => config?.syntax?.inline?.strong ?? true,
  configure({ syntax: { inline: { strong: false } } },
  surround('**', defrag(union([some(inline, '**')])), '**'))))),
  ns => [html('strong', ns)]),
  ([el]) => hasTightText(el)));
