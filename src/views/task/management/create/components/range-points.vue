<template>
  <y-card class="create-card range-card">
    <div class="range-head">
      <section-title
        :index="2"
        title="巡查范围与点位"
        subtitle="选择巡查地点和点位"
      />
      <div v-if="!readonly" class="range-head-actions">
        <el-button @click="clearAreas">清空区域</el-button>
        <el-button @click="resetPoints">重新选点</el-button>
      </div>
    </div>

    <div class="range-grid">
      <div class="map-panel">
        <el-form
          ref="formRef"
          :model="model"
          :rules="rules"
          label-position="top"
          @submit.prevent=""
        >
          <el-form-item label="社区多选" prop="areaIds" required>
            <el-select
              v-model="model.areaIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              clearable
              :disabled="readonly"
              class="y-fluid"
              placeholder="请选择社区"
              @change="handleAreaChange"
            >
              <el-option
                v-for="area in areas"
                :key="area.areaId"
                :label="area.areaName"
                :value="area.areaId"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="pointIds" class="point-validation-item">
            <div></div>
          </el-form-item>
        </el-form>

        <div class="task-map-shell">
          <base-map
            class="task-map"
            :api-key="txMapKey"
            :center="mapCenter"
            :zoom="15"
            :min-zoom="12"
            :max-zoom="18"
            :control="mapControl"
            :options="mapOptions"
            @map_inited="handleMapInited"
          >
            <multi-polygon
              v-if="polygonGeometries.length"
              id="task-create-area"
              :styles="polygonStyles"
              :geometries="polygonGeometries"
            />
          </base-map>
          <svg
            v-if="areaBorderPolylines.length"
            class="task-map-overlay"
            aria-hidden="true"
          >
            <polyline
              v-for="line in areaBorderPolylines"
              :key="line.id"
              class="task-area-border"
              :points="line.points"
            />
          </svg>
          <div
            v-for="label in projectedAreaLabels"
            :key="label.id"
            class="task-area-label"
            :style="{ left: `${label.x}px`, top: `${label.y}px` }"
          >
            {{ label.name }}
          </div>
          <div
            v-for="marker in projectedMarkers"
            :key="marker.id"
            class="task-map-marker"
            :style="{ left: `${marker.x}px`, top: `${marker.y}px` }"
          >
            <span class="marker-core"></span>
          </div>
          <div v-if="!txMapKey" class="map-empty">请配置腾讯地图 Key</div>
        </div>
      </div>

      <div class="point-panel pb-3">
        <div class="point-title">
          <strong>小区/楼栋/点位清单</strong>
          <span>共{{ selectedPoints.length }}个点位</span>
        </div>
        <el-scrollbar class="point-scrollbar pb-1">
          <y-check-card
            v-if="visiblePoints.length"
            v-model="model.pointIds"
            multiple
            :items="pointItems"
            :item-style="{ padding: 0, marginBottom: '8px' }"
            :disabled="readonly"
            class="point-check-card"
          >
            <template #item="{ item }">
              <div class="point-check-item">
                <el-icon><OfficeBuilding /></el-icon>
                <span>{{ item?.label }}</span>
              </div>
            </template>
          </y-check-card>
          <el-empty
            v-if="!visiblePoints.length"
            :image-size="80"
            description="请选择社区后查看点位"
          />
        </el-scrollbar>
      </div>
    </div>
  </y-card>
</template>

