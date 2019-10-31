import { Parser, exec } from '../../data/parser';
import { firstline } from './line';

export function block<P extends Parser<unknown, any, object, object>>(parser: P, separation?: boolean): P;
export function block<T, D extends Parser<unknown, any, object, object>[]>(parser: Parser<T, D, object, object>, separation = true): Parser<T, D, object, object> {
  assert(parser);
  return (source, config) => {
    if (source === '') return;
    const result = parser(source, config);
    if (!result) return;
    const rest = exec(result);
    if (separation && firstline(rest).trim() !== '') return;
    return rest === '' || source[source.length - rest.length - 1] === '\n'
      ? result
      : undefined;
  };
}
