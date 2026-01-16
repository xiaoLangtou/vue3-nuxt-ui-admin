/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<{}, {}, any>;
  export default component;
}

/**
 * 扩展 Vite 的环境变量类型定义
 * 注意：不要重新定义 ImportMeta 接口，否则会覆盖 Vite 提供的 glob 等类型
 */
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GLOB_APP_TITLE: string;
}

declare module 'vue/types/vue' {
  interface Vue {
    $echarts: any;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (key: string) => string;
    $tm: (key: string) => [] | { [p: string]: any };
  }
}
