import { ParserConfigs } from '../../..';
import { eval } from '../../combinator';
import { segment } from '../segment';
import { block } from '../block';
import { normalize } from './normalize';
import { figure, footnote } from '../../util';

export function bind(target: DocumentFragment | HTMLElement | ShadowRoot, cfgs: ParserConfigs): (source: string) => Generator<HTMLElement | undefined, undefined, undefined> {
  type Pair = readonly [string, readonly HTMLElement[]];
  const pairs: Pair[] = [];
  const adds: [HTMLElement, Node | null][] = [];
  const dels: HTMLElement[] = [];
  const bottom = target.firstChild;
  let revision: symbol;
  return function* (source: string): Generator<HTMLElement | undefined, undefined, undefined> {
    const rev = revision = Symbol();
    source = normalize(source);
    const targetSegments = pairs.map(([seg]) => seg);
    const sourceSegments = segment(source);
    let start = 0;
    for (; start < targetSegments.length; ++start) {
      if (targetSegments[start] !== sourceSegments[start]) break;
    }
    assert(start <= targetSegments.length);
    let end = 0;
    for (; start + end < targetSegments.length && start + end < sourceSegments.length; ++end) {
      if (targetSegments[targetSegments.length - end - 1] !== sourceSegments[sourceSegments.length - end - 1]) break;
    }
    assert(end <= targetSegments.length);
    assert(start + end <= targetSegments.length);
    const base = next(start);
    let index = start;
    for (; index < sourceSegments.length - end; ++index) {
      assert(rev === revision);
      const segment = sourceSegments[index];
      const elements = segment.trim() === ''
        ? []
        : eval(block(segment, {}));
      void pairs.splice(index, 0, [segment, elements]);
      if (elements.length === 0) continue;
      // All deletion processes always run after all addition processes have done.
      // Therefore any `base` node will never be unavailable by deletions until all the dependent `el` nodes are added.
      void adds.push(...elements.map<typeof adds[number]>(el => [el, base]));
    }
    while (pairs.length > sourceSegments.length) {
      assert(rev === revision);
      assert(index < pairs.length);
      const [[, es]] = pairs.splice(index, 1);
      void dels.push(...es);
    }
    while (adds.length > 0) {
      assert(rev === revision);
      const [el, base] = adds.shift()!;
      void target.insertBefore(el, base);
      assert(el.parentNode);
      yield el;
      if (rev !== revision) return yield;
    }
    while (dels.length > 0) {
      assert(rev === revision);
      const el = dels.shift()!;
      el.parentNode && void el.remove();
      assert(!el.parentNode);
      yield el;
      if (rev !== revision) return yield;
    }
    assert(pairs.length === sourceSegments.length);
    assert(rev === revision);
    void figure(target);
    void footnote(target, cfgs.footnote);
  };

  function next(index: number): Node | null {
    assert(index >= 0);
    assert(index <= pairs.length);
    for (let i = index; i < pairs.length; ++i) {
      const [, es] = pairs[i];
      if (es.length > 0) return es[0];
    }
    return bottom;
  }
}
