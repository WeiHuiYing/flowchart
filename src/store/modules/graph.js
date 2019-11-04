const graph = {
  state: {
    graphState: {
      selectedNode: null,
      selectedEdge: null,
      isDragging: false,
      toLink: false,
      linkType:'',
      scaleSize:1,
      positionX: 0,
      positionY: 0,
      nodes: [],
      edges:[]
    }
  },
  mutations: {
    CHANGE_SELECTEDNODE: (state, node) => {
      state.graphState.selectedNode = node
    },
    CHANGE_SELECTEDEDGE: (state, edge) => {
      state.graphState.selectedEdge = edge
    },
    TOGGLE_ISDRAGGING: (state, isDragging) => {
      state.graphState.isDragging = isDragging
    },
    TOGGLE_TOLINK: (state, data) => {
      state.graphState.toLink = data.toLink
      state.graphState.linkType = data.linkType
    },
    NODES_LOAD:(state,nodes) =>{
      state.graphState.nodes = nodes
    },
    EDGES_LOAD:(state,edges) => {
      state.graphState.edges = edges;
    },
    POSITION_CHANGE:(state,data) => {
      state.graphState.positionX = data.positionX
      state.graphState.positionY = data.positionY
    }
  },
  actions: {
    changSelectedNode ({commit}, node) {
      commit('CHANGE_SELECTEDNODE', node)
      commit('CHANGE_SELECTEDEDGE', null)
    },
    changSelectedEdge ({commit}, edge) {
      commit('CHANGE_SELECTEDEDGE', edge)
      commit('CHANGE_SELECTEDNODE', null)
    },
    toggle_isDragging ({commit}, isDragging) {
      commit('TOGGLE_ISDRAGGING', isDragging)
    },
    toggle_toLink ({commit}, toLink) {
      commit('TOGGLE_TOLINK', toLink)
    },
    load_data({commit},data){
      commit('NODES_LOAD', data.nodes)
      commit('EDGES_LOAD', data.edges)
    },
    change_position({commit},data){
      commit('POSITION_CHANGE', data)
    },
  }
}

export default graph
