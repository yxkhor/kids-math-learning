
// Data type definitions
export interface GameStats {
  petType: 'cat' | 'dog' | 'hamster' | 'rabbit';
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
