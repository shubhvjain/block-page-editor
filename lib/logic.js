Split(["#graph", "#block"], {
  sizes: [70, 30],
  minSize: [300, 100],
  expandToMin: true,
});

Doc = {};
Graph = {};
Network = {}

const resetDoc = () => {
  Doc = {};
  Graph = {};
  Network = {}
};

const initVue = () => {};

const initGraph = () => {
  let nodes = [];
  Doc.blocks.map(block=>{
    nodes.push({
      id:block,
      label: Doc.data[block].title, 
      group: block=="main"? "root" : "first" ,
      level: block=="main"? 1 : 2
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

};

const refreshNetworkEdges = ()=>{
  
}

const addNewBlock=()=>{
  newId = `block-${Doc.blocks.length+1}`
  newTitle=`${newId}`
  newBlock = `.[${newId}] ${newTitle}\n`
  Doc = blockPage.action.doAddNewBlock(Doc,newBlock)
  console.log(Doc)
  return {id:newId,label:newTitle,level:2,group:"first"}
}

const deleteBlock = (blockId)=>{
  Doc = blockPage.action.doDeleteBlock(Doc,blockId)
  console.log(Doc)
}

const addEdge = (from,to,label="Part")=>{
  newAppendBlock = `+[${from}]\n~[${label},${to}]`
  Doc = blockPage.action.doAddNewBlock(Doc,newAppendBlock)
  console.log(Doc)
}

const deleteEdge = (from ,to) => {
  Doc = blockPage.action.doDeleteKGEdge(Doc,from,to)
  console.log(Doc)
}

const loadBlock = ()=>{
  
}





const loadDocument = (text) => {
  resetDoc();
  initVue();
  Doc = blockPage.encode(text);
  initGraph();
  console.log(Doc);
};

sampleText = `.[main] Title of the doc
Some content
~[part,part1]
~[part,part2]

.[part1] Part 1

.[part2]

.[part 1-1]
`;
loadDocument(sampleText);
