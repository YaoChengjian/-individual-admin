<template>
  <y-card
    header="巡查员与设备状态"
    :body-style="{ padding: '10px', height: '310px' }"
    class="inspector-device-card"
  >
    <y-pro-table
      row-key="id"
      :columns="columns"
      :datasource="inspectors"
      :show-overflow-tooltip="true"
      :pagination="false"
      :toolbar="false"
      :bottom-line="false"
      highlight-current-row
      size="large"
      class="inspector-device-table"
    >
      <template #onlineStatus="{ row }">
        <y-dot
          v-if="row"
          :text="row.onlineStatus"
          :type="row.onlineStatus === '在线' ? 'success' : 'info'"
          size="7px"
          ripple
          class="online-status"
          :class="{ 'is-offline': row.onlineStatus === '离线' }"
        />
      </template>
      <template #glasses="{ row }">
        <device-icon v-if="row" :online="row.devices.glasses">
          <svg
            class="glasses-svg"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="7.5" cy="14" r="4" />
            <circle cx="16.5" cy="14" r="4" />
            <path d="M11.5 14h1" />
            <path d="M3.7 12.2 5.2 8" />
            <path d="m20.3 12.2-1.5-4.2" />
          </svg>
        </device-icon>
      </template>
      <template #headset="{ row }">
        <device-icon v-if="row" :online="row.devices.headset">
          <Headset />
        </device-icon>
      </template>
      <template #printer="{ row }">
        <device-icon v-if="row" :online="row.devices.printer">
          <Printer />
        </device-icon>
      </template>
      <template #location="{ row }">
        <y-dot
          v-if="row"
          :text="row.location"
          :type="row.onlineStatus === '在线' ? 'success' : 'info'"
          size="7px"
          :ripple="row.onlineStatus === '在线'"
          class="location-status"
          :class="{ 'is-offline': row.onlineStatus === '离线' }"
        />
      </template>
    </y-pro-table>
  </y-card>
</template>

<script lang="ts" setup>
  import { defineComponent, h, ref } from 'vue';
  import { Headset, Printer } from '@element-plus/icons-vue';
  import type { Columns } from 'y-element-ultra/es/y-pro-table/types';

  type OnlineStatus = '在线' | '离线';

  interface InspectorDevice {
    glasses: boolean;
    headset: boolean;
    printer: boolean;
  }

  interface Inspector {
    id: number;
    name: string;
    onlineStatus: OnlineStatus;
    devices: InspectorDevice;
    location: string;
  }

  const DeviceIcon = defineComponent({
    name: 'DeviceIcon',
    props: {
      online: Boolean
    },
    setup(props, { slots }) {
      return () =>
        h(
          'span',
          {
            class: ['device-icon', props.online ? 'is-online' : 'is-offline']
          },
          slots.default?.()
        );
    }
  });

  const columns = ref<Columns>([
    {
      prop: 'name',
      label: '巡查员',
      minWidth: 90
    },
    {
      prop: 'onlineStatus',
      label: '在线状态',
      width: 100,
      align: 'center',
      slot: 'onlineStatus'
    },
    {
      columnKey: 'glasses',
      label: '眼镜',
      width: 72,
      align: 'center',
      slot: 'glasses'
    },
    {
      columnKey: 'headset',
      label: '耳机',
      width: 72,
      align: 'center',
      slot: 'headset'
    },
    {
      columnKey: 'printer',
      label: '打印机',
      width: 78,
      align: 'center',
      slot: 'printer'
    },
    {
      prop: 'location',
      label: '当前位置',
      minWidth: 130,
      slot: 'location'
    }
  ]);

  const inspectors = ref<Inspector[]>([
    {
      id: 1,
      name: '陈志强',
      onlineStatus: '在线',
      devices: {
        glasses: true,
        headset: true,
        printer: true
      },
      location: '东门巡查点'
    },
    {
      id: 2,
      name: '李雨晴',
      onlineStatus: '在线',
      devices: {
        glasses: true,
        headset: false,
        printer: true
      },
      location: '北侧商业街'
    },
    {
      id: 3,
      name: '王浩',
      onlineStatus: '离线',
      devices: {
        glasses: false,
        headset: false,
        printer: false
      },
      location: '未上报'
    },
    {
      id: 4,
      name: '赵敏',
      onlineStatus: '在线',
      devices: {
        glasses: true,
        headset: true,
        printer: false
      },
      location: '中心广场'
    }
  ]);
</script>

<style lang="scss" scoped>
  .inspector-device-card {
    :deep(.el-card__body) {
      overflow: hidden;
    }
  }

  .inspector-device-table {
    height: 100%;

    :deep(.y-pro-table) {
      height: 100%;
    }

    :deep(.y-dot-text) {
      color: inherit;
      margin-left: 6px;
      font-weight: 700;
    }
  }

  .online-status,
  .location-status {
    color: var(--el-color-success);
    font-size: 13px;
    font-weight: 700;

    &.is-offline {
      color: var(--el-text-color-placeholder);
    }
  }

  .device-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 6px;

    :deep(svg) {
      width: 14px;
      height: 14px;
    }

    .glasses-svg {
      width: 15px;
      height: 15px;

      circle,
      path {
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    }

    &.is-online {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }

    &.is-offline {
      color: var(--el-text-color-placeholder);
      background: var(--el-fill-color-light);
    }
  }
</style>
