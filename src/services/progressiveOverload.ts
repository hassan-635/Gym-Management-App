/**
 * services/progressiveOverload.ts — Progressive overload analysis & suggestions
 * 
 * Analyzes exercise history for each exercise independently.
 * Detects plateaus, tracks progression, and suggests weight increases.
 * 
 * Strategy: If user completes target reps across all sets for N consecutive
 * sessions at the same weight, suggest a weight increase.
 */
import { ExerciseHistoryEntry, OverloadSuggestion } from '../types/stats';
import { OVERLOAD } from '../utils/constants';
import * as historyDb from '../database/historyDb';

/**
 * Analyze an exercise's history and generate an overload suggestion.
 * 
 * Logic:
 * 1. Look at the last N sessions for this exercise
 * 2. If the user has used the same weight for MIN_SESSIONS_FOR_SUGGESTION sessions
 * 3. And consistently hit their rep targets
 * 4. Suggest increasing weight
 */
export const getOverloadSuggestion = (
  exerciseId: string,
  exerciseName: string
): OverloadSuggestion | null => {
  const sessions = historyDb.getLastSessions(exerciseId, OVERLOAD.MIN_SESSIONS_FOR_SUGGESTION + 2);

  if (sessions.length < OVERLOAD.MIN_SESSIONS_FOR_SUGGESTION) {
    return null; // Not enough data for a suggestion
  }

  // Get the most recent sessions (up to MIN_SESSIONS_FOR_SUGGESTION)
  const recentSessions = sessions.slice(0, OVERLOAD.MIN_SESSIONS_FOR_SUGGESTION);
  
  // Check if weight has been consistent across recent sessions
  const currentWeight = recentSessions[0].maxWeight;
  
  if (currentWeight <= 0) {
    return null; // No meaningful weight data
  }

  const isWeightConsistent = recentSessions.every(
    (s) => s.maxWeight === currentWeight
  );

  if (!isWeightConsistent) {
    return null; // Weight is already varying — user is adjusting on their own
  }

  // Check if reps are being consistently completed
  const avgRepsPerSet = recentSessions.reduce((sum, s) => {
    return sum + (s.totalSets > 0 ? s.totalReps / s.totalSets : 0);
  }, 0) / recentSessions.length;

  // If average reps per set is reasonable (at least 6), suggest increase
  if (avgRepsPerSet < 6) {
    return null; // User is struggling with current weight
  }

  // Calculate suggested increase
  const increase = currentWeight < OVERLOAD.SMALL_WEIGHT_THRESHOLD
    ? OVERLOAD.SMALL_INCREASE_KG
    : OVERLOAD.DEFAULT_INCREASE_KG;

  const suggestedWeight = currentWeight + increase;

  // Determine confidence based on consistency
  let confidence: 'low' | 'medium' | 'high' = 'medium';
  if (recentSessions.length >= OVERLOAD.MIN_SESSIONS_FOR_SUGGESTION + 1) {
    confidence = 'high';
  }
  if (avgRepsPerSet < 8) {
    confidence = 'low';
  }

  // Generate reason message
  const reason = generateReason(currentWeight, suggestedWeight, recentSessions.length, avgRepsPerSet, increase);

  return {
    exerciseId,
    exerciseName,
    currentWeight,
    suggestedWeight,
    reason,
    confidence,
  };
};

/**
 * Generate a human-readable reason for the suggestion.
 */
const generateReason = (
  currentWeight: number,
  suggestedWeight: number,
  sessionCount: number,
  avgReps: number,
  increase: number
): string => {
  const repsStr = avgReps.toFixed(0);
  
  return `You've consistently lifted ${currentWeight}kg for ~${repsStr} reps/set across ${sessionCount} sessions. Time to level up to ${suggestedWeight}kg (+${increase}kg)! 💪`;
};

/**
 * Get the progression rate for an exercise.
 * Returns the percentage increase in max weight over time.
 */
export const getProgressionRate = (exerciseId: string): {
  rate: number;
  direction: 'up' | 'down' | 'flat';
  startWeight: number;
  currentWeight: number;
} => {
  const sessions = historyDb.getExerciseHistory(exerciseId, 10);

  if (sessions.length < 2) {
    return { rate: 0, direction: 'flat', startWeight: 0, currentWeight: 0 };
  }

  const currentWeight = sessions[0].maxWeight;
  const startWeight = sessions[sessions.length - 1].maxWeight;

  if (startWeight === 0) {
    return { rate: 0, direction: 'flat', startWeight: 0, currentWeight };
  }

  const rate = ((currentWeight - startWeight) / startWeight) * 100;

  return {
    rate: Math.round(rate * 10) / 10,
    direction: rate > 0 ? 'up' : rate < 0 ? 'down' : 'flat',
    startWeight,
    currentWeight,
  };
};

/**
 * Get overload suggestions for all exercises that have enough history.
 */
export const getAllOverloadSuggestions = (
  exercises: Array<{ id: string; name: string }>
): OverloadSuggestion[] => {
  const suggestions: OverloadSuggestion[] = [];

  for (const exercise of exercises) {
    const suggestion = getOverloadSuggestion(exercise.id, exercise.name);
    if (suggestion) {
      suggestions.push(suggestion);
    }
  }

  return suggestions;
};
