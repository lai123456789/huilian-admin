<!-- 数据权限 -->
<script>
import { getMenuDataRule, deleteMenuDataRuleById } from '@/api/admin/menu-data-rule'
import { getDataDictionary } from '@/api/admin/dicts'
import { transforArrayPayload } from '@/utils'
import constant from '@/constant'
import enums from '@/enums'
import ViewRulesEnterForm from './view-rules-enter-form'
import { mapGetters } from 'vuex'

export default {
  name: 'ViewRules',
  components: { ViewRulesEnterForm },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      constant,
      visible: this.value,
      enterForm: {
        visible: false,
        type: ''
      },
      tableRow: {},
      request: async ({ pager, params }) => {
        const { data } = await getMenuDataRule({ ...pager, ...transforArrayPayload(params) })
        return {
          data: data.records,
          total: data.total
        }
      },
      columns: [
        {
          field: 'status',
          title: '权限状态',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_IS_ENABLED_STATUS)
            }
          }
        },
        { field: 'ruleName', title: '规则名称' },
        { field: 'ruleColumn', title: '规则字段' },
        {
          field: 'ruleConditions',
          title: '规则条件',
          formatter: {
            type: 'options',
            config: {
              options: () => getDataDictionary(constant.DICTS_RULE_CONDITIONS)
            }
          }
        },
        { field: 'ruleValue', title: '规则值' }
      ],
      buttonsConfig: {}
    }
  },
  computed: {
    ...mapGetters(['permissions'])
  },
  watch: {
    // ----------- 固定定义 -----------
    value(newValue) {
      this.visible = newValue
    },
    visible(newValue) {
      this.$emit('input', newValue)
    }
    // ----------- 固定定义 -----------
  },
  created() {
    this.buttonsConfig = {
      add: {
        visible: this.permissions[constant.PERMISSION_SYS_MENU_RULES_ADD],
        handler: this.handleAdded
      },
      edit: {
        visible: this.permissions[constant.PERMISSION_SYS_MENU_RULES_EDIT],
        handler: this.handleEdit
      },
      del: {
        visible: this.permissions[constant.PERMISSION_SYS_MENU_RULES_DEL],
        handler: this.handleDel
      }
    }
  },
  methods: {
    handleAdded() {
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('ADDED')
      }
    },
    handleEdit(row) {
      this.tableRow = row
      this.enterForm = {
        visible: true,
        type: enums.FORM_TYPE.getFieldByKey('MODIFY')
      }
    },
    handleDel(row) {
      this.$confirm('是否确认删除所选记录?')
        .then(() => {
          deleteMenuDataRuleById(row.id).then(() => {
            // 清空表格全部选中的数据
            this.$refs['viewRulesRef'].handleTableClearCheckbox(true)
            this.$message.success('删除成功')
            this.reLoad(false)
          })
        })
        .catch(() => {})
    },
    reLoad(isClearSelect) {
      this.$refs['viewRulesRef'].refresh(isClearSelect)
    }
  }
}
</script>

<template>
  <base-dialog :visible.sync="visible" custom-class="view-rules-dialog" title="数据权限规则" width="1200px" :show-footer="false">
    <div class="view-rules">
      <!-- 列表页 -->
      <base-page
        ref="viewRulesRef"
        :name="constant.TABLE_NAME_MENU_VIEW_RULE"
        :columns="columns"
        :request="request"
        :buttons-config="buttonsConfig"
      />
    </div>
    <view-rules-enter-form v-model="enterForm.visible" :type="enterForm.type" :table-row="tableRow" :re-load="reLoad" />
  </base-dialog>
</template>

<style lang="scss">
$prefix: view-rules;
.#{$prefix}-dialog {
  .#{$prefix} {
    height: 60vh;
  }
  .base-dialog-body {
    padding: 0;
  }
}
</style>
