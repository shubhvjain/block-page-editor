// this will contain util files that work on top of the core block program. it adds additional functionalaties
const b = require("block-page");
const mj = require('mathjax-node');
mj.config({
  MathJax: {
    tex2jax: {
      inlineMath: [['$', '$'], ['\\[', '\\]']], // Define your inline and display math delimiters here
    },
  },
});

const renderStaticMaths = async (mathContent)=>{
  let rendered =  await mj.typeset({
    math: mathContent,
    format: 'TeX',
    svg: true,
  })
  
  // mjAPI.typeset({
  //   math: text,
  //   format: "TeX", 
  //   mml:true,     
  // });
  console.log(rendered)
  return rendered
}


const generateFullDocObject = (
  text,
  options = { processDocs: false, processLinks: true, processMaths: false }
) => {
  
};

module.exports = { generateFullDocObject ,renderStaticMaths};
