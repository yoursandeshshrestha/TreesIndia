import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import ImageWithSkeleton from '../../../components/ImageWithSkeleton';
import { PromotionBanner } from '../../../services';
import BannerSkeleton from './BannerSkeleton';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_ASPECT_RATIO = 16 / 9;
const BANNER_HEIGHT = SCREEN_WIDTH / BANNER_ASPECT_RATIO;

interface BannerCarouselProps {
  banners: PromotionBanner[];
  isLoading: boolean;
  onBannerPress: (banner: PromotionBanner) => void;
}

export default function BannerCarousel({
  banners,
  isLoading,
  onBannerPress,
}: BannerCarouselProps) {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (banners.length > 1) {
      startAutoSlide();
    }
    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners.length, currentBannerIndex]);

  const startAutoSlide = () => {
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
    }
    autoSlideTimerRef.current = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        const nextIndex = prev < banners.length - 1 ? prev + 1 : 0;
        scrollToBanner(nextIndex);
        return nextIndex;
      });
    }, 5000); // 5 seconds like Flutter
  };

  const scrollToBanner = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentBannerIndex(index);
    // Restart auto-slide timer when user manually swipes
    if (banners.length > 1) {
      startAutoSlide();
    }
  };

  // Show skeleton if loading or no banners
  if (isLoading || banners.length === 0) {
    return <BannerSkeleton />;
  }

  return (
    <View className="pt-4 pb-4" style={{ backgroundColor: 'white' }}>
      <View>
        <View
          style={{
            height: BANNER_HEIGHT,
            borderRadius: 0,
            overflow: 'hidden',
          }}
        >
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
          >
            {banners.map((banner, index) => (
              <TouchableOpacity
                key={banner.id || banner.ID || index}
                activeOpacity={0.9}
                onPress={() => onBannerPress(banner)}
                style={{ width: SCREEN_WIDTH }}
              >
                <ImageWithSkeleton
                  source={{ uri: banner.image }}
                  style={{
                    width: SCREEN_WIDTH,
                    height: BANNER_HEIGHT,
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Page Indicators */}
        {banners.length > 1 && (
          <View className="flex-row justify-center mt-3" style={{ gap: 6 }}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={{
                  width: currentBannerIndex === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: currentBannerIndex === index ? '#00a871' : '#D1D5DB',
                }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
