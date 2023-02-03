<script>
import { queryDayData, queryMonthData } from '@/api/index/index'
import BigNumber from '@/utils/big-number'

export default {
  name: 'Summarization',
  data() {
    return {
      activeName: 'month',
      month: {
        orderCount: 0,
        // achieve: 9938442.79,
        customerCount: 0,
        productCount: 0
      },
      day: {
        orderCount: 0,
        // achieve: 9938442.79,
        customerCount: 0,
        productCount: 0
      }
    }
  },
  created() {
    Promise.all([queryMonthData(), queryDayData()]).then(res => {
      Object.assign(this.month, res[0].data || {})
      Object.assign(this.day, res[1].data || {})
    })
  },
  methods: {
    formatDecimal(number) {
      return new BigNumber(Number(number)).dp(6).toFormat()
    }
  }
}
</script>

<template>
  <el-card class="summarization">
    <el-tabs v-model="activeName">
      <el-tab-pane label="月数据" name="month">
        <base-row>
          <base-col :span="8">
            <div class="block">
              <div class="num">{{ formatDecimal(month.orderCount) }}</div>
              <div class="text">本月订单量(单)</div>
            </div>
          </base-col>
          <!-- <base-col :span="16">
            <div class="block">
              <div class="num">{{ formatDecimal(month.achieve) }}</div>
              <div class="text">本月业绩量(美元)</div>
            </div>
          </base-col> -->
          <base-col :span="16">
            <div class="block">
              <div class="num">{{ formatDecimal(month.customerCount) }}</div>
              <div class="text">客户数(个)</div>
            </div>
          </base-col>
          <base-col :span="24">
            <div class="block">
              <div class="num">{{ formatDecimal(month.productCount) }}</div>
              <div class="text">商品数(个)</div>
            </div>
          </base-col>
        </base-row>
      </el-tab-pane>
      <el-tab-pane label="日数据" name="day">
        <base-row>
          <base-col :span="8">
            <div class="block">
              <div class="num">{{ formatDecimal(day.orderCount) }}</div>
              <div class="text">当日订单量(单)</div>
            </div>
          </base-col>
          <!-- <base-col :span="16">
            <div class="block">
              <div class="num">{{ formatDecimal(day.achieve) }}</div>
              <div class="text">当日业绩量(美元)</div>
            </div>
          </base-col> -->
          <base-col :span="16">
            <div class="block">
              <div class="num">{{ formatDecimal(day.customerCount) }}</div>
              <div class="text">客户数(个)</div>
            </div>
          </base-col>
          <base-col :span="24">
            <div class="block">
              <div class="num">{{ formatDecimal(day.productCount) }}</div>
              <div class="text">商品数(个)</div>
            </div>
          </base-col>
        </base-row>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style lang="scss" scoped>
.summarization {
  height: 245px;
  ::v-deep .el-card__body {
    padding: 10px 20px;
  }
  .block {
    margin: 10px 0;
    .num {
      overflow: hidden;
      font-size: 20px;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--color-primary);
      word-break: break-all;
    }
    .text {
      font-size: 13px;
      color: $--color-info;
    }
  }
}
</style>
