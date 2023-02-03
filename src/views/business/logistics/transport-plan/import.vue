<script>
import enums from '@/enums'
import constant from '@/constant'
import TransportPlan from './components/page-list'

export default {
  name: 'TransportPlanImport',
  components: { TransportPlan },
  data() {
    return {
      enums,
      permissionObj: {
        page: constant.PERMISSION_TRANSPORT_PLAN_IMPORT,
        create: constant.PERMISSION_TRANSPORT_PLAN_IMPORT_CREATE
      }
    }
  }
}
</script>

<template>
  <transport-plan :order-type="enums.ORDER_TYPE.getFieldByKey('IMPORT')" :permission-obj="permissionObj" />
</template>
