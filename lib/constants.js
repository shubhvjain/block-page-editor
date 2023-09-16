let Themes  = {
  dark: {
    group: {
      root: {
        shape: "box",
        color: {
          background: "#FFD369",
          border: '#FFD369',
          highlight: {
            border: '#FFD369',
            background: '#FFD369'
          },
          hover: {
            border: '#FFD369',
            background: '#FFD369'
          }
        },
        font : { size:20}
      },
      first: {
        shape: "box",
        color: {
          background: "#EEEEEE",
          border: '#EEEEEE',
          highlight: {
            border: '#EEEEEE',
            background: '#EEEEEE'
          },
          hover: {
            border: '#EEEEEE',
            background: '#EEEEEE'
          }
        },
        font : { size:20}
      },
      rest: {
        shape: "box",
        margin:3,
        // borderWidth:2,
        color: {
          border: "#222222",

          background: "#666666",
        },
        font : { size:20 , color: "#eeeeee"}
      }
    },
    edge: {
      shadow: false,
      color: {
        color: '#EEEEEE',
        highlight: '#EEEEEE',
        hover: '#EEEEEE',
      },
      font: {
        color: "#EEEEEE",
        strokeWidth: 0,
        size: 9,

      }
    }
  }
}

let selectedTheme  = "dark"



getGraphOptions = ()=>{
  t = Themes[selectedTheme] 
  const options = {
    autoResize: true,
    height: '100%',
    width: '100%',
    groups: t['group'],
    manipulation: {
      enabled: true,
    },
    locales: {
      en: {
        edit: 'Edit',
        del: 'Delete selected',
        back: 'Back',
        addNode: 'Add Block',
        addEdge: 'Add Edge',
        editNode: 'Edit Block',
        editEdge: 'Edit Edge',
        addDescription: 'Click in an empty space to place a new untitled block.',
        edgeDescription: 'Click on a node and drag the edge to another node to connect them.',
        editEdgeDescription: 'Click on the control points and drag them to a node to connect to it.',
        createEdgeError: 'Cannot link edges to a cluster.',
        deleteClusterError: 'Clusters cannot be deleted.',
        editClusterError: 'Clusters cannot be edited.'
      }
    },
    "edges": {
      ...t['edge'],
      "smooth": {
        enabled: true,
        "type": "continuous",
        "forceDirection": "vertical",
        "roundness": 0.75
      },
      arrows:{
        "to":{
          enabled:true,
          "type":"arrow",
          scaleFactor:0.25
        }
      }
    },
    layout: {
      hierarchical: {
        direction: "LR",
      },
    },
    // "physics": {
    //   enabled:true,
    //   "forceAtlas2Based": {
    //     "theta": 0.55,
    //     "gravitationalConstant": -56,
    //     "springLength": 80,
    //     "damping": 0.47,
    //     "avoidOverlap": 0.86
    //   },
    //   "minVelocity": 0.75,
    //   "solver": "forceAtlas2Based",
    //   "timestep": 0.48,
    //   "wind": {
    //     "x": 9.4,
    //     "y": -3
    //   }
    // }
    // "physics": {
    //   "forceAtlas2Based": {
    //     "theta": 0.55,
    //     "gravitationalConstant": -60,
    //     "centralGravity": 0.02,
    //     "springLength": 115,
    //     "springConstant": 0.375,
    //     "damping": 0.36,
    //     "avoidOverlap": 0.3
    //   },
    //   "maxVelocity": 67,
    //   "minVelocity": 0.75,
    //   "solver": "forceAtlas2Based",
    //   "timestep": 0.19,
    //   "wind": {
    //     "x": 6.5,
    //     "y": 0.1
    //   }
    // }
  }
  return options
}