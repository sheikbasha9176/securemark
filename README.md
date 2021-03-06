# Securemark

[![Build Status](https://travis-ci.org/falsandtru/securemark.svg?branch=master)](https://travis-ci.org/falsandtru/securemark)
[![Coverage Status](https://coveralls.io/repos/falsandtru/securemark/badge.svg?branch=master&service=github)](https://coveralls.io/github/falsandtru/securemark?branch=master)

Secure markdown renderer working on browsers for user input data.

## Features

- Secure DOM rendering.
- Declarative syntax.
- Recursive parsing.
- Incremental update.
- Progressive rendering.
- Unblinking rendering.
- Large document support.
- Syntax highlight with PrismJS.
- LaTeX rendering with MathJax.
- Figure, Annotation, and Reference syntax.
- Index generation for headings, terms, and figures.
- Shortlink syntax for local references of indexes and figures.
- Auto numbering of figures, annotations, and references.
- Cross reference generation for annotations and references.
- Table of contents.

## Demos

https://falsandtru.github.io/securemark/

## APIs

[index.d.ts](index.d.ts)

## Syntax

[markdown.d.ts](markdown.d.ts)

- Heading (#)
- UList (-)
- OList (0., 1., a., A.)
- DList (~)
- Table (| |)
- Blockquote (>, !>)
- Preformattedtext (```)
- HorizontalRule (---)
- Inline markups (*, `, []{}, {}, ![]{}, !{}, \[](), ++, ~~, (()), ...)
- Inline HTML tags (\<small>, \<bdi>, ...)
- Autolink (https://host, ttps://host, account@host, @account)
- Shartmedia (!https://host/image.png, !https://youtu.be/..., !https://gist.github.com/...)
- Syntex highlight (```lang filename)
- LaTeX (${expr}$, $$expr$$)
- Index (# title [#indexer], ~ term [#indexer], [#index])
- Figure (~~~figure $fig-name)
- Label ($fig-name, [$fig-name])
- Data ([~name], [~name=value], [~name=value|text])
- Annotation (((annotation)))
- Reference ([[reference]])
- Channel (@account#tag)
- Hashtag (#tag)
- Template ({{ template }})
- Comment (<# comment #>)

## Media

- Twitter
- YouTube
- Gist
- SlideShare
- PDF (.pdf)
- Video (.webm, .ogv)
- Audio (.oga, .ogg)
- Images

## Dependencies

- PrismJS
- MathJax
- jQuery (for Ajax)
- DOMPurify

## Browsers

- Chrome
- Firefox
- Edge (Chromium edition only)
- Safari

## License

Currently unlicensed but free to use this product only for private or offline usage under the Mozilla Public License 2.0 and the Apache License 2.0.
