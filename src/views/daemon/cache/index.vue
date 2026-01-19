<template>
  <div class="p-4 md:p-6 space-y-6">
    <div v-if="loading" class="flex items-center justify-center h-96">
      <div class="text-gray-500 dark:text-gray-400">加载中...</div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center h-96">
      <div class="text-red-500">{{ error }}</div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="card in infoCards"
          :key="card.key"
          class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ card.label }}</span>
            <component :is="card.icon" :size="20" class="text-primary-500" />
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ card.value }}
          </div>
        </div>
      </div>

      <div
        v-if="hasCommandsData"
        class="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">命令统计</h3>
          <div class="h-[400px] flex items-center justify-center">
            <Doughnut :data="commandsChartData" :options="commandsChartOptions" />
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">内存使用</h3>
          <div class="h-[400px] flex flex-col items-center justify-center">
            <div class="text-center mb-4">
              <div class="text-5xl font-bold text-primary-600 dark:text-primary-400">
                {{ memoryPercentage }}%
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {{ cacheData?.redisInfo?.usedMemoryHuman?.value }} / {{ cacheData?.redisInfo?.totalSystemMemoryHuman?.value }}
              </div>
            </div>
            <div class="w-full max-w-md">
              <Bar :data="memoryChartData" :options="memoryChartOptions" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { getCacheDetail } from '@/services/modules/cache';
import type { ICache } from '@/services/types/cache';
import {
  Database,
  Clock,
  Users,
  HardDrive,
  Server,
  FileCheck,
  ToggleLeft,
} from 'lucide-vue-next';
import { Doughnut, Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const cacheData = ref<ICache | null>(null);
const loading = ref(false);
const error = ref('');

interface InfoCard {
  key: string;
  label: string;
  value: string | number;
  icon: any;
}

const infoCards = computed<InfoCard[]>(() => {
  if (!cacheData.value?.redisInfo) return [];

  const { redisInfo } = cacheData.value;

  return [
    {
      key: 'version',
      label: redisInfo.redisVersion?.description || 'Redis版本',
      value: redisInfo.redisVersion?.value || '-',
      icon: Database,
    },
    {
      key: 'uptime',
      label: redisInfo.uptimeInDays?.description || '运行天数',
      value: redisInfo.uptimeInDays?.value ? `${redisInfo.uptimeInDays.value} 天` : '-',
      icon: Clock,
    },
    {
      key: 'clients',
      label: redisInfo.connectedClients?.description || '客户端连接数',
      value: redisInfo.connectedClients?.value || 0,
      icon: Users,
    },
    {
      key: 'memory',
      label: redisInfo.usedMemoryHuman?.description || '内存使用',
      value: redisInfo.usedMemoryHuman?.value || '-',
      icon: HardDrive,
    },
    {
      key: 'totalMemory',
      label: redisInfo.totalSystemMemoryHuman?.description || '内存总量',
      value: redisInfo.totalSystemMemoryHuman?.value || '-',
      icon: Server,
    },
    {
      key: 'rdb',
      label: redisInfo.RDBLoading?.description || 'RDB加载中',
      value: redisInfo.RDBLoading?.value ? '是' : '否',
      icon: FileCheck,
    },
    {
      key: 'aof',
      label: redisInfo.AOFEnabled?.description || 'AOF是否开启',
      value: redisInfo.AOFEnabled?.value ? '已开启' : '未开启',
      icon: ToggleLeft,
    },
  ];
});

const hasCommandsData = computed(() => {
  return cacheData.value?.redisCommands && cacheData.value.redisCommands.length > 0;
});

const commandsChartData = computed(() => {
  const commands = cacheData.value?.redisCommands || [];

  return {
    labels: commands.map((cmd: any) => cmd.name || cmd.label || ''),
    datasets: [
      {
        data: commands.map((cmd: any) => cmd.value || 0),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2,
      },
    ],
  };
});

const commandsChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        padding: 15,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || '';
          const value = context.parsed || 0;
          return `${label}: ${value}`;
        },
      },
    },
  },
}));

const memoryPercentage = computed(() => {
  const memoryValue = parseMemoryValue(
    cacheData.value?.redisInfo?.usedMemoryHuman?.value
  );
  const totalMemory = parseMemoryValue(
    cacheData.value?.redisInfo?.totalSystemMemoryHuman?.value
  );

  const percentage = totalMemory > 0 ? (memoryValue / totalMemory) * 100 : 0;
  return percentage.toFixed(1);
});

const memoryChartData = computed(() => {
  const memoryValue = parseMemoryValue(
    cacheData.value?.redisInfo?.usedMemoryHuman?.value
  );
  const totalMemory = parseMemoryValue(
    cacheData.value?.redisInfo?.totalSystemMemoryHuman?.value
  );
  const freeMemory = totalMemory - memoryValue;

  return {
    labels: ['已使用', '可用'],
    datasets: [
      {
        label: '内存 (MB)',
        data: [memoryValue, freeMemory],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(229, 231, 235, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(229, 231, 235)',
        ],
        borderWidth: 2,
      },
    ],
  };
});

const memoryChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  indexAxis: 'y' as const,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.parsed.x || 0;
          return `${context.label}: ${value.toFixed(2)} MB`;
        },
      },
    },
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
}));
/**
 * 解析内存值，统一转换为 MB
 */
const parseMemoryValue = (value: any): number => {
  if (!value) return 0;

  const str = String(value).toUpperCase();
  const numMatch = str.match(/([\d.]+)/);
  if (!numMatch || !numMatch[1]) return 0;

  const num = Number.parseFloat(numMatch[1]);

  if (str.includes('G')) {
    return num * 1024;
  }
  if (str.includes('M')) {
    return num;
  }
  if (str.includes('K')) {
    return num / 1024;
  }
  if (str.includes('B') && !str.includes('K') && !str.includes('M') && !str.includes('G')) {
    return num / (1024 * 1024);
  }

  return num;
};

/**
 * 获取缓存详情
 */
const fetchCacheDetail = async () => {
  try {
    loading.value = true;
    error.value = '';

    const data = await getCacheDetail();
    cacheData.value = data;
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '获取缓存信息失败';
    console.error('获取缓存详情失败:', err);
  }
  finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCacheDetail();
});

defineOptions({
  name: 'CacheMonitor',
});
</script>

<style scoped>
/* 使用 Tailwind CSS，无需额外样式 */
</style>
