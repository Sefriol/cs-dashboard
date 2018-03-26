<template>
  <div class="charts">
    <md-toolbar class="md-elevation-1">
      <div class="md-toolbar-row">
      <span class="md-title">Charts</span>
      </div>
      <div class="md-toolbar-row">
      <md-field>
        <label>Select Build Name</label>
        <md-select v-model="selectedBuildName" md-dense>
            <md-option v-for="option in Object.keys(buildOptions)" name="appOptions"
              v-bind:value="option" :key="option">
              {{ option }}
            </md-option>
        </md-select>
      </md-field>
      <md-field>
        <label>Select Build Version</label>
        <md-select v-model="selectedBuildVer" md-dense :disabled="!selectedBuildName">
            <md-option v-for="option in buildOptions[selectedBuildName]" name="appOptions"
              v-bind:value="option" :key="option">
              {{ option }}
            </md-option>
        </md-select>
      </md-field>
      <md-field class="md-toolbar-offset">
        <label>Select App ID</label>
        <md-select v-model="selectedApp" md-dense>
            <md-option v-for="option in appOptions" name="appOptions"
              v-bind:value="option.appID" :key="option.appID">
              {{ option.appID }}
            </md-option>
        </md-select>
      </md-field>
      <md-field>
        <label>Select Attribute to Compare</label>
        <md-select v-model="selectedAttribute" md-dense>
            <md-option v-bind:value="'media'" :key="'media'">
              Media Type
            </md-option>
            <md-option v-bind:value="'meanSendingRateKbps'" :key="'meanSendingRateKbps'">
              Mean Sending Rate (kbps)
            </md-option>
            <md-option v-bind:value="'meanReceiveRateKbps'" :key="'meanReceiveRateKbps'">
              Mean Receive Rate (kbps)
            </md-option>
        </md-select>
      </md-field>
      </div>
    </md-toolbar>
    <div class="md-layout" id="chart-container" >
      <div class="md-card md-layout-item md-size-50" v-for="chart in charts" v-bind:key="chart.id">
      <AppAverage
        v-if="chart.type==='avg'"
        :id="chart.id"
        v-on:destroy="removeChart"/>
      <MediaChart
        v-else-if="chart.type==='media'"
        :id="chart.id"
        :props="chart.props"
        :options="appOptions"
        v-on:destroy="removeChart"/>
      <Histogram
        v-else-if="chart.type==='app'"
        :id="chart.id"
        :props="chart.props"
        :attribute="'meanSendingRateKbps'"
        :options="appOptions"
        v-on:destroy="removeChart"/>
      <HistoBuild
        v-else-if="chart.type==='build'"
        :id="chart.id"
        :props="chart.props"
        :options="buildOptions"
        v-on:destroy="removeChart"/>
        </div>
    </div>
  </div>
</template>

<script>
import AppsService from '@/services/AppsService';
import AppAverage from '@/components/AppAverage';
import MediaChart from '@/components/MediaChart';
import Histogram from '@/components/Histogram';
import HistoBuild from '@/components/HistoBuild';
import tauCharts from 'taucharts';
import 'taucharts/dist/plugins/tooltip';
import 'taucharts/dist/plugins/legend';
import 'taucharts/dist/plugins/quick-filter';
// eslint-disable-next-line
import * as d3 from 'd3-array';

export default {
  name: 'dashboard',
  components: {
    tauCharts,
    AppAverage,
    MediaChart,
    Histogram,
    HistoBuild,
  },
  data() {
    return {
      uniqID: null,
      selectedApp: '',
      selectedBuildName: '',
      selectedBuildVer: '',
      selectedAttribute: '',
      appOptions: [],
      buildOptions: [],
      charts: [],
    };
  },
  watch: {
    selectedBuildName() {
      this.selectedBuildVer = '';
    },
    selectedBuildVer(val) {
      if (val === '') return;
      this.createChart({ build: { name: this.selectedBuildName, ver: this.selectedBuildVer } });
    },
    selectedAttribute(val) {
      if (val === 'media') {
        this.createChart({ media: { appid: this.selectedApp } });
      } else {
        this.createChart({ app: { appid: this.selectedApp, attribute: val } });
      }
    },
  },
  created() {
    this.initAppSelector();
    this.initBuildSelector();
    this.createChart();
  },
  methods: {
    async initAppSelector() {
      const response = await AppsService.fetchApps();
      this.appOptions = response.data;
    },
    async initBuildSelector() {
      const response = await AppsService.getBuilds();
      this.buildOptions = response.data.reduce((map, b) => {
        // eslint-disable-next-line
        map[b.buildName] = map[b.buildName] ? map[b.buildName] : [];
        map[b.buildName].push(b.buildVer);
        return map;
      }, {});
    },
    createChart(object) {
      const newId = this.uniqID + 1;
      if (!object) {
        this.charts.push({ id: newId, type: 'avg', props: {} });
      } else if (object.build) {
        this.charts.push({ id: newId, type: 'build', props: object.build });
      } else if (object.app) {
        this.charts.push({ id: newId, type: 'app', props: object.app });
      } else if (object.media) {
        this.charts.push({ id: newId, type: 'media', props: object.media });
      }
      this.uniqID = newId;
    },
    removeChart(id) {
      this.charts = this.charts.filter(chart => chart.id !== id);
    },
  },
  mounted() {
  },
  beforeDestroy() {
  },
};
</script>
<style lang="less">
@import (less,reference) '~vue-material/dist/vue-material.css';
#chart-container {
  margin-top: 30px;
}
.md-corner-button:extend(.md-icon-button) {
  margin-right: 0px;
  position:absolute;
  right:0px;
  z-index: 1;
}
.md-card .md-drawer {
  .md-toolbar {
    min-height: 32px;
  }
  .md-ripple {
    padding: 0px 16px !important;
  }
}
.md-card-chart-media:extend(.md-card-media) {
  padding: 5px 15px !important;
  height: 250px;
  padding: 10px 20px;
  border-top-right-radius: 25px;
  .md-progress-spinner {
    position: absolute;
    margin:70px auto;
  }
  .tau-chart__filter__wrap {
    padding: 5px 0 0 5px !important;
    .tau-chart__legend__title {
      margin-bottom: 2px;
    }
  }
  .tau-chart__legend {
    padding: 5px 0 0 5px !important;
  }
}
</style>
