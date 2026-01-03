import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  FlatList,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackIcon from '../../../components/icons/BackIcon';
import SearchIcon from '../../../components/icons/SearchIcon';
import ServiceCard from '../../../components/ServiceCard';
import ServiceDetailBottomSheet from './ServiceDetailBottomSheet';
import { serviceService, Service, SearchSuggestionsResponse } from '../../../services';

interface ServiceSearchScreenProps {
  onBack?: () => void;
  onServiceSelect?: (service: Service) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function ServiceSearchScreen({
  onBack,
  onServiceSelect,
}: ServiceSearchScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Service[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestionsResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, []);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const loadSuggestions = async () => {
    try {
      setIsLoadingSuggestions(true);
      const data = await serviceService.getSearchSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setSuggestions({ keywords: [], services: [] });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await serviceService.searchServices(query);
      setSearchResults(response.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setShowDetailSheet(true);
  };

  const handleSelectSuggestion = (suggestion: string | Service) => {
    if (typeof suggestion === 'string') {
      setSearchQuery(suggestion);
      performSearch(suggestion);
    } else {
      handleSelectService(suggestion);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={{ paddingTop: insets.top, backgroundColor: 'white' }}>
        {/* Header with Search Bar */}
        <View className="px-6 py-4 border-b border-[#E5E7EB]">
          <View className="flex-row items-center mb-3">
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.7}
              className="mr-4"
            >
              <BackIcon size={24} color="#111928" />
            </TouchableOpacity>
            <Text
              className="text-xl font-semibold text-[#111928]"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              Search Services
            </Text>
          </View>

          <View className="flex-row items-center bg-[#F9FAFB] rounded-lg px-4 py-3 border border-[#E5E7EB]">
            <SearchIcon size={20} color="#6B7280" />
            <TextInput
              ref={searchInputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for services..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-base text-[#111928]"
              style={{
                fontFamily: 'Inter-Regular',
                paddingVertical: 0,
                margin: 0,
                fontSize: 16,
                lineHeight: Platform.OS === 'ios' ? 20 : 22,
                textAlignVertical: 'center',
                ...(Platform.OS === 'android' && {
                  includeFontPadding: false,
                  textAlignVertical: 'center',
                }),
              }}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (searchQuery.trim().length >= 2) {
                  performSearch(searchQuery);
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                activeOpacity={0.7}
                className="ml-2"
              >
                <Text className="text-xl text-[#6B7280]">×</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!hasSearched && searchQuery.trim().length === 0 ? (
          // Show suggestions when no search has been performed
          <View className="px-6 py-6">
            {isLoadingSuggestions ? (
              <View className="items-center justify-center py-12">
                <ActivityIndicator size="large" color="#00a871" />
              </View>
            ) : (
              <>
                {/* Popular Services Grid */}
                {suggestions && suggestions.services && suggestions.services.length > 0 ? (
                  <View>
                    <Text
                      className="text-sm font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      Popular Services
                    </Text>
                    <FlatList
                      data={suggestions.services}
                      keyExtractor={(item) => item.id?.toString() || item.ID?.toString() || '0'}
                      numColumns={2}
                      scrollEnabled={false}
                      columnWrapperStyle={{
                        justifyContent: 'space-between',
                        marginBottom: 16,
                      }}
                      renderItem={({ item }) => (
                        <ServiceCard
                          service={item}
                          onPress={() => handleSelectService(item)}
                          onBook={() => handleSelectService(item)}
                          showBookButton={false}
                          width={CARD_WIDTH}
                        />
                      )}
                    />
                  </View>
                ) : (
                  <View className="items-center justify-center py-12">
                    <SearchIcon size={64} color="#D1D5DB" />
                    <Text
                      className="text-lg font-semibold text-[#111928] mt-4 mb-2 text-center"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      Start Searching
                    </Text>
                    <Text
                      className="text-sm text-[#6B7280] text-center"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      Search for services you need
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        ) : isSearching ? (
          // Searching
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#00a871" />
            <Text
              className="text-sm text-[#6B7280] mt-4"
              style={{ fontFamily: 'Inter-Regular' }}
            >
              Searching...
            </Text>
          </View>
        ) : hasSearched && searchResults.length === 0 ? (
          // No results found
          <View className="items-center justify-center py-12 px-6">
            <SearchIcon size={64} color="#D1D5DB" />
            <Text
              className="text-lg font-semibold text-[#111928] mt-4 mb-2 text-center"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              No Services Found
            </Text>
            <Text
              className="text-sm text-[#6B7280] text-center"
              style={{ fontFamily: 'Inter-Regular' }}
            >
              No services found for "{searchQuery}"
            </Text>
            <Text
              className="text-sm text-[#9CA3AF] text-center mt-2"
              style={{ fontFamily: 'Inter-Regular' }}
            >
              Try searching with different keywords
            </Text>
          </View>
        ) : (
          // Search results grid
          <View className="px-6 py-6">
            <Text
              className="text-sm font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}
            </Text>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id?.toString() || item.ID?.toString() || '0'}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
              renderItem={({ item }) => (
                <ServiceCard
                  service={item}
                  onPress={() => handleSelectService(item)}
                  onBook={() => handleSelectService(item)}
                  showBookButton={false}
                  width={CARD_WIDTH}
                />
              )}
            />
          </View>
        )}
      </ScrollView>

      {/* Service Detail Bottom Sheet */}
      {selectedService && (
        <ServiceDetailBottomSheet
          visible={showDetailSheet}
          onClose={() => setShowDetailSheet(false)}
          service={selectedService}
        />
      )}
    </KeyboardAvoidingView>
  );
}
