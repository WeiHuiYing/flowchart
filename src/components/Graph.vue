<template>
  <div class="container">
    <div :class="['graph', {active: graphState.isDragging}]"
      @drop="addNode"
      @dragover.prevent
    >
      <svg width="100%" height="418"
        @mousemove="svgMousemove($event)"
        @contextmenu="rightMenu($event)"
        @mousedown.right="svgMouseRightDown"
        @click="rightMenuVisible = false"
        @mouseup="svgMouseUp"
        @mousedown="svgMouseDown($event)"
        
      >
        <defs>
          <marker id="mark-arrow" viewBox="0 0 14 14" refX="8" refY="6" markerWidth="12" markerHeight="12" orient="auto">
            <path d="M2,2 L10,6 L2,10 L6,6 L2,2"/>
          </marker>
          <marker id="arrow" viewBox="0 0 14 14" refX="30" refY="6" markerWidth="12" markerHeight="12" orient="auto">
            <path d="M2,2 L10,6 L2,10 L6,6 L2,2"/>
          </marker>
        </defs>
        <g :transform="'translate(' + graphState.positionX + ','+ graphState.positionY +'),scale('+graphState.scaleSize+')'" class="graph">
          <path v-show="isLinking" class="link dragline" :d="dragData" marker-end="url(#mark-arrow)"></path>
          <g>
            <path v-for="edge in graphState.edges"
                  :key="edge.id"
                  :class="['link', {selected: edge.selected}]"
                  :d="edgeData(edge)"
                  marker-end="url(#arrow)"
                  @click="clickEdge(edge)"
            ></path>
          </g>
          <g>
            <g v-for="node in graphState.nodes"
               :key="node.id"
               :class="['conceptG', {selected: node.selected, toLink: graphState.toLink}]"
               :transform="'translate('+node.x+','+node.y+')'"
               @mousedown.stop="nodeMousedown(node)"
               @mouseup="nodeMouseup(node)"
            >
              <circle :r="node.r"></circle>
              <text text-anchor="middle">
                <tspan>{{node.name}}</tspan>
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
    <RightMenu v-if="rightMenuVisible" :node='mousedownNode' @close="rightMenuVisible = false"></RightMenu>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import RightMenu from './RightMenu'