<script lang="ts" setup>
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    reactive,
    ref,
    shallowRef,
    watch
  } from 'vue';
  import type { FormInstance, FormRules } from 'element-plus';
  import { OfficeBuilding } from '@element-plus/icons-vue';
  import type { CheckCardItem } from 'y-element-ultra/es/y-check-card/types';
  import { BaseMap, MultiPolygon } from '@/TMap';
  import type { PatrolArea, PatrolPoint } from '@/api/task/model';
  import { getTencentMapOptions } from '@/utils/tencent-map-options';
  import type { PatrolTaskCreateState } from '../types';
  import SectionTitle from './section-title.vue';

  type ProjectedPoint = {
    x: number;
    y: number;
  };

  type TencentMapInstance = {
    projectToContainer: (position: unknown) => {
      getX: () => number;
      getY: () => number;
    };
    on?: (event: string, callback: () => void) => void;
    off?: (event: string, callback: () => void) => void;
  };

  type ProjectedMarker = PatrolPoint &
    ProjectedPoint & {
      id: string;
    };

  type ProjectedAreaLabel = ProjectedPoint & {
    id: string;
    name: string;
  };

  const props = defineProps<{
    areas: PatrolArea[];
    points: PatrolPoint[];
    readonly?: boolean;
  }>();

  const model = defineModel<PatrolTaskCreateState>({ required: true });
  const readonly = computed(() => props.readonly);
  const formRef = ref<FormInstance | null>(null);

  const txMapKey = (import.meta.env.VITE_TX_MAP_KEY || '').trim();
  const mapInstance = shallowRef<TencentMapInstance | null>(null);
  const projectedMarkers = shallowRef<ProjectedMarker[]>([]);
  const projectedAreaLabels = shallowRef<ProjectedAreaLabel[]>([]);
  const projectedAreaBorders = shallowRef<
    Array<{ id: string; points: ProjectedPoint[] }>
  >([]);
  let renderTimer = 0;

  const validatePointIds = (
    _rule: unknown,
    value: number[],
    callback: (error?: Error) => void
  ) => {
    if (!value?.length) {
      callback(new Error('请选择巡查点位'));
      return;
    }
    callback();
  };

  const rules = reactive<FormRules>({
    areaIds: [
      {
        required: true,
        type: 'array',
        min: 1,
        message: '请选择社区',
        trigger: 'change'
      }
    ],
    pointIds: [
      { required: true, validator: validatePointIds, trigger: 'change' }
    ]
  });

  const selectedAreas = computed(() =>
    props.areas.filter((area) => model.value.areaIds.includes(area.areaId))
  );

  const visiblePoints = computed(() =>
    props.points.filter((point) => model.value.areaIds.includes(point.areaId))
  );

  const selectedPoints = computed(() =>
    props.points.filter((point) => model.value.pointIds.includes(point.pointId))
  );

  const pointItems = computed<CheckCardItem[]>(() =>
    visiblePoints.value.map((point) => ({
      key: point.pointId,
      value: point.pointId,
      label: point.pointName
    }))
  );

  const mapCenter = computed(() => {
    const firstArea = selectedAreas.value[0] || props.areas[0];
    return firstArea?.center || { lat: 23.1372, lng: 113.2621 };
  });

  const mapControl = {
    zoom: false,
    scale: false,
    rotation: false
  };

  const mapOptions = getTencentMapOptions();

  const polygonStyles = {
    selected: {
      color: 'rgba(31, 111, 235, 0.12)',
      showBorder: false
    }
  };

  const polygonGeometries = computed(() =>
    selectedAreas.value
      .filter((area) => area.boundary?.length)
      .map((area) => ({
        id: String(area.areaId),
        styleId: 'selected',
        paths: area.boundary,
        properties: { title: area.areaName }
      }))
  );

  const areaBorderPolylines = computed(() =>
    projectedAreaBorders.value.map((area) => ({
      id: area.id,
      points: area.points.map((point) => `${point.x},${point.y}`).join(' ')
    }))
  );

  const projectCoord = (point: {
    lat: number;
    lng: number;
  }): ProjectedPoint | null => {
    if (!mapInstance.value) return null;

    const tMap = (
      window as { TMap?: { LatLng: new (lat: number, lng: number) => unknown } }
    ).TMap;
    if (!tMap) return null;

    const pixel = mapInstance.value.projectToContainer(
      new tMap.LatLng(point.lat, point.lng)
    );

    return {
      x: pixel.getX(),
      y: pixel.getY()
    };
  };

  const projectPoint = (point: PatrolPoint): ProjectedMarker | null => {
    const projected = projectCoord(point);
    if (!projected) return null;

    return {
      ...point,
      id: String(point.pointId),
      ...projected
    };
  };

  const renderOverlay = () => {
    projectedMarkers.value = selectedPoints.value
      .map(projectPoint)
      .filter(Boolean) as ProjectedMarker[];
    projectedAreaLabels.value = selectedAreas.value
      .map((area) => {
        const projected = projectCoord(area.center);
        return projected
          ? { id: String(area.areaId), name: area.areaName, ...projected }
          : null;
      })
      .filter(Boolean) as ProjectedAreaLabel[];
    projectedAreaBorders.value = selectedAreas.value
      .filter((area) => area.boundary?.length)
      .map((area) => {
        const closedBoundary = [...area.boundary, area.boundary[0]];
        return {
          id: String(area.areaId),
          points: closedBoundary
            .map(projectCoord)
            .filter(Boolean) as ProjectedPoint[]
        };
      })
      .filter((area) => area.points.length > 1);
  };

  const scheduleRenderOverlay = () => {
    if (renderTimer) {
      window.cancelAnimationFrame(renderTimer);
    }
    renderTimer = window.requestAnimationFrame(renderOverlay);
  };

  const handleMapInited = (map: TencentMapInstance) => {
    mapInstance.value = map;
    [
      'bounds_changed',
      'center_changed',
      'zoom_changed',
      'pan',
      'drag',
      'idle'
    ].forEach((event) => {
      map.on?.(event, scheduleRenderOverlay);
    });
    nextTick(scheduleRenderOverlay);
  };

  const handleAreaChange = () => {
    const visiblePointIds = new Set(
      visiblePoints.value.map((point) => point.pointId)
    );
    model.value.pointIds = model.value.pointIds.filter((id) =>
      visiblePointIds.has(id)
    );
    formRef.value?.validateField?.(['areaIds', 'pointIds']);
  };

  const clearAreas = () => {
    model.value.areaIds = [];
    model.value.pointIds = [];
  };

  const resetPoints = () => {
    model.value.pointIds = [];
    formRef.value?.validateField?.('pointIds');
  };

  watch([selectedPoints, mapCenter], () => {
    nextTick(scheduleRenderOverlay);
  });

  onBeforeUnmount(() => {
    if (renderTimer) {
      window.cancelAnimationFrame(renderTimer);
    }
    projectedMarkers.value = [];
    projectedAreaLabels.value = [];
    projectedAreaBorders.value = [];
  });

  watch(
    () => model.value.pointIds,
    () => {
      formRef.value?.validateField?.('pointIds');
    }
  );

  const validate = () =>
    new Promise<boolean>((resolve) => {
      formRef.value?.validate((valid) => {
        resolve(valid);
      });
    });

  const clearValidate = () => {
    formRef.value?.clearValidate();
  };

  defineExpose({ clearValidate, validate });
