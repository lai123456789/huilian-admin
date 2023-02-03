<script>
import { getForeignRateList } from '@/api/index/index'
import * as echarts from 'echarts'
import { debounce } from 'xe-utils'
import dayjs from '@/utils/day'

export default {
  name: 'Charts',
  data() {
    return {
      activeName: 'rateTrend',
      loading: false,
      active: '美元'
    }
  },
  async mounted() {
    this.resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)

    window.addEventListener('resize', this.resizeHandler)

    setTimeout(() => {
      this.initCharts()
    }, 0)
  },
  activated() {
    this.resizeHandler()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandler)
    if (!this.chart) return
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    async initCharts() {
      this.loading = true
      const myChart = this.$refs['eCharts']
      this.chart = echarts.init(myChart)
      const near30s = [dayjs().subtract(1, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
      const currencys = ['美元', '港币', '英镑', '日元', '欧元']
      const xArr = dayjs.range(near30s[0], near30s[1])
      const result = {}
      const res = await getForeignRateList({ releaseDate: near30s.join(','), currency: currencys.join(',') })
      let activeName = '美元'
      const activeLegend = {
        美元: true,
        港币: false,
        英镑: false,
        日元: false,
        欧元: false
      }
      for (const key in res.data) {
        if (Object.hasOwnProperty.call(res.data, key)) {
          const item = res.data[key]
          for (let i = 0; i < currencys.length; i++) {
            const currency = currencys[i]
            if (currency === key) {
              Object.assign(result, this.processData(xArr, item, key))
              break
            }
          }
        }
      }

      const usa = result['美元']
      const hk = result['港币']
      const usk = result['英镑']
      const jpy = result['日元']
      const eur = result['欧元']
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          width: '93%',
          x: '5%',
          y: '20%'
        },
        legend: {
          icon: 'circle',
          top: '7%',
          itemWidth: 8,
          selectedMode: 'single',
          itemGap: 20,
          data: currencys,
          selected: activeLegend
        },
        xAxis: {
          type: 'category',
          data: xArr,
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#DCE2E8'
            }
          },
          axisLabel: {
            textStyle: {
              color: '#606266'
            },
            fontSize: 12
          }
        },
        yAxis: {
          type: 'value',
          scale: true,
          max: value => {
            return value.max
          },
          min: value => {
            return Math.min(...result[activeName].filter(x => x !== 0))
          },
          interval: 'auto',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            color: '#606266'
          },
          axisTick: {
            show: false
          }
        },
        series: [
          // 美元
          {
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: 'rgba(246, 204, 124,0.3)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(246, 204, 124,0)'
                    }
                  ],
                  false
                ),
                shadowColor: 'rgba(246, 204, 124, 0.9)',
                shadowBlur: 20
              }
            },
            data: usa,
            type: 'line',
            symbol: 'circle',
            symbolSize: 11,
            itemStyle: {
              normal: { label: { show: true } },
              color: '#fdcb6e',
              borderColor: '#fff',
              borderWidth: 4,
              shadowColor: 'rgba(0, 0, 0, .3)',
              shadowBlur: 0,
              shadowOffsetY: 2,
              shadowOffsetX: 2
            },
            smooth: true,
            name: '美元',
            color: ['#fdcb6e']
          },

          // 港币
          {
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: 'rgba(215, 86, 69,0.3)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(215, 86, 69,0)'
                    }
                  ],
                  false
                ),
                shadowColor: 'rgba(215, 86, 69, 0.9)',
                shadowBlur: 20
              }
            },
            data: hk,
            type: 'line',
            symbol: 'circle',
            symbolSize: 11,
            itemStyle: {
              normal: { label: { show: true } },
              color: '#e74c3c',
              borderColor: '#fff',
              borderWidth: 4,
              shadowColor: 'rgba(0, 0, 0, .3)',
              shadowBlur: 0,
              shadowOffsetY: 2,
              shadowOffsetX: 2
            },
            smooth: true,
            name: '港币',
            color: ['#e74c3c']
          },

          // 英镑
          {
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: 'rgba(146, 95, 177,0.3)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(146, 95, 177,0)'
                    }
                  ],
                  false
                ),
                shadowColor: 'rgba(146, 95, 177, 0.9)',
                shadowBlur: 20
              }
            },
            data: usk,
            type: 'line',
            symbol: 'circle',
            symbolSize: 11,
            itemStyle: {
              normal: { label: { show: true } },
              color: '#9b59b6',
              borderColor: '#fff',
              borderWidth: 4,
              shadowColor: 'rgba(0, 0, 0, .3)',
              shadowBlur: 0,
              shadowOffsetY: 2,
              shadowOffsetX: 2
            },
            smooth: true,
            name: '英镑',
            color: ['#9b59b6']
          },

          // 日元
          {
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: 'rgba(87, 185, 157,0.3)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(87, 185, 157,0)'
                    }
                  ],
                  false
                ),
                shadowColor: 'rgba(87, 185, 157, 0.9)',
                shadowBlur: 20
              }
            },
            data: jpy,
            type: 'line',
            symbol: 'circle',
            symbolSize: 11,
            itemStyle: {
              normal: { label: { show: true } },
              color: '#1abc9c',
              borderColor: '#fff',
              borderWidth: 4,
              shadowColor: 'rgba(0, 0, 0, .3)',
              shadowBlur: 0,
              shadowOffsetY: 2,
              shadowOffsetX: 2
            },
            smooth: true,
            name: '日元',
            color: ['#1abc9c']
          },

          // 欧元
          {
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: 'rgba(80, 152, 213,0.3)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(80, 152, 213,0)'
                    }
                  ],
                  false
                ),
                shadowColor: 'rgba(80, 152, 213, 0.9)',
                shadowBlur: 20
              }
            },
            data: eur,
            type: 'line',
            symbol: 'circle',
            symbolSize: 11,
            itemStyle: {
              normal: { label: { show: true } },
              color: '#3498db',
              borderColor: '#fff',
              borderWidth: 4,
              shadowColor: 'rgba(0, 0, 0, .3)',
              shadowBlur: 0,
              shadowOffsetY: 2,
              shadowOffsetX: 2
            },
            smooth: true,
            name: '欧元',
            color: ['#3498db']
          }
        ]
      }

      this.chart.setOption(option, true)
      this.chart.on('legendselectchanged', function (params) {
        for (const key in activeLegend) {
          activeLegend[key] = false
        }
        activeLegend[params.name] = true
        activeName = params.name
        this.chart = echarts.init(myChart)
        this.chart.setOption(option)
      })
      this.loading = false
    },
    // 处理数据
    processData(dates, data, key) {
      const result = {}
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i]
        const item = data.find(v => date === v.releaseDate)
        if (item) {
          if (result[key]) {
            result[key].push(item.sellingRate)
          } else {
            result[key] = []
            result[key].push(item.sellingRate)
          }
        } else {
          if (result[key]) {
            result[key].push(0)
          } else {
            result[key] = []
            result[key].push(0)
          }
        }
        continue
      }
      for (const key in result) {
        result[key].forEach((item, index, arry) => {
          if (item === 0) {
            arry[index] = Math.min(...result[key].filter(x => x !== 0))
          }
        })
      }
      return result
    }
  }
}
</script>

<template>
  <el-card class="charts">
    <el-tabs v-model="activeName">
      <el-tab-pane label="汇率走势图" name="rateTrend">
        <div
          ref="eCharts"
          v-loading="loading"
          element-loading-text="拼命加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          class="instance"
        />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style lang="scss" scoped>
.charts {
  width: 100%;
  height: 100%;
  min-height: 450px;
  ::v-deep .el-card__body {
    padding: 10px 20px;
    height: 100%;
  }
  ::v-deep .el-tabs {
    height: 100%;
    .el-tabs__header {
      margin-bottom: 0;
    }
    .el-tabs__content {
      height: calc(100% - 40px);
    }
    .el-tab-pane {
      height: 100%;
    }
  }
  .instance {
    width: 100%;
    height: 100%;
  }
}
</style>
