import { Parser, fmap } from '../../../combinator';
import { define } from 'typed-dom';

export function indexee<P extends Parser<HTMLElement>>(parser: P): P;
export function indexee(parser: Parser<HTMLElement>): Parser<HTMLElement> {
  return fmap(parser, ([el]) => [define(el, { id: identity(text(el)) || null })]);
}

export function text(source: Element): string {
  assert(!source.matches('.indexer'));
  assert(source.querySelectorAll('.indexer').length < 2);
  assert(source.querySelector('.indexer') === source.querySelector(':scope > .indexer'));
  const indexer = [...source.children].find(el => el.classList.contains('indexer'));
  if (indexer) return indexer.getAttribute('data-index')!;
  const target = source.cloneNode(true);
  for (const el of target.querySelectorAll('code[data-src], .math[data-src]')) {
    void define(el, el.getAttribute('data-src')!);
  }
  for (const el of target.querySelectorAll('.annotation, .reference')) {
    void el.remove();
  }
  return target.textContent!.trim();
}

function identity(index: string): string {
  assert(!index.includes('\n'));
  return index
    ? `index:${index.trim().replace(/\s+/g, '-')}`
    : '';
}