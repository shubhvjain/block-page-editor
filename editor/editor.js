// editor app

const getGraphOptions = () => {
  let Themes = {
    dark: {
      group: {
        root: {
          shape: "box",
          margin: 10,
          color: {
            background: "#FFD369",
            border: "#FFD369",
            highlight: {
              border: "#FFD369",
              background: "#FFD369",
            },
            hover: {
              border: "#FFD369",
              background: "#FFD369",
            },
          },
          font: { size: 20 },
          widthConstraint: {
            maximum: 300,
          },
        },
        first: {
          shape: "box",
          margin: 10,
          color: {
            background: "#EEEEEE",
            border: "#EEEEEE",
            highlight: {
              border: "#EEEEEE",
              background: "#EEEEEE",
            },
            hover: {
              border: "#EEEEEE",
              background: "#EEEEEE",
            },
          },
          font: { size: 20 },
          widthConstraint: {
            maximum: 300,
          },
        },
        rest: {
          shape: "box",
          margin: 3,
          // borderWidth:2,
          color: {
            border: "#222222",

            background: "#666666",
          },
          font: { size: 20, color: "#eeeeee" },
        },
      },
      edge: {
        shadow: false,
        color: {
          color: "#EEEEEE",
          highlight: "#EEEEEE",
          hover: "#EEEEEE",
        },
        font: {
          color: "#EEEEEE",
          strokeWidth: 0,
          size: 9,
        },
      },
    },
  };
  let selectedTheme = "dark";
  t = Themes[selectedTheme];
  const options = {
    autoResize: true,
    height: "100%",
    width: "100%",
    groups: t["group"],
    manipulation: {
      enabled: true,
    },
    locales: {
      en: {
        edit: "Edit",
        del: "Delete selected",
        back: "Back",
        addNode: "Add Block",
        addEdge: "Add Edge",
        editNode: "Edit Block",
        editEdge: "Edit Edge",
        addDescription:
          "Click in an empty space to place a new untitled block.",
        edgeDescription:
          "Click on a node and drag the edge to another node to connect them.",
        editEdgeDescription:
          "Click on the control points and drag them to a node to connect to it.",
        createEdgeError: "Cannot link edges to a cluster.",
        deleteClusterError: "Clusters cannot be deleted.",
        editClusterError: "Clusters cannot be edited.",
      },
    },
    edges: {
      ...t["edge"],
      smooth: {
        enabled: true,
        type: "continuous",
        forceDirection: "vertical",
        roundness: 0.75,
      },
      arrows: {
        to: {
          enabled: true,
          type: "arrow",
          scaleFactor: 0.25,
        },
      },
    },
    layout: {
      randomSeed: "seed",
      hierarchical: {
        direction: "LR",
        nodeSpacing: 100,
        levelSeparation: 200,
        sortMethod: "hubsize",
      },
    },
  };
  return options;
};

