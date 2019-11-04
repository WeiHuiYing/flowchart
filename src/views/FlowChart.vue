<template>
  <div class="flow-chart">
    <Tools ></Tools>
    <div class="app-main">
      <div class="left-tools">
        <ul>
          <li
            is="LeftToolBtn"
            v-for="btn in btns"
            :key="btn.value"
            :btn="btn"
            @selectedBtn="selectedBtn"
          ></li>
        </ul>
      </div>
      <div class="graph-container">
        <Graph
          @activeSelectBtn="activeSelectBtn"
        ></Graph>
        <GraphProp></GraphProp>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
// 工具栏
import Tools from '@/components/Tools'
// 左侧工具栏
import LeftToolBtn from '@/components/LeftToolBtn'
// 画布部分
import Graph from '@/components/Graph'
// 底部描述
import GraphProp from '@/components/GraphProp'
// 创建唯一的标识编码
import UUID from '@/utils/createUniqueString'
// 左侧工具栏数据
import btnsData from '@/data/btns.json'

// 测试节点数据
const testNodes = [
  {id: 1, name: '普通活动', type: 'activity', x: 200, y: 200, selected: false, r: 34},
  {id: 2, name: '普通活动', type: 'activity', x: 300, y: 300, selected: false, r: 34}
]
// 测试连接线
const testEdges = [
  {id: 1, source: testNodes[0], target: testNodes[1], selected: false}
]

export default {
  data () {
    return {
      btns: btnsData,
    }
  },
  components: {
    Tools,
    LeftToolBtn,
    Graph,
    GraphProp
  },
  computed: {
    ...mapGetters([
      'graphState'
    ])
  },
  methods: {
    ...mapActions([
      'toggle_toLink',
      'load_data'
    ]),
    loadData(){
      let data  = {};
      data.nodes = testNodes;
      data.edges = testEdges;
      this.$store.dispatch('load_data', data)
    },
    // 选择左侧列表按钮
    selectedBtn: function (btn) {
      this.btns.map(item => {
        item.active = false
      })
      btn.active = !btn.active
      let data = {};
      data.toLink = false;
      data.linkType = '';
      switch (btn.value) {
        case 'line':
          data.toLink = true;
          data.linkType = 'line';
          break
        case 'polyline':
          data.toLink = true;
          data.linkType = 'polyline';
          break
        case 'addStartEnd':
          this.addStartAndEnd()
          break
        default:
          break
      }
      this.$store.dispatch('toggle_toLink', data)
    },
    // 添加开始/结束按钮
    addStartAndEnd: function () {
      // 没有流出的节点插入结束节点
      this.nodesNoOutput().forEach(node => {
        var endNode = {
          id: UUID(),
          name: '结束',
          type: 'end',
          x: node.x + 150,
          y: node.y,
          selected: false,
          r: 34
        }
        this.graphState.nodes.push(endNode)
        this.graphState.edges.push({
          id: UUID(),
          source: node,
          target: endNode,
          selected: false})
      })
      // 没有流入的节点插入开始节点
      this.nodesNoInput().forEach(node => {
        var startNode = {
          id: UUID(),
          name: '开始',
          type: 'start',
          x: node.x - 150,
          y: node.y,
          selected: false,
          r: 34
        }
        this.graphState.nodes.push(startNode)
        this.graphState.edges.push({
          id: UUID(),
          source: startNode,
          target: node,
          selected: false
        })
      })
    },
    // 返回活动类型的节点
    filterAcivities: function () {
      return this.graphState.nodes.filter(node => node.type === 'activity')
    },
    // 没有流入的节点
    nodesNoInput: function () {
      var activties = this.filterAcivities()
      return activties.filter(node => {
        return this.graphState.edges.every(edge => {
          return edge.target !== node
        })
      })
    },
    // 没有流出的节点
    nodesNoOutput: function () {
      var activties = this.filterAcivities()
      return activties.filter(node => {
        return this.graphState.edges.every(edge => {
          return edge.source !== node
        })
      })
    },
    // 右键点击svg面板 将当前的按钮设置为选择
    activeSelectBtn: function () {
      this.btns.forEach(btn => {
        if (btn.value === 'select') {
          btn.active = true
        } else {
          btn.active = false
        }
      })
      this.$store.dispatch('toggle_toLink', false)
    },
  },
  mounted(){
    this.loadData();
  }
}
</script>

<style scoped>
  .flow-chart {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .app-main {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    width: 100%;
    height: 100%;
  }

  .graph-container {
    flex-grow: 1;
  }

  .left-tools {
    width: 160px;
    height: 100%;
    border-right: 1px solid #6e94e0;
  }

  .left-tools ul {
    padding: 0 10px;
    color: #757474;
  }
</style>
