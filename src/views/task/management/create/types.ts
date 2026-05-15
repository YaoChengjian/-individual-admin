import type { PatrolArea, PatrolExecutor, PatrolPoint } from '@/api/task/model';

export interface PatrolTaskCreateState {
  taskTitle: string;
  taskType: string;
  priority: string;
  description: string;
  aiFocus: boolean;
  areaIds: number[];
  pointIds: number[];
  startTime: string;
  endTime: string;
  durationHours: string | number;
  repeatRule: string;
  executorId?: number;
}

export interface TaskCreateContext {
  areas: PatrolArea[];
  points: PatrolPoint[];
  executors: PatrolExecutor[];
}
