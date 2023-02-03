<script>
import constant from '@/constant'
import autocompleteConfig from '@/config/autocomplete'

export default {
  name: 'Grid',
  props: {
    moduleName: String,
    params: Object
  },
  data() {
    return {
      constant
    }
  },
  computed: {
    config() {
      const config = autocompleteConfig[this.moduleName]
      return config.tableConfig
    }
  },
  methods: {
    handleCellDblclick($table) {
      this.$emit('cell-dblclick', $table)
    }
  }
}
</script>

<template>
  <div class="business-autocomplete-basic-grid">
    <base-page
      :name="constant.TABLE_NAME_BASE_AUTOCOMPLETE_BASIC"
      :extra-params="params"
      v-bind="config"
      :show-checkbox="false"
      :tools-config="{
        setting: {
          visible: false
        },
        download: {
          visible: false
        }
      }"
      @cell-dblclick="handleCellDblclick"
    >
    </base-page>
  </div>
</template>

<style lang="scss" scoped>
.business-autocomplete-basic-grid {
  height: 70vh;
}
</style>