var nodeId = 3
var edgeId = 2
const svgDx = 165
const svgDy = 50
export default {
  data () {
    return {
      mousedownNode: null,
      mousedownEdge: null,
      justDrag: true,
      isLinking: false,
      dragData: '',
      rightMenuVisible:false,
      moveGraph:false,
      moveStart:{},
      startState:{}
    }
  },
  computed: {
    ...mapGetters([
      'graphState'
    ])
  },
  components: {
    RightMenu
  },
  methods: {
    ...mapActions([
      'changSelectedNode',
      'changSelectedEdge'
    ]),
    // 线的绘制
    edgeData: function (edge) {
      if(edge.type == 'polyline'){
        return this.polyEdge(edge.source,edge.target)
      }else{
        return 'M' + edge.source.x + ',' + edge.source.y +
              ' L' + edge.target.x + ',' + edge.target.y
      }
    },
    polyEdge:function(start,end){
        var d = start;
        var des = end;
        var mid_x = (d.x + des.x)/2,
            mid_y = (d.y + des.y)/2;
        var dif_x = des.x - d.x,
            dif_y = des.y - d.y;
        var link;
        if (Math.abs(dif_x) > Math.abs(dif_y)) { // 左右连线
          if (dif_x > 0 && dif_y > 0) { //第一象限（200,200-300,300）
            // <path d="M 200,200 L 245,200 M 245,200 A 5,5,0,0,1 250,205 M 250,205 L 250,295 M 250,295 A 5,5,0,0,0 255,300 M 255,300 L 300,300" fill="none" stroke="#F18C16" stroke-width="1"></path>
            link = 'M' + d.x + ',' + d.y + 'L' + (mid_x-5) + ',' + d.y + 'M' + (mid_x-5) + ',' + d.y + 'A 5,5,0,0,1 ' + mid_x + ',' + (d.y+5) + 
              'M' + mid_x + ',' + (d.y+5) + 'L' + mid_x + ',' + (des.y-5) +'M' + mid_x + ',' + (des.y-5) + 'A 5,5,0,0,0' + (mid_x+5) + ',' + des.y + 
              'M' + (mid_x+5) + ',' + des.y + 'L' + des.x + ',' + des.y;
          }
          if (dif_x < 0 && dif_y > 0) { //第二象限（200,200-100,300）
            // <path d="M 200,200 L 155,200 M 155,200 A 5,5,0,0,0 150,205 M 150,205 L 150,295 M 150,295 A 5,5,0,0,1 145,300 M 145,300 L 100,300" fill="none" stroke="#F18C16" stroke-width="1"></path> 
            link = 'M' + d.x + ',' + d.y + 'L' + (mid_x+5) + ',' + d.y + 'M' + (mid_x+5) + ',' + d.y + 'A 5,5,0,0,0 ' + mid_x + ',' + (d.y+5) + 
              'M' + mid_x + ',' + (d.y+5) + 'L' + mid_x + ',' + (des.y-5) +'M' + mid_x + ',' + (des.y-5) + 'A 5,5,0,0,1' + (mid_x-5) + ',' + des.y + 
              'M' + (mid_x-5) + ',' + des.y + 'L' + des.x + ',' + des.y;
          }
          if (dif_x < 0 && dif_y < 0) { //第三象限（200,200-100,100）
            // <path d="M 200,200 L 155,200 M 155,200 A 5,5,0,0,1 150,195 M 150,195 L 150,105 M 150,105 A 5,5,0,0,0 145,100 M 145,100 L 100,100" fill="none" stroke="#F18C16" stroke-width="1"></path>
            link = 'M' + d.x + ',' + d.y + 'L' + (mid_x+5) + ',' + d.y + 'M' + (mid_x+5) + ',' + d.y + 'A 5,5,0,0,1 ' + mid_x + ',' + (d.y-5) + 
              'M' + mid_x + ',' + (d.y-5) + 'L' + mid_x + ',' + (des.y+5) +'M' + mid_x + ',' + (des.y+5) + 'A 5,5,0,0,0' + (mid_x-5) + ',' + des.y + 
              'M' + (mid_x-5) + ',' + des.y + 'L' + des.x + ',' + des.y;
          }
          if (dif_x > 0 && dif_y < 0) { //第四象限（200,200-300,100）
            // <path d="M 200,200 L 245,200 M 245,200 A 5,5,0,0,0 250,195 M 250,195 L 250,105 M 250,105 A 5,5,0,0,1 255,100 M 255,100 L 300,100" fill="none" stroke="#F18C16" stroke-width="1"></path>
            link = 'M' + d.x + ',' + d.y + 'L' + (mid_x-5) + ',' + d.y + 'M' + (mid_x-5) + ',' + d.y + 'A 5,5,0,0,0 ' + mid_x + ',' + (d.y-5) + 
              'M' + mid_x + ',' + (d.y-5) + 'L' + mid_x + ',' + (des.y+5) +'M' + mid_x + ',' + (des.y+5) + 'A 5,5,0,0,1' + (mid_x+5) + ',' + des.y + 
              'M' + (mid_x+5) + ',' + des.y + 'L' + des.x + ',' + des.y;
          }
        } else { // 上下连线
          if (dif_x > 0 && dif_y > 0) { //第一象限（200,200-300,300）
            // <path d="M 100,100 L 100,145 M 100,145 A 5,5,0,0,0 105,150 M 105,150 L 195,150 M 195,150 A 5,5,0,0,1 200,155 M 200,155 L 200,200" fill="none" stroke="#0096f2" stroke-width="1"></path>
            link = 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + (mid_y-5) + 'M' + d.x + ',' + (mid_y-5) + 'A 5,5,0,0,0 ' + (d.x+5) + ',' + mid_y + 
              'M' + (d.x+5) + ',' + mid_y + 'L' + (des.x-5) + ',' + mid_y +'M' + (des.x-5) + ',' + mid_y + 'A 5,5,0,0,1' + des.x + ',' + (mid_y+5) + 
              'M' + des.x + ',' + (mid_y+5) + 'L' + des.x + ',' + des.y;
          }
          if (dif_x < 0 && dif_y > 0) { //第二象限（200,200-100,300）
            // <path d="M 200,200 L 200,245 M 200,245 A 5,5,0,0,1 195,250 M 195,250 L 105,250 M 105,250 A 5,5,0,0,0 100,255 M 100,255 L 100,300" fill="none" stroke="#0096f2" stroke-width="1"></path>
            link = 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + (mid_y-5) + 'M' + d.x + ',' + (mid_y-5) + 'A 5,5,0,0,1 ' + (d.x-5) + ',' + mid_y + 
              'M' + (d.x-5) + ',' + mid_y + 'L' + (des.x+5) + ',' + mid_y +'M' + (des.x+5) + ',' + mid_y + 'A 5,5,0,0,0' + des.x + ',' + (mid_y+5) + 
              'M' + des.x + ',' + (mid_y+5) + 'L' + des.x + ',' + des.y;
          }
          if (dif_x < 0 && dif_y < 0) { //第三象限（200,200-100,100）
            // <path d="M 200,200 L 200,155 M 200,155 A 5,5,0,0,0 195,150 M 195,150 L 105,150 M 105,150 A 5,5,0,0,1 100,145 M 100,145 L 100,100" fill="none" stroke="#0096f2" stroke-width="1"></path>
            link = 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + (mid_y+5) + 'M' + d.x + ',' + (mid_y+5) + 'A 5,5,0,0,0 ' + (d.x-5) + ',' + mid_y + 
              'M' + (d.x-5) + ',' + mid_y + 'L' + (des.x+5) + ',' + mid_y +'M' + (des.x+5) + ',' + mid_y + 'A 5,5,0,0,1' + des.x + ',' + (mid_y-5) + 
              'M' + des.x + ',' + (mid_y-5) + 'L' + des.x + ',' + des.y;
          }
          if (dif_x > 0 && dif_y < 0) { //第四象限（200,200-300,100）
            // <path d="M 200,200 L 200,155 M 200,155 A 5,5,0,0,1 205,150 M 205,150 L 295,150 M 295,150 A 5,5,0,0,0 300,145 M 300,145 L 300,100" fill="none" stroke="#0096f2" stroke-width="1"></path>
            link = 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + (mid_y+5) + 'M' + d.x + ',' + (mid_y+5) + 'A 5,5,0,0,1 ' + (d.x+5) + ',' + mid_y + 
              'M' + (d.x+5) + ',' + mid_y + 'L' + (des.x-5) + ',' + mid_y +'M' + (des.x-5) + ',' + mid_y + 'A 5,5,0,0,0' + des.x + ',' + (mid_y-5) + 
              'M' + des.x + ',' + (mid_y-5) + 'L' + des.x + ',' + des.y;
          }
        }
        return link;
      
    },
    // 添加节点
    addNode: function (e) {
      var jsonStr = e.dataTransfer.getData('item')
      var jsonObj = JSON.parse(jsonStr)
      this.graphState.nodes.push({
        id: nodeId++,
        name: jsonObj.name,
        type: jsonObj.type,
        x: e.x - svgDx,
        y: e.y - svgDy,
        selected: false,
        r: 34
      })
    },
    // 将所有 节点 设置为未选中
    unSelectedNodes: function () {
      this.graphState.nodes.map(function (node) {
        node.selected = false
      })
    },
    // 将所有 连接线 设置为未选中
    unSelectedEdges: function () {
      this.graphState.edges.map(function (edge) {
        edge.selected = false
      })
    },
    // 将所有 连接线/连接点 设置为未选中
    unSelectedAll: function () {
      this.unSelectedNodes()
      this.unSelectedEdges()
    },
    // 将当前节点设置为选中
    nodeMousedown: function (node) {
      this.unSelectedAll()
      node.selected = true
      this.changSelectedNode(node)
      // this.$store.dispatch('changSelectedNode', node)
      this.mousedownNode = node
      if (this.graphState.toLink) {
        this.isLinking = true
        this.justDrag = false
      }
    },
    //连接两个节点
    nodeMouseup: function (node) {
      if (this.mousedownNode !== node) {
        var edge = {
          id: edgeId++,
          source: this.mousedownNode,
          target: node,
          selected: false,
          type:this.graphState.linkType
        }
        this.graphState.edges.push(edge)
      }
    },
    clickEdge:function(edge){
      let _this = this;
      _this.unSelectedAll();
      edge.selected = true
      _this.mousedownEdge = edge;
      this.changSelectedEdge(edge);
    },
    // 右侧菜单
    rightMenu: function (e) {
      let _this = this;
      if(_this.rightMenuVisible){
        _this.rightMenuVisible = false;
      }else{
        _this.rightMenuVisible = true;
      }
      e.preventDefault()
      return false;
    },
    svgMouseRightDown: function () {
      this.$emit('activeSelectBtn')
    },
    svgMouseDown:function(e){
      let _this = this;
      _this.moveGraph = true;
      _this.moveStart = e;
      _this.startState ={};
      _this.startState.positionX = this.graphState.positionX
      _this.startState.positionY = this.graphState.positionY
    },
    svgMouseUp: function () {
      this.mousedownNode = null
      this.dragData = ''
      this.isLinking = false;
      this.justDrag = true;
      this.moveGraph = false;
    },
    // 鼠标移动事件
    svgMousemove: function (e) {
      var node = this.mousedownNode;
      if (node) {
        this.rightMenuVisible = false;
        if (this.isLinking) { // link node
          if(this.graphState.linkType == 'polyline'){
            let end={};
            end.x = (e.x - svgDx-this.graphState.positionX)/this.graphState.scaleSize;
            end.y = (e.y - svgDy-this.graphState.positionY)/this.graphState.scaleSize;
            this.dragData = this.polyEdge(node,end)
          }else{
            this.dragData = 'M' + node.x + ',' + node.y +
                          'L' + (e.x - svgDx-this.graphState.positionX)/this.graphState.scaleSize + ',' + (e.y - svgDy-this.graphState.positionY)/this.graphState.scaleSize
          }
          
        }
        if (this.justDrag) { // drag node
          var dx = Math.abs(e.x - this.graphState.positionX - node.x - svgDx)/this.graphState.scaleSize
          var dy = Math.abs(e.y - this.graphState.positionY - node.y - svgDy)/this.graphState.scaleSize
          if (dx > node.r) {
            node.x =  (e.x - svgDx -this.graphState.positionX)/this.graphState.scaleSize
          } else {
            node.x =  node.x + e.movementX 
          }
          if (dy > node.r) {
            node.y =  (e.y - svgDy -this.graphState.positionY)/this.graphState.scaleSize
          } else {
            node.y = node.y + e.movementY 
          }
        }
      }else if(this.moveGraph){
        let data ={};
        data.positionX = e.x - this.moveStart.x + this.startState.positionX
        data.positionY = e.y - this.moveStart.y + this.startState.positionY
        this.$store.dispatch('change_position', data)
      }
    },
  },
  mounted(){
    
  }
}
</script>

