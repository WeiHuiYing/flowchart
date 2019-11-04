<template>
  <ul v-if="graphState.selectedNode && graphState.selectedNode != null" :style="'top:'+y+'px;left:'+x+'px'">
    <li @click="deleteNode ">
      <i class="el-icon-close"></i>删除
    </li>
    <li>
      <i class="fa fa-book" aria-hidden="true"></i>属性
    </li>
  </ul>
</template>

<script>
import {mapGetters,mapActions} from 'vuex'
export default {
  data () {
    return {
      x:0,
      y:0
    }
  },
  computed: {
    ...mapGetters([
      'graphState'
    ])
  },
  methods: {
    ...mapActions([
      'changSelectedNode'
    ]),
    loadData(){
      let _this = this;
      if(_this.graphState.selectedNode && _this.graphState.selectedNode != null){
        _this.x = _this.graphState.selectedNode.x*_this.graphState.scaleSize+_this.graphState.positionX;
        _this.y = _this.graphState.selectedNode.y*_this.graphState.scaleSize+_this.graphState.positionY;
      }
      
    },
    // 删除节点与连接线
    deleteNode:function(){
      let _this = this;
      if(this.graphState.selectedNode != null){
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
      this.$emit('close')
    },
  },
  mounted(){
    this.loadData()
  }
}
</script>

<style scoped>
  ul {
    position: absolute;
    top: 100px;
    left: 200px;
    width: 70px;
    padding: 2px 4px;
    border: 1px solid #4481bf;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    color: #4481bf;
    user-select: none;
    font-size: 12px;
    background:#fff;
  }

  ul li {
    text-align: center;
    list-style-type: none;
    padding: 4px 2px;
    cursor: pointer;
    border-radius: 3px;
  }

  ul li:hover {
    background-color: #d4d4d4;
    color: #0a6db3;
  }

  ul li i {
    margin-right: 6px;
  }
</style>
