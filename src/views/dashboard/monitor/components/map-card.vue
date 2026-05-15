<template>
  <y-card
    header="巡查态势地图"
    :body-style="{ padding: 0 }"
    class="patrol-map-card"
  >
    <div class="patrol-map-shell">
      <base-map
        class="patrol-map"
        :api-key="txMapKey"
        :center="mapCenter"
        :zoom="15.1"
        :min-zoom="11"
        :max-zoom="18"
        :control="mapControl"
        :options="mapOptions"
        @map_inited="handleMapInited"
      />
      <svg
        v-if="routePoints"
        class="patrol-route-layer"
        aria-hidden="true"
      >
        <polyline
          class="patrol-route-line"
          :points="routePoints"
        />
        <polygon
          v-if="movingArrowPoints"
          class="patrol-route-arrow"
          :points="movingArrowPoints"
        />
      </svg>
      <div
        v-if="routeLabelPoint"
        class="patrol-route-label"
        :style="{ left: `${routeLabelPoint.x}px`, top: `${routeLabelPoint.y}px` }"
      >
        幸福里小区
      </div>
      <div
        v-for="marker in projectedMarkers"
        :key="marker.id"
        class="patrol-map-marker"
        :class="`is-${marker.type}`"
        :style="{ left: `${marker.x}px`, top: `${marker.y}px` }"
      >
        <span class="marker-core">
          <span v-if="marker.type === 'important'" class="marker-icon">⌂</span>
          <span v-else-if="marker.type === 'event'" class="marker-icon">!</span>
        </span>
      </div>
      <div class="patrol-map-legend">
        <div class="legend-title">图例说明</div>
        <div
          v-for="item in legendItems"
          :key="item.label"
          class="legend-item"
        >
          <span
            class="legend-symbol"
            :class="`is-${item.type}`"
          />
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
  </y-card>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, ref, shallowRef } from 'vue';
  import { BaseMap } from '@/TMap';

  type PatrolCoord = {
    lat: number;
    lng: number;
  };

  type ProjectedPoint = {
    x: number;
    y: number;
  };

  type TencentMapInstance = {
    projectToContainer: (position: unknown) => {
      getX: () => number;
      getY: () => number;
    };
  };

  type PatrolMarker = PatrolCoord & {
    id: string;
    type: 'idle' | 'task' | 'important' | 'event';
  };

  type ProjectedMarker = PatrolMarker & ProjectedPoint;

  const txMapKey = (import.meta.env.VITE_TX_MAP_KEY || '').trim();
  const mapInstance = shallowRef<TencentMapInstance | null>(null);
  const projectedRoute = ref<ProjectedPoint[]>([]);
  const projectedMarkers = ref<ProjectedMarker[]>([]);
  const routeLabelPoint = ref<ProjectedPoint | null>(null);
  const movingArrow = ref({
    x: 0,
    y: 0,
    angle: 0
  });
  let animationFrame = 0;
  let animationStart = 0;

  const mapCenter = {
    lat: 23.13148,
    lng: 113.26142
  };

  const mapControl = {
    zoom: false,
    scale: false,
    rotation: false
  };

  const mapOptions = {
    pitch: 0,
    rotation: 0,
    mapStyleId: 'style1'
  };

  const patrolRoute: PatrolCoord[] = [
    { lat: 23.1334, lng: 113.2547 },
    { lat: 23.1357, lng: 113.2576 },
    { lat: 23.1374, lng: 113.2616 },
    { lat: 23.1367, lng: 113.2659 },
    { lat: 23.1348, lng: 113.2675 },
    { lat: 23.1314, lng: 113.2641 },
    { lat: 23.1330, lng: 113.2596 },
    { lat: 23.1296, lng: 113.2565 },
    { lat: 23.1271, lng: 113.2595 },
    { lat: 23.1282, lng: 113.2646 },
    { lat: 23.1309, lng: 113.2669 },
    { lat: 23.1265, lng: 113.2682 },
    { lat: 23.1254, lng: 113.2631 },
    { lat: 23.1276, lng: 113.2572 },
    { lat: 23.1304, lng: 113.2529 },
    { lat: 23.1322, lng: 113.2568 },
    { lat: 23.1290, lng: 113.2616 },
    { lat: 23.1324, lng: 113.2648 },
    { lat: 23.1348, lng: 113.2675 },
    { lat: 23.1334, lng: 113.2547 }
  ];

  const patrolMarkers: PatrolMarker[] = [
    { id: 'idle-1', type: 'idle', ...patrolRoute[1] },
    { id: 'idle-2', type: 'idle', ...patrolRoute[2] },
    { id: 'idle-3', type: 'idle', ...patrolRoute[5] },
    { id: 'idle-4', type: 'idle', ...patrolRoute[7] },
    { id: 'idle-5', type: 'idle', ...patrolRoute[9] },
    { id: 'idle-6', type: 'idle', ...patrolRoute[11] },
    { id: 'idle-7', type: 'idle', ...patrolRoute[14] },
    { id: 'idle-8', type: 'idle', ...patrolRoute[16] },
    { id: 'idle-9', type: 'idle', ...patrolRoute[17] },
    { id: 'task-1', type: 'task', ...patrolRoute[4] },
    { id: 'important-1', type: 'important', ...patrolRoute[6] },
    { id: 'event-1', type: 'event', ...patrolRoute[3] }
  ];

  const legendItems = [
    { label: '巡查员（空闲）', type: 'idle' },
    { label: '巡查员（任务中）', type: 'task' },
    { label: '巡查路线', type: 'route' },
    { label: '重点点位', type: 'important' },
    { label: '事件点位', type: 'event' }
  ];

  const routeSegments = patrolRoute.slice(0, -1).map((point, index) => {
    const nextPoint = patrolRoute[index + 1];
    const distance = Math.hypot(nextPoint.lat - point.lat, nextPoint.lng - point.lng);

    return {
      start: point,
      end: nextPoint,
      distance
    };
  });
  const routeLength = routeSegments.reduce((sum, item) => sum + item.distance, 0);

  const routePoints = computed(() => projectedRoute.value.map((point) => `${point.x},${point.y}`).join(' '));
  const movingArrowPoints = computed(() => {
    if (!movingArrow.value.x || !movingArrow.value.y) return '';

    const size = 15;
    const wing = 7;
    const angle = (movingArrow.value.angle * Math.PI) / 180;
    const tip = {
      x: movingArrow.value.x + Math.cos(angle) * size * 0.5,
      y: movingArrow.value.y + Math.sin(angle) * size * 0.5
    };
    const left = {
      x: movingArrow.value.x - Math.cos(angle) * size * 0.5 + Math.cos(angle + Math.PI / 2) * wing,
      y: movingArrow.value.y - Math.sin(angle) * size * 0.5 + Math.sin(angle + Math.PI / 2) * wing
    };
    const right = {
      x: movingArrow.value.x - Math.cos(angle) * size * 0.5 + Math.cos(angle - Math.PI / 2) * wing,
      y: movingArrow.value.y - Math.sin(angle) * size * 0.5 + Math.sin(angle - Math.PI / 2) * wing
    };

    return `${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`;
  });

  const projectPoint = (point: PatrolCoord): ProjectedPoint | null => {
    if (!mapInstance.value) return null;

    const tMap = (window as { TMap?: { LatLng: new (lat: number, lng: number) => unknown } }).TMap;
    if (!tMap) return null;

    const pixel = mapInstance.value.projectToContainer(new tMap.LatLng(point.lat, point.lng));

    return {
      x: pixel.getX(),
      y: pixel.getY()
    };
  };

  const getRoutePosition = (progress: number) => {
    const targetDistance = progress * routeLength;
    let passedDistance = 0;

    for (const segment of routeSegments) {
      if (passedDistance + segment.distance >= targetDistance) {
        const segmentProgress = (targetDistance - passedDistance) / segment.distance;

        return {
          current: {
            lat: segment.start.lat + (segment.end.lat - segment.start.lat) * segmentProgress,
            lng: segment.start.lng + (segment.end.lng - segment.start.lng) * segmentProgress
          },
          next: segment.end
        };
      }

      passedDistance += segment.distance;
    }

    return {
      current: patrolRoute[0],
      next: patrolRoute[1]
    };
  };

  const renderOverlay = (time: number) => {
    if (!animationStart) {
      animationStart = time;
    }

    const route = patrolRoute.map(projectPoint).filter(Boolean) as ProjectedPoint[];
    projectedRoute.value = route;
    projectedMarkers.value = patrolMarkers
      .map((marker) => {
        const projected = projectPoint(marker);
        return projected ? { ...marker, ...projected } : null;
      })
      .filter(Boolean) as ProjectedMarker[];
    routeLabelPoint.value = projectPoint({ lat: 23.1374, lng: 113.2616 });

    const progress = ((time - animationStart) % 15000) / 15000;
    const routePosition = getRoutePosition(progress);
    const currentPoint = projectPoint(routePosition.current);
    const nextPoint = projectPoint(routePosition.next);

    if (currentPoint && nextPoint) {
      movingArrow.value = {
        ...currentPoint,
        angle: (Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x) * 180) / Math.PI
      };
    }

    animationFrame = window.requestAnimationFrame(renderOverlay);
  };

  const handleMapInited = (map: TencentMapInstance) => {
    mapInstance.value = map;
    animationFrame = window.requestAnimationFrame(renderOverlay);
  };

  onBeforeUnmount(() => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }
  });
