import React, { useEffect } from "react";

export function VideoSyncPlayer({ src, videoElementRef }) {

  useEffect(() => {

    const video = videoElementRef.current;

    if (!video || !src) return;

    video.src = src;

  }, [src]);

  return (

    <video
      ref={videoElementRef}
      controls
      autoPlay
      playsInline
      preload="auto"
      style={{ width: "100%" }}
    />

  );

}
