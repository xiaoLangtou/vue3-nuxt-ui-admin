import { fileURLToPath, URL } from 'node:url';
import ui from '@nuxt/ui/vite';
import tailwindcss from '@tailwindcss/vite';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    return {
        plugins: [
            vue(),
            vueJsx(),
            tailwindcss(),
            ui({
                ui: {
                    button:{
                       slots:{
                         base:['cursor-pointer']
                       }
                    },
                    input: {
                        slots: {
                            base: ['border-gray-100 dark:border-gray-800']
                        }
                    },
                    table: {
                        slots: {
                            base: ['border-gray-100 dark:border-gray-800']
                        }
                    },
                    colors: {
                        primary: 'rose',
                        neutral: 'gray'
                    },
                },
                // 使用 Nuxt UI 内置的 autoImport 配置
                autoImport: {
                    imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
                    dirs: ['src/composables', 'src/stores'],
                    dts: './src/types/auto-imports.d.ts',
                    vueTemplate: true,
                    dumpUnimportItems: true, // 生成 .unimport-items.json 供 eslint-plugin-unimport 使用
                },
                // 使用 Nuxt UI 内置的 components 配置
                components: {
                    dirs: ['src/components'],
                    dts: './src/types/components.d.ts',
                },
            }),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        css: {
            preprocessorOptions: {
                sass: {
                },
            },
        },
        server: {
            port: 5173,
            proxy: createProxy(env.VITE_PROXY),
        },
    };
});

/**
 * 创建代理配置
 * @param proxyConfig 代理配置字符串
 */
function createProxy(proxyConfig?: string) {
    if (!proxyConfig) {
        return {};
    }

    try {
        const proxyList = JSON.parse(proxyConfig);
        const proxy: Record<string, any> = {};

        proxyList.forEach(([prefix, target]: [string, string]) => {
            proxy[prefix] = {
                target,
                changeOrigin: true,
                rewrite: (path: string) => path.replace(new RegExp(`^${prefix}`), ''),
            };
        });

        return proxy;
    }
    catch (error) {
        console.error('代理配置解析失败:', error);
        return {};
    }
}
