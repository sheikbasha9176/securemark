import { Parser, Data, eval, exec, check } from '../../data/parser';

export function contract<P extends Parser<unknown>>(pattern: RegExp | string, parser: P, cond: (results: readonly Data<P>[], rest: string) => boolean): P;
export function contract<T, D extends Parser<unknown>[]>(pattern: RegExp | string, parser: Parser<T, D>, cond: (results: readonly T[], rest: string) => boolean): Parser<T, D> {
  return verify(validate(pattern, parser), cond);
}

export function validate<P extends Parser<unknown>>(pattern: RegExp | string, parser: P): P;
export function validate<T, D extends Parser<unknown>[]>(pattern: RegExp | string, parser: Parser<T, D>): Parser<T, D> {
  assert(pattern instanceof RegExp ? !pattern.global && pattern.source.startsWith('^') : true);
  assert(parser);
  return (source, config, state) => {
    if (source === '') return;
    switch (typeof pattern) {
      case 'string':
        if (source.startsWith(pattern)) break;
        return;
      default:
        if (pattern.test(source)) break;
        return;
    }
    const result = parser(source, config, state);
    assert(check(source, result));
    if (!result) return;
    return exec(result).length < source.length
      ? result
      : undefined;
  };
}

export function verify<P extends Parser<unknown>>(parser: P, cond: (results: readonly Data<P>[], rest: string) => boolean): P;
export function verify<T, D extends Parser<unknown>[]>(parser: Parser<T, D>, cond: (results: readonly T[], rest: string) => boolean): Parser<T, D> {
  assert(parser);
  return (source, config, state) => {
    if (source === '') return;
    const result = parser(source, config, state);
    assert(check(source, result));
    if (!result) return;
    if (!cond(eval(result), exec(result))) return;
    return exec(result).length < source.length
      ? result
      : undefined;
  };
}
