export function context(base: DocumentFragment | HTMLElement | ShadowRoot, bound: string = 'blockquote, aside'): (el: Element) => boolean {
  const memory = new WeakMap<Node, boolean>();
  const context = base.nodeType === 1 && (base as HTMLElement).closest(bound) || null;
  return el => {
    assert(el.parentNode?.parentNode);
    const node = memory.has(el.parentNode!)
      ? el.parentNode!
      : el.parentNode!.parentNode!;
    return memory.has(node)
      ? memory.get(node)!
      : memory.set(node, el.closest(bound) === context).get(node)!;
  };
}
