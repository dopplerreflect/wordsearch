export function swipe(node: HTMLElement) {
  let touchstartX = 0;
  let touchendX = 0;

  function handleTouchStart(event: TouchEvent) {
    touchstartX = event.changedTouches[0].screenX;
  }

  function handleTouchEnd(event: TouchEvent) {
    touchendX = event.changedTouches[0].screenX;
    handleSwipe();
  }

  function handleSwipe() {
    if (touchendX < touchstartX) {
      node.dispatchEvent(new CustomEvent("swipeleft"));
    }

    if (touchendX > touchstartX) {
      node.dispatchEvent(new CustomEvent("swiperight"));
    }
  }

  node.addEventListener("touchstart", handleTouchStart, { passive: true });
  node.addEventListener("touchend", handleTouchEnd, { passive: true });

  return {
    destroy() {
      node.removeEventListener("touchstart", handleTouchStart);
      node.removeEventListener("touchend", handleTouchEnd);
    },
  };
}
