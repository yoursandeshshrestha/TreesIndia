import { useMemo } from 'react';

export function useFontFamily(weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular') {
  return useMemo(() => {
    const fontMap: Record<string, string> = {
      regular: 'Inter-Regular',
      medium: 'Inter-Medium',
      semibold: 'Inter-SemiBold',
      bold: 'Inter-Bold',
    };
    return { fontFamily: fontMap[weight] };
  }, [weight]);
}


