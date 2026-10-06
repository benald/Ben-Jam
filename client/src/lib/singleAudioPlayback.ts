// Mixcloud/Bandcamp/Odysee embeds are cross-origin iframes with no shared JS API to pause each
// other, so there's no direct way to tell "the other player" to stop when one starts playing.
// The common workaround: clicking inside a cross-origin iframe moves focus into it, which fires
// a "blur" event on the top window. We use that as a signal that a particular iframe just became
// active, and force every other registered iframe to reload (which stops its audio/video).
const registeredFrames = new Set<HTMLIFrameElement>();
let listenerAttached = false;

function stopFrame(frame: HTMLIFrameElement) {
  const src = frame.getAttribute("src");
  if (!src) return;
  // reassigning the same src is a no-op in most browsers, so blank it first to force a reload
  frame.src = "about:blank";
  frame.src = src;
}

function handleWindowBlur() {
  const active = document.activeElement;
  if (!(active instanceof HTMLIFrameElement) || !registeredFrames.has(active)) return;
  for (const frame of registeredFrames) {
    if (frame !== active) stopFrame(frame);
  }
}

export function registerPlaybackFrame(frame: HTMLIFrameElement) {
  registeredFrames.add(frame);
  if (!listenerAttached) {
    window.addEventListener("blur", handleWindowBlur);
    listenerAttached = true;
  }
}

export function unregisterPlaybackFrame(frame: HTMLIFrameElement) {
  registeredFrames.delete(frame);
}
