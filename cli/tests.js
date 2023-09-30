const u = require("./block-util")

text = `$$E = mc^2$$  
then this is inline : $\\frac{1}{2}$
`
const mathContent = 'This is an inline math expression: $E=mc^2$ and a display math expression: $$F=ma$$';

let main = async ()=>{
  let h = await u.renderStaticMaths(mathContent)
  
  console.log(h.svg)
}

main()
