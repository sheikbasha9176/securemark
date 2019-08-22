import { context } from './context';
import { isFixed, isFormatted } from '../parser/inline';
import { number as calculate } from '../parser/inline/extension/label';
import { MultiMap } from 'spica/multimap';
import { define } from 'typed-dom';

export function figure(source: DocumentFragment | HTMLElement | ShadowRoot): void {
  const refs = new MultiMap<string, Element>(
    [...source.querySelectorAll('a.label')]
      .filter(context(source, 'blockquote, aside'))
      .map(el => [el.getAttribute('data-label')!, el]));
  const numbers = new Map<string, string>();
  let base = '0';
  let bases: readonly string[] = base.split('.');
  for (const def of source.children) {
    if (!['FIGURE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(def.tagName)) continue;
    if (base === '0' && def.tagName[0] === 'H') continue;
    assert(base === '0' || bases.length > 1);
    const label = def.tagName === 'FIGURE'
      ? def.getAttribute('data-label')!
      : `$-${increment(bases, def as HTMLHeadingElement)}`;
    if (label === '$-') continue;
    const group = label.split('-', 1)[0];
    assert(label && group);
    assert(group === def.getAttribute('data-group') || !def.matches('figure'));
    let number = calculate(
      label,
      numbers.has(group) && !isFixed(label)
        ? numbers.get(group)!.split('.')
            .slice(0, isFormatted(label) ? label.slice(label.lastIndexOf('-') + 1).split('.').length : bases.length).join('.')
        : base);
    assert(def.matches('figure') || number.endsWith('.0'));
    if (number.split('.').pop() === '0') {
      assert(isFixed(label));
      if (number === '0') {
        number = `0${'.0'.repeat(bases.length - 1)}`;
      }
      else if (number.startsWith('0.') && number.endsWith('.0')) {
        number = bases.slice()
          .reduce((idx, _, i, bases) => {
            i === idx.length
              ? bases.length = i
              : idx[i] = +idx[i] > +bases[i]
                ? idx[i]
                : +idx[i] === 0
                  ? bases[i]
                  : `${+bases[i] + 1}`;
            return idx;
          }, number.split('.'))
          .join('.');
      }
      base = number;
      bases = base.split('.');
      void numbers.clear();
      if (def.tagName !== 'FIGURE') continue;
      assert(!void def.setAttribute('data-number', number));
      continue;
    }
    assert(def.matches('figure:not([style])'));
    assert(number.split('.').pop() !== '0');
    void numbers.set(group, number);
    assert(!void def.setAttribute('data-number', number));
    const figid = isFormatted(label) ? label.slice(0, label.lastIndexOf('-')) : label;
    void def.setAttribute('id', `label:${figid}`);
    const figindex = group === '$' ? `(${number})` : `${capitalize(group)}. ${number}`;
    void define([...def.children].find(el => el.classList.contains('figindex'))!, group === '$' ? figindex : `${figindex}. `);
    for (const ref of refs.ref(figid)) {
      void define(ref, { href: `#${def.id}` }, figindex);
    }
  }
}

function increment(bases: readonly string[], el: HTMLHeadingElement): string {
  const cursor = +el.tagName[1] - 1 || 1;
  assert(cursor > 0);
  return cursor < bases.length || bases.length === 1
    ? [...bases.slice(0, cursor - 1), +bases[cursor - 1] + 1, '0'].join('.')
    : '';
}

function capitalize(label: string): string {
  return label[0].toUpperCase() + label.slice(1);
}
