import 'element-plus/global';
import 'y-element-ultra/typings/global';

declare module 'vue' {
  export interface GlobalComponents {
    DictData: (typeof import('@/components/DictData/index.vue'))['default'];
  }
}

export {};
