// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import 'taucharts/dist/taucharts.min.css';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';
import 'font-awesome/css/font-awesome.css';

import VueMaterial from 'vue-material';

import Vue from 'vue';
import App from './App';
import router from './router';

Vue.use(VueMaterial);

Vue.config.productionTip = false;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});

