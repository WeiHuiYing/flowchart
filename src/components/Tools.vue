<template>
  <el-header class="tools flex-y-center">
    <div>
      <el-tooltip content="清空" placement="bottom">
         <i @click="clearNode" class="el-icon-delete" title="清空"></i>
      </el-tooltip>
      <el-tooltip content="删除" placement="bottom">
        <i @click="deleteNode" class="el-icon-circle-close-outline" title="删除"></i>
      </el-tooltip>
      <el-tooltip content="放大" placement="bottom">
        <i @click="zoom('out')" class="el-icon-zoom-in" title="放大"></i>
      </el-tooltip>
      <el-tooltip content="缩小" placement="bottom">
        <i @click="zoom('in')" class="el-icon-zoom-out" title="缩小"></i>
      </el-tooltip>
      <el-tooltip content="归位" placement="bottom">
        <i @click="zoom('clear')" class="el-icon-rank" title="归位"></i>
      </el-tooltip>
    </div>
  </el-header>
</template>

<script>
import {mapGetters,mapActions} from 'vuex'
export default {
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'graphState'
    ])
  },
  methods: {
    ...mapActions([
      'changSelectedNode',
      'changSelectedEdge'
    ]),
    zoom:function(type){
      let _this = this;
      switch (type) {
        case 'out':
          _this.graphState.scaleSize = _this.graphState.scaleSize + 0.1;
          break
        case 'in':
          _this.graphState.scaleSize = _this.graphState.scaleSize - 0.1;
          break
        case 'clear':
          _this.graphState.positionX = 0;
          _this.graphState.positionY = 0;
          _this.graphState.scaleSize = 1;
          break
        default:
          break
      }
    },
    // 删除节点与连接线
    deleteNode:function(){
      let _this = this;
      if(this.graphState.selectedEdge != null){
        this.$confirm('此操作将删除该连接线, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          _this.graphState.edges = _this.graphState.edges.filter(item => {
            return (item.id != _this.graphState.selectedEdge.id)
          })
          this.changSelectedEdge(null)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      }else if(this.graphState.selectedNode != null){
        this.$confirm('此操作将删除该节点与相关连接线, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          _this.graphState.nodes = _this.graphState.nodes.filter(item => {
            return (item.id != this.graphState.selectedNode.id)
          })
          _this.graphState.edges = _this.graphState.edges.filter(item => {
            return (item.source.id != _this.graphState.selectedNode.id  && item.target.id != _this.graphState.selectedNode.id)
          })
          this.changSelectedNode(null)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      }else{
        this.$message({
          showClose: true,
          message: '请选择要删除的节点或连接线',
          type: 'error'
        });
      }
    },
    // 清空节点与连接线
    clearNode:function(){
      let _this = this;
      this.$confirm('此操作将清空现在流程, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        _this.graphState.edges = [] ;
        _this.graphState.nodes = [];
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
        this.changSelectedEdge(null)
        this.changSelectedNode(null)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    }
  }
}
</script>

<style scoped>

.tools {
  min-width: 600px;
  height: 46px!important;
  border-bottom: 1px solid #6e94e0;
}

.tools i {
  height: 24px;
  color: #6e94e0;
  margin: 0 20px;
  font-size: 1.5em;
  cursor: pointer;
}

.tools i:hover {
  color: #9fe499;
}

</style>
