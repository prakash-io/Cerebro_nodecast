import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function GlitchText({ text, className = '', as: Component = 'h1' }) {
  const textRef = useRef(null);

  useEffect(() => {
    if (!textRef.current) return;
    
    // Create subtle glitching effect
    const tl = gsap.timeline({ repeat: -1, repeatDelay: Math.random() * 3 + 2 });
    
    tl.to(textRef.current, {
      duration: 0.1,
      opacity: 0.8,
      skewX: 10,
      textShadow: '2px 0 red, -2px 0 blue'
    })
    .to(textRef.current, {
      duration: 0.1,
      opacity: 1,
      skewX: -10,
      textShadow: '-2px 0 red, 2px 0 blue'
    })
    .to(textRef.current, {
      duration: 0.1,
      opacity: 1,
      skewX: 0,
      textShadow: 'none'
    });
    
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <Component 
      ref={textRef} 
      className={`relative inline-block font-press-start ${className}`}
      data-text={text}
    >
      {text}
    </Component>
  );
}
