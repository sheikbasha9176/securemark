import { Parser, Data, SubData, SubParsers, IntermediateParser, eval, exec, check } from '../parser';
import { concat } from 'spica/concat';

export function sequence<P extends Parser<unknown>>(parsers: SubParsers<P>): SubData<P> extends Data<P> ? P : IntermediateParser<P>;
export function sequence<T, D extends Parser<T>[]>(parsers: D): Parser<T, D> {
  assert(parsers.every(f => f));
  return (source, config) => {
    let rest = source;
    const data: T[] = [];
    for (let i = 0, len = parsers.length; i < len; ++i) {
      if (rest === '') return;
      const result = parsers[i](rest, config);
      assert(check(rest, result));
      if (!result) return;
      void concat(data, eval(result));
      rest = exec(result);
    }
    assert(rest.length <= source.length);
    return rest.length < source.length
      ? [data, rest]
      : void 0;
  };
}
