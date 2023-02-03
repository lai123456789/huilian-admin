<script>
import { getBaseCustomsRate } from '@/api/base/base-customs-rate'
import { getForeignRateList } from '@/api/index/index'
import dayjs from '@/utils/day'

export default {
  name: 'Rate',
  data() {
    return {
      currentDate: dayjs().format('YYYY-MM-DD'),
      currentMonth: dayjs().format('YYYY-MM'),
      bankChinaLoading: false,
      customsLoading: false,
      bankChinaRates: [
        { name: 'usa', label: '美元', value: 0, icon: require('@/assets/dashboard/usa.png') },
        { name: 'hk', label: '港币', value: 0, icon: require('@/assets/dashboard/hk.png') },
        { name: 'usk', label: '英镑', value: 0, icon: require('@/assets/dashboard/usk.png') },
        { name: 'jpy', label: '日元', value: 0, icon: require('@/assets/dashboard/jpy.png') },
        { name: 'eur', label: '欧元', value: 0, icon: require('@/assets/dashboard/eur.png') }
      ],
      customsRates: [
        { name: 'usa', label: '美元', value: 0, icon: require('@/assets/dashboard/usa.png') },
        { name: 'hk', label: '港币', value: 0, icon: require('@/assets/dashboard/hk.png') },
        { name: 'usk', label: '英镑', value: 0, icon: require('@/assets/dashboard/usk.png') },
        { name: 'jpy', label: '日元', value: 0, icon: require('@/assets/dashboard/jpy.png') },
        { name: 'eur', label: '欧元', value: 0, icon: require('@/assets/dashboard/eur.png') }
      ]
    }
  },
  created() {
    Promise.all([this.getBaseForeigns(), this.getCustomsRates()])
  },
  methods: {
    // 获取海关汇率数据
    getCustomsRates() {
      this.customsLoading = true
      return new Promise((resolve, reject) => {
        getBaseCustomsRate({
          year: this.currentMonth.split('-')[0],
          month: this.zerofill(this.currentMonth.split('-')[1]),
          currency: this.customsRates.map(v => v.label).join(',')
        })
          .then(res => {
            for (let i = 0; i < this.customsRates.length; i++) {
              const oi = this.customsRates[i]
              for (let j = 0; j < res.data.records.length; j++) {
                const oj = res.data.records[j]
                if (oi.label === oj.currency) {
                  oi.value = oj.rate
                  continue
                }
              }
            }
            this.customsLoading = false
            resolve()
          })
          .catch(error => {
            reject(error)
            this.customsLoading = false
          })
      })
    },
    // 获取中银汇率数据
    getBaseForeigns() {
      this.bankChinaLoading = true
      return new Promise((resolve, reject) => {
        getForeignRateList({
          releaseDate: `${this.currentDate},${this.currentDate}`,
          currency: this.bankChinaRates.map(v => v.label).join(',')
        })
          .then(res => {
            for (let i = 0; i < this.bankChinaRates.length; i++) {
              const oi = this.bankChinaRates[i]
              if (res.data[oi.label].length) {
                oi.value = res.data[oi.label][0].sellingRate
              } else {
                oi.value = 0
              }
            }
            this.bankChinaLoading = false
            resolve()
          })
          .catch(error => {
            reject(error)
            this.bankChinaLoading = false
          })
      })
    },
    zerofill(num) {
      return num <= 10 ? `0${num}` : num
    }
  }
}
</script>

<template>
  <base-row class="rate" :gutter="10">
    <base-col :span="12">
      <el-card class="rate">
        <div slot="header" class="header">
          <span
            >中银汇率<i>({{ currentDate }})</i></span
          >
          <el-button icon="el-icon-refresh" :loading="bankChinaLoading" type="text" @click="getBaseForeigns"></el-button>
        </div>
        <div class="content">
          <ul
            v-loading="bankChinaLoading"
            element-loading-text="拼命加载中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)"
          >
            <li v-for="item in bankChinaRates" :key="item.name" class="item">
              <div class="l">
                <img :src="item.icon" />
                <div>{{ item.label }}</div>
              </div>
              <div class="r">{{ item.value }}</div>
            </li>
          </ul>
        </div>
      </el-card>
    </base-col>

    <base-col :span="12">
      <el-card class="rate">
        <div slot="header" class="header">
          <span
            >海关汇率<i>({{ currentMonth }})</i></span
          >
          <el-button icon="el-icon-refresh" :loading="customsLoading" type="text" @click="getCustomsRates"></el-button>
        </div>
        <div class="content">
          <ul
            v-loading="customsLoading"
            element-loading-text="拼命加载中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)"
          >
            <li v-for="item in customsRates" :key="item.name" class="item">
              <div class="l">
                <img :src="item.icon" />
                <div>{{ item.label }}</div>
              </div>
              <div class="r">{{ item.value }}</div>
            </li>
          </ul>
        </div>
      </el-card>
    </base-col>
  </base-row>
</template>

<style lang="scss" scoped>
.rate {
  height: 245px;
  ::v-deep .el-card__header {
    padding-top: 5px;
    padding-bottom: 5px;
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      > span {
        display: inline-block;
        font-size: 14px;
        > i {
          display: inline-block;
          margin-left: 5px;
          font-size: 12px;
          font-style: normal;
        }
      }
    }
  }
  .content {
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 14px;
      color: $--color-info;
      .l {
        display: flex;
        align-items: center;
        > img {
          margin-right: 10px;
        }
      }
      .r {
        overflow: hidden;
        padding-left: 7px;
        text-align: right;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        word-break: break-all;
      }
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
