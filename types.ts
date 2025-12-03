export enum Subject {
  MATH = 'Mathematics',
  SCIENCE = 'Science',
  ENGLISH = 'English / Language Arts',
  HISTORY = 'History',
  CODING = 'Coding / Logic',
  CUSTOM = 'Custom'
}

export enum DeviceStatus {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  UPDATING = 'Updating Firmware'
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  grade: string;
  avatarUrl: string;
  assignedTutorId?: string;
  assignedDeviceId?: string;
}

export interface Device {
  id: string;
  serialNumber: string;
  nickname: string;
  status: DeviceStatus;
  firmwareVersion: string;
  lastSeen: string;
  assignedChildId?: string;
}

export interface TutorConfig {
  id: string;
  name: string;
  model: 'gemini-2.5-flash' | 'gemini-3-pro-preview';
  tone: 'Encouraging' | 'Strict' | 'Socratic' | 'Playful';
  subjectFocus: Subject[];
  knowledgeBaseFiles: string[]; // filenames
  systemInstruction: string;
}

export interface LessonPlan {
  id: string;
  topic: string;
  content: string;
  quizQuestions: { question: string; options: string[]; answer: number }[];
  imageUrl?: string;
  createdAt: string;
}

export interface LearningSession {
  date: string;
  durationMinutes: number;
  topicsCovered: string[];
  score: number;
}