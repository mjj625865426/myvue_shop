<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addclass">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类表格 -->
      <tree-table
        class="treetable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效区域 -->
        <template slot="isok" slot-scope="scope">
          <i
            style="color: lightgreen"
            v-if="scope.row.cat_deleted === false"
            class="el-icon-success"
          ></i>
          <i style="color: red" v-else class="el-icon-error"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-if="scope.row.cat_level === 2"
            >三级</el-tag
          >
        </template>
        <!-- 操作 -->
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加分类dialog -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="30%"
        @close="closeemptyselete"
      >
        <!-- 添加分类表单 -->
        <el-form
          ref="addclassforms"
          :rules="addclassformRules"
          :model="addclassform"
          label-width="100px"
        >
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="addclassform.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              v-model="selectkeys"
              :options="parentlist"
              :props="parentprop"
              @change="selecthandleChange"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="adddialogclass">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询条件
      queryinfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品数据列表
      catelist: [],
      // 保存总数据
      total: 0,
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        // 当前列定义为模板列,  使用名称为isok
        { label: '是否有效', type: 'template', template: 'isok' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'opt' }
      ],
      // 控制添加分类dialog
      addCateDialogVisible: false,
      // 添加分类的数据
      addclassform: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0 // 默认添加一级分类
      },
      // 添加分类校验规则
      addclassformRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 父级分类数据
      parentlist: [],
      // 父级数据配置信息
      parentprop: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 获取到的值id
      selectkeys: []
    }
  },
  created () {
    this.getcatelist()
  },
  methods: {
    // 获取分类数据
    async getcatelist () {
      const { data: res } = await this.$http.get('categories', { params: this.queryinfo })
      if (res.meta.status !== 200) return this.$message.error('获取分类失败!')
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize变化
    handleSizeChange (newsize) {
      this.queryinfo.pagesize = newsize
      this.getcatelist()
    },
    // 监听pagenum
    handleCurrentChange (newpage) {
      this.queryinfo.pagenum = newpage
      this.getcatelist()
    },
    // 添加分类按钮
    addclass () {
      this.getparentdata()
      this.addCateDialogVisible = true
    },
    // 获取添加分类下父级数据
    async getparentdata () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      // console.log(res.data)
      // 赋值
      this.parentlist = res.data
    },
    // 当select发生变化
    selecthandleChange () {
      console.log(this.selectkeys)
      // 判断对象的长度
      if (this.selectkeys.length > 0) {
        // 将数组最后一项设置为父级分类
        this.addclassform.cat_pid = this.selectkeys[this.selectkeys.length - 1]
        // 将leveljibie
        this.addclassform.cat_level = this.selectkeys.length
      } else {
        this.addclassform.cat_level = 0
        this.addclassform.cat_pid = 0
      }
    },
    // 点添加分类里面的分类按钮
    adddialogclass () {
      console.log(this.addclassform)
      this.$refs.addclassforms.validate(async valid => {
        // console.log(valid)
        if (!valid) return this.$message.error('请符合规则')
        // 发送请求
        const { data: res } = await this.$http.post('categories', this.addclassform)
        if (res.meta.status !== 201) this.$message.error('添加分类失败!')
        this.$message.success('添加分类成功!')
        // 关闭窗口
        this.addCateDialogVisible = false
        // 重新获取
        this.getcatelist()
      })
      // 预校验
      this.addCateDialogVisible = false
    },
    // 点击添加分类里面的取消按钮
    closeemptyselete () {
      // 清空
      this.$refs.addclassforms.resetFields()
      this.selectkeys = []
      this.addclassform.cat_level = 0
      this.addclassform.cat_pid = 0
      // console.log(this.selectkeys)
    }
  }
}
</script>
<style lang="less" scoped>
.treetable {
  margin-top: 15px;
}
.el-cascader {
  width: 100% !important;
}
</style>
