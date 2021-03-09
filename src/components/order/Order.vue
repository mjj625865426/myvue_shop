<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryinfo.query"
            clearable
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="searchbtn"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- table  -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag
              effect="dark"
              v-if="scope.row.pay_status === '0'"
              type="primary"
              size="mini"
              >已付款</el-tag
            >
            <el-tag v-else effect="dark" type="danger" size="mini"
              >未付款</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160px">
          <template>
            <!-- 修改 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="修改订单地址"
              :enterable="false"
              placement="top"
            >
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="editorderaddress"
              ></el-button>
            </el-tooltip>
            <!-- 物流信息 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="物流信息"
              :enterable="false"
              placement="top"
            >
              <el-button
                size="mini"
                type="success"
                icon="el-icon-location-outline"
                @click="showprocess"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[5, 10, 15, 20, 30]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 修改订单地址 -->
      <el-dialog
        title="修改订单地址"
        :visible.sync="addressdialogVisible"
        width="50%"
        @close="closedialogedit"
      >
        <el-form
          :model="addressForm"
          :rules="addressFormrules"
          ref="addressFormref"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader
              :options="cityData"
              v-model="addressForm.address1"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addressdialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressdialogVisible = false"
            >确 定</el-button
          >
        </span>
      </el-dialog>
      <!-- 物流信息 -->
      <el-dialog
        title="物流进度"
        :visible.sync="prosessdialogVisible"
        width="50%"
      >
        <!-- 时间线 -->
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in sendprogressinfo"
            :key="index"
            :timestamp="activity.time"
          >
            {{ activity.context }}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import cityData from './citydata'
export default {
  created () {
    this.getOrderList()
  },
  data () {
    return {
      // 发送给order
      queryinfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 获取到的order数据
      orderlist: [],
      // 数量
      total: 0,
      // 控制修改订单dialog
      addressdialogVisible: false,
      // 订单双向绑定
      addressForm: {
        address1: [],
        address2: ''
      },
      // 订单rules规则
      addressFormrules: {
        address1: [{ required: true, message: '请输入省市区/县', trigger: 'blur' }],
        address2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      // 省市区县
      cityData,
      // 控制是否显示物流信息dialog
      prosessdialogVisible: false,
      // 物流进度数据
      sendprogressinfo: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
    }
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryinfo })
      // console.log(res)
      this.orderlist = res.data.goods
      this.total = res.data.total
      // console.log(this.orderlist)
    },
    // 分页数量
    handleSizeChange (val) {
      this.queryinfo.pagesize = val
      this.getOrderList()
    },
    // 分页第几页
    handleCurrentChange (val) {
      this.queryinfo.pagenum = val
      this.getOrderList()
    },
    // 点击搜索按钮
    async searchbtn () {
      // console.log(this.queryinfo)
      // console.log(res)
    },
    // 点击修改订单地址
    editorderaddress () {
      this.addressdialogVisible = true
    },
    // 点击关闭
    closedialogedit () {
      this.$refs.addressFormref.resetFields()
    },
    // 点击物流信息按钮
    showprocess () {
      this.prosessdialogVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100% !important;
}
.el-cascader-node {
  width: 200px !important;
}
</style>
