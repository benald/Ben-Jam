import { useCallback, useRef } from "react";
import { registerPlaybackFrame, unregisterPlaybackFrame } from "./singleAudioPlayback";

// attach to an embed <iframe>'s ref so only one Mixcloud/Bandcamp/Odysee player plays at a time
export function useExclusivePlaybackRef() {
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  return useCallback((frame: HTMLIFrameElement | null) => {
    if (frameRef.current) unregisterPlaybackFrame(frameRef.current);
    frameRef.current = frame;
    if (frame) registerPlaybackFrame(frame);
  }, []);
}
