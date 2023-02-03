<script>
import { getStorage } from '@/utils/storage'
import constant from '@/constant'

export default {
  name: 'Avatar',
  data() {
    return {
      realname: '',
      avatar: '',
      defaultAvatar: require('@/assets/navbar/avatar-default.png')
    }
  },
  mounted() {
    this.getUserInfo()
  },
  methods: {
    handleSettings() {
      this.$store.dispatch('app/toggleSettingVisible', true)
    },
    async handleLogout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    getUserInfo() {
      if (getStorage({ name: constant.STORAGE_USER_INFO })) {
        const userInfo = getStorage({ name: constant.STORAGE_USER_INFO })
        const { avatar, realname } = userInfo
        this.realname = realname
        this.avatar = `${window.origin}${avatar}`
      }
    }
  }
}
</script>

<template>
  <el-dropdown class="avatar" size="medium" trigger="click">
    <div class="avatar-reference">
      <el-avatar :size="25" :src="avatar" @error="() => true">
        <img :src="defaultAvatar" />
      </el-avatar>
      <div class="avatar-name">{{ realname }}</div>
    </div>

    <el-dropdown-menu slot="dropdown" class="navtar-right-avatar">
      <router-link to="/profile/index">
        <el-dropdown-item icon="el-icon-user">个人信息</el-dropdown-item>
      </router-link>
      <!-- <el-dropdown-item divided icon="el-icon-setting" @click.native="handleSettings">界面设置</el-dropdown-item> -->
      <el-dropdown-item divided icon="el-icon-switch-button" @click.native="handleLogout">退出登录</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<style lang="scss">
.avatar {
  &-reference {
    position: relative;
    display: flex;
    align-items: center;
    height: 40px;
    .avatar-name {
      margin-left: 10px;
      font-size: 14px;
    }
  }
  & .el-dropdown-menu {
    padding: 5px 0;
  }
}
</style>
