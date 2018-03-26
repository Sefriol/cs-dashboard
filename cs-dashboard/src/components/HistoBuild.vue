<template>
  <div class="">
    <md-button class="md-corner-button" @click="showNavigation = true">
      <md-icon>settings</md-icon>
    </md-button>
    <div class="md-card-chart-media" :id="`chart-${id}`">
      <md-progress-spinner v-if="!ready" md-mode="indeterminate"/>
      <h1 v-if="ready && builds.length===0">NO VALID DATA</h1>
      <md-button v-if="ready && builds.length===0"
        class="md-icon-button" @click="removeChart">
      <md-icon>delete</md-icon>
    </md-button>
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
        <md-list-item>
     <md-field>
        <label for="build-name">Select Build</label>
        <md-select name="build-name" v-model="selectedBuildName" md-dense>
            <md-option v-for="option in Object.keys(options)" name="appOptions"
              v-bind:value="option" :key="option">
              {{ option }}
            </md-option>
        </md-select>
        <md-select name="build-ver"
          v-model="selectedBuildVer" md-dense :disabled="!selectedBuildName">
            <md-option v-for="option in options[selectedBuildName]" name="appOptions"
              v-bind:value="option" :key="option">
              {{ option }}
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
    options: {
      type: Object,
      required: true,
    },
    props: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      ready: false,
      showNavigation: false,
      bins: 20,
      chart: undefined,
      builds: [],
      selectedBuildName: '',
      selectedBuildVer: '',
    };
  },
  watch: {
    selectedBuildName() {
      this.selectedBuildVer = '';
    },
    selectedBuildVer(val) {
      if (val === '') return;
      this.getData({ name: this.selectedBuildName, ver: this.selectedBuildVer });
    },
  },
  mounted() {
    this.getData(this.props);
  },
  methods: {
    async getData(build) {
      const response = await AppsService.getBuild(build);
      const newBuild = response.data.filter(r => !!r.meanSendingRateKbps).map((x) => {
        const value = isNaN(parseInt(x.meanSendingRateKbps, 10))
          ? x.meanSendingRateKbps
          : parseInt(x.meanSendingRateKbps, 10);
        return {
          name: build.name,
          version: x.buildVer,
          value,
        };
      });
      if (newBuild.length === 0) {
        this.ready = true;
        return;
      }
      this.builds.push(newBuild);
      this.renderChart();
    },
    renderChart() {
      if (this.chart) {
        this.chart.destroy();
        this.ready = false;
      }
      let bins = this.builds.map(app => this.getBins(app));
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
              fields: ['name', 'version', 'length', 'x0', 'x1'],
              formatters: {
                name: {
                  label: 'Name',
                  format: x => x,
                },
                version: {
                  label: 'Version',
                  format: x => x,
                },
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
          x: { label: { text: 'Mean Sending Rate Kbps' } },
          y: { label: 'Connections', padding: 5 },
          padding: { b: 70, l: 70, t: 10, r: 10 },
          showGridLines: 'y',
        },
        data: bins,
        type: 'bar',
        x: 'average',
        y: 'length',
        color: 'version',
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
      const version = data[0].version;
      const name = data[0].name;
      data.sort((a, b) => a.value - b.value);
      const min = data[0];
      const [max] = data.slice(-1);
      const histGenerator = d3.histogram()
        .value(d => d.value)
        .domain([min.value, max.value])
        .thresholds(this.bins)(data).map(x => (
          { name, version, length: x.length, x1: x.x1, x0: x.x0, average: (x.x1 + x.x0) / 2 }));
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