</script>

<style lang="scss" scoped>
  .range-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .range-head-actions {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 10px;
  }

  .range-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 22px;
    align-items: stretch;
  }

  .map-panel,
  .point-panel {
    --range-content-height: 326px;
  }

  .task-map-shell {
    position: relative;
    height: 260px;
    overflow: hidden;
    border: 1px solid #e5eaf3;
    border-radius: 6px;
    background: #eef4ff;
  }

  .point-validation-item {
    margin-bottom: 0;

    :deep(.el-form-item__content) {
      display: none;
    }
  }

  .task-map {
    width: 100%;
    height: 100%;
  }

  .task-map-overlay {
    position: absolute;
    inset: 0;
    z-index: 3;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .task-area-border {
    fill: none;
    stroke: #1f73ff;
    stroke-width: 2.2;
    stroke-dasharray: 7 6;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 2px 2px rgb(31 115 255 / 16%));
  }

  .task-area-label {
    position: absolute;
    z-index: 5;
    padding: 4px 10px;
    color: #1f73ff;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    pointer-events: none;
    border: 1px solid rgb(31 115 255 / 38%);
    border-radius: 4px;
    background: rgb(255 255 255 / 94%);
    box-shadow: 0 4px 12px rgb(31 115 255 / 12%);
    transform: translate(-50%, -115%);

    &::after {
      position: absolute;
      bottom: -6px;
      left: 50%;
      width: 9px;
      height: 9px;
      content: '';
      border-right: 1px solid rgb(31 115 255 / 38%);
      border-bottom: 1px solid rgb(31 115 255 / 38%);
      background: rgb(255 255 255 / 94%);
      transform: translateX(-50%) rotate(45deg);
    }
  }

  .task-map-marker {
    position: absolute;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    pointer-events: none;
    border-radius: 999px;
    transform: translate(-50%, -50%);

    .marker-core {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 12px;
      height: 12px;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      line-height: 1;
      border: 2px solid #fff;
      border-radius: inherit;
      box-shadow: 0 2px 8px rgb(0 0 0 / 16%);
    }

    background: rgb(31 115 255 / 18%);

    .marker-core {
      background: #1f73ff;
    }
  }

  .map-empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8b95a5;
    background: #f5f8ff;
  }

  .point-panel {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-width: 0;
    height: var(--range-content-height);
  }

  .point-title {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 12px;
    color: #1f2937;
    font-size: 14px;

    span {
      color: #8b95a5;
    }
  }

  .point-scrollbar {
    height: 100%;
    min-height: 0;

    :deep(.el-scrollbar__wrap),
    :deep(.el-scrollbar__view) {
      height: 100%;
    }
  }

  .point-check-card {
    :deep(.y-check-card) {
      display: block;
      width: 100%;
      overflow: hidden;
      border-color: #edf1f7;
      border-radius: 6px;
      background: #fff;
      transition:
        border-color 0.2s,
        background-color 0.2s;

      &.is-checked {
        border-color: rgb(31 111 235 / 35%);
        background: rgb(31 111 235 / 6%);
      }
    }
  }

  .point-check-item {
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr);
    gap: 8px;
    align-items: center;
    min-height: 44px;
    padding: 0 10px;
    color: #334155;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .el-icon {
      color: #1f6feb;
    }
  }

  @media (max-width: 1024px) {
    .range-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
