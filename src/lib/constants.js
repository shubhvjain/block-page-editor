let Themes  = {
  dark: {
    group: {
      root: {
        shape: "box",
        margin: 10,
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
        font : { size:20},
        widthConstraint: {
          maximum: 300,
        },
      },
      first: {
        shape: "box",
        margin: 10,
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
        font : { size:20},
        widthConstraint: {
          maximum: 300,
        },
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
      randomSeed: "seed",
      hierarchical: {
        direction: "LR",
        nodeSpacing: 100,
        levelSeparation: 200,
        sortMethod:"hubsize",

      },
    },
  }
  return options
}

window.MathJax.Hub.Config({
  showMathMenu: false,
  tex2jax: { inlineMath: [["$", "$"]],displayMath:[["$$", "$$"]] },
  menuSettings: { zoom: "Double-Click", zscale: "150%" },
  CommonHTML: { linebreaks: { automatic: true } },
  "HTML-CSS": { linebreaks: { automatic: true } },
  SVG: { linebreaks: { automatic: true } }
})

const renderMaths = ()=>{
  setTimeout(() => {
    window.MathJax['Hub'].Queue(["Typeset", window.MathJax.Hub], 'editor');
  },1000)
};