</script>

<style lang="scss" scoped>
  .patrol-map-shell {
    position: relative;
    height: 468px;
    overflow: hidden;
    border-radius: 0 0 var(--el-border-radius-base) var(--el-border-radius-base);
  }

  .patrol-map {
    width: 100%;
    height: 100%;
  }

  .patrol-route-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .patrol-route-line {
    fill: none;
    stroke: #1f73ff;
    stroke-width: 2.4;
    stroke-dasharray: 8 7;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 2px 2px rgb(31 115 255 / 18%));
  }

  .patrol-route-arrow {
    fill: #1f73ff;
    filter: drop-shadow(0 2px 3px rgb(31 115 255 / 25%));
  }

  .patrol-route-label {
    position: absolute;
    z-index: 3;
    padding: 5px 12px;
    font-size: 13px;
    font-weight: 600;
    color: #1f73ff;
    white-space: nowrap;
    pointer-events: none;
    background: rgb(255 255 255 / 92%);
    border: 1px solid rgb(31 115 255 / 42%);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgb(31 115 255 / 12%);
    transform: translate(-50%, -110%);
  }

  .patrol-map-marker {
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
      font-size: 10px;
      font-weight: 700;
      line-height: 1;
      color: #fff;
      border: 2px solid #fff;
      border-radius: inherit;
      box-shadow: 0 2px 8px rgb(0 0 0 / 16%);
    }

    &.is-idle {
      background: rgb(31 115 255 / 18%);

      .marker-core {
        background: #1f73ff;
      }
    }

    &.is-task {
      background: rgb(255 141 18 / 18%);

      .marker-core {
        background: #ff8d12;
      }
    }

    &.is-important {
      background: rgb(35 190 96 / 18%);

      .marker-core {
        width: 15px;
        height: 15px;
        background: #23be60;
      }
    }

    &.is-event {
      background: rgb(126 87 255 / 18%);

      .marker-core {
        width: 15px;
        height: 15px;
        background: #7e57ff;
      }
    }
  }

  .patrol-map-legend {
    position: absolute;
    right: 16px;
    top: 50%;
    z-index: 5;
    width: 142px;
    padding: 12px 14px;
    background: rgb(255 255 255 / 92%);
    border: 1px solid rgb(229 235 246 / 86%);
    border-radius: 6px;
    box-shadow: 0 8px 24px rgb(22 45 84 / 12%);
    transform: translateY(-50%);
  }

  .legend-title {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 700;
    color: #1d2b45;
  }

  .legend-item {
    display: flex;
    gap: 7px;
    align-items: center;
    margin-top: 8px;
    font-size: 12px;
    color: #526071;
    white-space: nowrap;
  }

  .legend-symbol {
    position: relative;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    border-radius: 999px;

    &.is-idle {
      background: #1f73ff;
      border: 2px solid #dceaff;
    }

    &.is-task {
      background: #ff8d12;
      border: 2px solid #ffead2;
    }

    &.is-route {
      width: 22px;
      height: 0;
      border-top: 2px dashed #1f73ff;
      border-radius: 0;

      &::after {
        position: absolute;
        right: -1px;
        top: -5px;
        width: 0;
        height: 0;
        content: '';
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
        border-left: 6px solid #1f73ff;
      }
    }

    &.is-important {
      background: #23be60;
      border: 2px solid #d8f6e3;
    }

    &.is-event {
      background: #7e57ff;
      border: 2px solid #ece5ff;
    }
  }

  @media (max-width: 768px) {
    .patrol-map-shell {
      height: 360px;
    }

    .patrol-map-legend {
      right: 10px;
      width: 128px;
      padding: 10px;
    }
  }
</style>
