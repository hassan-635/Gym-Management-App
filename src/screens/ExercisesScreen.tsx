/**
 * screens/ExercisesScreen.tsx — Exercise library screen
 * 
 * Browse, search, and manage exercises grouped by muscle group.
 * Add new custom exercises with muscle group selection.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useExerciseStore } from '../store/useExerciseStore';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { MuscleGroupBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Exercise, MuscleGroup, MUSCLE_GROUPS } from '../types/exercise';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ExercisesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    exercises,
    filteredExercises,
    selectedMuscleGroup,
    searchQuery,
    loadExercises,
    addExercise,
    deleteExercise,
    setMuscleGroupFilter,
    setSearchQuery,
  } = useExerciseStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newMuscleGroup, setNewMuscleGroup] = useState<MuscleGroup>('Chest');
  const [newMinReps, setNewMinReps] = useState('');
  const [newMaxReps, setNewMaxReps] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [])
  );

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name.');
      return;
    }

    const result = addExercise({
      name: newExerciseName.trim(),
      muscleGroup: newMuscleGroup,
      targetMinReps: newMinReps ? parseInt(newMinReps) : undefined,
      targetMaxReps: newMaxReps ? parseInt(newMaxReps) : undefined,
    });

    if (result === null) {
      Alert.alert('Duplicate', 'An exercise with this name already exists.');
      return;
    }

    setNewExerciseName('');
    setNewMinReps('');
    setNewMaxReps('');
    setShowAddModal(false);
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exercise.name}"? This will also remove it from your schedule and history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExercise(exercise.id),
        },
      ]
    );
  };

  const displayExercises = searchQuery || selectedMuscleGroup ? filteredExercises : exercises;

  const renderExercise = ({ item }: { item: Exercise }) => (
    <Card
      onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
      style={styles.exerciseCard}
      padding="md"
    >
      <View style={styles.exerciseRow}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <MuscleGroupBadge muscleGroup={item.muscleGroup} />
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteExercise(item)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color={colors.accent.danger} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Exercises</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.primary.default} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.text.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Muscle Group Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[null, ...MUSCLE_GROUPS]}
          keyExtractor={(item) => item ?? 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setMuscleGroupFilter(item)}
              style={[
                styles.filterChip,
                selectedMuscleGroup === item && styles.filterChipActive,
                item === null && selectedMuscleGroup === null && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  (selectedMuscleGroup === item || (item === null && selectedMuscleGroup === null)) &&
                    styles.filterChipTextActive,
                ]}
              >
                {item ?? 'All'}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Exercise List */}
      <FlatList
        data={displayExercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="barbell-outline"
            title="No Exercises Yet"
            message="Add your first exercise to start building your workout library."
            actionLabel="Add Exercise"
            onAction={() => setShowAddModal(true)}
          />
        }
      />

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Exercise"
      >
        <View style={styles.modalContent}>
          {/* Exercise Name Input */}
          <Text style={styles.inputLabel}>Exercise Name</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="e.g., Bench Press"
            placeholderTextColor={colors.text.muted}
            value={newExerciseName}
            onChangeText={setNewExerciseName}
            autoFocus
          />

          {/* Muscle Group Selection */}
          <Text style={[styles.inputLabel, { marginTop: spacing.lg }]}>Muscle Group</Text>
          <View style={styles.muscleGroupGrid}>
            {MUSCLE_GROUPS.map((group) => (
              <TouchableOpacity
                key={group}
                onPress={() => setNewMuscleGroup(group)}
                style={[
                  styles.muscleGroupOption,
                  newMuscleGroup === group && styles.muscleGroupOptionActive,
                  newMuscleGroup === group && { borderColor: colors.muscleGroups[group] },
                ]}
              >
                <Text
                  style={[
                    styles.muscleGroupOptionText,
                    newMuscleGroup === group && { color: colors.muscleGroups[group] },
                  ]}
                >
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Target Reps Inputs */}
          <Text style={[styles.inputLabel, { marginTop: spacing.lg }]}>Target Rep Range (Optional)</Text>
          <View style={styles.repsRow}>
            <TextInput
              style={[styles.modalInput, styles.repInput]}
              placeholder="Min"
              placeholderTextColor={colors.text.muted}
              value={newMinReps}
              onChangeText={setNewMinReps}
              keyboardType="number-pad"
            />
            <Text style={styles.repsSeparator}>to</Text>
            <TextInput
              style={[styles.modalInput, styles.repInput]}
              placeholder="Max"
              placeholderTextColor={colors.text.muted}
              value={newMaxReps}
              onChangeText={setNewMaxReps}
              keyboardType="number-pad"
            />
          </View>

          {/* Add Button */}
          <Button
            title="Add Exercise"
            onPress={handleAddExercise}
            variant="primary"
            size="lg"
            fullWidth
            icon="add-circle"
            style={{ marginTop: spacing.xl }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
  },
  filterContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: colors.primary.muted,
    borderColor: colors.primary.default,
  },
  filterChipText: {
    ...typography.captionMedium,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.primary.default,
  },
  listContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  exerciseCard: {
    marginBottom: spacing.sm,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  exerciseName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  deleteButton: {
    padding: spacing.sm,
  },

  // Modal
  modalContent: {
    paddingBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.captionMedium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  modalInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  muscleGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  muscleGroupOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  muscleGroupOptionActive: {
    backgroundColor: colors.primary.muted,
  },
  muscleGroupOptionText: {
    ...typography.captionMedium,
    color: colors.text.secondary,
  },
  repsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  repInput: {
    flex: 1,
    textAlign: 'center',
  },
  repsSeparator: {
    ...typography.body,
    color: colors.text.muted,
  },
});
