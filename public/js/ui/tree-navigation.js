(function (root) {
  'use strict';
  const interactive = 'button,a,input,select,textarea,label,summary,[role="button"],[contenteditable="true"]';
  function bind(view, options = {}) {
    if (!view || view.dataset.treePan) return;
    view.dataset.treePan = 'true';
    const read = options.read || (() => ({ x: -view.scrollLeft, y: -view.scrollTop }));
    const write = options.write || (position => { view.scrollLeft = -position.x; view.scrollTop = -position.y; });
    let drag = null, suppressClick = false;
    view.addEventListener('pointerdown', event => {
      suppressClick = false;
      if (drag || event.button !== 0 || event.isPrimary === false || event.target.closest(interactive)) return;
      event.preventDefault();
      view.focus({ preventScroll: true });
      drag = { pointer: event.pointerId, x: event.clientX, y: event.clientY, origin: read(), moved: false };
      view.setPointerCapture(event.pointerId);
      view.classList.add('dragging');
    });
    view.addEventListener('pointermove', event => {
      if (!drag || drag.pointer !== event.pointerId) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      drag.moved ||= Math.hypot(dx, dy) > 3;
      write({ x: drag.origin.x + dx, y: drag.origin.y + dy });
      options.onPan?.();
    });
    function end(event) {
      if (!drag || event.pointerId !== drag.pointer) return;
      suppressClick = drag.moved && event.type === 'pointerup';
      drag = null;
      view.classList.remove('dragging');
      if (view.hasPointerCapture(event.pointerId)) view.releasePointerCapture(event.pointerId);
    }
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) view.addEventListener(name, end);
    view.addEventListener('click', event => {
      if (!suppressClick) return;
      suppressClick = false; event.preventDefault(); event.stopPropagation();
    }, true);
    view.addEventListener('keydown', () => { suppressClick = false; });
    view.addEventListener('dragstart', event => event.preventDefault());
  }
  root.TreeNavigation = { bind };
})(window);
