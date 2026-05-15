import type { PageParam } from '@/api';

export interface PatrolTask {
  taskId: number;
  taskCode: string;
  taskTitle: string;
  taskType: string;
  taskTypeName: string;
  priority?: string;
  description?: string;
  aiFocus?: boolean;
  patrolLocation: string;
  areaIds?: number[];
  pointIds?: number[];
  planTime: string;
  startTime?: string;
  endTime?: string;
  durationHours?: number;
  repeatRule?: string;
  executorId: number;
  executorName: string;
  taskStatus: string;
  taskStatusName: string;
  progress: number;
  exceptionCount: number;
  creatorName: string;
  createTime: string;
}

export interface PatrolTaskPrintedWorkOrder {
  workOrderId: number;
  workOrderCode: string;
  title: string;
  taskId?: number;
  eventTypeName?: string;
  riskLevelName?: string;
  reporterName?: string;
  locationName?: string;
  addressDetail?: string;
  description?: string;
  suggestion?: string;
  status: string;
  statusName: string;
  statusColor?: string;
  statusRipple?: boolean;
  reportTime?: string;
  printedAt?: string;
  noticeNumber?: string;
  documentContent?: string;
  fileUrl?: string;
  imageBase64?: string;
  evidenceList?: Array<Record<string, any>>;
}

export interface PatrolTaskWorkOrderParam extends PageParam {
  taskId?: number;
  taskCode?: string;
}

export interface PatrolTaskParam extends PageParam {
  taskTitle?: string;
  taskType?: string;
  taskStatus?: string;
  timeStart?: string;
  timeEnd?: string;
  patrolLocation?: string;
  executorId?: number;
}

export interface PatrolTaskSummary {
  waiting: number;
  running: number;
  finished: number;
  overdue: number;
}

export interface PatrolTaskTourStatus {
  hidden: boolean;
}

export interface PatrolCoord {
  lat: number;
  lng: number;
}

export interface PatrolArea {
  areaId: number;
  areaCode: string;
  areaName: string;
  center: PatrolCoord;
  boundary: PatrolCoord[];
  sortNumber: number;
  comments?: string;
}

export interface PatrolAreaForm {
  areaId?: number;
  areaName: string;
  center: PatrolCoord;
  boundary: PatrolCoord[];
  comments?: string;
}

export interface PatrolPoint {
  pointId: number;
  areaId: number;
  pointCode: string;
  pointName: string;
  pointType: string;
  lat: number;
  lng: number;
  sortNumber: number;
  comments?: string;
}

export interface PatrolDevice {
  deviceId: number;
  userId: number;
  userName: string;
  employeeNo: string;
  deviceType: string;
  deviceName: string;
  deviceSn: string;
  onlineStatus: string;
  bindStatus: string;
}

export interface PatrolExecutor {
  userId: number;
  username: string;
  nickname: string;
  employeeNo: string;
  avatar?: string;
  status: number;
  devices: PatrolDevice[];
}

export interface PatrolTaskCreateOptions {
  areas: PatrolArea[];
  points: PatrolPoint[];
  executors: PatrolExecutor[];
}

export interface PatrolTaskDetailParam {
  taskId?: number;
  taskCode?: string;
}

export interface PatrolTaskDetail {
  task: PatrolTask;
  areas: PatrolArea[];
  points: PatrolPoint[];
  executors: PatrolExecutor[];
}

export interface PatrolPointForm {
  areaId?: number;
  pointId?: number;
  pointName: string;
  pointType?: string;
  lat: number;
  lng: number;
}

export interface PatrolTaskCreateForm {
  taskTitle: string;
  taskType: string;
  priority: string;
  description?: string;
  aiFocus: boolean;
  areaIds: number[];
  pointIds: number[];
  startTime: string;
  endTime: string;
  durationHours: number;
  repeatRule: string;
  executorId?: number;
  draft?: boolean;
}

export interface PatrolTaskUpdateForm extends PatrolTaskCreateForm {
  taskId: number;
}
