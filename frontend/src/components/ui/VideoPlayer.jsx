import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export const VideoPlayer = ({ options, onReady, className }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode. 
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered', 'vjs-matrix-theme');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        if (onReady) {
          onReady(player);
        }
      });

    // You could update an existing player in the `else` block here
    // on prop change, for example:
    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef, onReady]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player className={`relative ${className}`}>
      {/* Glitch Overlay Effect applied directly over the video player */}
      <div className="absolute inset-0 pointer-events-none z-10 border-2 border-[#ff0033]/30 shadow-[inset_0_0_50px_rgba(255,0,51,0.2)]"></div>
      <div 
        ref={videoRef} 
        className="w-full h-full [&>.video-js]:w-full [&>.video-js]:h-full [&>.video-js_.vjs-control-bar]:bg-black/80 [&>.video-js_.vjs-control-bar]:h-12"
      />
    </div>
  );
}

export default VideoPlayer;
