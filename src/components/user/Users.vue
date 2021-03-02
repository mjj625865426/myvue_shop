<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 输入框 -->
      <el-row :gutter="20">
        <el-col :span="7"
          ><el-input
            placeholder="请输入内容"
            v-model="queryinfo.query"
            clearable
            @clear="getUserlist"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserlist"
            ></el-button> </el-input
        ></el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" stripe border>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userstatechanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              @click="editbtn(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              @click="deluserinfo(scope.row.id)"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
              ><el-button
                type="warning"
                icon="el-icon-setting"
                circle
              ></el-button
            ></el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!--添加用户 弹出对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="30%"
      @close="addDialogreset"
    >
      <!-- 主题区 -->
      <el-form
        :model="addForm"
        :rules="addFormrules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户信息弹出框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editdialogVisible"
      width="30%"
      @close="editdialogclose"
    >
      <!-- content内容区域 -->
      <el-form
        :model="editform"
        :rules="editformrules"
        ref="editruleform"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editform.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editform.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editform.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edituserlist">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    // 校验邮箱
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱!'))
    }
    // 校验手机号
    var checkMoblie = (rule, value, cb) => {
      const regMoblie = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMoblie.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号!'))
    }
    return {
      // 获取用户列表的参数对象
      queryinfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      total: 0,
      userlist: [],
      dialogVisible: false,
      // 添加用户对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户校验规则
      addFormrules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMoblie, trigger: 'blur' }
        ]
      },
      // 控制修改用户信息弹出层
      editdialogVisible: false,
      // 获取到的修改用户信息
      editform: {},
      // 修改信息规则验证
      editformrules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, message: '邮箱格式不正确，请重新输入', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMoblie, message: '手机号码不正确，请重新输入', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserlist()
  },
  methods: {
    async getUserlist () {
      const { data: res } = await this.$http.get('users', { params: this.queryinfo })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.total = res.data.total
      this.userlist = res.data.users
    },
    // 每页显示多少数据
    handleSizeChange (val1) {
      // console.log(val1)
      this.queryinfo.pagesize = val1
      // 重新发送请求
      this.getUserlist()
    },
    // 当前页码
    handleCurrentChange (val) {
      // console.log(val)
      this.queryinfo.pagenum = val
      this.getUserlist()
    },
    // 监听swich开关状态
    async userstatechanged (userinfo) {
      // console.log(userinfo)
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败!')
      }
      this.$message.success('更新用户状态成功!')
    },
    // 点击添加用户的关闭按钮
    addDialogreset () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定提交
    addUser () {
      this.$refs.addFormRef.validate(async (vaild) => {
        // console.log(vaild)
        if (!vaild) return
        // 如果为true 发送axios请求
        const { data: res } = await this.$http.post('users', this.addForm)
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败!')
        // 关闭对话框
        this.dialogVisible = false
        this.$message.success('添加用户成功!')
        this.getUserlist()
      })
    },
    // 点击修改按钮
    async editbtn (id) {
      // 弹出修改用户信息弹出层
      this.editdialogVisible = true
      // console.log(id)
      // 发送axios
      const { data: res } = await this.$http.get('users/' + id)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // this.$message.success(res.meta.msg)
      this.editform = res.data
    },
    // 修改重置
    editdialogclose () {
      this.$refs.editruleform.resetFields()
    },
    // 修改确定
    edituserlist () {
      this.$refs.editruleform.validate(async valid => {
        if (!valid) return
        // 发起修改信息请求
        const { data: res } = await this.$http.put('users/' + this.editform.id, {
          email: this.editform.email,
          mobile: this.editform.mobile
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 关闭对话框
        this.editdialogVisible = false
        // 刷新列表
        this.getUserlist()
        // 提示修改信息
        this.$message.success('修改用户信息成功!')
      })
    },
    // 点击删除用户
    async deluserinfo (id) {
      // console.log(id)
      const result = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(result)
      if (result !== 'confirm') {
        return this.$message.error('已取消删除!')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('已删除!')
      this.getUserlist()
      this.$message.success('确认删除!')
    }
  }
}
</script>
<style lang="less" scoped>
</style>
