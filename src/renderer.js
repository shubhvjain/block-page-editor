function showDiv(id) {
  const element = document.getElementById(id);
  if (element) {
    element.style.display = "block";
  }
}

// Function to hide a div by setting its display property to 'none'
function hideDiv(id) {
  const element = document.getElementById(id);
  if (element) {
    element.style.display = "none";
  }
}

let main = async () => {
  let fileContent = `This is a file`;
  let path = "~/Desktop/sample1.txt";
  await window.electronAPI.saveFile(path, fileContent);
};
// main()

const btn = document.getElementById("pickFileBtn");

btn.addEventListener("click", async () => {
  const fileData1 = await window.electronAPI.openFile();
  if (fileData1.success) {
    showDiv("editor");
    hideDiv("startup");
    await window.electronAPI.setTitle(fileData1.filePath)
    loadDocument(fileData1);
  } else {
    console.log(fileData1.message);
  }
});

// To save on Ctrl+S
document.addEventListener("keydown", async function (event) {
  // Check if Ctrl key (or Command key on macOS) is pressed and the "S" key is pressed
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    // Call your custom function here
    await saveDataToFile(); // Replace this with the function you want to call
    event.preventDefault(); // Prevent the browser's default Save dialog from appearing
  }
});

async function saveDataToFile() {
  // Your save data logic here
  let decodedDoc = blockPage.decode(Doc);
  await window.electronAPI.saveFile(DocPath, decodedDoc);
  UnsavedChanges= false
  // Replace this with your actual save data code
}

async function loadAnotherDoc(fileName){
  const fileData1 = await window.electronAPI.openAnotherDoc(DocPath,fileName);
}

async function loadExternalResource(fileName){
  let data = await window.electronAPI.loadDoc(DocPath,fileName);
  return data
}

const loadResource = async (fileName)=>{
  // check if this file is already loaded 
  if(!Resources[fileName]){
    try {
      let data = await loadExternalResource(fileName)
      Resources[fileName] = data
    } catch (error) {
      console.log(error)
      // console.log("error in loading file")
    }
  }else{
    if(!Resources[fileName]["success"]){
      let data = await loadExternalResource(fileName)
      Resources[fileName] = data
    }
  }
  return Resources[fileName]
}

const showResourcePreview = async (fileName)=>{
  let data = await loadResource(fileName)
  if(data.success){
    return `<iframe class="ifr" src="data:${data.fileType};base64,${data.base64Data}"></iframe>`
  }else{
    return `<div class="alert alert-danger" role="alert">
    File "${data.fileName}" not found. Make sure that the resource is in the same folder.
  </div>`
  }
}



(async()=>{
// on start check if new file needs to be opened automatically 
let processArgs = window.electronAPI.getArgs()
// console.log(processArgs)
if(processArgs.openFileOnLoad){
  const fileData1 = await window.electronAPI.openSelectedFile(processArgs.openFileOnLoad);
  // console.log(fileData1)
  if (fileData1.success) {
    showDiv("editor");
    await window.electronAPI.setTitle(fileData1.filePath)
    loadDocument(fileData1);
  } else {
    console.log(fileData1.message);
  }
}else{
  console.log('The openFile parameter does not exist.');
  showDiv("startup")
}
})();
