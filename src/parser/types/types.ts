import { Resume } from '../types/resume-schema';

export interface Section {
  content: string;
  startIndex: number;
  endIndex: number;
}

export interface ParsedSections {
  [key: string]: string;
}

export type BasicsData = Resume['basics'];
export type WorkData = Resume['work'][0];
export type EducationData = Resume['education'][0];
export type SkillData = Resume['skills'][0];
export type ProjectData = Resume['projects'][0];