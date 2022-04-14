<template>
  <div class="home">
    <el-container class="home-container">
      <!-- 顶部 -->
       <el-header>
         <div>
           <img src="../assets/heima.png" alt="">
           <span>电商后台管理系统</span>
         </div>
         <el-button type="info" @click="logout">退出登录</el-button>
       </el-header>
     <el-container>
       <!-- 侧边栏 -->
       <el-aside :width="isCollapse ?'64px':'200px'">
         <div class="toggle-button" @click="toggleCollapse">|||</div>
         <!-- 侧边栏菜单 -->
          <el-menu unique-opened :collapse='this.isCollapse' :collapse-transition="false" router :default-active="activePath"
      background-color="#333744" 
      text-color="#fff"
      active-text-color="#409eff">
      <!-- 一级菜单 -->
      <el-submenu  v-for="item in menuList" :key="item.id" :index="item.id+'' ">
        <!-- 一级菜单模板区域 -->
        <template slot="title">
          <!-- 图标 -->
          <i :class="iconsObj[item.id]"></i>
          <!-- 文本 -->
          <span>{{item.authName}}</span>
        </template>
        <!-- 二级菜单 -->
          <el-menu-item :index="'/'+subItem.path " v-for="subItem in item.children" :key="subItem.id"
          @click="saveNavState('/'+subItem.path)">
             <template slot="title">
          <!-- 图标 -->
          <i class="el-icon-menu"></i>
          <!-- 文本 -->
          <span>{{subItem.authName}}</span>
        </template>
          </el-menu-item>
      </el-submenu> 
    </el-menu>
       </el-aside>
       <!-- 中间区域 -->
       <el-main>

         <router-view></router-view>
       </el-main>
     </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data(){
    return {
      menuList: [],
      iconsObj:{
        125:'iconfont icon-user',
        103:'iconfont icon-tijikongjian',
        101:'iconfont icon-shangpin',
        102:'iconfont icon-danju',
        145:'iconfont icon-baobiao',
      },
      isCollapse:false,
      // 被激活的链接地址
      activePath:''
    }
  },
  methods:{
    logout(){
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList(){
      const {data:res}=await this.$http.get('menus')
      if(res.meta.status!==200) return this.$message.error(res.meta.msg)
      this.menuList=res.data
      console.log(res);
    },
    // 点击按钮切换菜单的折叠与展开
    toggleCollapse(){
        this.isCollapse=!this.isCollapse
    },
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath=activePath
    }
  },
  created(){
    this.getMenuList()
    this.activePath=window.sessionStorage.getItem('activePath')
  },
}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  >div {
    display: flex;
    align-items: center;
    >span {
      margin-left: 20px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.home,.home-container {
  height: 100%;
}
.iconfont {
  margin-right:10px ;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
  color:#fff;
}
</style>