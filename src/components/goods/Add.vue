<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        :closable="false"
        show-icon
      >
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        align-center
        :active="isactiveindex - 0"
        finish-status="success"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏 -->
      <el-form
        :model="addForm"
        :rules="addFormrules"
        ref="addFormref"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :before-leave="beforetableleave"
          v-model="isactiveindex"
          :tab-position="'left'"
          @tab-click="tabClickked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item prop="goods_name" label="商品名称">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item prop="goods_price" label="商品价格">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item prop="goods_weight" label="商品重量">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item prop="goods_number" label="商品数量">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateprops"
                @change="catehandleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单项 -->
            <el-form-item
              :key="item.attr_id"
              v-for="item in manytablelist"
              :label="item.attr_name"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  v-for="(item1, i) in item.attr_vals"
                  :key="i"
                  :label="item1"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :key="item.attr_id"
              :label="item.attr_name"
              v-for="item in onlytablelist"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="uploadsuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 按钮 -->
            <el-button @click="quill" class="addbtn" type="primary"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <!-- 预览图片功能 -->
      <el-dialog title="提示" :visible.sync="previewdialogVisible" width="50%">
        <img :src="previewpath" alt="" class="img" />
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
// 导入 lodash
import _ from 'lodash'
export default {
  created () {
    // 获取分类数据
    this.getCateList()
  },
  data () {
    return {
      isactiveindex: '0',
      // 存储tab栏的信息
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        // 级联选择的数组
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 校验规则
      addFormrules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      // 保存获取到的商品分类
      cateList: [],
      // 级联配置
      cateprops: {
        expandTrigger: 'hover',
        children: 'children',
        value: 'cat_id',
        label: 'cat_name'
      },
      // 动态参数列表
      manytablelist: [],
      // 静态参数列表
      onlytablelist: [],
      // 上传的默认图片
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 没有调用axios 图片上传组件的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 保存图片预览地址
      previewpath: '',
      // 控制是否弹出dialog预览图片
      previewdialogVisible: false
    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 当级联选择发生变化
    catehandleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return
      }
      console.log(this.addForm.goods_cat)
    },
    // 增加事件
    beforetableleave (activeName1, oldActiveName) {
      // activeName 是跳转的
      // oldActiveName 是从哪跳转
      // 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。
      // console.log('第' + activeName)
      // console.log('第' + oldActiveName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类!')
        return false
      }
    },
    // 点击tab栏
    async tabClickked () {
      // console.log(this.isactiveindex)
      // console.log(this.cateId)
      if (this.isactiveindex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error('获取数据失败!')
        this.$message.success('获取数据成功!')
        res.data.forEach(items => {
          items.attr_vals = items.attr_vals.length === 0 ? [] : items.attr_vals.split(' ')
        })
        this.manytablelist = res.data
        console.log(this.manytablelist)
      } else if (this.isactiveindex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error('获取数据失败!')
        this.$message.success('获取数据成功!')
        this.onlytablelist = res.data
        // console.log(this.onlytablelist)
      }
    },
    // upload查看图片
    handlePreview (file) {
      // console.log(file.response.data.url)
      this.previewpath = file.response.data.url
      this.previewdialogVisible = true
    },
    // upload删除图片
    handleRemove (file) {
      // 获取临时路径
      const filepath = file.response.data.tmp_path
      // 根据临时路径拿到数组索引
      const i = this.addForm.pics.findIndex(x =>
        x.pic === filepath
      )
      // 删除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 上传成功
    uploadsuccess (response) {
      console.log(response)
      // 创建拼接
      const pics = { pic: response.data.tmp_path }
      this.addForm.pics.push(pics)
      // console.log(this.addForm)
    },
    quill () {
      // console.log(this.addForm)
      this.$refs.addFormref.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项!')
        }
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // console.log(this.manytablelist)
        this.manytablelist.forEach(item => {
          console.log(item)
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(newInfo)
        })
        this.onlytablelist.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        const { data: res } = await this.$http.post('goods', form)
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败!')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-tabs__item {
  margin: 20px 0 !important;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.img {
  width: 100%;
}
.addbtn {
  margin-top: 14px;
}
</style>
