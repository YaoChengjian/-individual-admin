<template>
  <y-page hide-footer :multi-card="false">
    <div class="patrol-map-page">
      <div class="patrol-map-head">
        <div class="patrol-map-title">
          <h1>巡查地图</h1>
          <span>绘制巡查区域、配置点位，并同步到任务管理闭环</span>
        </div>
        <div class="patrol-map-actions">
          <el-button size="large" :icon="Refresh" @click="loadMapData">
            刷新数据
          </el-button>
          <el-button
            size="large"
            type="primary"
            :icon="Finished"
            :loading="savingArea"
            @click="saveArea"
          >
            保存区域
          </el-button>
          <el-button
            size="large"
            type="success"
            :icon="CirclePlus"
            @click="goCreateTask"
          >
            新建巡查任务
          </el-button>
        </div>
      </div>

      <div class="patrol-map-layout">
        <y-card
          class="map-work-card"
          :body-style="{ padding: 0, height: '100%' }"
        >
          <div class="map-toolbar">
            <el-segmented v-model="activeTool" :options="toolOptions" />
            <div class="map-toolbar-actions">
              <el-button :icon="Close" @click="undoBoundary">撤销边界</el-button>
              <el-button :icon="Delete" @click="clearDraft">清空草稿</el-button>
            </div>
          </div>

          <div class="map-canvas" @click="handleCanvasClick">
            <base-map
              class="patrol-map"
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
                id="patrol-area-layer"
                :styles="polygonStyles"
                :geometries="polygonGeometries"
              />
              <multi-marker
                v-if="markerGeometries.length"
                id="patrol-point-layer"
                :styles="markerStyles"
                :geometries="markerGeometries"
              />
            </base-map>

            <svg
              v-if="draftLinePoints"
              class="draft-layer"
              aria-hidden="true"
            >
              <polyline class="draft-line" :points="draftLinePoints" />
            </svg>
            <div
              v-for="point in projectedDraftPoints"
              :key="point.id"
              class="draft-point"
              :style="{ left: `${point.x}px`, top: `${point.y}px` }"
            >
              {{ point.index }}
            </div>
            <div
              v-if="activeAreaLabel"
              class="area-label"
              :style="{
                left: `${activeAreaLabel.x}px`,
                top: `${activeAreaLabel.y}px`
              }"
            >
              {{ activeAreaLabel.name }}
            </div>

            <div v-if="!txMapKey" class="map-empty">请配置腾讯地图 Key</div>
          </div>
        </y-card>

        <aside class="map-side">
          <y-card
            class="side-card"
            header="区域草稿"
            :body-style="{ padding: '14px 16px 16px' }"
          >
            <el-form label-width="72px" @submit.prevent="">
              <el-form-item label="区域名称">
                <el-input
                  v-model.trim="draftAreaName"
                  maxlength="100"
                  placeholder="请输入巡查区域名称"
                />
              </el-form-item>
              <el-form-item label="当前区域">
                <el-select
                  v-model="activeAreaId"
                  clearable
                  filterable
                  class="y-fluid"
                  placeholder="请选择已保存区域"
                  @change="handleAreaSelect"
                >
                  <el-option
                    v-for="area in areas"
                    :key="area.areaId"
                    :label="area.areaName"
                    :value="area.areaId"
                  />
                </el-select>
              </el-form-item>
            </el-form>
            <div class="draft-stats">
              <div>
                <strong>{{ draftBoundary.length }}</strong>
                <span>边界点</span>
              </div>
              <div>
                <strong>{{ activeAreaPoints.length }}</strong>
                <span>巡查点位</span>
              </div>
            </div>
          </y-card>

          <y-card
            class="side-card"
            header="区域清单"
            :body-style="{ padding: '10px 12px 12px' }"
          >
            <el-scrollbar height="210px">
              <div
                v-for="area in areas"
                :key="area.areaId"
                class="area-item"
                :class="{ 'is-active': area.areaId === activeAreaId }"
                @click="selectArea(area)"
              >
                <div>
                  <strong>{{ area.areaName }}</strong>
                  <span>{{ area.boundary.length }} 个边界点</span>
                </div>
                <y-dot
                  :text="`${pointsByArea(area.areaId).length} 点位`"
                  color="#1f6feb"
                  size="7px"
                />
              </div>
              <el-empty
                v-if="!areas.length"
                :image-size="72"
                description="暂无巡查区域"
              />
            </el-scrollbar>
          </y-card>

          <y-card
            class="side-card side-card-fill"
            header="点位清单"
            :body-style="{ padding: '10px 12px 12px', height: '100%' }"
          >
            <el-scrollbar class="point-scrollbar">
              <div
                v-for="point in activeAreaPoints"
                :key="point.pointId"
                class="point-item"
              >
                <div>
                  <strong>{{ point.pointName }}</strong>
                  <span>{{ pointTypeName(point.pointType) }}</span>
                </div>
                <el-button
                  link
                  type="danger"
                  :icon="Delete"
                  @click="removePoint(point)"
                >
                  删除
                </el-button>
              </div>
              <el-empty
                v-if="!activeAreaPoints.length"
                :image-size="72"
                description="选择区域后点击地图添加点位"
              />
            </el-scrollbar>
          </y-card>
        </aside>
      </div>

      <div class="closed-loop-strip">
        <div
          v-for="item in closedLoopSteps"
          :key="item.title"
          class="loop-step"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <div>
            <strong>{{ item.title }}</strong>
            <span>{{ item.desc }}</span>
          </div>
        </div>
      </div>
    </div>
  </y-page>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onBeforeUnmount, reactive, ref, shallowRef } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    Aim,
    Brush,
    CirclePlus,
    Close,
    Delete,
    Finished,
    MapLocation,
    Position,
    Refresh
  } from '@element-plus/icons-vue';
  import { ElMessageBox } from 'element-plus';
  import { YMessage } from 'y-element-ultra';
  import { BaseMap, MultiMarker, MultiPolygon } from '@/TMap';
  import {
    addPatrolPoint,
    listPatrolAreas,
    listPatrolPoints,
    removePatrolPoint,
    savePatrolArea
  } from '@/api/task';
  import type { PatrolArea, PatrolCoord, PatrolPoint } from '@/api/task/model';
  import { getTencentMapOptions } from '@/utils/tencent-map-options';

  defineOptions({ name: 'PatrolMap' });

  type ToolMode = 'area' | 'point';

  type TencentMapInstance = {
    projectToContainer: (position: unknown) => {
      getX: () => number;
      getY: () => number;
    };
    containerToLatLng?: (point: unknown) => {
      getLat: () => number;
      getLng: () => number;
    };
    unprojectFromContainer?: (point: unknown) => {
      getLat: () => number;
      getLng: () => number;
    };
    on?: (event: string, callback: () => void) => void;
    off?: (event: string, callback: () => void) => void;
  };

  type ProjectedPoint = PatrolCoord & {
    id: string;
    index: number;
    x: number;
    y: number;
  };

  const router = useRouter();
  const txMapKey = (import.meta.env.VITE_TX_MAP_KEY || '').trim();
  const mapInstance = shallowRef<TencentMapInstance | null>(null);
  const mapShellRect = ref<DOMRect | null>(null);
  const areas = ref<PatrolArea[]>([]);
  const points = ref<PatrolPoint[]>([]);
  const activeAreaId = ref<number>();
  const activeTool = ref<ToolMode>('area');
  const draftAreaName = ref('');
  const draftBoundary = ref<PatrolCoord[]>([]);
  const savingArea = ref(false);
  const projectedDraftPoints = ref<ProjectedPoint[]>([]);
  const activeAreaLabel = ref<{ name: string; x: number; y: number } | null>(null);
  let renderTimer = 0;

  const mapCenter = {
    lat: 23.1372,
    lng: 113.2621
  };

  const mapControl = {
    zoom: false,
    scale: false,
    rotation: false
  };

  const mapOptions = getTencentMapOptions();

  const toolOptions = [
    { label: '画巡查面', value: 'area', icon: Brush },
    { label: '添加点位', value: 'point', icon: Aim }
  ];

  const closedLoopSteps = [
    { title: '配置巡查面', desc: '框选社区或重点区域', icon: MapLocation },
    { title: '布设点位', desc: '在面内添加楼栋与重点点', icon: Position },
    { title: '创建任务', desc: '任务管理选择区域和点位', icon: CirclePlus },
    { title: '下发闭环', desc: '执行、工单、报告回流', icon: Finished }
  ];

  const activeArea = computed(() =>
    areas.value.find((area) => area.areaId === activeAreaId.value)
  );

  const activeBoundary = computed(() =>
    draftBoundary.value.length ? draftBoundary.value : activeArea.value?.boundary || []
  );

  const activeAreaPoints = computed(() =>
    points.value.filter((point) => point.areaId === activeAreaId.value)
  );

  const polygonStyles = {
    saved: {
      color: 'rgba(31, 111, 235, 0.12)',
      showBorder: true,
      borderColor: '#1f6feb',
      borderWidth: 2
    },
    active: {
      color: 'rgba(31, 111, 235, 0.2)',
      showBorder: true,
      borderColor: '#1f6feb',
      borderWidth: 3
    },
    draft: {
      color: 'rgba(245, 158, 11, 0.14)',
      showBorder: true,
      borderColor: '#f59e0b',
      borderWidth: 2
    }
  };

  const markerStyles = {
    building: {
      width: 18,
      height: 18,
      anchor: { x: 9, y: 9 },
      color: '#1f6feb',
      strokeColor: '#fff',
      strokeWidth: 3
    },
    key_point: {
      width: 20,
      height: 20,
      anchor: { x: 10, y: 10 },
      color: '#20b56b',
      strokeColor: '#fff',
      strokeWidth: 3
    }
  };

  const polygonGeometries = computed(() => {
    const saved = areas.value
      .filter((area) => area.boundary.length >= 3)
      .map((area) => ({
        id: String(area.areaId),
        styleId: area.areaId === activeAreaId.value ? 'active' : 'saved',
        paths: area.boundary,
        properties: { title: area.areaName }
      }));

    if (draftBoundary.value.length >= 3) {
      saved.push({
        id: 'draft',
        styleId: 'draft',
        paths: draftBoundary.value,
        properties: { title: draftAreaName.value || '未命名区域' }
      });
    }

    return saved;
  });

  const markerGeometries = computed(() =>
    points.value.map((point) => ({
      id: String(point.pointId),
      styleId: point.pointType === 'building' ? 'building' : 'key_point',
      position: { lat: point.lat, lng: point.lng },
      properties: { title: point.pointName }
    }))
  );

  const draftLinePoints = computed(() =>
    projectedDraftPoints.value.map((point) => `${point.x},${point.y}`).join(' ')
  );

  const pointsByArea = (areaId: number) =>
    points.value.filter((point) => point.areaId === areaId);

  const pointTypeName = (type: string) =>
    type === 'building' ? '楼栋点位' : '重点点位';

  const toTMapLatLng = (point: PatrolCoord) => {
    const tMap = (
      window as { TMap?: { LatLng: new (lat: number, lng: number) => unknown } }
    ).TMap;
    return tMap ? new tMap.LatLng(point.lat, point.lng) : null;
  };

  const projectCoord = (point: PatrolCoord) => {
    if (!mapInstance.value) return null;
    const latLng = toTMapLatLng(point);
    if (!latLng) return null;
    const pixel = mapInstance.value.projectToContainer(latLng);
    return {
      x: pixel.getX(),
      y: pixel.getY()
    };
  };

  const readLatLng = (value: unknown): PatrolCoord | null => {
    const latLng = value as { getLat?: () => number; getLng?: () => number };
    if (typeof latLng?.getLat === 'function' && typeof latLng?.getLng === 'function') {
      return { lat: latLng.getLat(), lng: latLng.getLng() };
    }
    const plain = value as { lat?: number; lng?: number };
    if (typeof plain?.lat === 'number' && typeof plain?.lng === 'number') {
      return { lat: plain.lat, lng: plain.lng };
    }
    return null;
  };

  const eventToCoord = (event: MouseEvent): PatrolCoord | null => {
    if (!mapInstance.value || !mapShellRect.value) return null;
    const point = {
      x: event.clientX - mapShellRect.value.left,
      y: event.clientY - mapShellRect.value.top
    };
    const converter =
      mapInstance.value.containerToLatLng ||
      mapInstance.value.unprojectFromContainer;
    if (converter) {
      return readLatLng(converter(point));
    }
    const center = activeArea.value?.center || mapCenter;
    const scale = 0.000045;
    return {
      lat: center.lat - (point.y - mapShellRect.value.height / 2) * scale,
      lng: center.lng + (point.x - mapShellRect.value.width / 2) * scale
    };
  };

  const renderOverlay = () => {
    projectedDraftPoints.value = draftBoundary.value
      .map((point, index) => {
        const projected = projectCoord(point);
        return projected
          ? {
              id: `${index}-${point.lat}-${point.lng}`,
              index: index + 1,
              ...point,
              ...projected
            }
          : null;
      })
      .filter(Boolean) as ProjectedPoint[];

    const labelArea = activeArea.value;
    if (labelArea) {
      const projected = projectCoord(labelArea.center);
      activeAreaLabel.value = projected
        ? { name: labelArea.areaName, ...projected }
        : null;
    } else {
      activeAreaLabel.value = null;
    }
  };

  const scheduleRenderOverlay = () => {
    if (renderTimer) {
      window.cancelAnimationFrame(renderTimer);
    }
    renderTimer = window.requestAnimationFrame(renderOverlay);
  };

  const handleMapInited = (map: TencentMapInstance) => {
    mapInstance.value = map;
    ['bounds_changed', 'center_changed', 'zoom_changed', 'pan', 'drag', 'idle'].forEach(
      (event) => map.on?.(event, scheduleRenderOverlay)
    );
    nextTick(scheduleRenderOverlay);
  };

  const loadMapData = () => {
    Promise.all([listPatrolAreas(), listPatrolPoints()])
      .then(([areaRows, pointRows]) => {
        areas.value = areaRows || [];
        points.value = pointRows || [];
        if (!activeAreaId.value && areas.value.length) {
          selectArea(areas.value[0]);
        }
        nextTick(scheduleRenderOverlay);
      })
      .catch((e) => {
        YMessage.error({ message: e.message, plain: true });
      });
  };

  const selectArea = (area: PatrolArea) => {
    activeAreaId.value = area.areaId;
    draftAreaName.value = area.areaName;
    draftBoundary.value = [...area.boundary];
    nextTick(scheduleRenderOverlay);
  };

  const handleAreaSelect = () => {
    const area = activeArea.value;
    if (area) {
      selectArea(area);
      return;
    }
    draftAreaName.value = '';
    draftBoundary.value = [];
  };

  const handleCanvasClick = (event: MouseEvent) => {
    mapShellRect.value = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const coord = eventToCoord(event);
    if (!coord) return;

    if (activeTool.value === 'area') {
      draftBoundary.value.push(coord);
      nextTick(scheduleRenderOverlay);
      return;
    }

    addPoint(coord);
  };

  const polygonCenter = (boundary: PatrolCoord[]) => {
    const sum = boundary.reduce(
      (acc, point) => ({
        lat: acc.lat + point.lat,
        lng: acc.lng + point.lng
      }),
      { lat: 0, lng: 0 }
    );
    return {
      lat: sum.lat / boundary.length,
      lng: sum.lng / boundary.length
    };
  };

  const saveArea = () => {
    if (!draftAreaName.value) {
      YMessage.warning({ message: '请输入巡查区域名称', plain: true });
      return;
    }
    if (draftBoundary.value.length < 3) {
      YMessage.warning({ message: '请至少绘制3个边界点', plain: true });
      return;
    }

    savingArea.value = true;
    savePatrolArea({
      areaId: activeAreaId.value,
      areaName: draftAreaName.value,
      center: polygonCenter(draftBoundary.value),
      boundary: draftBoundary.value
    })
      .then((area) => {
        YMessage.success({ message: '巡查区域已保存', plain: true });
        activeAreaId.value = area.areaId;
        loadMapData();
      })
      .catch((e) => {
        YMessage.error({ message: e.message, plain: true });
      })
      .finally(() => {
        savingArea.value = false;
      });
  };

  const addPoint = (coord: PatrolCoord) => {
    if (!activeAreaId.value) {
      YMessage.warning({ message: '请先保存或选择巡查区域', plain: true });
      return;
    }

    const index = activeAreaPoints.value.length + 1;
    const areaName = activeArea.value?.areaName || '巡查区域';
    addPatrolPoint({
      areaId: activeAreaId.value,
      pointName: `${areaName}${index}号点位`,
      pointType: index % 3 === 0 ? 'key_point' : 'building',
      lat: coord.lat,
      lng: coord.lng
    })
      .then((point) => {
        points.value.push(point);
        YMessage.success({ message: '点位已添加', plain: true });
      })
      .catch((e) => {
        YMessage.error({ message: e.message, plain: true });
      });
  };

  const removePoint = (point: PatrolPoint) => {
    ElMessageBox.confirm(`确定删除「${point.pointName}」吗？`, '删除点位', {
      type: 'warning'
    })
      .then(() => removePatrolPoint(point.pointId))
      .then(() => {
        points.value = points.value.filter((item) => item.pointId !== point.pointId);
        YMessage.success({ message: '点位已删除', plain: true });
      })
      .catch(() => {});
  };

  const undoBoundary = () => {
    draftBoundary.value.pop();
    nextTick(scheduleRenderOverlay);
  };

  const clearDraft = () => {
    activeAreaId.value = undefined;
    draftAreaName.value = '';
    draftBoundary.value = [];
    nextTick(scheduleRenderOverlay);
  };

  const goCreateTask = () => {
    router.push('/task/management/create');
  };

  loadMapData();

  onBeforeUnmount(() => {
    if (renderTimer) {
      window.cancelAnimationFrame(renderTimer);
    }
  });
