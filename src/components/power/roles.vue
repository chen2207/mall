<template>
  <div class="roles">
     <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesUsers">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom',i1===0?'':'bdtop','vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag @close="removeRihtById(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
                <i class='el-icon-caret-right'></i>
              </el-col>
              <!-- 渲染二 三级权限 -->
              <el-col :span="19">
                <el-row :class="['bdbottom',i2===0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <!-- {{item2.authName}} -->
                    <el-tag type="success" @close="removeRihtById(scope.row,item2.id)" closable>{{item2.authName}}</el-tag>
                    <i class='el-icon-caret-right'></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="item3 in item2.children" :key="item3.id" type="warning" closable @close="removeRihtById(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon='el-icon-edit' @click="editRoles(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" icon='el-icon-delete' @click="deleteRoles(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon='el-icon-search' @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog @close="setRightDialogClosed"
       title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%">
        <!-- 树形控件 -->
        <el-tree :data="rightsList" :props="treeProps" show-checkbox
        node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
         <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>

      <!--添加角色的对话框  -->
      <el-dialog @close="addDialogClose"
          title="添加角色"
          :visible.sync="addRolesUsersDialogVisible"
          width="50%">
            <el-form :model="addRolesList" ref="addFormRef" label-width="80px" :rules="addRolesRules">
              <el-form-item label="角色名称" prop="roleName" >
                <el-input v-model="addRolesList.roleName"></el-input>
              </el-form-item>
              <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="addRolesList.roleDesc"></el-input>
              </el-form-item>
            </el-form>
          <span slot="footer" class="dialog-footer">
           <el-button @click="addRolesUsersDialogVisible = false">取 消</el-button>
           <el-button type="primary" @click="addRoles">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改角色的对话框 -->
        <el-dialog
          title="提示"
          :visible.sync="editRolesDialog"
          width="50%">
          <div>
            <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="editRolesRules">
              <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="editForm.roleName"></el-input>
              </el-form-item>
              <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="editForm.roleDesc"></el-input>
              </el-form-item>
            </el-form>
          </div>
          <span slot="footer" class="dialog-footer">
           <el-button @click="editRolesDialog = false">取 消</el-button>
           <el-button type="primary" @click="editRolesConfirm">确 定</el-button>
          </span>
        </el-dialog>
  </div>
</template>

<script>
export default {
  data(){
    return{
      // 所有角色列表数据
      roleList:[],
      setRightDialogVisible:false,
      rightsList:[],
      //树形控件的属性绑定对象
      treeProps:{
        label:'authName',
        children:'children'
      },
      defKeys:[],
      roleId:0,
      addRolesUsersDialogVisible:false,
      // 添加用户绑定
      addRolesList:{},
      addRolesRules:{
        roleName:[
          {required:true,message:'请输入角色名字',trigger:'blur'},
          {min:3,max:10,message:'角色名长度为三个字符到十个字符'}
        ],
        roleDesc:[{required:true,message:'请输入描述',trigger:'blur'},],
      },
      editRolesDialog:false,
      editForm:{},
      rid:0,//记录要修改的当前行的id数值
      editRolesRules:{
        roleName:[
          {required:true,message:'请输入角色名字',trigger:'blur'},
          {min:3,max:10,message:'角色名长度为三个字符到十个字符'}
        ],
        roleDesc:[
          {required:true,message:'请输入描述',trigger:'blur'},
        ],
      },
    }
  },
  methods:{
    async getRolesList(){
      const{data:res}=await this.$http.get('roles')
      if(res.meta.status!==200)return this.$message.error('获取角色列表失败')
      this.roleList=res.data
    },
    async removeRihtById(role,rightid){
      // 提示用户是否删除
       const confirmResult=await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(confirmResult!=='confirm')return this.$message.info('用户取消了删除')
        const{data:res}=await this.$http.delete('roles/'+role.id+'/rights/'+rightid)
        if(res.meta.status!==200){
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        this.getRolesList()
    },
    async showSetRightDialog(role){
      this.roleId=role.id
      // 获取所有权限数据
      const{data:res}=await this.$http.get('rights/tree')
      if(res.meta.status!==200)return this.$message.error('获取权限列表失败')
      this.rightsList=res.data

      this.getLeafKeys(role,this.defKeys)
      this.setRightDialogVisible=true
    },
    // 获取所有三级节点---递归
    getLeafKeys(node,arr){
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item=>{
        this.getLeafKeys(item,arr)
      })
    },
    setRightDialogClosed(){
      this.defKeys=[]
    },
    async allotRights(){
      const keys=[
      ...this.$refs.treeRef.getCheckedKeys(),
      ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const {data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(res.meta.status!==200)return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible=false
    },
    // 点击弹出对话框
    addRolesUsers(){
      this.addRolesUsersDialogVisible=true
    },
    // 点击确定增加新角色
    addRoles(){
      this.$refs.addFormRef.validate(async valid=>{
      if(!valid)return this.$message.error('格式不正确哦！')
      const {data:res}=await this.$http.post('roles',this.addRolesList)

      if(res.meta.status!==201)return this.$message.error('添加角色失败')

      // 查重名
        const {data:all}=await this.$http.get('roles')
        var num=0;
        all.data.forEach(e=>{
          if(e.roleName===this.addRolesList.roleName)
            num++
        })
        if(num>0)
         return this.$message.error('改名称已经存在!')


      this.$message.success("添加角色成功！")
      this.getRolesList()
      this.addRolesUsersDialogVisible=false
      } )
    },
    addDialogClose(){
      this.$refs.addFormRef.resetFields();
    },
    async deleteRoles(id){
      const confirmResult=await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'}).catch(err=>err)
      if(confirmResult!=='confirm'){
        return this.$message('已经取消删除')
      }
      const {data:res}=await this.$http.delete(`roles/${id}`)
      if(res.meta.status!==200){
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      this.getRolesList()
    },
    // 展示 角色修改 对话框
    async editRoles(role){
      this.rid=role.id
      const{data:res}=await this.$http.get('roles/'+role.id)
      if(res.meta.status!==200)return this.$message.error('获取角色失败')
      this.$message.success('获取角色成功')
      this.editForm=res.data
      this.editRolesDialog=true
    },
    editRolesConfirm(){
      this.$refs.editFormRef.validate(async valid=>{
        if(!valid)return this.$message.error('格式不正确！')
        const{data:res}=await this.$http.put(`roles/${this.rid}`,this.editForm)
        if(res.meta.status!==200)return this.$message.error('修改用户信息失败！')
        // 查重名
        const {data:all}=await this.$http.get('roles')
        var num=0;
        all.data.forEach(e=>{
          if(e.roleName===this.editForm.roleName)
            num++
        })
        if(num>1)
         return this.$message.error('改名称已经存在!')
        this.$message.success('修改用户信息成功！')
        console.log(res);
        this.getRolesList()
        this.editRolesDialog=false
      })
    },
  },
  created(){
     this.getRolesList()
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top:1px solid #eee ;
}
.bdbottom {
  border-bottom:1px solid #eee ;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>