class BlockPageEditor {
  constructor(divId) {
    if (!divId) {
      throw new Error("No div id specified");
    }
    this.divId = divId;
    this.divElement = document.getElementById(divId);
    this.networkDivId = `${divId}-network`
  }
  async initializeComponent() {
    await this.loadRequiredPackages();
  }
  async loadRequiredPackages() {
    try {
      this.libraryLoaded = false;
      const scriptUrls = [
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/split.js/1.6.0/split.min.js",
        "https://unpkg.com/vis-network/standalone/umd/vis-network.min.js",
        "https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js",
        // "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-MML-AM_CHTML",
        "https://unpkg.com/block-page/bundle.js",
      ];
      const cssUrls = [
        // "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
        "./library/style.css"
      ];
      for (let index = 0; index < scriptUrls.length; index++) {
        const element = scriptUrls[index];
        await this.loadJS(element);
      }
      cssUrls.forEach((url) => {this.loadCSS(url);});
      const inlineCSS = `
      .w-100{width:100%}#block,.blockNetwork,.split{height:100vh}.split{display:flex;flex-direction:row}.gutter{background-color:var(--bs-gray-dark);background-repeat:no-repeat;background-position:50%}.gutter.gutter-horizontal{background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');cursor:col-resize}.blockNetwork{width:100%}body{font-size:20px}#block{overflow-y:auto}.vis-label{color:#000}.vis-edit-mode{background-color:red}.ifr{width:100%;height:50vh}`;
      var styleElement = document.createElement("style");
      styleElement.textContent = inlineCSS;
      document.head.appendChild(styleElement);
      document.body.setAttribute("data-bs-theme", "dark");
      this.libraryLoaded = true;
    } catch (error) {
      console.log(error);
    }
  }
  initializeEditor(doc) {
    if (this.libraryLoaded) {
      console.log("Initializing the editor");
      this.validateAttributes(doc);
      if (this.docExists) {
        this.divElement.innerHTML = `Will load the doc`;
        this.initializeDocObject();
        this.initializeVueApp();
        this.initializeNetwork()
        this.splitTheScreen()
      } else {
        this.divElement.innerHTML =
          "<h2>Block page editor</h2><p>No document was specified.</p>";
      }
    } else {
      throw new Error(
        "Editor is not yet initialized. Call `initializeComponent` method first "
      );
    }
  }

  validateAttributes(doc) {
    this.docExists = false;
    this.docRaw = "";
    if (doc) {
      this.docExists = true;
      this.docRaw = doc;
    }
  }
  initializeDocObject() {
    this.Doc = {};
    this.Resources = {};
    this.UnsavedChanges = false;
    this.Doc = blockPage.encode(this.docRaw);
    console.log(this.Doc);
    if(!this.Doc.data['main']){
      mainBlock =`.[main] Central Idea\nEnter your main idea here`
      this.Doc = blockPage.action.doAddNewBlock(this.Doc,mainBlock)
    }
  }

  initializeNetwork() {
    console.log("initi graph")
    this.Graph = {};
    this.Network = {};
    let nodes = [];
    let bfs = null;
    try {
      bfs = blockPage.graph.BreadthFirstSearch(this.Doc.graphs.knowledge, "main");
      // console.log(bfs)
    } catch (error) {
      bfs = { vertices: {} };
    }
    this.Doc.blocks.map((block) => {
      let theLevel = 2; // default level is 2
      if (bfs.vertices[block]) {
        theLevel = bfs.vertices[block]["weight"] + 1;
      }
      nodes.push({
        id: block,
        label: this.Doc.data[block].title,
        group: block == "main" ? "root" : "first",
        level: theLevel,
      })
    })
    let edges = [];
    this.Doc.graphs.knowledge.edges.map((edge) => {
      edges.push({ from: edge.v1, to: edge.v2, label: edge.label });
    });

    this.Graph = {
      nodes: new vis.DataSet(nodes),
      edges: new vis.DataSet(edges),
    };
    // initialize your network!

    let container = document.getElementById(this.networkDivId);
    let options = getGraphOptions();
    let webComp = this
    options.manipulation = {
      enabled: true,
      addNode: function (nodeData, callback) {
        let newNode = webComp.addNewBlock();
        callback(newNode);
      },
      deleteNode: function (nodeData, callback) {
        webComp.VueApp.closeIfOpen(nodeData.nodes[0]);
        webComp.deleteBlock(nodeData.nodes[0]);
        callback(nodeData);
      },
      addEdge: function (edgeData, callback) {
        if (edgeData.from != edgeData.to) {
          webComp.addEdge(edgeData.from, edgeData.to, edgeData.label);
          callback(edgeData);
        } else {
          console.log("Error cannot connect to itself");
        }
      },
      deleteEdge: function (edge, callback) {
        try {
          edgeData = webComp.Graph.edges.get(edge["edges"][0]);
          webComp.deleteEdge(edgeData.from, edgeData.to);
          callback(edge);
        } catch (error) {
          console.log(error);
        }
      },
      editEdge: function (edge, callback) {
        console.log("This option will not work.");
      },
    };
    this.Network = new vis.Network(container, this.Graph, options);

    this.Network.on("click", function (params) {
      if (params.nodes.length == 1) {
        let blockId = params.nodes[0];
        webComp.VueApp.loadPreview(blockId);
      }
      if (params.nodes.length == 0) {
        webComp.VueApp.closeEditor();
      }
    });
   this. Network.on("doubleClick", function (params) {
      if (params.nodes.length == 1) {
        let blockId = params.nodes[0];
        webComp.VueApp.loadPreview(blockId, true);
      }
    });
  }
  async loadJS(file) {
    return new Promise((resolve, reject) => {
      let myScript = document.createElement("script");
      myScript.setAttribute("src", file);
      document.body.appendChild(myScript);
      myScript.addEventListener("load", scriptLoaded, false);
      function scriptLoaded() {
        resolve();
      }
    });
  }
  loadCSS(file) {
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", file);
  }

