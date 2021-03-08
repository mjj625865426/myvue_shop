<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>参数管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意:只允许为第三级分类设置相关参数!"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>
      <!-- 选择商品分类级联框 -->
      <el-row class="cat">
        <el-col>
          <span
            >选择商品分类:
            <el-cascader
              v-model="selectidkeys"
              :options="catelist"
              :props="selectprop"
              @change="selecthandleChange"
            ></el-cascader>
          </span>
        </el-col>
      </el-row>
      <!-- tab标签页 -->
      <el-tabs v-model="activetabsName" @tab-click="handletabsClick">
        <!-- 动态参数区域 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isdisabled"
            @click="adddialogVisible = true"
            >添加参数</el-button
          >
          <!-- 添加表格 -->
          <el-table :data="manytabsdata" border stripe>
            <!-- 展开列表 -->
            <el-table-column type="expand">
              <!-- 添加tag标签 -->
              <template slot-scope="scope">
                <!-- 循环tag -->
                <el-tag
                  closable
                  :key="i"
                  v-for="(item, i) in scope.row.attr_vals"
                  @close="closeexpandtag(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列表 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="editparams(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  size="mini"
                  type="warning"
                  icon="el-icon-delete"
                  @click="deleteparams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性区域 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加参数按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isdisabled"
            @click="adddialogVisible = true"
            >添加参数</el-button
          >
          <!-- 添加表格 -->
          <el-table :data="onlytabsdata" border stripe>
            <!-- 展开列表 -->
            <el-table-column type="expand">
              <!-- 添加tag标签 -->
              <template slot-scope="scope">
                <!-- 循环tag -->
                <el-tag
                  closable
                  :key="i"
                  v-for="(item, i) in scope.row.attr_vals"
                  @close="closeexpandtag(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列表 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="editparams(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  size="mini"
                  type="warning"
                  icon="el-icon-delete"
                  @click="deleteparams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加参数dialog框 -->
      <el-dialog
        :title="'请输入' + addparamsdialogtitle"
        :visible.sync="adddialogVisible"
        width="50%"
        @close="closeadddialog"
      >
        <!-- 表单 -->
        <el-form
          :model="addparamsForm"
          :rules="addparamsFormrules"
          ref="addparamsFormref"
          label-width="100px"
        >
          <el-form-item label="活动名称" prop="attr_name">
            <el-input v-model="addparamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="adddialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addparamssendaxios"
            >确 定</el-button
          >
        </span>
      </el-dialog>
      <!-- 修改参数dialog框 -->
      <el-dialog
        :title="'请输入' + addparamsdialogtitle"
        :visible.sync="editdialogVisible"
        width="50%"
        @close="closeeditdialog"
      >
        <!-- 表单 -->
        <el-form
          :model="editparamsForm"
          :rules="editparamsFormrules"
          ref="editparamsFormref"
          label-width="100px"
        >
          <el-form-item label="活动名称" prop="attr_name">
            <el-input v-model="editparamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editdialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editsend">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选择框商品分类配置信息
      selectprop: {
        expandTrigger: 'hover',
        children: 'children',
        value: 'cat_id',
        label: 'cat_name'
      },
      // 级联当前选中的分类id数组
      selectidkeys: [],
      // tabs标签默认
      activetabsName: 'many',
      // 动态数据参数
      manytabsdata: [],
      // 静态数据参数
      onlytabsdata: [],
      // 控制添加参数框
      adddialogVisible: false,
      // 添加参数里的数据
      addparamsForm: {
        attr_name: ''
      },
      // 对添加参数里的校验规则
      addparamsFormrules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }]
      },
      // 控制dialog显示
      editdialogVisible: false,
      // 修改按钮里的数据对象
      editparamsForm: {
        attr_name: ''
      },
      // 修改按钮的规则
      editparamsFormrules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }]
      },
      // 暂存的修改id
      editid: ''
    }
  },
  created () {
    this.getcatlist()
  },
  methods: {
    async getcatlist () {
      const { data: res } = await this.$http.get('categories')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取数据失败!')
      this.catelist = res.data
    },
    // 当select事件变化 发生级联
    selecthandleChange () {
      this.gettabdata()
    },
    // 点击tabs栏切换
    handletabsClick () {
      // console.log(this.activetabsName)
      this.gettabdata()
    },
    // 获取tab数据
    async gettabdata () {
      // 证明是三级
      // console.log(this.selectidkeys)
      if (this.selectidkeys.length !== 3) {
        this.selectidkeys = []
        this.manytabsdata = []
        this.onlytabsdata = []
        return
      }
      // console.log(this.selectidkeys)
      // console.log(this.cateId)
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activetabsName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数数据失败!')
      // 遍历数组中的attr_vals
      // console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //  添加控制输入框是否显示
        item.inputVisible = false
        //  输入的值
        item.inputValue = ''
      })
      // console.log(res.data)
      // 判断是many的数据还是only的数据
      if (this.activetabsName === 'many') {
        this.manytabsdata = res.data
      } else {
        this.onlytabsdata = res.data
      }
    },
    // 点击关闭对话框
    closeadddialog () {
      this.$refs.addparamsFormref.resetFields()
    },
    // dialog里面确认按钮
    addparamssendaxios () {
      // 先校验
      this.$refs.addparamsFormref.validate(async valid => {
        if (!valid) return
        // f发送请求
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addparamsForm.attr_name, attr_sel: this.activetabsName })
        if (res.meta.status !== 201) return this.$message.error('添加分类失败!')
        this.$message.success('添加分类成功!')
        this.gettabdata()
        this.adddialogVisible = false
      })
    },
    // 点击修改按钮
    async editparams (attrid) {
      // console.log(attrid)
      this.editid = attrid
      // 发请求
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrid}`, { attr_sel: this.activetabsName })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败!')
      this.editparamsForm = res.data
      // 获取数据
      this.editdialogVisible = true
    },
    // 点击关闭修改按钮
    closeeditdialog () {
      this.$refs.editparamsFormref.resetFields()
    },
    // 点击修改按钮里的确认按钮
    editsend () {
      // 预校验
      this.$refs.editparamsFormref.validate(async valid => {
        if (!valid) return this.$message.error('请输入正确参数!')
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editid}`, { attr_name: this.editparamsForm.attr_name, attr_sel: this.activetabsName })
        if (res.meta.status !== 200) this.$message.error('修改参数失败!')
        this.$message.success('修改参数成功!')
        this.editdialogVisible = false
        this.gettabdata()
      })
    },
    // 根据id删除对应参数
    async deleteparams (attrid) {
      // 弹框
      const results = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (results !== 'confirm') return this.$message.info('取消了删除!')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrid}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败!')
      this.$message.success('删除成功!')
      this.gettabdata()
    },
    // 关闭tag标签
    closeexpandtag (i, row) {
      row.attr_vals.splice(i, 1)
      this.editparamstab(row)
    },
    // 当失去焦点或者摁了enter
    handleInputConfirm (row) {
      console.log(row)
      // console.log('ok')
      // 如果用户没有输入内容
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果输入内容 添加标签
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // this.getcatlist()
      // 调用接口
      this.editparamstab(row)
    },
    // 抽离修改参数项
    async editparamstab (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ') })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('添加标签失败！')
      this.$message.success('修改参数项成功！')
    },
    // 点击了添加tag+
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  computed: {
    isdisabled () {
      // 判断级联数组长度
      if (this.selectidkeys.length !== 3) {
        return true
      }
      return false
    },
    // 级联三级id
    cateId () {
      if (this.selectidkeys.length === 3) {
        return this.selectidkeys[2]
      }
      return null
    },
    // dialog切换文本
    addparamsdialogtitle () {
      if (this.activetabsName === 'many') {
        return '动态参数'
      }
      return '静态参数'
    }
  }
}
</script>
<style lang="less" scoped>
.cat {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 150px;
}
</style>
