﻿import { LinkParser, inline } from '../inline';
import { union, subsequence, some, match, surround, transform, build } from '../../combinator';
import { line } from '../source/line';
import { text } from '../source/text';
import { escsource } from '../source/escapable';
import { hasText, hasContent, stringify, squash } from '../util';
import { sanitize } from '../string/url';
import { html } from 'typed-dom';

export const link: LinkParser = line(transform(build(() =>
  line<LinkParser>(surround('[', some(union([inline]), ']'), ']', false), false)),
  (ns, rest) => {
    const children = squash(ns, document.createDocumentFragment());
    if (children.querySelector('a, .annotation')) return;
    if (children.querySelector('.media')) {
      if (children.childNodes.length !== 1 || !children.firstElementChild || !children.firstElementChild.matches('.media')) return;
    }
    else {
      if (children.childNodes.length > 0 && !hasText(children)) return;
    }
    return transform(
      line<LinkParser>(surround('(', subsequence([some(union([parenthesis, text]), /^\)|^\s/), attribute]), ')', false), false),
      (ns, rest) => {
        const [, INSECURE_URL = '', attr = ''] = stringify(ns).match(/^(.*?)(?:\n(.*))?$/) || [];
        assert(attr === '' || attr === 'nofollow');
        const url = sanitize(INSECURE_URL);
        if (url === '' && INSECURE_URL !== '') return;
        const el = html('a',
          {
            href: url,
            rel: attr === 'nofollow' ? 'noopener nofollow noreferrer' : 'noopener',
          },
          hasContent(children)
            ? children.childNodes
            : sanitize(INSECURE_URL || window.location.href)
                .replace(/^h(?=ttps?:\/\/)/, attr === 'nofollow' ? '' : 'h'));
        if (window.location.origin !== el.origin || el.querySelector('.media')) {
          void el.setAttribute('target', '_blank');
        }
        assert(hasContent(el));
        return [[el], rest];
      })
      (rest);
  }
), false);

export const parenthesis: LinkParser.ParenthesisParser = transform(build(() =>
  surround('(', some(union<LinkParser.ParenthesisParser>([parenthesis, escsource]), /^\)|^\s/), ')', false)),
  (ts, rest) =>
    [[document.createTextNode('('), ...ts, document.createTextNode(')')], rest]);

const attribute: LinkParser.AttributeParser =
  surround(
    /^\s(?=\S)/,
    match(/^nofollow/, ([attr], rest) =>
      [[document.createTextNode(`\n${attr}`)], rest]),
    /^(?=\))/);
