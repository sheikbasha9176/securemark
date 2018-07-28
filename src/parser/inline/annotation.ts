﻿import { AnnotationParser, inline } from '../inline';
import { union, some, surround, verify, fmap, build } from '../../combinator';
import { hasText, hasMedia, hasAnnotationOrAuthority } from '../util';
import { html } from 'typed-dom';

export const annotation: AnnotationParser = verify(fmap(build(() =>
  surround('((', some(union([inline]), '))'), '))')),
  ns => [html('sup', { class: 'annotation' }, ns)]
), ([el]) => hasText(el) && !hasMedia(el) && !hasAnnotationOrAuthority(el));
