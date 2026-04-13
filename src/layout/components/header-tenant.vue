<!-- 顶栏租户切换 -->
<template>
  <y-popover
    v-if="tenantOptions.length > 1"
    :width="320"
    trigger="click"
    transition="el-zoom-in-top"
    :content-style="{ padding: 0 }"
    :body-style="{ overflow: 'hidden' }"
    :popper-style="{ maxWidth: 'calc(100% - 32px)' }"
    :popper-options="{
      strategy: 'fixed',
      modifiers: [{ name: 'offset', options: { offset: [0, 5] } }]
    }"
  >
    <template #reference>
      <div class="tenant-trigger">
        <el-icon class="tenant-trigger__icon">
          <CityOutlined />
        </el-icon>
      </div>
    </template>

    <div class="tenant-panel">
      <div class="tenant-panel__search">
        <el-input
          v-model.trim="keywords"
          clearable
          size="small"
          placeholder="搜索租户"
          :prefix-icon="SearchOutlined"
        />
      </div>

      <div class="tenant-panel__list">
        <div
          v-for="item in orderedTenantOptions"
          :key="item.tenantId"
          class="tenant-item"
          :class="{
            'is-current': item.tenantId === selectedTenantId,
            'is-disabled': item.status === 1 && item.tenantId !== selectedTenantId
          }"
          @click="handleTenantChange(item)"
        >
          <div class="tenant-item__body">
            <div class="tenant-item__title">{{ item.tenantName }}</div>
            <div class="tenant-item__meta">
              {{ item.tenantCode || '未设置租户编码' }}
            </div>
          </div>
          <div class="tenant-item__tags">
            <el-tag
              v-if="item.tenantId === selectedTenantId"
              size="small"
              type="primary"
              :disable-transitions="true"
            >
              当前
            </el-tag>
            <el-tag
              v-else-if="item.status === 1"
              size="small"
              type="info"
              :disable-transitions="true"
            >
              停用
            </el-tag>
          </div>
        </div>

        <el-empty
          v-if="!orderedTenantOptions.length"
          description="没有匹配的租户"
          :image-size="60"
        />
      </div>
    </div>
  </y-popover>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { YMessage } from 'y-element-ultra';
  import { CityOutlined, SearchOutlined } from '@/components/icons';
  import { switchTenant } from '@/api/layout';
  import type { TenantAccess } from '@/api/system/user/model';
  import { useUserStore } from '@/store/modules/user';
  import { setToken } from '@/utils/token-util';

  const userStore = useUserStore();
  const recentTenantKey = 'header-recent-tenant-ids';

  /** 当前可访问租户 */
  const tenantOptions = computed(() => userStore.info?.tenantList ?? []);

  /** 当前租户 */
  const selectedTenantId = computed(() => userStore.info?.tenantId);

  /** 搜索关键字 */
  const keywords = ref('');

  /** 最近使用的租户 ID */
  const recentTenantIds = computed(() => {
    try {
      const cached = window.localStorage.getItem(recentTenantKey);
      const value = cached ? (JSON.parse(cached) as number[]) : [];
      return Array.isArray(value) ? value : [];
    } catch (e) {
      return [];
    }
  });

  /** 按关键字过滤后的租户列表 */
  const visibleTenantOptions = computed(() => {
    const keyword = keywords.value.trim().toLowerCase();
    const result = tenantOptions.value.filter((item) => {
      if (!keyword) {
        return true;
      }
      return (
        item.tenantName?.toLowerCase().includes(keyword) ||
        item.tenantCode?.toLowerCase().includes(keyword)
      );
    });
    return result;
  });

  /** 面板内的租户排序 */
  const orderedTenantOptions = computed(() => {
    const recentIndexMap = new Map<number | undefined, number>();
    recentTenantIds.value.forEach((tenantId, index) => {
      recentIndexMap.set(tenantId, index);
    });
    return [...visibleTenantOptions.value].sort((a, b) => {
      const currentDelta =
        Number(b.tenantId === selectedTenantId.value) -
        Number(a.tenantId === selectedTenantId.value);
      if (currentDelta !== 0) {
        return currentDelta;
      }
      const recentA = recentIndexMap.get(a.tenantId);
      const recentB = recentIndexMap.get(b.tenantId);
      if (recentA != null && recentB != null && recentA !== recentB) {
        return recentA - recentB;
      }
      if (recentA != null) {
        return -1;
      }
      if (recentB != null) {
        return 1;
      }
      const statusDelta = (a.status ?? 0) - (b.status ?? 0);
      if (statusDelta !== 0) {
        return statusDelta;
      }
      return (a.tenantName || '').localeCompare(b.tenantName || '');
    });
  });

  /** 切换租户 */
  const handleTenantChange = (tenant?: TenantAccess) => {
    if (!tenant?.tenantId || tenant.tenantId === selectedTenantId.value) {
      return;
    }
    if (tenant.status === 1) {
      YMessage.warning({ message: '该租户已停用，暂不可切换', plain: true });
      return;
    }
    const loading = YMessage.loading({
      message: '切换租户中..',
      plain: true
    });
    switchTenant(tenant.tenantId)
      .then((data) => {
        loading.close();
        if (!data.access_token) {
          throw new Error('切换租户失败');
        }
        const nextRecentIds = [
          tenant.tenantId,
          ...recentTenantIds.value.filter((item) => item !== tenant.tenantId)
        ].slice(0, 8);
        window.localStorage.setItem(recentTenantKey, JSON.stringify(nextRecentIds));
        setToken(data.access_token);
        if (data.user) {
          userStore.setInfo(data.user);
        }
        YMessage.success({ message: '租户切换成功', plain: true });
        window.location.reload();
      })
      .catch((e) => {
        loading.close();
        YMessage.error({ message: e.message, plain: true });
      });
  };
</script>

<style lang="scss" scoped>
  .tenant-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 100%;
    color: var(--el-text-color-primary);
  }

  .tenant-trigger__icon {
    transform: scale(1.08);
  }

  .tenant-panel__search {
    padding: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .tenant-panel__list {
    max-height: 360px;
    padding: 8px;
    overflow: auto;
  }

  .tenant-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 4px 0;
    padding: 10px 8px;
    border-radius: 10px;
    transition: background-color 0.2s ease;
    cursor: pointer;
  }

  .tenant-item:hover {
    background: var(--el-fill-color-light);
  }

  .tenant-item.is-current {
    background: var(--el-color-primary-light-9);
  }

  .tenant-item.is-disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .tenant-item__body {
    min-width: 0;
    flex: 1;
  }

  .tenant-item__title {
    overflow: hidden;
    color: var(--el-text-color-primary);
    font-size: 13px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tenant-item__meta {
    margin-top: 3px;
    overflow: hidden;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tenant-item__tags {
    flex: none;
  }
</style>
