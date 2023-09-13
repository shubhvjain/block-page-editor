import { Component } from '@angular/core';
// import { Network,DataSet } from "vis-network";
// https://visjs.github.io/vis-network/examples/network/basic_usage/legacy.html 
import { Network } from "vis-network/peer/esm/vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'BlockPageEditor';
  constructor() {
  }
  theGraph: any
  themes: any = {
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
          }
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
          font: {},
        },
        rest: {
          shape: "box",
          margin:3,
          // borderWidth:2,
          color: {
            border: "#222222",

            background: "#666666",
          },
          font: { color: "#eeeeee" },
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
  selectedTheme: any = "dark"
  ngOnInit() {
    this.selectedTheme = "dark"
    const options = {
      autoResize: true,
      height: '100%',
      width: '100%',
      groups: this.themes[this.selectedTheme]['group'],
      "edges": {
        ...this.themes[this.selectedTheme]['edge'],
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

    // create an array with nodes
    let a = new DataSet()
    let nodes = new DataSet([
      { id: 1, label: "Central topic of the document", group: "root" },
      { id: 2, label: "This is the main point 1", group: "first" },
      { id: 3, label: "Can another main point be a question ?", group: "first" },
      { id: 4, label: "This has to be another main point", group: "first" },
      { id: 5, label: "Summary", group: "first" },
      { id: 6, label: "This is a sub point one in the main point 1", group: "rest" },
      { id: 7, label: "This is a sub point two in the main point 1", group: "rest" },
      { id: 8, label: "This is a sub point one in the main point 2", group: "rest" },
      { id: 9, label: "This is a sub point two in the main point 2", group: "rest" },
      { id: 10, label: "This is a sub point one in the main point 3", group: "rest" },
      { id: 11, label: "This is a sub point two in the main point 3", group: "rest" },
      { id: 12, label: "This is a sub point three in the main point 3", group: "rest" },
    ]);
    
    // create an array with edges
    // let edges = new DataSet( [
    //   { from: 1, to: 2, label: "part" },
    //   { from: 1, to: 3, label: "part" },
    //   { from: 1, to: 4, label: "part" },
    //   { from: 1, to: 5, label: "part" },
    //   { from: 2, to: 6, label: "part" },
    //   { from: 2, to: 7, label: "part" },
    //   { from: 3, to: 8, label: "part" },
    //   { from: 3, to: 9, label: "part" },
    //   { from: 4, to: 10, label: "part" },
    //   { from: 4, to: 11, label: "part" },
    //   { from: 4, to: 12, label: "part" }
    // ]);

    let edges =[
      { from: 1, to: 2, label: "part" },
      { from: 1, to: 3, label: "part" },
      { from: 1, to: 4, label: "part" },
      { from: 1, to: 5, label: "part" },
      { from: 2, to: 6, label: "part" },
      { from: 2, to: 7, label: "part" },
      { from: 3, to: 8, label: "part" },
      { from: 3, to: 9, label: "part" },
      { from: 4, to: 10, label: "part" },
      { from: 4, to: 11, label: "part" },
      { from: 4, to: 12, label: "part" }
    ];

    // create a network
    const container = document.getElementById("mynetwork")!;
    const data = {
      nodes: nodes,
      edges: edges
    };

    this.theGraph = new Network(container, data, options);
    let ang = this
    this.theGraph.on("click", function (event:any) {
      var nodeId = event.nodes[0]; // Get the clicked node's ID
      if (nodeId !== undefined) {
        // Create a button element
        var button = document.createElement("button");
        button.innerHTML = "Add Node";
        
        // Position the button next to the clicked node
        var nodePosition = ang.theGraph.getPositions([nodeId]);
        var x = nodePosition[nodeId].x + 50; // Adjust the X position as needed
        var y = nodePosition[nodeId].y; // Use the Y position of the clicked node
        
        button.style.position = "absolute";
        button.style.left = x + "px";
        button.style.top = y + "px";
        
        // Add a click event listener to the button
        button.addEventListener("click", function () {
          // Create a new node
          var newNodeId = nodes.length + 1;
          // @ts-ignore
          nodes.add({ id: newNodeId, label: "Untitled" });
          // @ts-ignore
          edges.push({ from: nodeId, to: newNodeId });
          ang.theGraph.redraw()
          // @ts-ignore
          button['parentNode'].removeChild(button);
        });
        
        // Append the button to the container
        container.appendChild(button);
      }
    });

  }
}
