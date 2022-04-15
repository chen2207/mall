<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="9">
          <!-- 搜索和添加 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userList" border stripe>
        <el-table-column type='index' label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch @change="userStateChanged(scope.row)"
              v-model="scope.row.mg_state"
               active-color="#13ce66"
               inactive-color="#ff4949">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改" placement="top-start" :enterable='false'>
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable='false'>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable='false'>
                <el-button type="warning" icon="el-icon-setting" size="mini"
                @click="setRole(scope.row)"></el-button>
            </el-tooltip>

          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
         <el-pagination
             @size-change="handleSizeChange"
             @current-change="handleCurrentChange"
             :current-page="queryInfo.pagenum"
             :page-sizes="[1, 2, 5, 10]"
             :page-size="queryInfo.pagesize"
             layout="total, sizes, prev, pager, next, jumper"
             :total="total">
        </el-pagination>
      <!-- 添加用户的对话框 -->
      <el-dialog @close="addDialogClose"
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%">
        <!-- 内容主题区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <!-- 添加用户的用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="email" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
         <el-button @click="addDialogVisible = false">取 消</el-button>
         <el-button type="primary" @click="addUser">确 定</el-button>
       </span>
      </el-dialog>
      <!-- 修改用户的对话框 -->
      <el-dialog @close="editDialogClose"
       title="修改用户"
       :visible.sync="editDialogVisible"
        width="50%">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
          <!-- 修改页面的对话框的用户修改 -->
          <el-form-item label="用户名称">
           <el-input v-model="editForm.username" disabled></el-input>
         </el-form-item>
         <el-form-item label="email" prop="email">
           <el-input v-model="editForm.email"></el-input>
         </el-form-item>
         <el-form-item label="手机号码" prop="mobile">
           <el-input v-model="editForm.mobile"></el-input>
         </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
         <el-button @click="editDialogVisible = false">取 消</el-button>
         <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
</el-dialog>
<!-- 分配角色的对话框 -->
<el-dialog @close="setRoleDialogClosed"
  title="分配角色"
  :visible.sync="setRoleialogVisible"
  width="50%">
  <div>
    <p>当前的用户：{{userInfo.username}}</p>
    <p>当前的角色：{{userInfo.role_name}}</p>
    <p>
      分配新角色
      <el-select v-model="selectedRoleId" placeholder="请选择">
        <el-option
          v-for="item in rolesList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id">
        </el-option>
      </el-select>
    </p>
  </div>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
</el-dialog>
    </el-card>

   
  </div>
</template>

