<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="iscollape ? '64px' : '200px'">
        <div class="toggle-button" @click="togglecollapse">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eee"
          unique-opened
          :collapse="iscollape"
          :collapse-transition="false"
          router
          :default-active="activepath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            :key="item.id"
            v-for="item in menulist"
          >
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconid[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单模板 -->
            <el-menu-item
              :index="'/' + subitem.path"
              :key="subitem.id"
              v-for="subitem in item.children"
              @click="saveNavState('/' + subitem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subitem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data () {
    return {
      menulist: [],
      iconid: {
        "125": "iconfont icon-users ",
        "103": "iconfont icon-tijikongjian",
        "101": "iconfont icon-shangpin ",
        "102": "iconfont icon-danju",
        "145": "iconfont icon-baobiao"
      },
      iscollape: false,
      //被激活的链接地址
      activepath: ''
    }
  },
  created () {
    this.getMeunList()
    this.activepath = window.sessionStorage.getItem('activepath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear('token')
      this.$router.push('/login')
    },
    async getMeunList () {
      // 发送axios获取菜单数据
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.mata.msg)
      // this.$message.success(res.meta.msg)
      this.menulist = res.data
    },
    // 点击按钮折叠 展开
    togglecollapse () {
      this.iscollape = !this.iscollape;
    },
    saveNavState (activepath) {
      window.sessionStorage.setItem('activepath', activepath)
      this.activepath = activepath;
    }
  }
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  padding-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
