<template>
  <div>
     <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type='primary' @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table class="treeTable" :data="catelist" :columns="columns" 
      :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialogShow(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 7, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog @close="addCloseDialogVisible"
      title="提示"
      :visible.sync="addCateDialogVisible"
     width="50%">
     <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRuleForm" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
         <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
           <el-cascader
              v-model="selectedKeys"
             :options="parentCateList"
             :props="cascaderProps"
             @change="parentCateChange"
             expand-trigger="hover"
             clearable change-on-select></el-cascader>
        </el-form-item>
     </el-form> 
     <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog
      title="提示"
      :visible.sync="editDialogVisible"
      width="50%">
      <el-form :model="editForm" :rules="editRules" ref="editRef" label-width="100px">
        <el-form-item label="类别名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editConfirm(editId)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data(){
    return{
      queryInfo:{
        type:3,
        pagenum:1,
        pagesize:5
      },
      // 商品分类的数据列表，默认为空
      catelist:[],
      total:0,
      columns:[{
        label:'分类名称',
        prop: 'cat_name'
      },
      {
        label:'是否有效',
        type:'template',
        template:'isok',
      },
      {
        label:'排序',
        type:'template',
        template:'order',
      },
      {
        label:'操作',
        type:'template',
        template:'opt',
      }
      ],
      addCateDialogVisible:false,
      addCateForm:{
        cat_name:'',
        cat_pid:0,
        cat_level:0,
      },
      addCateFormRules:{
        cat_name:[
          {required:true,message:'请输入分类名称',trigger:'blur'}
        ]
      },
      parentCateList:[],
      cascaderProps:{
        value:'cat_id',
        label:'cat_name',
        children:'children',
      },
      selectedKeys:[],
      editDialogVisible:false,
      editForm:{
        cat_name:''
      },
      editRules:{
        cat_name:[{required:true,message:'请输入类别名称',trigger:'blur'}]
      },
      editId:0,
    }
  },
  methods:{
    async getCateList(){
      const{data:res}=await this.$http.get('categories',{params:this.queryInfo})
      if(res.meta.status!==200) return this.$message.error('获取商品分类失败')
      this.catelist=res.data.result
      this.total=res.data.total
    },
    handleSizeChange(newsize){
      this.queryInfo.pagesize=newsize
      this.getCateList()
    },
    handleCurrentChange(newpage){
      this.queryInfo.pagenum=newpage
      this.getCateList()
    },
    showAddCateDialog(){
      this.getParentCateList()
      this.addCateDialogVisible=true 
    },
    async getParentCateList(){
      const{data:res}=await this.$http.get('categories',{params:
      {type:2}})
      if(res.meta.status!==200) return this.$message.error('获取数据失败')
      this.$message.success('获取父级数据成功')
      this.parentCateList=res.data
    },
    parentCateChange(){
      // 如果selectKeys数组中的length大于0，证明选中父级分类
      if(this.selectedKeys.length>0){
        this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
        this.addCateForm.cat_level=this.selectedKeys.length
        return 
      }else{
        this.addCateForm.cat_pid=0
        this.addCateForm.cat_level=0
      }
    },
    addCate(){
      this.$refs.addCateFormRuleForm.validate(async valid=>{
        if(!valid)return this.$message.error('输入格式不正确')
        const{data:res}=await this.$http.post('categories',this.addCateForm)
        if(res.meta.status!=201)return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible=false
      })
    },
    addCloseDialogVisible(){
      this.$refs.addCateFormRuleForm.resetFields()
      this.selectedKeys=[]
      this.addCateForm.cat_pid=0
      this.addCateForm.cat_level=0
    },
    editDialogShow(cate){
      this.editForm.cat_name=cate.cat_name
      this.editId=cate.cat_id
      this.editDialogVisible=true
    },
    async editConfirm(id){
      const{data:res}=await this.$http.put(`categories/${id}`,this.editForm)
      if(res.meta.status!==200) return this.$message.error('更改分类名称失败！')
      this.$message.success('更改分类名称成功！')
      this.editDialogVisible=false
      this.getCateList()
    },
    async removeCate(id){
      const confirm=await this.$confirm('此操作将永久删除该类别, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
      if(confirm!=='confirm') return this.$message.info('取消删除操作！')
      const{data:res}=await this.$http.delete(`categories/${id}`)
      if(res.meta.status!==200)return this.$message.error('删除类别失败！')
      this.$message.success('删除类别成功！')
    }
  },
  created(){
    this.getCateList()
  }
}
</script>

<style lang='less' scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>