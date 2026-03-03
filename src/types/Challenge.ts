// Challenge interface representing a fitness challenge document in Firestore
export interface Challenge {
  id?: string; // Firestore document ID (optional for creation)
  userId: string; // Owner of the challenge (currentUser.uid)
  title: string; // Challenge title (e.g., "500 Pushups Challenge")
  description: string; // Detailed description
  targetValue: number; // Target goal (e.g., 500)
  unit: string; // Unit of measurement (e.g., "reps", "km", "minutes")
  deadline: Date; // Challenge deadline
  currentValue: number; // Current progress value
  createdAt: Date; // When the challenge was created
  status: 'active' | 'completed' | 'expired'; // Challenge status
}

// Form data for creating a new challenge
export interface ChallengeFormData {
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  deadline: string; // ISO date string for form input
}

// Leaderboard entry for ranking users
export interface LeaderboardEntry {
  userId: string;
  userEmail: string;
  totalChallenges: number;
  completedChallenges: number;
  averageCompletionRate: number;
  rank: number;
}

// Progress update data
export interface ProgressUpdate {
  challengeId: string;
  addedValue: number;
  timestamp: Date;
}