  splitTheScreen() {
    Split(["#graph", "#block"], {
      sizes: [80, 20],
      minSize: [300, 100],
      expandToMin: true,
    });
  }

  initializeVueApp() {
    this.VueApp = {};
    const webComp = this;
    this.VueApp = new Vue({
      el: `#${webComp.divId}`,
      data: {
        isEditing: false,
        blockSelected: false,
        blockData: { id: "", title: "", text: "", value: { type: "" } },
        status: 0,
        fontSize: 18,
        newBlockId: "",
        addPreview: false,
        docPreview: "",
      },
      methods: {
        increaseFontSize() {this.fontSize += 2;},
        decreaseFontSize() {if (this.fontSize > 12) {this.fontSize -= 2;}},
        saveToFile() {
          webComp.saveDataToFile()
            .then((data) => {})
            .catch((err) => {
              console.log(err);
            });
        },
        addNamedBlock() {
          webComp.addNewBlock1(this.newBlockId);
          this.newBlockId = "";
        },
        closeIfOpen(blockId) {
          // use this if you are deleteting a node from the graph and if its also open in the editor. no need to save things
          if (this.status != 0) {
            if (this.blockData.id == blockId) {
              this.blockSelected = false;
              this.status = 0;
              this.blockData = {
                id: "",
                title: "",
                text: "",
                value: { type: "" },
              };
            }
          }
        },
        closeEditor() {
          if (this.status != 0) {
            this.saveBeforeLeaving();
            this.blockSelected = false;
            this.status = 0;
          }
        },
        saveBeforeLeaving() {
          if (this.status == 0) {
            // the editor what just initialized
            this.status = 1;
          } else {
            this.saveChanges();
          }
          this.blockData = { id: "", title: "", text: "", value: { type: "" } };
        },
        async loadPreview(blockId, edit = false) {
          this.saveBeforeLeaving();
          let bData = { ...webComp.Doc.data[blockId] };
          this.blockData = {
            id: blockId,
            preview: bData.text,
            title: bData.title,
            text: bData.source.first,
            value: bData.value,
          };
          //console.log(this.blockData)
          if (bData.value["type"]) {
            this.addPreview = true;
            if (bData.value["type"] == "doc") {
              let prev = await webComp.showResourcePreview(bData.value["src"]);
              this.docPreview = prev;
            }
          }
          this.blockSelected = true;
          if (edit) {
            this.editPreview();
          }
          webComp.renderMaths();
        },
        editPreview() {
          this.isEditing = true;
        },
        saveChanges() {
          // check if something changes. if yes save otherwise ignore
          let blockContent = webComp.Doc.data[this.blockData.id];
          let contentChanged = false;
          if (blockContent.title != this.blockData.title) {
            contentChanged = true;
          }
          if (blockContent.source.first != this.blockData.text) {
            contentChanged = true;
          }
          if (contentChanged) {
            //console.log("changes have to be saved first")
            blockContent = webComp.updateBlock(this.blockData.id, {
              title: this.blockData.title,
              text: this.blockData.text,
            });
          }
          this.blockData.preview = blockContent.text;
          this.blockData.value = blockContent.value;
          this.isEditing = false;
          webComp.renderMaths();
        },
        formatHtml(content) {
          // Replace newline characters with <br> tags
          if (content) {
            return content.replace(/\n/g, "<br>");
          } else {
            return "";
          }
        },
        openNewEditor() {
          if (this.blockData.value.type == "link") {
            loadAnotherDoc(this.blockData.value.src);
          }
        },
      },
      template: `
      <div class="container-fluid">
      <div class="row" id="editor">
      <div class="col-12 split">
        <div id="graph"><div class="blockNetwork" id="${webComp.networkDivId}"></div></div>
        <div id="block" :style="{ fontSize: fontSize + 'px' }" >
          <div id="preview" class="p-1 m-1" v-show="blockSelected" >
            <div v-show="!isEditing" >
              <h2 class="border-bottom">{{ blockData.title }} <button class="btn btn-link" id="edit-button" @click="editPreview">Edit</button>  </h2>
              <div v-html="formatHtml(blockData.preview)"></div>
              <div v-show="addPreview">
                <br>
                <div v-show="blockData['value']['type']=='link'">
                 
                      <div class="list-group">
                        <a @click="openNewEditor" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                          <!-- <img src="https://github.com/twbs.png" alt="twbs" width="32" height="32" class="rounded-circle flex-shrink-0"> -->
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-box-arrow-up-right  flex-shrink-0" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                            <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                          </svg>
                          <div class="d-flex gap-2 w-100 justify-content-between">
                            <div>
                              <h6 class="mb-0">{{ blockData['value']['title'] || blockData['value']['src'] }}</h6>
                            </div>
                          </div>
                        </a>
                      </div>
                </div>
                <div v-show="blockData['value']['type']=='doc'">
                  <div style="height: 50vh;width:100%" v-html="docPreview"></div>
                </div>
              </div>
            </div>
            
            <div id="edit-form" v-show="isEditing">
              <h4>Editing <code >{{blockData.id}}</code> <button type="button"  @click="saveChanges" class="btn btn-link">Save</button></h4>              
              <div class="mb-3">
                <input type="text" v-model="blockData.title" class="form-control" id="selectedTitle" placeholder="Title" >
              </div>
              <div class="mb-3">
                <textarea class="form-control" v-model="blockData.text" id="selectedText" rows="10"></textarea>
              </div>      
            </div>
        </div>
        <div v-show="!blockSelected">
          <div class="d-flex align-items-end flex-column mb-3" style="height: 100vh;">
            <div class="p-2 m-2 w-100">
              <br><br>
              <p class="text-center text-white-50 ">Select a block to preview/edit</p>
            </div>
            <div class="mt-auto p-2 border-top w-100">
              <div class="text-center">
                <div class="btn-group" role="group" aria-label="Basic outlined example">
                  <button type="button" @click="increaseFontSize" id="increaseFontSize" class="btn btn-sm btn-outline-primary">+ A</button>
                  <button type="button" @click="decreaseFontSize" id="decreaseFontSize" class="btn btn-sm btn-outline-primary">- A</button>
                  <button type="button" @click="saveToFile"  class="btn btn-sm btn-outline-success ml-4">Save</button>
                </div>
              </div>
              <div class="input-group mt-1">
                <input type="text" class="form-control form-control-sm" placeholder="block name" v-model="newBlockId">
                <button class="btn btn-outline-secondary btn-sm" type="button" id="button-addon2" @click="addNamedBlock" >+ Block</button>
              </div>
            </div>
          </div>
        </div>
        
        </div>
      </div>
    </div>
    </div>
      `,
    });
  }  
  addNewBlock=()=>{
    const random4DigitInteger = Math.floor(1000 + Math.random() * 9000);
    let newId = `block-${random4DigitInteger}`
    let newTitle=`${newId}`
    let newBlock = `.[${newId}] ${newTitle}\n`
    this.Doc = blockPage.action.doAddNewBlock(this.Doc,newBlock)
    //console.log(Doc)
    this.refreshNetworkEdges()
    this.UnsavedChanges = true
    return {id:newId,label:newTitle,level:2,group:"first"} 
  }
  addNewBlock1=(blockId)=>{
    if(!this.Doc.data[blockId]){
      let newId = `${blockId}`
      let newTitle=`${newId}`
      let newBlock = `.[${newId}] ${newTitle}\n`
      this.Doc = blockPage.action.doAddNewBlock(this.Doc,newBlock)
      this.refreshNetworkEdges()
      this.UnsavedChanges = true
      // return {id:newId,label:newTitle,level:2,group:"first"} 
    }else{
      console.log("This block already exists")
    }
  }
  deleteBlock = (blockId)=>{
    this.Doc = blockPage.action.doDeleteBlock(this.Doc,blockId)
    //console.log(Doc)
    UnsavedChanges = true
    // refreshNetworkEdges()
  }
  addEdge = (from,to,label="part")=>{
    let newAppendBlock = `+[${from}]\n~[${label},${to}]`
    this.Doc = blockPage.action.doAddNewBlock(this.Doc,newAppendBlock)
    console.log(this.Doc)
    //console.log(Doc)
    this.UnsavedChanges = true
    this.refreshNetworkEdges()
  }
  deleteEdge = (from ,to) => {
    this.Doc = blockPage.action.doDeleteKGEdge(this.Doc,from,to)
    //console.log(Doc)
    this.UnsavedChanges = true
    // refreshNetworkEdges()
    var items = this.Graph.edges.get({
      fields: ['id'],
      filter: function (item) {
        return item.from == from && item.to == to;
      }  
    });
    this.Graph.edges.remove(items.id)
    return
  }
  updateBlock = (blockId,changes)=>{
    this.Doc = blockPage.action.doEditBlock(this.Doc,blockId+"",changes)
    this.refreshNetworkEdges()
    this.UnsavedChanges = true
    return this.Doc.data[blockId]
  }
  refreshNetworkEdges = ()=>{
    let nodes = [];
    console.log(this.Doc)
    let bfs = null
    try {
      bfs = blockPage.graph.BreadthFirstSearch(this.Doc.graphs.knowledge,"main") 
      //console.log(bfs)   
    } catch (error) {
      bfs = {vertices:{}}  
    }
    console.log(bfs)
    this.Doc.blocks.map(block=>{
      let theLevel = 2 // default level is 2
      if (bfs.vertices[block]){
        theLevel  = bfs.vertices[block]["weight"] + 1
      }
      nodes.push({
        id:block,
        label: this.Doc.data[block].title, 
        group: block=="main"? "root" : "first" ,
        level: theLevel
      })
    })
    //console.log(nodes)
    let edges = []
    this.Doc.graphs.knowledge.edges.map(edge=>{
      edges.push({ from : edge.v1 , to : edge.v2 ,label : edge.label })
    })
  
    this.Graph.nodes.update(nodes)
    this.Graph.edges.update(edges)
  }
  showResourcePreview = async (fileName)=>{
    let data = await loadResource(fileName)
    if(data.success){
      return `<iframe class="ifr" src="data:${data.fileType};base64,${data.base64Data}"></iframe>`
    }else{
      return `<div class="alert alert-danger" role="alert">
      File "${data.fileName}" not found. Make sure that the resource is in the same folder.
    </div>`
    }
  }
  renderMaths(){}



}

// Define the new web component
// if ("customElements" in window) {
//   customElements.define("block-page-editor", BlockPageEditor);
// }
