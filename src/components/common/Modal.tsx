/**
 * components/common/Modal.tsx — Bottom sheet modal
 * 
 * Animated bottom sheet modal with backdrop tap to dismiss.
 * Used for confirmations, pickers, and form inputs.
 */
import React from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        {/* Backdrop — tap to dismiss */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Modal Content */}
        <View style={styles.content}>
          {/* Drag Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Body */}
          <View style={styles.body}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  content: {
    backgroundColor: colors.background.elevated,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderTopWidth: 1,
    borderColor: colors.border.light,
    maxHeight: '80%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.text.muted,
    borderRadius: borderRadius.full,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
  },
  closeText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});
