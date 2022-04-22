<template>
  <div>
     <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
      title="添加商品信息"
      type="info"
      center
      show-icon></el-alert>
      <!-- 步骤条 -->
      <!-- active为激活项、 -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
      <!-- tab栏 -->
      <!-- v-model中绑定的是name属性 -->
      <el-tabs v-model="activeIndex" :tab-position="'left'" 
      :before-leave='beforeTabLeave'
      @tab-click='tabClicked'>
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="addForm.goods_weight" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="addForm.goods_number" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="">
            <!-- option数据源、props级联选择器配置项 -->
           <el-cascader
            v-model="addForm.goods_cat"
            prop='goods_cat'
            :options="catelist"
            expandTrigger='hover'
            :props='cateProps'
            @change="handleChange"></el-cascader>
          </el-form-item>
          </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <!-- 渲染表单的item项 -->
          <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
            <!-- 复选框 -->
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox :label="valname" v-for="(valname,i) in item.attr_vals" :key="i" border></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <!-- action表示图片要上传到后台的api接口 
          on-preview预览
          on-remove删除
          list-type 渲染的ui效果-->
          <el-upload
          class="upload-demo"
          action='http://127.0.0.1:8888/api/private/v1/upload'
          :headers="headerObj"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          list-type="picture">
          <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <quill-editor v-model="addForm.goods_introduce"></quill-editor>
          <!-- 添加商品 -->
          <el-button type="primary" class="btnadd" @click="add">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    </el-card>
    <el-dialog
     title="图片预览"
     :visible.sync="previewVisible"
     width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data(){
    return{
      activeIndex:0,
      // 添加商品的表单的数据对象
      addForm:{
        goods_name:'',
        goods_price:0,
        goods_weight:0,
        goods_cat:[],
        pics:[],
        goods_introduce:'',
        attrs:[],
      },
      addFormRules:{
        goods_name:[
          {required:'true',message:'请输入商品名称！',trigger:'blur'}
        ],
        goods_price:[
          {required:'true',message:'请输入商品价格！',trigger:'blur'}
        ],
        goods_weight:[
          {required:'true',message:'请输入商品重量！',trigger:'blur'}
        ],
        goods_number:[
          {required:'true',message:'请输入商品数量！',trigger:'blur'}
        ],
        goods_cat:[
          {required:'true',message:'请输入商品分类！',trigger:'blur'}
        ]
      },
      catelist:[],
      cateProps:{
        label:'cat_name',
        value:'cat_id',
        children:'children',
      },
      manyTableData:[],
      onlyTableData:[],
      headerObj:{
        Authorization:window.sessionStorage.getItem('token')
      },
      previewPath:'',
      previewVisible:false,
    }
  },
  methods:{
    async getCateList(){
      const{data:res}=await this.$http.get('categories')
      if(res.meta.status!==200)
      return this.$message.error('获取商品分类数据失败！')
      this.$message.success('获取商品分类数据成功')
      this.catelist=res.data
      console.log(this.catelist);
    },
    handleChange(){
      if(this.addForm.goods_cat.length!==3){
        this.addForm.goods_cat=[]
      }
    },
    beforeTabLeave(actname,oldname){
      if(oldname==='0'&&this.addForm.goods_cat.length!==3){
        this.$message.info('请先选择商品分类！')
        return false
      }
    },
    async tabClicked(){
      if(this.activeIndex==='1'){
        const{data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'many'}})
        if(res.meta.status!==200)return this.$message.error('获取动态参数列表失败！')
        this.$message.success('获取动态参数列表成功')
        res.data.forEach(item =>{
          item.attr_vals.length===0?[]:
          item.attr_vals=item.attr_vals.split(" ")
        })
        this.manyTableData=res.data
      }
      if(this.activeIndex==='2'){
        const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'only'}})
        if(res.meta.status!==200)return this.$message.error('获取静态属性列表失败！')
        this.$message.success('获取静态属性列表成功')
        this.onlyTableData=res.data
      }
    },
    handlePreview(file){
      this.previewPath=file.response.data.url 
      this.previewVisible=true
    },
    handleRemove(file){
      const filepath=file.response.data.tmp_path
      const i= this.addForm.pics.findIndex(x=>{
        x.pic===filepath
      })
      this.addForm.pcs.splice(i,1)
    },
    handleSuccess(response){
      const picInfo={pic:response.data.tmp_path}
      this.addForm.pics.push(picInfo)
    },
    add(){
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid)return this.$message.error('请填写必要的表单项')
        // 添加业务逻辑
        const form=_.cloneDeep(this.addForm)
        form.goods_cat=form.goods_cat.join(',')
        // 处理动态参数和静态属性
        this.manyTableData.forEach(item=>{
          const newInfo={
            attr_id:item.attr_id,
            attr_value:item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item=>{
          const newInfo={
            attr_id:item.attr_id,
            attr_value:item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs=this.addForm.attrs
        // 发起添加请求
        const{data:res}=await this.$http.post('goods',form)
        if(res.meta.status!==201)return this.$message.error('添加失败！')
        this.$message.success('添加成功！')
        this.$router.push('/goods')
      })
    }

  },
  created(){
    this.getCateList()
  },
  computed:{
    cateId(){
      if(this.addForm.goods_cat.length===3)
      return this.addForm.goods_cat[2]
      return null
    }
  }
}
</script>

<style lang='less' scoped>
  .el-checkbox {
    margin: 0 !important;
  }
  .previewImg {
    width: 100%;
  }
  .btnadd{
    margin-top: 15px;
  }
</style>