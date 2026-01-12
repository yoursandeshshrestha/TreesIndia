import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Text,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import {
  pickImageFromCamera,
  pickImageFromGallery,
  pickVideoFromGallery,
  recordVideoFromCamera,
  PickedFile,
  FileUploadError,
} from '../../utils/fileUpload';

interface ChatInputProps {
  onSend: (message: string) => void;
  onSendWithFile?: (message: string, file: PickedFile) => void;
  placeholder?: string;
  disabled?: boolean;
  isSending?: boolean;
}

/**
 * ChatInput component for composing and sending messages
 * Features: multiline input, send button, file attachments, auto-clear on send
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onSendWithFile,
  placeholder = 'Type a message...',
  disabled = false,
  isSending = false,
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<PickedFile | null>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if ((!trimmedMessage && !selectedFile) || disabled || isSending) {
      return;
    }

    if (selectedFile && onSendWithFile) {
      onSendWithFile(trimmedMessage, selectedFile);
    } else {
      onSend(trimmedMessage);
    }

    setMessage('');
    setSelectedFile(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleFileError = (error: FileUploadError | Error | unknown) => {
    let errorMessage = 'Failed to select file';

    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as FileUploadError).message;
    }

    Alert.alert('Error', errorMessage);
  };

  const showAttachmentOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose Photo', 'Choose Video', 'Record Video'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          try {
            let file: PickedFile | null = null;

            switch (buttonIndex) {
              case 1: // Take Photo
                file = await pickImageFromCamera();
                break;
              case 2: // Choose Photo
                file = await pickImageFromGallery();
                break;
              case 3: // Choose Video
                file = await pickVideoFromGallery();
                break;
              case 4: // Record Video
                file = await recordVideoFromCamera();
                break;
            }

            if (file) {
              setSelectedFile(file);
            }
          } catch (error) {
            handleFileError(error);
          }
        }
      );
    } else {
      // For Android, show a custom modal or use similar approach
      // For now, just show photo picker
      pickImageFromGallery()
        .then((file) => {
          if (file) {
            setSelectedFile(file);
          }
        })
        .catch(handleFileError);
    }
  };

  const canSend = (message.trim().length > 0 || selectedFile !== null) && !disabled && !isSending;

  return (
    <View className="bg-white border-t border-[#E5E7EB]">
      {/* File Preview */}
      {selectedFile && (
        <View className="px-4 pt-3">
          <View className="flex-row items-center bg-[#F9FAFB] rounded-lg p-2 border border-[#E5E7EB]">
            {/* Preview */}
            {selectedFile.type === 'image' ? (
              <Image
                source={{ uri: selectedFile.uri }}
                className="w-12 h-12 rounded"
                resizeMode="cover"
              />
            ) : (
              <View className="w-12 h-12 rounded bg-[#E5E7EB] items-center justify-center">
                <VideoIcon size={24} color="#6B7280" />
              </View>
            )}

            {/* File Info */}
            <View className="flex-1 ml-2">
              <Text
                className="text-sm text-[#111928]"
                style={{ fontFamily: 'Inter-Medium' }}
                numberOfLines={1}
              >
                {selectedFile.fileName}
              </Text>
              <Text
                className="text-xs text-[#6B7280]"
                style={{ fontFamily: 'Inter-Regular' }}
              >
                {selectedFile.type === 'image' ? 'Image' : 'Video'}
              </Text>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              onPress={handleRemoveFile}
              className="w-8 h-8 items-center justify-center"
              activeOpacity={0.7}
            >
              <CloseIcon size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Input Area */}
      <View className="flex-row items-end px-4 py-3">
        {/* Attachment Button */}
        <TouchableOpacity
          onPress={showAttachmentOptions}
          disabled={disabled || isSending}
          className="w-10 h-10 items-center justify-center mr-2"
          activeOpacity={0.7}
        >
          <AttachmentIcon size={24} color={disabled || isSending ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>

        {/* Text Input */}
        <View className="flex-1 mr-2">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={1000}
            editable={!disabled && !isSending}
            className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-3xl px-4 py-3 text-base text-[#111928] max-h-32"
            style={{
              fontFamily: 'Inter-Regular',
              textAlignVertical: 'top',
              minHeight: 48,
            }}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend}
          className={`w-12 h-12 rounded-full items-center justify-center ${
            canSend ? 'bg-[#00a871]' : 'bg-[#E5E7EB]'
          }`}
          activeOpacity={0.7}
        >
          {isSending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <SendIcon color={canSend ? '#FFFFFF' : '#9CA3AF'} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Send icon SVG component
 */
const SendIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Attachment icon SVG component
 */
const AttachmentIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21.44 11.05l-9.19 9.19a6.003 6.003 0 01-8.49-8.49l9.19-9.19a4.002 4.002 0 015.66 5.66l-9.2 9.19a2.001 2.001 0 01-2.83-2.83l8.49-8.48"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Video icon SVG component
 */
const VideoIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 7l-7 5 7 5V7z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Close icon SVG component
 */
const CloseIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
