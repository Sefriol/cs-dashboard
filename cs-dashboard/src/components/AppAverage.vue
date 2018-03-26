<template>
  <div class="">
    <md-button class="md-corner-button" @click="showNavigation = true">
      <md-icon>settings</md-icon>
    </md-button>
    <div class="md-card-chart-media" :id="`chart-${id}`">
      <md-progress-spinner v-if="!chart.ready" md-mode="indeterminate"/>
    </div>
    <md-drawer class="md-right" :md-active.sync="showNavigation">
      <md-toolbar class="md-white" md-elevation="0">
        <span class="md-title">Options</span>
      </md-toolbar>
      <md-list class="">
        <md-list-item @click="removeChart">
          <i class="md-icon">delete</i>
          <span class="md-list-item-text">Remove Chart</span>
        </md-list-item>
      </md-list>
    </md-drawer>
  </div>
</template>

<script>
import AppsService from '@/services/AppsService';
import tauCharts from 'taucharts';
import 'taucharts/dist/plugins/tooltip';
import 'taucharts/dist/plugins/legend';
import 'taucharts/dist/plugins/quick-filter';

export default {
  name: 'app-avg-chart',
  data() {
    return {
      showNavigation: false,
      chart: {},
      apps: [],
    };
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      const response = await AppsService.getAppAvg();
      this.apps = response.data;
      const config = {
        plugins: [
          tauCharts.api.plugins.get('legend')(
          ),
          tauCharts.api.plugins.get('quick-filter')(
            {
              fields: ['appID', 'avgrate'],
            }),
          tauCharts.api.plugins.get('tooltip')(
            {
              fields: ['appID', 'avgrate'],
              formatters: {
                appID: {
                  label: 'App ID',
                  format: x => x,
                },
                avgrate: {
                  label: 'Average',
                  format: x => Math.round(x),
                },
              },
            }),
        ],
        guide: {
          y: { label: 'Average Rate (kbps)', padding: 5 },
          padding: { b: 70, l: 70, t: 10, r: 10 },
          showGridLines: 'y',
        },
        data: this.apps,
        type: 'bar',
        x: 'appID',
        y: 'avgrate',
        color: 'appID',
      };
      if (!this.chart.ready) {
        this.chart = new tauCharts.Chart(config);
        this.chart.renderTo('.md-card-chart-media');
        this.chart.ready = true;
      }
    },
    removeChart() {
      this.$emit('destroy', this.id);
    },
  },
};
</script>
