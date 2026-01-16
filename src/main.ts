import ui from '@nuxt/ui/vue-plugin';
import { createApp } from 'vue';
import App from '@/App.vue';
import VueQueryPlugin, { vueQueryOptions } from '@/plugins/vue-query';
import router from '@/router';
import pinia from '@/stores';
import '@/assets/styles/styles.scss';

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(VueQueryPlugin, vueQueryOptions);
app.use(ui);

app.mount('#app');
