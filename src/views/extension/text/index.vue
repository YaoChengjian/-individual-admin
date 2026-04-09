<template>
  <y-page>
    <y-card header="单行文本省略">
      <option-item label="提示风格">
        <el-radio-group v-model="tooltip">
          <el-radio :value="2" label="Tooltip" />
          <el-radio :value="1" label="原生" />
          <el-radio :value="3" label="关闭" />
        </el-radio-group>
      </option-item>
      <div style="width: 520px; max-width: 100%; margin-top: 8px">
        <y-ellipsis :tooltip="tooltipProps">
          文本省略组件 `y-ellipsis` 支持单行和多行省略,
          当鼠标移入时会提示全部内容, 且支持使用 Tooltip 组件进行提示.
        </y-ellipsis>
      </div>
    </y-card>
    <y-card header="多行文本省略">
      <option-item label="最大行数">
        <el-radio-group v-model="maxLine">
          <el-radio :value="2" label="2" />
          <el-radio :value="3" label="3" />
          <el-radio :value="4" label="4" />
        </el-radio-group>
      </option-item>
      <div style="width: 520px; max-width: 100%; margin-top: 8px">
        <y-ellipsis :tooltip="tooltipProps" :max-line="maxLine">
          文本省略组件 `y-ellipsis` 支持单行和多行省略,
          当鼠标移入时会提示全部内容, 且支持使用 Tooltip 组件进行提示,
          并且支持设置 Tooltip 组件的其它属性, 如提示位置和主题等,
          还可以单独设置提示的内容与展示的内容完全不一样,
          默认会获取展示的文本内容为提示内容.
        </y-ellipsis>
      </div>
    </y-card>
    <y-card header="文本组件">
      <div style="line-height: 1.8" class="demo-text-group">
        <y-text :icon="UserOutlined">&nbsp;常规文本</y-text>
        <y-text :icon="UserOutlined" type="secondary">&nbsp;二级文本</y-text>
        <y-text :icon="UserOutlined" type="placeholder">&nbsp;提示文本</y-text>
        <y-text :icon="UserOutlined" type="heading">&nbsp;标题文本</y-text>
        <y-text :icon="UserOutlined" type="primary">&nbsp;主色文本</y-text>
        <y-text :icon="UserOutlined" type="success">&nbsp;成功文本</y-text>
        <y-text :icon="UserOutlined" type="warning">&nbsp;警告文本</y-text>
        <y-text :icon="UserOutlined" type="danger">&nbsp;危险文本</y-text>
        <y-text :icon="UserOutlined" type="info">&nbsp;信息文本 </y-text>
        <y-text deleted>删除线</y-text>
        <y-text underline>下划线</y-text>
        <y-text deleted underline>删除线&下划线</y-text>
        <y-text strong>加粗文本</y-text>
        <y-text italic>斜体文本</y-text>
        <y-text size="xs">超小型文本</y-text>
        <y-text size="sm">小型文本</y-text>
        <y-text>常规文本</y-text>
        <y-text size="md">中型文本</y-text>
        <y-text size="lg">大型文本</y-text>
        <y-text size="xl">特大型文本</y-text>
        <y-text size="xxl">超大型文本</y-text>
      </div>
    </y-card>
    <y-card header="文本复制">
      <div>
        <y-copyable>This is a copyable text.</y-copyable>
      </div>
      <div style="margin: 16px 0">
        <y-copyable style="width: 100%; max-width: 520px">
          <y-ellipsis :tooltip="tooltipProps">
            文本省略组件 `y-ellipsis` 支持单行和多行省略,
            当鼠标移入时会提示全部内容, 且支持使用 Tooltip 组件进行提示.
          </y-ellipsis>
        </y-copyable>
      </div>
      <div style="display: flex; align-items: center; max-width: 280px">
        <el-input
          v-model="text"
          placeholder="请输入"
          style="flex: 1; margin-right: 8px"
        />
        <y-copyable :text="text" :custom-style="{ margin: 0 }" />
      </div>
    </y-card>
    <y-card header="滚动数字">
      <y-text size="xxl" style="padding: 0 0 16px 10px">
        <y-count-up ref="countUpRef" :end-val="demoNum" :options="option" />
      </y-text>
      <div>
        <el-button class="y-btn-icon" @click="restart">重新开始</el-button>
        <el-button class="y-btn-icon" @click="update">更新数字</el-button>
      </div>
    </y-card>
    <y-card header="状态文本">
      <option-item label="默认效果">
        <el-space size="large">
          <y-dot :ripple="ripple" text="运行中" :size="dotSize" />
          <y-dot
            type="success"
            :ripple="ripple"
            text="已上线"
            :size="dotSize"
          />
          <y-dot type="danger" :ripple="ripple" text="异常" :size="dotSize" />
          <y-dot type="info" :ripple="ripple" text="关闭" :size="dotSize" />
        </el-space>
      </option-item>
      <option-item label="显示动画">
        <el-radio-group v-model="ripple">
          <el-radio :value="true" label="是" />
          <el-radio :value="false" label="否" />
        </el-radio-group>
      </option-item>
      <option-item label="尺寸选择">
        <el-radio-group v-model="dotSize">
          <el-radio value="8px" label="8px" />
          <el-radio value="12px" label="12px" />
          <el-radio value="16px" label="16px" />
        </el-radio-group>
      </option-item>
    </y-card>
    <y-card header="状态仪表盘">
      <div>
        <y-dashboard type="success" style="margin-right: 18px">
          <div style="line-height: 1">
            <span style="font-size: 48px">100</span>
            <span style="font-size: 12px; margin-left: 4px">分</span>
          </div>
          <div style="margin-top: 4px">安全</div>
        </y-dashboard>
        <y-dashboard type="warning" style="margin-right: 18px">
          <div style="line-height: 1">
            <span style="font-size: 48px">70</span>
            <span style="font-size: 12px; margin-left: 4px">分</span>
          </div>
          <div style="margin-top: 4px">待优化</div>
        </y-dashboard>
        <y-dashboard type="danger">
          <div style="line-height: 1">
            <span style="font-size: 48px">40</span>
            <span style="font-size: 12px; margin-left: 4px">分</span>
          </div>
          <div style="margin-top: 4px">高风险</div>
        </y-dashboard>
      </div>
      <div style="margin: 32px 0 14px 0; max-height: 100%">
        自定义颜色和尺寸:
      </div>
      <div>
        <y-dashboard color="#722ED1" style="margin-right: 18px">
          <div style="font-size: 48px">100</div>
        </y-dashboard>
        <y-dashboard size="108px" space="14px">
          <div style="font-size: 38px">100</div>
        </y-dashboard>
      </div>
    </y-card>
  </y-page>