<style scoped>
.container {
  height: 80%;
  padding: 4px;
  position: relative;
}

.graph {
  height: 100%;
  border: 1px solid transparent;
  background: url('../assets/wf_edit_bg.gif');
  overflow: hidden;
}

.graph.active {
  border: 1px dashed #5cdc5c;
}

svg {
  height: 100%;
}

marker {
  fill: #3c39f2;
}

g.conceptG.toLink {
  cursor: crosshair;
}

g.conceptG circle {
  fill: #F6FBFF;
  stroke: #6164c1;
  stroke-width: 1px;
}

g.conceptG.selected circle {
  fill: #e8d0ef;
  stroke: #9b78d3;
  stroke-width: 1.5px;
}

g.conceptG:hover circle {
  fill: rgb(200, 238, 241);
}

g.selected circle {
  fill: #e8d0ef;
  stroke: #9b78d3;
  stroke-width: 1.5px;
}

path.link.selected {
  stroke: #9b78d3;
}

g.selected:hover circle {
  fill: #e8d0ef;
}

g.conceptG text {
  font-size: 12px;
  fill: #151996;
}

path.link {
  fill: none;
  stroke: #a6a6f2;
  stroke-width: 2px;
  cursor: default;
}

path.link:hover {
  stroke: rgb(94, 196, 204);
}

tspan {
  user-select: none
}
</style>
