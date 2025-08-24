import { useState, useEffect } from 'react';

export const useScroll = () => {
  const threshold = 10;
  const [isScroll, setIsScroll] = useState(true);
  useEffect(() => {
    const handleScroll = () => {
      setIsScroll(window.scrollY > threshold);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);
  return isScroll;
};
