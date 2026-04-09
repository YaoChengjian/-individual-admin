<template>
  <y-card header="进阶用法" :body-style="{ padding: 0 }">
    <div
      :style="{
        maxWidth: type === 'default' ? '100%' : '260px',
        padding: type === 'default' ? 0 : '20px'
      }"
    >
      <y-icon-select
        clearable
        :filterable="type !== 'modal' && type !== 'drawer'"
        :data="icons"
        v-model="selectedIcon"
        :hide-on-single-tab="true"
        placeholder="请选择"
        :popper-options="{ strategy: 'fixed' }"
        :popper-type="type"
        :tooltip="tooltipType"
        :popper-width="
          type === 'modal' || type === 'drawer'
            ? 720
            : tooltipType === 'static'
              ? 568
              : void 0
        "
        :popper-height="
          type === 'modal' ? 520 : tooltipType === 'static' ? 448 : 388
        "
        :popper-props="
          type === 'modal' ? { maxable: true, closeOnClickModal: true } : void 0
        "
      >
        <template #icon="{ icon, prefix }">
          <img
            :src="menuIconUrls[`/src/assets/menu-icons/${icon}.png`]"
            :style="
              prefix
                ? { maxWidth: '22px', maxHeight: '22px' }
                : {
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: '24px',
                    height: '24px'
                  }
            "
          />
        </template>
      </y-icon-select>
    </div>
    <div v-if="type === 'default'" style="padding: 20px">
      选中数据：{{ selectedIcon }}
    </div>
  </y-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import type { IconItem } from 'y-element-ultra/es/y-icon-select/types';
  import type { PopperType } from 'y-element-ultra/es/y-basic-select/types';
  const menuIconUrls: any = import.meta.glob('/src/assets/menu-icons/*.png', {
    import: 'default',
    eager: true
  });
  const iconNames = Object.keys(menuIconUrls).map((d) =>
    d.substring(d.lastIndexOf('/') + 1, d.lastIndexOf('.'))
  );
  const icons1 = iconNames.slice(0, Math.floor(iconNames.length / 2));
  const icons2 = iconNames.slice(Math.floor(iconNames.length / 2));

  defineProps<{
    type?: PopperType;
    tooltipType?: boolean | 'static';
  }>();

  /** 选中值 */
  const selectedIcon = ref('');

  /** 图标数据 */
  const icons = ref<IconItem[]>([
    {
      title: '',
      children: [
        {
          title: '文档',
          icons: icons1
        },
        {
          title: '媒体',
          icons: icons2.slice(0, Math.floor(icons2.length / 2))
        },
        {
          title: '应用',
          icons: icons2.slice(Math.floor(icons2.length / 2))
        }
      ]
    }
  ]);
</script>
