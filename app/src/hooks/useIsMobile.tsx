import { usePageSize } from './usePageSize';

export const useIsMobile = () => {
  const [width] = usePageSize();

  const isMobile = width <= 768;

  return isMobile;
};
