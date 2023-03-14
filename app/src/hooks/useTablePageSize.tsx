import { useEffect, useState } from 'react';
import { usePageSize } from './usePageSize';

export const useTablePageSize = (minusExtra: number) => {
  const [width, height] = usePageSize();

  const getPageSize = () => {
    // windowHeight - headerHeight - footerHeight - pagination height - paddingTop - paddingBottom - <thead> height
    let pageSize = height - 64 - 70 - 24 - 16 * 2 - 48;
    if (width > 768) {
      // remove padding
      pageSize -= 32;
      // if (width < 959) {
      //   // in tablet mode, <tr> have 70px in height
      //   return Math.trunc((pageSize - minusExtra) / 70);
      // }
    }
    // divide by <tr> height
    return Math.trunc((pageSize - minusExtra) / 48);
  };

  const [pageSize, setPageSize] = useState(getPageSize());

  useEffect(() => {
    setPageSize(getPageSize());
  }, [width, height]);

  return pageSize;
};
