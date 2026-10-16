'use strict';
(function (root) {
  // Mirrored neighbors meet at the exact same source column, including alpha.
  // Floor (rather than truncation) keeps negative scrolling continuous.
  function visibleTiles(offset, tileWidth, viewportWidth, alternateMirror = true) {
    if (![offset, tileWidth, viewportWidth].every(Number.isFinite) || tileWidth <= 0 || viewportWidth <= 0) {
      throw new RangeError('Finite offset and positive tile/viewport widths required');
    }
    const first = Math.floor(offset / tileWidth);
    const tiles = [];
    for (let index = first; index * tileWidth - offset < viewportWidth; index++) {
      tiles.push({ index, x: index * tileWidth - offset,
        mirror: alternateMirror && Math.abs(index % 2) === 1 });
    }
    return tiles;
  }
  const api = { visibleTiles };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StageTiling = api;
})(typeof globalThis === 'undefined' ? this : globalThis);
