import { WeakMap } from 'spica/global';
import { hasOwnProperty, ObjectCreate } from 'spica/alias';
import { Parser, Ctx, Context } from '../../data/parser';
import { template } from 'spica/assign';
import { type } from 'spica/type';
import { memoize } from 'spica/memoize';

export function guard<P extends Parser<unknown>>(f: (context: Context<P>) => boolean, parser: P): P;
export function guard<T extends unknown, D extends Parser<unknown, any>[]>(f: (context: Ctx) => boolean, parser: Parser<T, D>): Parser<T, D> {
  return (source, context) =>
    f(context)
      ? parser(source, context)
      : void 0;
}

export function update<P extends Parser<unknown>>(context: Context<P>, parser: P): P;
export function update<T extends unknown, D extends Parser<unknown, any, C>[], C extends Ctx>(base: C, parser: Parser<T, D, C>): Parser<T, D, C> {
  assert(Object.getPrototypeOf(base) === Object.prototype);
  return (source, context) =>
    parser(source, merge(ObjectCreate(context), base));
}

export function context<P extends Parser<unknown>>(context: Context<P>, parser: P): P;
export function context<T extends unknown, D extends Parser<unknown, any, C>[], C extends Ctx>(base: C, parser: Parser<T, D, C>): Parser<T, D, C> {
  assert(Object.getPrototypeOf(base) === Object.prototype);
  const merge_ = memoize<C, C>(context => merge(ObjectCreate(context), base), new WeakMap());
  return (source, context) =>
    parser(source, merge_(context));
}

const merge = template((prop, target, source) => {
  switch (prop) {
    case 'resource':
      assert(typeof source[prop] === 'object');
      return prop in target
        ? target[prop]
        : target[prop] = ObjectCreate(source[prop]);
  }
  switch (type(source[prop])) {
    case 'Object':
      assert(Object.getPrototypeOf(source[prop]) === Object.prototype);
      switch (type(target[prop])) {
        case 'Object':
          return target[prop] = isOwnProperty(target, prop)
            ? merge(target[prop], source[prop])
            : merge(ObjectCreate(target[prop]), source[prop]);
        default:
          return target[prop] = ObjectCreate(source[prop]);
      }
    default:
      return target[prop] = source[prop];
  }
});

const isOwnProperty: (o: object, p: string) => boolean = '__proto__' in {}
  ? (o, p) => !('__proto__' in o) || o[p] !== o['__proto__'][p]
  : hasOwnProperty;