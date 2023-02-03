<script>
import { url as fileUrl } from '@/api/admin/sys-file'
import { setBrowserTabIcon } from '@/utils'

export default {
  name: 'Logo',
  data() {
    return {
      logo: '',
      errorLogo: require('@/assets/login/login-logo@2.x.png'),
      title: ''
    }
  },
  mounted() {
    this.$store.dispatch('app/getSystemConfigInfo').then(res => {
      this.title = res.title || '慧链科技在线测试系统'
      this.logo = res.url ? `${window.location.origin}${fileUrl}/preView/${res.url}` : void 0
      setBrowserTabIcon(this.logo)
    })
  }
}
</script>

<template>
  <div class="logo">
    <router-link class="logo-link" to="/">
      <el-image :src="logo" class="logo-image">
        <div slot="error">
          <img :src="errorLogo" class="logo-image" alt="logo" />
        </div>
      </el-image>
      <div class="logo-text">{{ title }}</div>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.logo {
  position: relative;
  overflow: hidden;
  padding-left: 10px;
  width: 100%;
  height: 100%;
  &-link {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
  }
  &-image {
    width: 36px !important;
    height: 36px;
    vertical-align: middle;
  }
  &-text {
    display: inline-block;
    margin-left: 7px;
    font-size: 18px;
    font-weight: 700;
    vertical-align: middle;
  }
}
</style>
