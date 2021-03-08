<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索添加 -->
      <el-row>
        <el-col :span="8">
          <el-input
            clearable
            v-model="queryinfo.query"
            placeholder="请输入内容"
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4"
          ><el-button class="btn" type="primary" @click="addgoods"
            >添加商品</el-button
          ></el-col
        >
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="95px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="70px"
        ></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="170px"
          ><template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <!-- 修改  -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editbtn(scope.row.goods_id)"
            ></el-button>
            <!-- 删除  -->
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-delete"
              @click="delbtn(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[5, 10, 15, 30]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询参数对象
      queryinfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 获取到的商品参数
      goodsList: [],
      // 总数据条数
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryinfo })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取数据失败！')
      this.goodsList = res.data.goods
      this.total = res.data.total
      // console.log(this.goodsList)
    },
    // 分页条数
    handleSizeChange (val) {
      this.queryinfo.pagesize = val
      this.getGoodsList()
    },
    // 分页第几页
    handleCurrentChange (val) {
      this.queryinfo.pagenum = val
      this.getGoodsList()
    },
    // 删除
    async delbtn (id) {
      const results = await this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (results !== 'confirm') return this.$message.info('用户取消了删除')
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败！')
      this.$message.success('删除成功')
      this.getGoodsList()
    },
    // 添加商品
    addgoods () {
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped>
.btn {
  margin: 0 20px;
}
</style>
