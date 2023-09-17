Doc = {};
Graph = {};
Network = {}
VueApp = {}
DocPath=""
UnsavedChanges = false;

const resetDoc = () => {
  Doc = {};
  Graph = {};
  Network = {};
  VueApp = {}
  DocPath=""
};

const initVue = () => {
  VueApp = new Vue({
    el: "#block",
    data: {
        isEditing: false,
        blockSelected:false,
        blockData : {id:"",title:"",text:""},
        status:0,
        fontSize:18
    },
    methods: {
        increaseFontSize() {
          this.fontSize += 2; // Increase font size by 2 pixels
        },
        decreaseFontSize() {
            if (this.fontSize > 12) { // Ensure a minimum font size
                this.fontSize -= 2; // Decrease font size by 2 pixels
            }
        },
        closeIfOpen(blockId){
          // use this if you are deleteting a node from the graph and if its also open in the editor. no need to save things 
          if(this.status !=0){
            if(this.blockData.id==blockId){
              this.blockSelected = false
              this.status=0  
              this.blockData = {}
            }
          }
        },
        closeEditor(){
          if(this.status != 0){
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
          renderMaths()
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

const initGraph = () => {
  let nodes = [];
  let bfs = null
  try {
    bfs = blockPage.graph.BreadthFirstSearch(Doc.graphs.knowledge,"main")
  } catch (error) {
    bfs = {vertices:{}}
  }
  
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
      VueApp.closeIfOpen(nodeData.nodes[0])
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
  Split(["#graph", "#block"], {
    sizes: [70, 30],
    minSize: [300, 100],
    expandToMin: true,
  });

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
};


const addNewBlock=()=>{
  newId = `block-${Doc.blocks.length+1}`
  newTitle=`${newId}`
  newBlock = `.[${newId}] ${newTitle}\n`
  Doc = blockPage.action.doAddNewBlock(Doc,newBlock)
  //console.log(Doc)
  refreshNetworkEdges()
  UnsavedChanges = true
  return {id:newId,label:newTitle,level:2,group:"first"}
  
}

const deleteBlock = (blockId)=>{
  Doc = blockPage.action.doDeleteBlock(Doc,blockId)
  //console.log(Doc)
  UnsavedChanges = true
  // refreshNetworkEdges()
}

const addEdge = (from,to,label="part")=>{
  newAppendBlock = `+[${from}]\n~[${label},${to}]`
  Doc = blockPage.action.doAddNewBlock(Doc,newAppendBlock)
  console.log(Doc)
  //console.log(Doc)
  UnsavedChanges = true
  refreshNetworkEdges()
}

const deleteEdge = (from ,to) => {
  Doc = blockPage.action.doDeleteKGEdge(Doc,from,to)
  //console.log(Doc)
  UnsavedChanges = true
  refreshNetworkEdges()
}

const updateBlock = (blockId,changes)=>{
  Doc = blockPage.action.doEditBlock(Doc,blockId+"",changes)
  refreshNetworkEdges()
  UnsavedChanges = true
  return Doc.data[blockId]
}

const refreshNetworkEdges = ()=>{
  let nodes = [];
  console.log(Doc)
  let bfs = null
  try {
    bfs = blockPage.graph.BreadthFirstSearch(Doc.graphs.knowledge,"main")    
  } catch (error) {
    bfs = {vertices:{}}  
  }
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
  console.log(text)
  resetDoc();
  initVue();
  Doc = blockPage.encode(text.fileData);
  console.log(Doc)
  if(!Doc.data['main']){
    mainBlock =`.[main] Central Idea\n`
    Doc = blockPage.action.doAddNewBlock(Doc,mainBlock)
  }
  DocPath = text.filePath
  initGraph();
};
