import { useEffect, useState } from 'react';

const useIsMobile = (breakpoint = 768) => {
  const getWidth = () =>
    typeof window === 'undefined' ? breakpoint + 1 : window.innerWidth;
  const [isMobile, setIsMobile] = useState(getWidth() < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(getWidth() < breakpoint);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
