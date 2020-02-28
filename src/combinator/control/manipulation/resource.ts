import { Parser, Ctx } from '../../data/parser';
import { DeepMutable } from 'spica/type';

export function creator<P extends Parser<unknown>>(parser: P): P;
export function creator<P extends Parser<unknown>>(cost: number, parser: P): P;
export function creator(cost: number | Parser<unknown>, parser?: Parser<unknown>): Parser<unknown> {
  if (typeof cost === 'function') return creator(1, cost);
  return (source, context: DeepMutable<Ctx>) => {
    const { resource } = context;
    if (resource && resource.creation < 0) throw new Error('Too many creations');
    const result = parser!(source, context);
    if (result && resource) {
      resource.creation -= cost;
      assert(Object.getPrototypeOf(resource).creation % 10 === 0);
    }
    return result;
  };
}
