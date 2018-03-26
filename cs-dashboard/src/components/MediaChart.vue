<template>
  <div class="">
    <md-button class="md-corner-button" @click="showNavigation = true">
      <md-icon>settings</md-icon>
    </md-button>
    <div class="md-card-chart-media" :id="`chart-${id}`">
      <md-progress-spinner v-if="!ready" md-mode="indeterminate"/>
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
         <md-list-item>
          <i class="md-icon">multiline_chart</i>
          <md-field>
            <label for="options">Add more Apps</label>
            <md-select v-model="extraApp" name="options_drawer" md-dense>
              <md-option v-for="option in options"
                v-bind:value="option.appID"
                :key="option.appID">
                {{ option.appID }}
              </md-option>
            </md-select>
          </md-field>
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
  name: 'media-chart',
  components: {
    tauCharts,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    props: {
      type: Object,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      ready: false,
      showNavigation: false,
      chart: {},
      apps: [],
      extraApp: '',
    };
  },
  watch: {
    extraApp(val) {
      this.getMore(val);
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      const response = await AppsService.getApp(this.props.appid);
      let total = 0;
      this.app = response.data.reduce((map, session) => {
        total += 1;
        // eslint-disable-next-line
        map[session.mediaType] = (map[session.mediaType] || 0) + 1;
        return map;
      }, {});
      this.app = Object.keys(this.app).map(x => (
        {
          appid: this.props.appid,
          type: x,
          amount: (this.app[x] / total) * 100,
        }));
      const config = {
        plugins: [
          tauCharts.api.plugins.get('legend')(),
          tauCharts.api.plugins.get('quick-filter')(),
          tauCharts.api.plugins.get('tooltip')(
            {
              fields: ['type', 'amount'],
              formatters: {
                type: {
                  label: 'Media type',
                  format: x => x || 'unkown',
                },
                amount: {
                  label: 'Amount',
                  format: x => Math.round(x),
                },
              },
            }),
        ],
        guide: {
          y: { label: '%', padding: 5 },
          padding: { b: 70, l: 70, t: 10, r: 10 },
          showGridLines: 'xy',
        },
        data: this.app,
        type: 'stacked-bar',
        x: 'appid',
        y: 'amount',
        color: 'type',
      };
      const r = document.getElementById(`chart-${this.id}`);
      if (!this.ready && r) {
        this.chart = new tauCharts.Chart(config);
        this.chart.renderTo(r);
        this.ready = true;
      }
    },
    async getMore(val) {
      const response = await AppsService.getApp(val);
      let total = 0;
      let newData = response.data.reduce((map, session) => {
        total += 1;
        // eslint-disable-next-line
        map[session.mediaType] = (map[session.mediaType] || 0) + 1;
        return map;
      }, {});
      this.chart.destroy();
      this.ready = false;
      newData = Object.keys(newData).map(x => (
        {
          appid: val,
          type: x,
          amount: (newData[x] / total) * 100,
        }));
      this.app = [...this.app, ...newData];
      const config = {
        plugins: [
          tauCharts.api.plugins.get('legend')(),
          tauCharts.api.plugins.get('quick-filter')(),
          tauCharts.api.plugins.get('tooltip')(
            {
              fields: ['appid', 'type', 'amount'],
              formatters: {
                appid: {
                  label: 'App ID',
                  format: x => x || 'unkown',
                },
                type: {
                  label: 'Media type',
                  format: x => x || 'unkown',
                },
                amount: {
                  label: 'Amount',
                  format: x => Math.round(x),
                },
              },
            }),
        ],
        guide: {
          x: { label: { text: 'App ID', padding: 5 } },
          y: { label: '%', padding: 5 },
          padding: { b: 70, l: 70, t: 10, r: 10 },
          showGridLines: 'xy',
        },
        data: this.app,
        type: 'stacked-bar',
        x: 'appid',
        y: 'amount',
        color: 'type',
      };
      const r = document.getElementById(`chart-${this.id}`);
      if (!this.ready && r) {
        this.chart = new tauCharts.Chart(config);
        this.chart.renderTo(r);
        this.ready = true;
      }
    },
    removeChart() {
      this.$emit('destroy', this.id);
    },
  },
};
</script>
