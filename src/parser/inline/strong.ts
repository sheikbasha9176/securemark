import { StrongParser, inline } from '../inline';
import { union, some, validate, verify, surround, configure, lazy, fmap } from '../../combinator';
import { defrag, trimNodeEnd, hasTightText } from '../util';
import { html, text } from 'typed-dom';

export const strong: StrongParser = lazy(() => verify(fmap(trimNodeEnd(validate(
  /^\*\*\S[\s\S]*?\*\*/,
  configure({ syntax: { inline: { strong: false } } },
  surround('**', defrag(union([some(inline, '**')])), '**')))),
  (ns, _, config) =>
    config?.syntax?.inline?.strong ?? true
      ? [html('strong', ns)]
      : [html('span', { class: 'invalid', 'data-invalid-syntax': 'strong', 'data-invalid-type': 'nesting' }, [text('**'), ...ns, text('**')])]),
  ([el]) => hasTightText(el)));
