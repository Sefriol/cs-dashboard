import Api from '@/services/Api';

export default {
  fetchApps() {
    return Api().get('app');
  },
  getApp(id) {
    return Api().get(`app/${id}`);
  },
  getAppAvg() {
    return Api().get('app/average');
  },
  getBuilds() {
    return Api().get('build');
  },
  getBuild(build) {
    return Api().get(`build/${build.name}/${encodeURIComponent(build.ver)}`);
  },
};
