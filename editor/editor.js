// editor app

class BlockPageEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    
  }
  async initializeComponent() {
    await this.loadRequiredPackages();
  }
  initializeEditor() {
    if(this.libraryLoaded){
      console.log("Initializing the editor");
      // steps involved :
      // 2. validate attributes : check editor mode, add initial html content in the component
      this.validateAttributes();
      // 3. read the text : if available step 4, if not , show message to load doc
      if (this.docExists) {
        const htmlContent = ``;
        this.shadowRoot.innerHTML = htmlContent;
        this.initializeDocObject();

        this.initializeVueApp();
      } else {
        const htmlContent =
          "<h2>Block page editor</h2><p>No document was specified.</p>";
        const divElement = document.createElement("div");
        divElement.innerHTML = htmlContent;
        this.shadowRoot.appendChild(divElement);
      }
      // 5.  split the screen
      // 6.  display the network
      // 7. register events
    }else{
      throw new Error("Web component is not yet initialized. Call `initializeComponent` method first ")
    }
  }
  initializeDocObject() {
    this.Doc = {};
    this.Resources = {};
    this.UnsavedChanges = false;
    this.Doc = blockPage.encode(this.docRaw);
    console.log(this.Doc);
    // if(!Doc.data['main']){
    //   mainBlock =`.[main] Central Idea\nEnter your main idea here`
    //   Doc = blockPage.action.doAddNewBlock(Doc,mainBlock)
    // }
  }

  initializeNetwork() {
    this.Graph = {};
    this.Network = {};
  }
  async loadJS(file) {
    return new Promise((resolve, reject) => {
      let a = this;
      let myScript = document.createElement("script");
      myScript.setAttribute("src", file);
      this.shadowRoot.appendChild(myScript);
      myScript.addEventListener("load", scriptLoaded, false);
      function scriptLoaded() {
        resolve();
      }
    });
  }
  loadCSS(file) {
    var fileref = document.createElement("link");
    fileref.rel = "stylesheet";
    fileref.type = "text/css";
    fileref.href = file;
    this.shadowRoot.appendChild(fileref)
  }
  async loadRequiredPackages() {
    this.libraryLoaded = false
    const scriptUrls = [
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/split.js/1.6.0/split.min.js",
      "https://unpkg.com/vis-network/standalone/umd/vis-network.min.js",
      "https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js",
      // "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-MML-AM_CHTML",
      "https://unpkg.com/block-page/bundle.js",
    ];
    const cssUrls = [
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
    ];
    // Inline CSS as strings
    const inlineCSS = `body{color:red}#block,#mynetwork,.split{height:100vh}.split{display:flex;flex-direction:row}.gutter{background-color:var(--bs-gray-dark);background-repeat:no-repeat;background-position:50%}.gutter.gutter-horizontal{background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');cursor:col-resize}#mynetwork{width:100%}body{font-size:20px}#block{overflow-y:auto}.vis-label{color:#000}.vis-edit-mode{background-color:red}.ifr{width:100%;height:50vh}`;
    // Create a style element for inline CSS
    const styleElement = document.createElement("style");
    styleElement.innerHTML = inlineCSS;
    // Load JavaScript files dynamically
    for (let index = 0; index < scriptUrls.length; index++) {
      const element = scriptUrls[index];
      await this.loadJS(element)
    }
  
    // Load CSS files dynamically
    cssUrls.forEach((url) => {
      this.loadCSS(url)
    });
    // Attach inline CSS to the shadow DOM
    this.shadowRoot.appendChild(styleElement);
    // Create and add HTML content to the shadow DOM
    const htmlContent = "";
    const divElement = document.createElement("div");
    divElement.innerHTML = htmlContent;
    this.shadowRoot.appendChild(divElement);
    this.libraryLoaded = true
  }
  validateAttributes() {
    const doc = this.getAttribute("data-doc");
    this.docExists = false;
    this.docRaw = "";
    if (doc) {
      this.docExists = true;
      this.docRaw = doc;
    }
  }
  loadVueApp() {
    this.VueApp = {};
    const mountPoint = document.createElement("div");
    this.shadowRoot.appendChild(mountPoint);

    this.vueApp = new Vue({
      el: mountPoint,
      data: {
        message: "Hello Vue!",
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
        mounted() {
          // split screen
          Split(["#graph", "#block"], {
            sizes: [70, 30],
            minSize: [300, 100],
            expandToMin: true,
          });
        },
        increaseFontSize() {
          this.fontSize += 2; // Increase font size by 2 pixels
        },
        decreaseFontSize() {
          if (this.fontSize > 12) {
            // Ensure a minimum font size
            this.fontSize -= 2; // Decrease font size by 2 pixels
          }
        },
        saveToFile() {
          saveDataToFile()
            .then((data) => {})
            .catch((err) => {
              console.log(err);
            });
        },
        addNamedBlock() {
          addNewBlock1(this.newBlockId);
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
          let bData = { ...Doc.data[blockId] };
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
              let prev = await showResourcePreview(bData.value["src"]);
              this.docPreview = prev;
            }
          }
          this.blockSelected = true;
          if (edit) {
            this.editPreview();
          }
          renderMaths();
        },
        editPreview() {
          this.isEditing = true;
        },
        saveChanges() {
          // check if something changes. if yes save otherwise ignore
          let blockContent = Doc.data[this.blockData.id];
          contentChanged = false;
          if (blockContent.title != this.blockData.title) {
            contentChanged = true;
          }
          if (blockContent.source.first != this.blockData.text) {
            contentChanged = true;
          }
          if (contentChanged) {
            //console.log("changes have to be saved first")
            blockContent = updateBlock(this.blockData.id, {
              title: this.blockData.title,
              text: this.blockData.text,
            });
          }
          this.blockData.preview = blockContent.text;
          this.blockData.value = blockContent.value;
          this.isEditing = false;
          renderMaths();
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
        <div id="graph">
          <div id="mynetwork"></div>
        </div>
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
                <!-- @blur="saveChanges" -->
              </div>
              <div class="mb-3">
                <textarea class="form-control" v-model="blockData.text" id="selectedText" rows="10"></textarea>
              </div>      
            </div>
        </div>
        <div v-show="!blockSelected">
          <div class="d-flex align-items-end flex-column mb-3" style="height: 100vh;">
            <div class="p-2 m-2">
              <br><br>
              <p class="text-center text-white-50 ">Select a block to preview/edit</p>
            </div>
            <div class="mt-auto p-2 border-top">
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

  initializeVueApp() {
    this.loadVueApp();
    // if (window.Vue) {
    //   this.loadVueApp();
    // } else {
    //   let comp = this;
    //   setTimeout(function () {
    //     comp.loadVueApp();
    //     //console.log(window.Vue)
    //   }, 750);
    // }
  }

  get dataDoc() {
    return this.getAttribute("data-doc") || ""; // Default to an empty string
  }
  set dataDoc(value) {
    this.setAttribute("data-doc", value);
    this.initializeEditor();
  }
  static get observedAttributes() {
    return ["data-doc"]; // List of attributes to observe for changes
  }
}

// Define the new web component
if ("customElements" in window) {
  customElements.define("block-page-editor", BlockPageEditor);
}
