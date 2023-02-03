<template lang="html">
  <div class="cron">
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane name="s">
        <span slot="label"><i class="el-icon-date"></i> 秒</span>
        <secondAndMinute v-model="sVal" lable="秒" />
      </el-tab-pane>
      <el-tab-pane name="m">
        <span slot="label"><i class="el-icon-date"></i> 分</span>
        <secondAndMinute v-model="mVal" lable="分" />
      </el-tab-pane>
      <el-tab-pane name="h">
        <span slot="label"><i class="el-icon-date"></i> 时</span>
        <hour v-model="hVal" lable="时" />
      </el-tab-pane>
      <el-tab-pane name="d">
        <span slot="label"><i class="el-icon-date"></i> 日</span>
        <day v-model="dVal" lable="日" />
      </el-tab-pane>
      <el-tab-pane name="month">
        <span slot="label"><i class="el-icon-date"></i> 月</span>
        <month v-model="monthVal" lable="月" />
      </el-tab-pane>
      <el-tab-pane name="week">
        <span slot="label"><i class="el-icon-date"></i> 周</span>
        <week v-model="weekVal" lable="周" />
      </el-tab-pane>
      <el-tab-pane name="year">
        <span slot="label"><i class="el-icon-date"></i> 年</span>
        <year v-model="yearVal" lable="年" />
      </el-tab-pane>
    </el-tabs>
    <!-- table -->
    <el-table :data="tableData" size="mini" border style="width: 100%">
      <el-table-column prop="sVal" label="秒" width="70"> </el-table-column>
      <el-table-column prop="mVal" label="分" width="70"> </el-table-column>
      <el-table-column prop="hVal" label="时" width="70"> </el-table-column>
      <el-table-column prop="dVal" label="日" width="70"> </el-table-column>
      <el-table-column prop="monthVal" label="月" width="70"> </el-table-column>
      <el-table-column prop="weekVal" label="周" width="70"> </el-table-column>
      <el-table-column prop="yearVal" label="年"> </el-table-column>
    </el-table>
  </div>
</template>

<script>
/* eslint-disable vue/require-default-prop */
import SecondAndMinute from './second-and-minute'
import Hour from './hour'
import Day from './day'
import Month from './month'
import Week from './week'
import Year from './year'
export default {
  components: {
    SecondAndMinute,
    Hour,
    Day,
    Month,
    Week,
    Year
  },
  props: {
    value: {
      type: String
    }
  },
  data() {
    return {
      //
      activeName: 's',
      sVal: '',
      mVal: '',
      hVal: '',
      dVal: '',
      monthVal: '',
      weekVal: '',
      yearVal: ''
    }
  },
  computed: {
    tableData() {
      return [
        {
          sVal: this.sVal,
          mVal: this.mVal,
          hVal: this.hVal,
          dVal: this.dVal,
          monthVal: this.monthVal,
          weekVal: this.weekVal,
          yearVal: this.yearVal
        }
      ]
    },
    value_() {
      if (!this.dVal && !this.weekVal) {
        return ''
      }
      if (this.dVal === '?' && this.weekVal === '?') {
        this.$message.error('日期与星期不可以同时为“不指定”')
      }
      if (this.dVal !== '?' && this.weekVal !== '?') {
        this.$message.error('日期与星期必须有一个为“不指定”')
      }
      const v = `${this.sVal} ${this.mVal} ${this.hVal} ${this.dVal} ${this.monthVal} ${this.weekVal} ${this.yearVal}`
      if (v !== this.value) {
        this.$emit('input', v)
      }
      return v
    }
  },
  watch: {
    value(a, b) {
      this.updateVal()
    }
  },
  created() {
    this.updateVal()
  },
  methods: {
    updateVal() {
      if (!this.value) {
        return
      }
      const arrays = this.value.split(' ')
      this.sVal = arrays[0]
      this.mVal = arrays[1]
      this.hVal = arrays[2]
      this.dVal = arrays[3]
      this.monthVal = arrays[4]
      this.weekVal = arrays[5]
      this.yearVal = arrays[6]
    }
  }
}
</script>

<style lang="css">
.cron {
  padding: 10px;
  border: 1px solid #dcdfe6;
  text-align: left;
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}
</style>
