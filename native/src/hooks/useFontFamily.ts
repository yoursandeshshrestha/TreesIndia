import { useMemo } from 'react';

export function useFontFamily(weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular') {
  return useMemo(() => {
    const fontMap: Record<string, string> = {
      regular: 'OpenSans-Regular',
      medium: 'OpenSans-Medium',
      semibold: 'OpenSans-SemiBold',
      bold: 'OpenSans-Bold',
    };
    return { fontFamily: fontMap[weight] };
  }, [weight]);
}