</script>

<style lang="scss" scoped>
  .patrol-map-page {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 108px);
  }

  .patrol-map-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .patrol-map-title {
    display: flex;
    min-width: 0;
    align-items: baseline;
    gap: 14px;

    h1 {
      margin: 0;
      color: #111827;
      font-size: 24px;
      font-weight: 800;
      line-height: 34px;
    }

    span {
      color: #8b95a5;
      font-size: 13px;
      white-space: nowrap;
    }
  }

  .patrol-map-actions {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 10px;
  }

  .patrol-map-layout {
    display: grid;
    flex: 1;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 16px;
    min-height: 620px;
  }

  .map-work-card {
    min-width: 0;
    overflow: hidden;
  }

  .map-toolbar {
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid #edf1f7;
    background: #fff;
  }

  .map-toolbar-actions {
    display: flex;
    gap: 8px;
  }

  .map-canvas {
    position: relative;
    height: calc(100% - 57px);
    min-height: 560px;
    overflow: hidden;
    cursor: crosshair;
    background: #edf4ff;
  }

  .patrol-map {
    width: 100%;
    height: 100%;
  }

  .draft-layer {
    position: absolute;
    inset: 0;
    z-index: 4;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .draft-line {
    fill: none;
    stroke: #f59e0b;
    stroke-width: 2.4;
    stroke-dasharray: 8 7;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 2px 2px rgb(245 158 11 / 20%));
  }

  .draft-point {
    position: absolute;
    z-index: 5;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    pointer-events: none;
    border: 2px solid #fff;
    border-radius: 999px;
    background: #f59e0b;
    box-shadow: 0 4px 12px rgb(245 158 11 / 26%);
    transform: translate(-50%, -50%);
  }

  .area-label {
    position: absolute;
    z-index: 6;
    padding: 5px 12px;
    color: #1f6feb;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    pointer-events: none;
    border: 1px solid rgb(31 111 235 / 38%);
    border-radius: 4px;
    background: rgb(255 255 255 / 94%);
    box-shadow: 0 4px 12px rgb(31 111 235 / 12%);
    transform: translate(-50%, -118%);

    &::after {
      position: absolute;
      bottom: -6px;
      left: 50%;
      width: 9px;
      height: 9px;
      content: '';
      border-right: 1px solid rgb(31 111 235 / 38%);
      border-bottom: 1px solid rgb(31 111 235 / 38%);
      background: rgb(255 255 255 / 94%);
      transform: translateX(-50%) rotate(45deg);
    }
  }

  .map-empty {
    position: absolute;
    inset: 0;
    z-index: 7;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8b95a5;
    background: #f5f8ff;
  }

  .map-side {
    display: grid;
    min-width: 0;
    grid-template-rows: auto auto minmax(0, 1fr);
    gap: 16px;
  }

  .side-card {
    border-radius: 8px;
  }

  .side-card-fill {
    min-height: 0;
  }

  .draft-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;

    div {
      padding: 12px;
      border: 1px solid #edf1f7;
      border-radius: 6px;
      background: #f8fbff;
    }

    strong {
      display: block;
      color: #111827;
      font-size: 24px;
      line-height: 30px;
    }

    span {
      color: #8b95a5;
      font-size: 12px;
    }
  }

  .area-item,
  .point-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px;
    border: 1px solid #edf1f7;
    border-radius: 6px;
    background: #fff;

    & + & {
      margin-top: 8px;
    }

    strong,
    span {
      display: block;
    }

    strong {
      color: #172033;
      font-size: 14px;
      line-height: 20px;
    }

    span {
      color: #8b95a5;
      font-size: 12px;
      line-height: 18px;
    }
  }

  .area-item {
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s;

    &.is-active,
    &:hover {
      border-color: rgb(31 111 235 / 36%);
      background: rgb(31 111 235 / 6%);
    }
  }

  .point-scrollbar {
    height: 100%;
    min-height: 280px;
  }

  .closed-loop-strip {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  .loop-step {
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    padding: 12px 14px;
    border: 1px solid #edf1f7;
    border-radius: 8px;
    background: #fff;

    .el-icon {
      width: 38px;
      height: 38px;
      color: #1f6feb;
      border-radius: 999px;
      background: rgb(31 111 235 / 9%);
    }

    strong,
    span {
      display: block;
    }

    strong {
      color: #172033;
      font-size: 14px;
      line-height: 20px;
    }

    span {
      color: #8b95a5;
      font-size: 12px;
      line-height: 18px;
    }
  }

  @media (max-width: 1280px) {
    .patrol-map-layout {
      grid-template-columns: 1fr;
    }

    .map-side {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-rows: auto;
    }
  }

  @media (max-width: 768px) {
    .patrol-map-head,
    .map-toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    .patrol-map-title {
      align-items: flex-start;
      flex-direction: column;
      gap: 2px;

      span {
        white-space: normal;
      }
    }

    .patrol-map-actions,
    .map-toolbar-actions {
      flex-wrap: wrap;
    }

    .map-side,
    .closed-loop-strip {
      grid-template-columns: 1fr;
    }
  }
</style>
