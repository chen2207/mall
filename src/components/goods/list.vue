<template>
  <div>
     <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" 
          clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search"
            @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
    <!-- table表格区域  -->
    <el-table :data="goodslist" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="商品名称" prop="goods_name"></el-table-column>
      <el-table-column label="商品价格(元)" prop="goods_price" width="100px"></el-table-column>
      <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
      <el-table-column label="创建时间" prop="add_time" width="160px">
        <template slot-scope="scope">
          {{scope.row.add_time | dateFormat}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130px">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showedit(scope.row)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
        </template>
      </el-table-column>

    </el-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 7, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total" background>
    </el-pagination>
    </el-card>
    <!-- 编辑功能 -->
    <el-dialog
      title="修改商品"
      :visible.sync="editDialogVisible"
      width="50%">
      <el-form :model="editForm" :rules="EditRules" ref="EditRef" label-width="100px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editconfirm()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data(){
    return{
      // 查询参数对象
      queryInfo:{
        query:'',//查找
        pagenum:1,
        pagesize:10,
      },
      // 商品列表
      goodslist:[],
      total:0,
      editDialogVisible:false,
      editForm:{
        goods_name:'',
        goods_price:0,
        goods_number:0,
        goods_weight:0,
        goods_cat:"1,2,3"
      },
      EditRules:{
        goods_name:[{required:true,message:'请输入商品名称！',trigger:'blur'}],
        goods_price:[{required:true,message:'请输入商品名称！',trigger:'blur'}],
        goods_number:[{required:true,message:'请输入商品名称！',trigger:'blur'}],
        goods_weight:[{required:true,message:'请输入商品名称！',trigger:'blur'}],
      },
      editId:0,
    }
  },
  methods:{
    async getGoodsList(){
      const{data:res}=await this.$http.get('goods',{params:this.queryInfo} )
      if(res.meta.status!==200)return this.$message.error('获取商品列表失败！')
      this.$message.success('获取商品列表成功')
      this.goodslist=res.data.goods
      this.total=res.data.total
    },
    handleSizeChange(newSize){
      this.queryInfo.pagesize=newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum=newPage
      this.getGoodsList()
    },
    async removeById(id){
      const confirmResult=await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(confirmResult!=='confirm'){
          return this.$message.info('已经取消删除')
        }
        const{data:res}=await this.$http.delete(`goods/${id}`)
        if(res.meta.status!=200){
          return this.$message.error('删除失败！')
        }
        this.$message.success('删除成功')
        this.getGoodsList()
    },
    goAddPage(){
      this.$router.push('/goods/add')
    },
    showedit(goods){
      this.editForm.goods_name=goods.goods_name
      this.editForm.goods_price=goods.goods_price
      this.editForm.goods_number=goods.goods_number
      this.editForm.goods_weight=goods.goods_weight
      // this.editForm.goods_cat=goods.goods_cat
      this.editId=goods.goods_id
      this.editDialogVisible=true
    },
    async editconfirm(){
      const{data:res}=await this.$http.put(`goods/${this.editId}`,this.editForm)
      if(res.meta.status!==200)return this.$message.error('编辑商品失败！')
      this.$message.success('编辑商品成功！')
      this.getGoodsList()
      this.editDialogVisible=false
    }
  },
  created(){
    this.getGoodsList()
  }
}
</script>

<style lang="less" scoped>

</style>