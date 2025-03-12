import { Timestamp } from "firebase/firestore";

export interface Holiday {
  id?: string;
  date: Timestamp;
  title: string;
  description: string;
  isFullDay: boolean; // Whether the gym is closed for the entire day
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 