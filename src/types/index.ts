import { FieldValue, Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  createdAt: Timestamp | FieldValue;
  updateAt: Timestamp | FieldValue;
}

export interface Interview {
  id: string;
  position: string;
  description: string;
  experience: number;
  userId: string;
  techStack: string;
  resume?: string;
  targetJD?: string;
  questions: InterviewQuestion[];
  createdAt: Timestamp;
  updateAt: Timestamp;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
  type?: "technical" | "behavioral" | "system-design" | "debugging" | "mcq";
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
  options?: string[];
  correctOption?: string;
  explanation?: string;
}

export interface UserAnswer {
  id: string;
  mockIdRef: string;
  question: string;
  correct_ans: string;
  user_ans: string;
  feedback: string;
  rating: number;
  userId: string;
  fillerCount?: number;
  avgWPM?: number;
  confidenceScore?: number;
  communicationFeedback?: string;
  userCode?: string;
  createdAt: Timestamp;
  updateAt: Timestamp;
}

// Communication metrics (Feature 1)
export interface CommunicationMetrics {
  fillerCount: number;
  avgWPM: number;
  confidenceScore: number;
  fillerWords: { word: string; count: number }[];
  paceSamples: number[];
}

// Code interview session (Feature 2)
export interface CodeSession {
  id: string;
  interviewId: string;
  userId: string;
  language: string;
  problemStatement: string;
  code: string;
  aiFollowUps: { role: "ai" | "user"; message: string; timestamp: number }[];
  score?: number;
  feedback?: string;
  createdAt: Timestamp | FieldValue;
  updateAt: Timestamp | FieldValue;
}

// System design (Feature 4)
export interface DesignNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
}

export interface DesignEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface SystemDesignSession {
  id: string;
  interviewId: string;
  userId: string;
  nodes: DesignNode[];
  edges: DesignEdge[];
  aiFeedback: string;
  score?: number;
  createdAt: Timestamp | FieldValue;
  updateAt: Timestamp | FieldValue;
}

// Gamification (Feature 6)
export interface UserStats {
  userId: string;
  displayName: string;
  imageUrl: string;
  currentStreak: number;
  longestStreak: number;
  totalInterviews: number;
  avgScore: number;
  activeDays: string[];
  badges: string[];
  updatedAt: Timestamp | FieldValue;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  threshold: number;
}

export interface BadgeWithIcon extends Omit<Badge, "icon"> {
  icon: React.ReactNode;
}
