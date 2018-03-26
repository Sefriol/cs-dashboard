<template>
  <div class="">
    <md-button class="md-corner-button" @click="showNavigation = true">
      <md-icon>settings</md-icon>
    </md-button>
    <div class="md-card-chart-media" :id="`chart-${id}`">
      <md-progress-spinner v-if="!ready" md-mode="indeterminate"/>
        <h1 v-if="ready && apps.length===0">NO VALID DATA</h1>
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
        <md-list-item>
          <md-icon>create_new_folder</md-icon>
          <md-field>
            <label>Bar Count (per App)</label>
            <md-input value="bins"
            type="number" autocomplete="age" v-model="bins"/>
          </md-field>
          <md-button class="md-icon-button" @click="changeBins">
            <md-icon class="">check_circle_outline</md-icon>
          </md-button>
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
// eslint-disable-next-line
import * as d3 from 'd3-array';

export default {
  name: 'histogram',
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
      bins: 20,
      chart: undefined,
      apps: [],
      extraApp: '',
    };
  },
  watch: {
    extraApp(val) {
      this.getData(val);
    },
  },
  mounted() {
    this.getData(this.props.appid);
  },
  methods: {
    async getData(val) {
      const response = await AppsService.getApp(val);
      const newApp = response.data.filter(r => !!r[this.props.attribute]).map((x) => {
        const value = isNaN(parseInt(x[this.props.attribute], 10))
          ? x[this.props.attribute]
          : parseInt(x[this.props.attribute], 10);
        return {
          appid: x.appID,
          id: x.id,
          value,
        };
      });
      if (newApp.length === 0) return;
      this.apps.push(newApp);
      this.renderChart();
    },
    renderChart() {
      if (this.chart) {
        this.chart.destroy();
        this.ready = false;
      }
      let bins = this.apps.map(app => this.getBins(app));
      bins = this.concatBins(bins);
      const config = {
        plugins: [
          tauCharts.api.plugins.get('legend')(),
          tauCharts.api.plugins.get('quick-filter')(
            {
              fields: ['length', 'x0'],
            }),
          tauCharts.api.plugins.get('tooltip')(
            {
              fields: ['appid', 'length', 'x0', 'x1'],
              formatters: {
                length: {
                  label: 'Connection(s)',
                  format: x => x,
                },
                x0: {
                  label: 'From',
                  format: x => x,
                },
                x1: {
                  label: 'To',
                  format: x => x,
                },
              },
            }),
        ],
        guide: {
          x: { label: { text: this.props.attribute.replace(/([a-z])([A-Z])/g, '$1 $2') } },
          y: { label: 'Connections', padding: 5 },
          padding: { b: 70, l: 70, t: 10, r: 10 },
          showGridLines: 'y',
        },
        data: bins,
        type: 'bar',
        x: 'average',
        y: 'length',
        color: 'appid',
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
    getBins(data) {
      const appid = data[0].appid;
      data.sort((a, b) => a.value - b.value);
      const min = data[0];
      const [max] = data.slice(-1);
      const histGenerator = d3.histogram()
        .value(d => d.value)
        .domain([min.value, max.value])
        .thresholds(this.bins)(data).map(x => (
          { appid, length: x.length, x1: x.x1, x0: x.x0, average: (x.x1 + x.x0) / 2 }));
      return histGenerator;
    },
    changeBins() {
      this.renderChart();
    },
    concatBins(bins) {
      return bins.reduce((acc, val) => [...acc, ...val]);
    },
  },
};
</script>
