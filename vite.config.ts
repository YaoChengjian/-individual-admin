import type { ProxyOptions } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve } from 'path';
import Compression from 'vite-plugin-compression';
import Components from 'unplugin-vue-components/vite';
import type { ComponentResolver } from 'unplugin-vue-components/types';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { YAdminResolver } from 'y-element-ultra/es/utils/resolvers';
import { ComponentsResolver } from './src/components/resolvers';

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build';
  const env = loadEnv(mode, process.cwd());
  const alias = {
    '@/': resolve('src') + '/',
    'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
  };
  // 插件配置
  const plugins = [vue(), vueJsx()];
  const componentsResolvers: (ComponentResolver | ComponentResolver[])[] = [
    ComponentsResolver()
  ];
  if (isBuild) {
    // 组件按需引入
    plugins.push(
      Components({
        dts: false,
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass'
          }),
          YAdminResolver({
            importStyle: 'sass'
          })
        ]
      })
    );
    // gzip压缩
    plugins.push(
      Compression({
        disable: !isBuild,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz'
      })
    );
  } else {
    // 开发环境全局安装
    alias['./as-needed'] = './global-import';
  }
  plugins.push(
    Components({
      dts: false,
      globsExclude: ['src/components/*/components/**'],
      resolvers: componentsResolvers
    })
  );
  // 接口地址代理配置
  const baseApi = env.VITE_API_URL;
  const proxyApi = env.VITE_API_PROXY_URL;
  const proxy: Record<string, string | ProxyOptions> = {};
  if (proxyApi) {
    const isRemoveBasePath = !proxyApi.endsWith(baseApi); // 接口代理时是否移除地址前缀
    proxy[baseApi] = {
      target: isRemoveBasePath
        ? proxyApi
        : proxyApi.substring(0, proxyApi.length - baseApi.length),
      rewrite: isRemoveBasePath
        ? (path) => path.replace(new RegExp(`^${baseApi}`), '')
        : void 0,
      changeOrigin: true
    };
  }
  return {
    resolve: { alias },
    define: {
      // 让业务代码里可以直接使用 $http(...)，实际会映射到运行时全局对象
      $http: 'globalThis.$http'
    },
    plugins,
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;`
        }
      }
    },
    optimizeDeps: {
      include: [
        'echarts/core',
        'echarts/charts',
        'echarts/renderers',
        'echarts/components',
        'vue-echarts',
        'echarts-wordcloud',
        'sortablejs',
        'vuedraggable'
      ]
    },
    build: {
      target: 'chrome63',
      chunkSizeWarningLimit: 4000
    }
  };
});
