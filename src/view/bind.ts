﻿import { parse } from '../syntax';
import { segment } from './segment';

export function bind(el: HTMLElement, source: string = ''): (source: string) => void {
  type Pair = [string, HTMLElement[]];
  const pairs: Pair[] = [];
  void segment(source)
    .reduce((el, s) => (
      void pairs.push([s, Array.from<HTMLElement>(<any>parse(s).children)]),
      void pairs[pairs.length - 1][1]
        .forEach(e =>
          void el.appendChild(e)),
      el
    ), el);
  return (source: string) => {
    const os = pairs.map(([s]) => s);
    const ns = segment(source);
    let i = 0;
    for (; i < os.length; ++i) {
      if (os[i] !== ns[i]) break;
    }
    let j = 0;
    for (; i + j < os.length && i + j < ns.length; ++j) {
      if (os[os.length - j - 1] !== ns[ns.length - j - 1]) break;
    }
    if (os.length === i && ns.length === i) return;
    void pairs.splice(i, os.length - j - i)
      .forEach(([, es]) =>
        void es
          .forEach(e =>
            void e.remove()));
    const ref = pairs.slice(i).reduce<HTMLElement | null>((e, [, es]) => e || es[0], null);
    return void pairs.splice(
      i,
      0,
      ...ns.slice(i, ns.length - j)
        .map<Pair>(s =>
          [
            s,
            Array.from<HTMLElement>(<any>parse(s).children)
              .map(e =>
                <HTMLElement>el.insertBefore(e, ref))
          ]));
  };
}
