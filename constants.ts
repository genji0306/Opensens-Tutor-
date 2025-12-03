import { ChildProfile, Device, DeviceStatus, Subject, TutorConfig, LearningSession } from './types';

export const MOCK_CHILDREN: ChildProfile[] = [
  {
    id: 'c1',
    name: 'Leo',
    age: 8,
    grade: '3rd Grade',
    avatarUrl: 'https://picsum.photos/100/100?random=1',
    assignedTutorId: 't1',
    assignedDeviceId: 'd1'
  },
  {
    id: 'c2',
    name: 'Maya',
    age: 12,
    grade: '7th Grade',
    avatarUrl: 'https://picsum.photos/100/100?random=2',
    assignedTutorId: 't2',
    assignedDeviceId: 'd2'
  }
];

export const MOCK_DEVICES: Device[] = [
  {
    id: 'd1',
    serialNumber: 'KT-9928-XJ',
    nickname: "Leo's Tablet",
    status: DeviceStatus.ONLINE,
    firmwareVersion: '2.1.0',
    lastSeen: 'Just now',
    assignedChildId: 'c1'
  },
  {
    id: 'd2',
    serialNumber: 'KT-1102-AB',
    nickname: "Maya's Desk Bot",
    status: DeviceStatus.OFFLINE,
    firmwareVersion: '2.0.5',
    lastSeen: '2 hours ago',
    assignedChildId: 'c2'
  }
];

export const MOCK_TUTORS: TutorConfig[] = [
  {
    id: 't1',
    name: 'Captain Math',
    model: 'gemini-2.5-flash',
    tone: 'Playful',
    subjectFocus: [Subject.MATH],
    knowledgeBaseFiles: ['primary_math_curriculum.pdf'],
    systemInstruction: 'You are a superhero who loves numbers. Explain things simply to an 8 year old.'
  },
  {
    id: 't2',
    name: 'Professor Logic',
    model: 'gemini-3-pro-preview',
    tone: 'Socratic',
    subjectFocus: [Subject.SCIENCE, Subject.CODING],
    knowledgeBaseFiles: ['intro_to_python.pdf', 'physics_101.pdf'],
    systemInstruction: 'You are a helpful professor. Guide the student to the answer by asking questions.'
  }
];

export const MOCK_SESSIONS: LearningSession[] = [
  { date: '2023-10-20', durationMinutes: 25, topicsCovered: ['Fractions'], score: 85 },
  { date: '2023-10-21', durationMinutes: 40, topicsCovered: ['Solar System'], score: 92 },
  { date: '2023-10-22', durationMinutes: 15, topicsCovered: ['Grammar'], score: 78 },
  { date: '2023-10-23', durationMinutes: 30, topicsCovered: ['Multiplication'], score: 95 },
  { date: '2023-10-24', durationMinutes: 45, topicsCovered: ['History of Rome'], score: 88 },
  { date: '2023-10-25', durationMinutes: 20, topicsCovered: ['Fractions'], score: 90 },
  { date: '2023-10-26', durationMinutes: 50, topicsCovered: ['Geometry'], score: 96 },
];