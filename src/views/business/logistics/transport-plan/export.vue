<script>
import enums from '@/enums'
import constant from '@/constant'
import TransportPlan from './components/page-list'

export default {
  name: 'TransportPlanExport',
  components: { TransportPlan },
  data() {
    return {
      enums,
      permissionObj: {
        page: constant.PERMISSION_TRANSPORT_PLAN_EXPORT,
        create: constant.PERMISSION_TRANSPORT_PLAN_EXPORT_CREATE
      }
    }
  }
}
</script>

<template>
  <transport-plan :order-type="enums.ORDER_TYPE.getFieldByKey('EXPORT')" :permission-obj="permissionObj" />
</template>
