import type { PageParam } from '@/api';

export interface ClosedLoopParam extends PageParam {
  keywords?: string;
  status?: string;
  riskLevel?: string;
  areaName?: string;
}

export interface StatusMeta {
  statusColor?: string;
  statusRipple?: boolean;
}

export interface DashboardSummary {
  todayTaskCount: number;
  runningTaskCount: number;
  completedTaskCount: number;
  pendingWorkOrderCount: number;
  timeoutWorkOrderCount: number;
  aiDetectCount: number;
  highRiskCount: number;
  closureRate: number;
  avgHandleTime: string;
}

export interface PatrolCoord {
  lat: number;
  lng: number;
  name?: string;
}

export interface MapArea {
  areaId: number;
  areaName: string;
  center: PatrolCoord;
  boundary: PatrolCoord[];
}

export interface MapPoint extends PatrolCoord {
  pointId: number;
  areaId: number;
  pointName: string;
  pointType: string;
}

export interface MapInspector extends PatrolCoord {
  id: number;
  name: string;
  status: string;
  statusName: string;
  taskName: string;
  location: string;
  devices: Array<{
    deviceType: string;
    deviceName: string;
    onlineStatus: string;
  }>;
}

export interface InspectionEvent extends PatrolCoord {
  eventId: number;
  eventCode: string;
  eventTitle: string;
  eventType: string;
  riskLevel: string;
  riskLevelName: string;
  riskColor: string;
  source: string;
  status: string;
  taskId?: number;
  taskCode?: string;
  inspectorId?: number;
  inspectorName: string;
  areaId?: number;
  areaName: string;
  pointId?: number;
  pointName: string;
  confidence: number;
  description?: string;
  imageUrl?: string;
  detectedTime: string;
}

export interface MapPointsPayload {
  areas: MapArea[];
  points: MapPoint[];
  route: PatrolCoord[];
  inspectors: MapInspector[];
  events: InspectionEvent[];
}

export interface WorkOrder extends StatusMeta {
  workOrderId: number;
  workOrderNo?: string;
  workOrderCode: string;
  title: string;
  eventType?: string;
  eventTypeName?: string;
  riskLevel: string;
  riskLevelName: string;
  riskColor: string;
  source: string;
  reporterId?: number;
  reporterName: string;
  areaId?: number;
  areaName: string;
  pointName?: string;
  locationName?: string;
  addressDetail?: string;
  eventId?: number;
  taskId?: number;
  status: string;
  statusName: string;
  pushStatus?: string;
  pushStatusName?: string;
  pushStatusColor?: string;
  pushStatusRipple?: boolean;
  thirdOrderNo?: string;
  platformCode?: string;
  latitude?: number;
  longitude?: number;
  deadlineTime?: string;
  remainingMinutes: number;
  responsibleDepartment?: string;
  handlerName?: string;
  description?: string;
  suggestion?: string;
  evidenceList?: Array<{ fileType: string; fileName: string; fileUrl: string }>;
  timeline: TimelineItem[];
  reportTime?: string;
  createdAt?: string;
  createTime: string;
}

export interface TimelineItem {
  time: string;
  title: string;
  desc: string;
  status: string;
  color: string;
}

export interface WorkOrderDetail {
  workOrder: WorkOrder;
  task?: unknown;
  aiDetection?: InspectionEvent;
  event?: InspectionEvent;
  report?: InspectionReport;
  document?: LawDocument;
  documents?: LawDocument[];
  pushRecords?: PushRecord[];
  flowRecords?: Array<{
    flowId: number;
    businessType: string;
    businessId: number;
    businessCode: string;
    action: string;
    fromStatus?: string;
    toStatus?: string;
    operatorName: string;
    remark?: string;
    eventType?: string;
    createdAt: string;
  }>;
}

export interface WorkOrderActionForm {
  workOrderId: number;
  action: string;
  comments?: string;
}

export interface InspectionReport extends StatusMeta {
  reportId: number;
  reportCode: string;
  reportTitle: string;
  taskId?: number;
  workOrderId?: number;
  reportStatus: string;
  reportStatusName: string;
  closureRate: number;
  pointCount: number;
  aiDetectCount: number;
  workOrderCount: number;
  timeoutCount: number;
  summary?: string;
  generatedTime?: string;
  archiveTime?: string;
  createTime: string;
}

export interface LawDocument extends StatusMeta {
  documentId: number;
  documentNo?: string;
  documentCode: string;
  documentTitle: string;
  documentType: string;
  documentTypeName?: string;
  workOrderId?: number;
  targetName?: string;
  checkedUnit: string;
  checkLocation: string;
  illegalFact?: string;
  legalBasis?: string;
  rectificationRequirement?: string;
  deadline?: string;
  reviewRequirement?: string;
  patrolUserName?: string;
  status?: string;
  statusName?: string;
  printStatus: string;
  printStatusName: string;
  inspectorName: string;
  content?: string;
  qrCode?: string;
  generatedAt?: string;
  printedAt?: string;
  createTime: string;
}

export interface PushRecord extends StatusMeta {
  pushRecordId: number;
  requestId: string;
  workOrderId: number;
  workOrderNo: string;
  targetPlatform: string;
  pushStatus: string;
  pushStatusName: string;
  thirdOrderNo?: string;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  errorMessage?: string;
  pushedAt: string;
  operatorName: string;
}

export interface PersonnelDevice {
  id: number;
  name: string;
  employeeNo: string;
  onlineStatus: string;
  statusColor: string;
  location: string;
  taskName: string;
  devices: Array<{
    deviceId: number;
    deviceType: string;
    deviceName: string;
    deviceSn: string;
    onlineStatus: string;
    bindStatus: string;
  }>;
}
