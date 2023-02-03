<script>
import Summarization from './components/summarization'
import Rate from './components/rate'
import Chart from './components/chart.vue'

export default {
  name: 'Dashboard',
  components: { Summarization, Rate, Chart },
  data() {
    return {}
  }
}
</script>

<template>
  <div class="dashboard">
    <base-row :gutter="10">
      <base-col :span="12">
        <summarization></summarization>
      </base-col>
      <base-col :span="12">
        <rate></rate>
      </base-col>
    </base-row>
    <base-row class="charts-wrap">
      <base-col :span="24" style="height: 100%">
        <chart></chart>
      </base-col>
    </base-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  background-color: #f9f9f9;
  box-sizing: border-box;
  .charts-wrap {
    margin-top: 10px;
    height: calc(100% - 255px);
  }
}
</style>
