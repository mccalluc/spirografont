import opentype from 'https://cdn.skypack.dev/opentype.js@1.3.4';

import Stencil from './Stencil.js';

function makeGlyph(character, path) {
  return new opentype.Glyph({
    name: character,
    unicode: character.codePointAt(),
    advanceWidth: 130,
    path: path
  });
}

export function makeFont({fontName, segmentMap, segments, stretch, skew, shrink, grow, bevel}) {
  const glyphs = [];

  // The .notdef glyph is required.
  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: 0,
    path: new opentype.Path()
  });
  glyphs.push(notdefGlyph);

  const stencil = new Stencil({segments, stretch, skew, shrink, grow, bevel});
  for (let label in segmentMap) {
    const path = stencil.getFontPath(segmentMap[label].split(''));
    glyphs.push(makeGlyph(label, path));
  }

  const font = new opentype.Font({
    familyName: fontName,
    styleName: 'Medium',
    unitsPerEm: 100, // Must be between 16 and 16384.
    ascender: 200, // Must not be less than the max used by the paths.
    descender: -20,
    glyphs: glyphs
  });
  return font;
}
