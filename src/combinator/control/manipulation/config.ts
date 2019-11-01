import { Parser, Config } from '../../data/parser';
import { extend } from 'spica/assign';

export function check<P extends Parser<object>>(f: (config: Config<P>) => boolean, parser: P): P;
export function check<T extends object, D extends Parser<unknown, any, S, C>[], S extends object, C extends object>(f: (config: C) => boolean, parser: Parser<T, D, S, C>): Parser<T, D, S, C> {
  return (source, state, config) =>
    f(config)
      ? parser(source, state, config)
      : undefined;
}

const singleton = {};

export function configure<P extends Parser<object>>(config: Config<P>, parser: P): P;
export function configure<T extends object, D extends Parser<unknown, any, S, C>[], S extends object, C extends object>(config: C, parser: Parser<T, D, S, C>): Parser<T, D, S, C> {
  const memory = new WeakMap<C, C>();
  return (source, state: S, base: C) => {
    base = !memory.has(base) && Object.keys(base).length === 0
      ? singleton as C
      : base;
    return parser(source, state, memory.get(base) || memory.set(base, extend<C>({}, base, config)).get(base)!);
  };
}