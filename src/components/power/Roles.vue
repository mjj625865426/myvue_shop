<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加用户按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleslist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 == 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 -->
                <el-row
                  :class="[i2 == 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="deltag(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      :key="item3.id"
                      v-for="item3 in item2.children"
                      closable
                      @close="deltag(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre></pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="500px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"
              >搜索</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="rightsable(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="rightsdialogVisible"
      width="50%"
      @close="setrightclosed"
    >
      <!-- 树控件 -->
      <el-tree
        :data="rightslist"
        :props="rightsProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="rightstree"
        ref="treeref"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightsdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotrights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      roleslist: [],
      // 控制分配权限
      rightsdialogVisible: false,
      // 权限 列表
      rightslist: [],
      // 权限树显示管理
      rightsProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认勾选的id
      rightstree: [],
      // 当前选择的
      roleId: ''
    }
  },
  created () {
    this.getroles()
  },
  methods: {
    async getroles () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.roleslist = res.data
    },
    // 删除标签
    async deltag (rule, id) {
      // 弹出确认框
      const delresult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(delresult)
      if (delresult !== 'confirm') return this.$message.info('取消了删除!')
      console.log('点击删除')
      // 发送axios
      const { data: res } = await this.$http.delete(`roles/${rule.id}/rights/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败!')
      // this.$message.success('删除成功!')
      rule.children = res.data
    },
    // 点击权限分配
    async rightsable (rule) {
      this.roleId = rule.id
      // 获取权限列表
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.status)
      }
      this.rightslist = res.data
      // console.log(this.rightslist)
      this.gettreelist(rule, this.rightstree)
      // 点击弹出
      this.rightsdialogVisible = true
    },
    // 递归 获取权限接口下三级id
    gettreelist (node, list) {
      // console.log(node.children)
      if (!node.children) {
        return list.push(node.id)
      }
      // node.children
      node.children.forEach(items =>
        this.gettreelist(items, list)
      )
    },
    // 点击取消清空树id
    setrightclosed () {
      this.rightstree = []
    },
    // 点击确认绑定事件
    async allotrights () {
      // 获取全选id
      const keys = [
        ...this.$refs.treeref.getCheckedKeys(),
        ...this.$refs.treeref.getHalfCheckedKeys()
      ]
      const idkey = keys.join(',')
      // console.log(keys)
      // 发送axios
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idkey })
      if (res.meta.status !== 200) return this.$message.error('修改权限失败!')
      this.$message.success('修改权限成功!')
      this.getroles()
      // 关闭
      this.rightsdialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
