<script>
import { url as fileUrl } from '@/api/admin/sys-file'
import { setBrowserTabIcon } from '@/utils'
import { clone } from 'xe-utils'
import { getStorage, setStorage } from '@/utils/storage'
import constant from '@/constant'
import variables from '@/styles/variables.scss'

const THEME_BGS = ['login-bg1.jpg', 'login-bg2.jpg', 'login-bg3.jpg', 'login-bg4.jpg', 'login-bg5.jpg', 'login-bg6.jpg']

const form = {
  username: '',
  password: ''
}

export default {
  name: 'Login',
  data() {
    return {
      form: clone(form, true),
      rules: {
        username: [{ required: true, message: '请输入用户名' }],
        password: [{ required: true, message: '请输入密码' }]
      },
      loading: false,
      redirect: undefined,
      otherQuery: {},
      themeBgs: THEME_BGS,
      activeIndex: 0,
      switchConfig: {
        methods: 'manual',
        active: {
          text: '自动轮播',
          value: 'auto',
          color: variables.themeColor
        },
        inactive: {
          text: '手动切换',
          value: 'manual',
          color: variables.successColor
        }
      },
      timer: null,
      title: '',
      logoImages: ''
    }
  },
  watch: {
    $route: {
      handler(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  async mounted() {
    const loginThemeConfig = getStorage({ name: constant.STORAGE_LOGIN_THEME })
    if (loginThemeConfig) {
      this.activeIndex = loginThemeConfig.activeIndex
      this.switchConfig.methods = loginThemeConfig.switchMethods
      this.handleSwitchChange(loginThemeConfig.switchMethods)
    }
    const res = await this.$store.dispatch('app/getSystemConfigInfo')
    this.title = res.title || 'NEXTSCM'
    this.logoImages = `${window.location.origin}${fileUrl}/preView/${res.url}`
    setBrowserTabIcon(this.logoImages)
    this.initialFocus()
  },
  beforeDestroy() {
    clearInterval(this.timer)
    this.timer = null
  },
  methods: {
    handleLogin() {
      this.$refs.formRef.validate((valid, invalidFields) => {
        if (valid) {
          this.loading = true
          this.$store
            .dispatch('user/login', this.form)
            .then(() => {
              this.loading = false
              this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          // 通过 el-message 的形式展示错误信息
          this.getFormInstance().useErrorByMessage(invalidFields)
          this.loading = false
        }
      })
    },
    /** 进到login页面获取输入框焦点 */
    initialFocus() {
      if (this.form.username === '') {
        this.$refs.usernameRef.focus()
      } else if (this.form.password === '') {
        this.$refs.passwordRef.focus()
      }
      this.$refs.formRef.clearValidate()
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    },
    handleItemClick(index) {
      this.activeIndex = index
      console.log(constant.STORAGE_LOGIN_THEME)
      setStorage({
        name: constant.STORAGE_LOGIN_THEME,
        content: { switchMethods: this.switchConfig.methods, activeIndex: this.activeIndex }
      })
    },
    handleSwitchChange(value) {
      if (value === 'manual') {
        clearInterval(this.timer)
        this.timer = null
      } else {
        this.timer = setInterval(() => {
          if (this.activeIndex >= this.themeBgs.length - 1) {
            this.activeIndex = 0
          } else {
            this.activeIndex++
          }
        }, 3000)
      }
      setStorage({ name: constant.STORAGE_LOGIN_THEME, content: { switchMethods: value, activeIndex: this.activeIndex } })
    }
  }
}
</script>

<template>
  <div class="login">
    <div
      v-for="(item, index) in themeBgs"
      :key="item"
      :class="['login-bg', { 'is-active': activeIndex === index }]"
      :style="{ backgroundImage: `url(${require('@/assets/login/' + item)})`, zIndex: themeBgs.length - index }"
    />
    <div class="login-form">
      <div class="login-form-logo">
        <el-image :src="logoImages">
          <div slot="placeholder">
            <div class="login-form-logo-placeholder" />
          </div>
          <div slot="error">
            <img src="@/assets/login/login-logo@2.x.png" class="login-form-logo-error" />
          </div>
        </el-image>
      </div>
      <div class="login-form-title">{{ title }}</div>
      <div class="login-form-title-sub">全新一代数字化供应链管理平台</div>
      <div class="login-form-main">
        <base-form ref="formRef" :model="form" :rules="rules">
          <base-form-item prop="username">
            <base-input ref="usernameRef" v-model="form.username" prefix-icon="el-icon-user" placeholder="请输入用户名" />
          </base-form-item>

          <base-form-item prop="password">
            <base-input
              ref="passwordRef"
              v-model="form.password"
              prefix-icon="el-icon-lock"
              show-password
              placeholder="请输入密码"
              @keyup.enter.native="handleLogin"
            />
          </base-form-item>

          <base-form-item>
            <el-button class="login-form-button" type="primary" :loading="loading" @click="handleLogin">{{
              loading ? '正在登录中' : '登&nbsp;&nbsp;录'
            }}</el-button>
          </base-form-item>
        </base-form>
      </div>
    </div>
    <el-popover placement="bottom" trigger="click" popper-class="login-frame-popover">
      <div class="login-frame-container">
        <div class="login-frame-header">
          <base-switch
            v-model="switchConfig.methods"
            :active-value="switchConfig.active.value"
            :inactive-value="switchConfig.inactive.value"
            :active-text="switchConfig.active.text"
            :inactive-text="switchConfig.inactive.text"
            :active-color="switchConfig.active.color"
            :inactive-color="switchConfig.inactive.color"
            @change="handleSwitchChange"
          />
        </div>
        <div class="login-frame-content">
          <ul class="login-frame-items">
            <li
              v-for="(item, index) in themeBgs"
              :key="item"
              :class="['login-frame-item', { 'is-active': activeIndex === index }]"
              @click="() => handleItemClick(index)"
            >
              <img :src="require(`@/assets/login/${item}`)" />
            </li>
          </ul>
        </div>
      </div>
      <div slot="reference" class="login-frame">
        <img src="@/assets/login/login-frame.png" />
      </div>
    </el-popover>
  </div>
</template>

<style lang="scss">
.login {
  $inputWidth: 330px;
  $logoSize: 70px;

  position: relative;
  overflow-y: auto;
  width: 100%;
  height: 100%;
  min-height: 600px;
  .login-bg {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    opacity: 0;
    transition: opacity 1s;
    &.is-active {
      opacity: 1;
    }
  }
  .login-form {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 9999;
    padding: 80px 60px;
    max-width: 450px;
    border-radius: 6px;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 34px 0 rgba(0, 0, 0, 0.1);
    transform: translate(-50%, -50%);
    .login-form-logo {
      text-align: center;
      .login-form-logo-error,
      .el-image {
        width: $logoSize;
      }
      .login-form-logo-placeholder {
        width: $logoSize;
        height: $logoSize;
      }
    }
    .login-form-title {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
    }
    .login-form-title-sub {
      font-size: 14px;
      color: #d7d7d7;
    }
    .login-form-main {
      display: flex;
      justify-content: center;
      padding-top: 30px;
      .el-input {
        width: $inputWidth;
        .el-input__inner {
          width: $inputWidth;
          border-top-width: 0;
          border-right-width: 0;
          border-bottom-width: 1px;
          border-left-width: 0;
          border-radius: 0;
          color: #ffffff;
          background-color: transparent;
          caret-color: #ffffff;
          &:-internal-autofill-previewed,
          &:-internal-autofill-selected {
            transition: background-color 5000s ease-out 0.5s;
            -webkit-text-fill-color: #ffffff;
          }
        }
        &.el-input--prefix {
          .el-input__inner {
            padding-left: 40px;
          }
        }
        .el-input__prefix {
          font-size: 16px;
          color: #ffffff;
        }
        .el-input__clear {
          color: #ffffff;
        }
      }
      .el-form-item {
        &:last-child {
          margin-bottom: 0;
          padding-top: 20px;
        }
      }
      .login-form-button {
        width: $inputWidth;
      }
    }
  }
  .login-frame {
    position: absolute;
    right: 30px;
    bottom: 40px;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 46px;
    height: 46px;
    border-radius: 6px;
    background-color: rgba(0, 0, 0, 0.4);
    cursor: pointer;
  }
}
.login-frame-popover {
  padding: 10px 5px 5px;
  .login-frame-header {
    margin-bottom: 10px;
  }
  .login-frame-items {
    padding: 2px;
    border: 1px solid #dedede;
  }
  .login-frame-item {
    display: inline-block;
    margin: 2px;
    width: 54px;
    height: 54px;
    border: 2px solid transparent;
    cursor: pointer;
    > img {
      width: 100%;
      height: 100%;
    }
    &.is-active {
      border-color: var(--color-primary);
    }
  }
}
</style>
