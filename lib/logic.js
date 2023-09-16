Split(["#graph", "#block"], {
  sizes: [70, 30],
  minSize: [300, 100],
  expandToMin: true,
});

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
   //   window.MathJax.Queue(["Typeset", window.MathJax.Hub], 'editor');
  },1000)
}


Doc = {};
Graph = {};
Network = {}
VueApp = {}

const resetDoc = () => {
  Doc = {};
  Graph = {};
  Network = {};
  VueApp = {}
};

const initVue = () => {};

const initGraph = () => {
  let nodes = [];

  bfs = blockPage.graph.BreadthFirstSearch(Doc.graphs.knowledge,"main")
  Doc.blocks.map(block=>{
    theLevel = 2 // default level is 2
    if (block=="main") theLevel = 1
    if (bfs.vertices[block]){
      theLevel  = bfs.vertices[block]["weight"] + 1
    }
    nodes.push({
      id:block,
      label: Doc.data[block].title, 
      group: block=="main"? "root" : "first" ,
      level: theLevel
    })
  })
  let edges = []
  Doc.graphs.knowledge.edges.map(edge=>{
    edges.push({ from : edge.v1 , to : edge.v2 ,label : edge.label })
  })


  Graph= {
    nodes : new vis.DataSet(nodes),
    edges : new vis.DataSet(edges)
  }
  // initialize your network!
  
  let container = document.getElementById("mynetwork");
  let options = getGraphOptions()
  options.manipulation = {
    enabled: true,
    addNode: function(nodeData,callback) {
      let newNode = addNewBlock()
      callback(newNode);
    },
    deleteNode : function(nodeData,callback) {
      deleteBlock(nodeData.nodes[0])
      callback(nodeData);
    },
    addEdge: function(edgeData,callback) {
      if (edgeData.from != edgeData.to) {
        addEdge(edgeData.from,edgeData.to,edgeData.label)
        callback(edgeData);
      }
      else {
        console.log("Error cannot connect to itself")
      }
    },
    deleteEdge: function(edge,callback){
      console.log(edge)
      edgeData = Graph.edges.get(edge["edges"][0])
      deleteEdge(edgeData.from,edgeData.to)
      console.log(edgeData)
      callback(edge)
    }
  }
  Network = new vis.Network(container, Graph,options );

  Network.on("click", function (params) {
    if(params.nodes.length==1){
      blockId = params.nodes[0]
      VueApp.loadPreview(blockId)
    }
    if(params.nodes.length==0){
      VueApp.closeEditor()
    }
  });
  Network.on("doubleClick", function (params) {
    if(params.nodes.length==1){
      blockId = params.nodes[0]
      VueApp.loadPreview(blockId,true)
    }
  });

  VueApp = new Vue({
    el: "#block",
    data: {
        isEditing: false,
        blockSelected:false,
        blockData : {
          id:"",
          title:"",
          text:""
        },
        status:0
    },
    methods: {
        closeEditor(){
          if(this.status !=0){
            this.savePreviewBeforeLeaving()
            this.blockSelected = false
            this.status=0
          }
        },
        savePreviewBeforeLeaving(){
          if(this.status==0){
            // the editor what just initialized 
            this.status = 1
          }else{
            this.saveChanges()
          }
          this.blockData = {}
        },
        loadPreview(blockId,edit=false) {
            this.savePreviewBeforeLeaving()
            let bData = { ... Doc.data[blockId] }
            this.blockData = {id:blockId, preview:bData.text, title:bData.title,text:bData.source.first } ;
            //console.log(this.blockData)
            this.blockSelected = true
            if(edit){
              this.editPreview()
            }    
            renderMaths()
        },
        editPreview() {
            this.isEditing = true;
        },
        saveChanges() {
          // check if something changes. if yes save otherwise ignore
          let blockContent = Doc.data[this.blockData.id]
          contentChanged  = false
          if(blockContent.title != this.blockData.title){
            contentChanged = true
          }
          if(blockContent.source.first != this.blockData.text){
            contentChanged = true
          }
          if(contentChanged){
            //console.log("changes have to be saved first")
            blockContent = updateBlock(this.blockData.id,{title:this.blockData.title,text:this.blockData.text})
          } 
          this.blockData.preview = blockContent.text
          this.isEditing = false;
  
        },
        formatHtml(content) {
          // Replace newline characters with <br> tags
          if(content){
            return content.replace(/\n/g, '<br>');
          }
          else{return ""}
        }
    }
  });

};


const addNewBlock=()=>{
  newId = `block-${Doc.blocks.length+1}`
  newTitle=`${newId}`
  newBlock = `.[${newId}] ${newTitle}\n`
  Doc = blockPage.action.doAddNewBlock(Doc,newBlock)
  //console.log(Doc)
  refreshNetworkEdges()
  return {id:newId,label:newTitle,level:2,group:"first"}
  
}

const deleteBlock = (blockId)=>{
  Doc = blockPage.action.doDeleteBlock(Doc,blockId)
  //console.log(Doc)
  refreshNetworkEdges()
}

const addEdge = (from,to,label="Part")=>{
  newAppendBlock = `+[${from}]\n~[${label},${to}]`
  Doc = blockPage.action.doAddNewBlock(Doc,newAppendBlock)
  //console.log(Doc)
  refreshNetworkEdges()
}

const deleteEdge = (from ,to) => {
  Doc = blockPage.action.doDeleteKGEdge(Doc,from,to)
  //console.log(Doc)
  refreshNetworkEdges()
}

const updateBlock = (blockId,changes)=>{
  Doc = blockPage.action.doEditBlock(Doc,blockId+"",changes)
  refreshNetworkEdges()
  return Doc.data[blockId]
}

const refreshNetworkEdges = ()=>{
  let nodes = [];
  console.log(Doc)
  bfs = blockPage.graph.BreadthFirstSearch(Doc.graphs.knowledge,"main")
  //console.log(bfs)
  Doc.blocks.map(block=>{
    theLevel = 2 // default level is 2
    if (block=="main") theLevel = 1
    if (bfs.vertices[block]){
      theLevel  = bfs.vertices[block]["weight"] + 1
    }
    nodes.push({
      id:block,
      label: Doc.data[block].title, 
      group: block=="main"? "root" : "first" ,
      level: theLevel
    })
  })
  //console.log(nodes)
  let edges = []
  Doc.graphs.knowledge.edges.map(edge=>{
    edges.push({ from : edge.v1 , to : edge.v2 ,label : edge.label })
  })

  Graph.nodes.update(nodes)
  Graph.edges.update(edges)
}

const loadDocument = (text) => {
  resetDoc();
  initVue();
  Doc = blockPage.encode(text);
  initGraph();
  // console.log(Doc);
};



sampleText = `.[main] The central idea
~[part,one]
~[part,two]

.[one] One
~[part,one-one]

.[one-one] One one 
~[part,one one one]

.[one one one] One one one 

.[two] Two 
~[part,two one]

.[two one]
Sample 
`;
loadDocument(sampleText);

