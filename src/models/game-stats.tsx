
// Data type definitions
export interface GameStats {
  totalQuestions: number;
  correctAnswers: number;
  stars: number;
  level: number;
  achievements: string[];
  petHappiness: number;
  currentStreak: number;
  bestStreak: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
