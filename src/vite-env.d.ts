/// <reference types="vite/client" />

import type { HttpHandler } from '@/utils/https/util';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $http: HttpHandler;
  }
}

declare global {
  const $http: HttpHandler;

  interface GlobalThis {
    $http: HttpHandler;
  }
}

export {};