</template>

<script lang="ts" setup>
  import { ref, computed, reactive } from 'vue';
  import type { YCountUp } from 'y-element-ultra';
  import { UserOutlined } from '@/components/icons';
  import OptionItem from '@/views/extension/avatar/components/option-item.vue';

  defineOptions({ name: 'ExtensionText' });

  /** 提示风格 */
  const tooltip = ref(2);

  /** 最大行数 */
  const maxLine = ref(2);

  /** tooltip属性 */
  const tooltipProps = computed(() => {
    if (tooltip.value === 3) {
      return false;
    }
    return {
      original: tooltip.value === 1,
      popperStyle: {
        width: '420px',
        maxWidth: 'calc(100vw - 32px)'
      }
    };
  });

  /** 输入框 */
  const text = ref('YElementUltra');

  /** 滚动数字组件实例 */
  const countUpRef = ref<InstanceType<typeof YCountUp> | null>(null);

  /** 滚动数字值 */
  const demoNum = ref(6317);

  /** 滚动数字配置 */
  const option = reactive({
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.',
    prefix: '',
    suffix: ''
  });

  /** 更新滚动数字 */
  const update = () => {
    demoNum.value += 100 + Math.round(Math.random() * 300);
  };

  /** 重新开始滚动数字 */
  const restart = () => {
    if (countUpRef.value) {
      countUpRef.value.reset();
      countUpRef.value.start();
    }
  };

  /** 状态圆点是否显示动画 */
  const ripple = ref(true);

  /** 状态圆点尺寸 */
  const dotSize = ref('12px');
</script>

<style lang="scss" scoped>
  .demo-text-group > div {
    max-height: 100%;
  }
</style>
