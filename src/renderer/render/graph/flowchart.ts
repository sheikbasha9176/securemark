﻿import { define } from 'typed-dom';

declare global {
  interface Window {
    flowchart: any;
  }
}

export function flowchart(target: HTMLElement): void {
  assert(target.children.length === 0);
  void requestAnimationFrame(() => {
    const diagram = window.flowchart.parse(target.textContent!);
    void define(target, []);
    void diagram.drawSVG(target);
    void target.querySelectorAll<HTMLAnchorElement>('svg a')
      .forEach(el =>
        void el.removeAttribute('href'));
    const svg = target.querySelector('svg')!;
    svg.style.maxHeight = `${Math.round(parseFloat(svg.getAttribute('height')!) * svg.clientWidth / parseFloat(svg.getAttribute('width')!))}`;
  });
}
