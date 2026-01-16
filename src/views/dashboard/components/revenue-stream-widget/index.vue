<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
// @ts-ignore
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
// @ts-ignore
import { Bar } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const layoutStore = useLayoutStore();
const { getPrimary, getGray, isDarkTheme } = layoutStore;

const chartData = ref<any>({
  labels: [],
  datasets: []
});
const chartOptions = ref<any>({});

function setChartData() {
  const documentStyle = getComputedStyle(document.documentElement);

  return {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Subscriptions',
        backgroundColor: documentStyle.getPropertyValue('--p-primary-400') || '#60a5fa',
        data: [4000, 10000, 15000, 4000],
        barThickness: 32,
      },
      {
        label: 'Advertising',
        backgroundColor: documentStyle.getPropertyValue('--p-primary-300') || '#93c5fd',
        data: [2100, 8400, 2400, 7500],
        barThickness: 32,
      },
      {
        label: 'Affiliate',
        backgroundColor: documentStyle.getPropertyValue('--p-primary-200') || '#bfdbfe',
        data: [4100, 5200, 3400, 7400],
        borderRadius: {
          topLeft: 8,
          topRight: 8,
        },
        borderSkipped: true,
        barThickness: 32,
      },
    ],
  };
}

function setChartOptions() {
  const documentStyle = getComputedStyle(document.documentElement);
  const borderColor = documentStyle.getPropertyValue('--gray-border') || '#e5e7eb';
  const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary') || '#6b7280';

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      legend: {
        labels: {
          color: textMutedColor
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: textMutedColor,
        },
        grid: {
          color: 'transparent',
          borderColor: 'transparent',
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: textMutedColor,
        },
        grid: {
          color: borderColor,
          borderColor: 'transparent',
          drawTicks: false,
        },
      },
    },
  };
}

watch([getPrimary, getGray, isDarkTheme], () => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

onMounted(() => {
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});
</script>

<template>
  <UCard class="flex flex-col">
    <template #header>
      <div class="font-semibold text-xl text-gray-900 dark:text-white">
        Revenue Stream
      </div>
    </template>
    <div class="h-80">
      <Bar v-if="chartData.datasets.length" :data="chartData" :options="chartOptions" />
    </div>
  </UCard>
</template>