<script>
export default {
  data(){
    // 验证邮箱是否符合规则
    var checkEmail=(rule,value,cb)=>{
     const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if(regEmail.test(value)){
        return cb();
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号规则
    var checkMobile=(rule,value,cb)=>{
      const regMobile=/^1[34578][0-9]{9}$/
      if(regMobile.test(value)){
        return cb();
      }
      cb(new Error('输入正确的电话号码'))
    }
    return{
      // 获取用户列表的参数对象
      queryInfo:{
        query:'',
        pagenum:1,
        pagesize:2
      },
      userList:[],
      total:0,
      // 控制用户添加对话框的显示和隐藏
      addDialogVisible:false,
      // 添加用户的表单数据
      addForm:{
        username:'',
        password:'',
        email:'',
        mobile:'',
      },
      addFormRules:{
        username:[
          {required:true,message:'请输入用户名字',trigger:'blur'},
          {min:3,max:10,message:'用户名长度为三个字符到十个字符'}
        ],
        password:[
          {required:true,message:'请输入密码',trigger:'blur'},
          {min:6,max:15,message:'用户名长度为6个字符到15个字符'}
        ],
        email:[
          {required:true,message:'请输入email',trigger:'blur'},
          {validator:checkEmail,trigger:'blur'}
        ],
        mobile:[
          {required:true,message:'请输入电话号码',trigger:'blur'},
          {validator:checkMobile,trigger:'blur'},
        ]
      },
      // 修改对话框是否显示
      editDialogVisible:false,
      editForm:{},
      editFormRules:{
        email:[
          {required:true,message:'请输入email',trigger:'blur'},
          {validator:checkEmail,trigger:'blur'}
          ],
        mobile:[
          {required:true,message:'请输入电话号码',trigger:'blur'},
          {validator:checkMobile,trigger:'blur'},
        ],
      },
      setRoleialogVisible:false,
      userInfo:{},
      rolesList:[],
      // 已选中的id
      selectedRoleId:'',
    }
  },
  methods:{
    async getUserList(){
      const {data:res}=await this.$http.get('users',{params:this.queryInfo})
      if(res.meta.status!==200)return this.$message.error('获取用户列表失败！') ;
      this.userList=res.data.users
      this.total=res.data.total
    },
    // 监听pagesize改变的时间
    handleSizeChange(newSize){
      // console.log(newSize);
      this.queryInfo.pagesize=newSize
      this.getUserList()
    },
    handleCurrentChange(newPage){
      // console.log(newPage)
      this.queryInfo.pagenum=newPage
      this.getUserList()
    },
    async userStateChanged(userinfo){
      // console.log(userinfo);
      const{data:res}=await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if(res.meta.status!==200){
        userinfo.mg_state=!userinfo.mg_state
        return this.$message.error('更新用户失败')
        }
      this.$message.success('更新用户成功')
    },
    addDialogClose(){
      // 监听对话框关闭事件
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加新用户
    addUser(){
      this.$refs.addFormRef.validate(async valid=>{
        // console.log(valid);
        if(!valid)return;
        // 发起添加用户的请求
        const {data:res}=await this.$http.post('users',this.addForm)
        if(res.meta.status!==201){
          this.$message.error('添加用户失败！')
        }this.$message.success('添加用户成功！')
        // 成功后隐藏对话框
        this.addDialogVisible=false;
      })
    },
    async showEditDialog(id){
      // 展示编辑用户的对话框
      this.editDialogVisible=true
      const{data:res}=await this.$http.get(`users/${id}`)
      if(res.meta.status!==200){
        return this.$message.error('查询用户信息失败！')
      }
      this.$message.success('查询用户信息成功！')
      this.editForm=res.data
    },
    editDialogClose(){
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo(){
      this.$refs.editFormRef.validate(async valid=>{
        // console.log(valid);
        if(!valid)return this.$message.error('填写的信息有问题')
        const{data:res}=await this.$http.put('users/'+this.editForm.id,
        {email:this.editForm.email,mobile:this.editForm.mobile})
        if(res.meta.status!=200) return this.$message.error('更新用户信息失败！')
        // 关闭对话框    刷新列表     提示修改成功
        this.editDialogVisible=false
        this.getUserList()
        this.$message.success("用户信息修改成功！")
      })
    },
    // 根据id删除用户对应的用户信息
    async removeUserById(id){
      const confirmResult=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'}).catch(err=>{
            return err
          })
      // 确认删除返回数值为confirm
      //  取消删除返回值为cancel
      // console.log(confirmResult);
      if(confirmResult!=='confirm'){
        return this.$message('已经取消删除')
      }
      const {data:res}=await this.$http.delete('users/'+id)
      if(res.meta.status!==200){
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      this.getUserList()
    },
    // 展示分配角色的对话框
    async setRole(userinfo){
      this.userInfo=userinfo
      // 在展示对话框之前，获取所有列表
      const{data:res}=await this.$http.get('roles')
      if(res.meta.status!==200)return this.$message.error('获取角色列表失败！')
      this.rolesList=res.data
      this.setRoleialogVisible=true
    },
    // 点击按钮分配角色
    async saveRoleInfo(){
      if(!this.selectedRoleId)return this.$message.error('请选择要分配的角色！')
      const{data:res}=await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
      if(res.meta.status!==200)return this.$message.error('更新角色失败！')
      this.$message.success('更新角色成功！')
      this.getUserList()
      this.setRoleialogVisible=false
    },
    setRoleDialogClosed(){
      this.selectedRoleId=''
      this.userInfo={}
    }
  },
  created(){
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>

</style>