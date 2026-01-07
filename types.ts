
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  correctFeedback: string;
  incorrectFeedback: string;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  levelCompletionPraise: string;
}

export type GameStatus = 'start' | 'playing' | 'feedback' | 'levelComplete' | 'finished';

export interface FeedbackData {
  isCorrect: boolean;
  praise: string;
  explanation: string;
}
