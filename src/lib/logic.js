Doc = {};
Graph = {};
Network = {}
VueApp = {}
DocPath=""
Resources = {}
UnsavedChanges = false;

const resetDoc = () => {
  Doc = {};
  Graph = {};
  Network = {};
  VueApp = {}
  Resources = {}
  DocPath=""
};

const initVue = () => {
  VueApp = new Vue({
    el: "#block",
    data: {
        isEditing: false,
        blockSelected:false,
        blockData : {id:"",title:"",text:"",value:{type:''}},
        status:0,
        fontSize:18,
        newBlockId:"",
        addPreview : false,
        docPreview:""
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
        saveToFile(){
          saveDataToFile().then(data=>{}).catch(err=>{console.log(err)})
        },
        addNamedBlock(){
          addNewBlock1(this.newBlockId)
          this.newBlockId = ""
        },
        closeIfOpen(blockId){
          // use this if you are deleteting a node from the graph and if its also open in the editor. no need to save things 
          if(this.status !=0){
            if(this.blockData.id==blockId){
              this.blockSelected = false
              this.status=0  
              this.blockData = {id:"",title:"",text:"",value:{type:''}}
            }
          }
        },
        closeEditor(){
          if(this.status != 0){
            this.saveBeforeLeaving()
            this.blockSelected = false
            this.status=0
          }
        },
        saveBeforeLeaving(){
          if(this.status==0){
            // the editor what just initialized 
            this.status = 1
          }else{
            this.saveChanges()
          }
          this.blockData = {id:"",title:"",text:"",value:{type:''}}
        },
        async loadPreview(blockId,edit=false) {
            this.saveBeforeLeaving()
            let bData = { ... Doc.data[blockId] }
            this.blockData = {id:blockId, preview:bData.text, title:bData.title,text:bData.source.first, value:bData.value } ;
            //console.log(this.blockData)
            if(bData.value['type']){
              this.addPreview = true
              if(bData.value['type']=="doc"){
                let prev = await showResourcePreview(bData.value['src'])
                this.docPreview = prev
              }
            }
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
          this.blockData.value = blockContent.value
          this.isEditing = false;
          renderMaths()
        },
        formatHtml(content) {
          // Replace newline characters with <br> tags
          if(content){
            return content.replace(/\n/g, '<br>');
          }
          else{return ""}
        },
        openNewEditor(){
          if(this.blockData.value.type=='link'){
            loadAnotherDoc(this.blockData.value.src)
          }
        }
    }
  });
};

const initGraph = () => {
  let nodes = [];
  let bfs = null
  try {
    bfs = blockPage.graph.BreadthFirstSearch(Doc.graphs.knowledge,"main")
    // console.log(bfs)
  } catch (error) {
    bfs = {vertices:{}}
  }
  
  Doc.blocks.map(block=>{
    theLevel = 2 // default level is 2
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
      try {
        edgeData = Graph.edges.get(edge["edges"][0])
        deleteEdge(edgeData.from,edgeData.to)
        callback(edge)
      } catch (error) {
        console.log(error)
      }
    },
    editEdge : function(edge,callback){
      console.log("This option will not work.")
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
  const random4DigitInteger = Math.floor(1000 + Math.random() * 9000);
  newId = `block-${random4DigitInteger}`
  newTitle=`${newId}`
  newBlock = `.[${newId}] ${newTitle}\n`
  Doc = blockPage.action.doAddNewBlock(Doc,newBlock)
  //console.log(Doc)
  refreshNetworkEdges()
  UnsavedChanges = true
  return {id:newId,label:newTitle,level:2,group:"first"} 
}

const addNewBlock1=(blockId)=>{
  if(!Doc.data[blockId]){
    newId = `${blockId}`
    newTitle=`${newId}`
    newBlock = `.[${newId}] ${newTitle}\n`
    Doc = blockPage.action.doAddNewBlock(Doc,newBlock)
    refreshNetworkEdges()
    UnsavedChanges = true
    // return {id:newId,label:newTitle,level:2,group:"first"} 
  }else{
    console.log("This block already exists")
  }
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
  // refreshNetworkEdges()
  var items = Graph.edges.get({
    fields: ['id'],
    filter: function (item) {
      return item.from == from && item.to == to;
    }  
  });
  
  Graph.edges.remove(items.id)
  return
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
    //console.log(bfs)   
  } catch (error) {
    bfs = {vertices:{}}  
  }
  console.log(bfs)
  Doc.blocks.map(block=>{
    theLevel = 2 // default level is 2
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
  // console.log(text)
  resetDoc();
  initVue();
  Doc = blockPage.encode(text.fileData);
  if(!Doc.data['main']){
    mainBlock =`.[main] Central Idea\nEnter your main idea here`
    Doc = blockPage.action.doAddNewBlock(Doc,mainBlock)
  }
  console.log(Doc)
  DocPath = text.filePath
  initGraph();
};
