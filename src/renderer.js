// const inputFilePath = document.getElementById('inputFilePath');
// const loadFileButton = document.getElementById('loadFileBtn');

// loadFileButton.addEventListener('click', function() {
//   const inputValue = myInput.value;
  
// });

// console.log(window.electronAPI)

function showDiv(id) {
  const element = document.getElementById(id);
  if (element) {
    element.style.display = 'block';
  }
}

// Function to hide a div by setting its display property to 'none'
function hideDiv(id) {
  const element = document.getElementById(id);
  if (element) {
    element.style.display = 'none';
  }
}

// let fileContent= `This is a file`
// let path = "~/Desktop/sample1.txt"

let main = async()=>{
  await window.electronAPI.saveFile(path,fileContent)
}
// main()


const btn = document.getElementById('pickFileBtn')
const filePathElement = document.getElementById('filePath')

btn.addEventListener('click', async () => {
  const fileData1 = await window.electronAPI.openFile()
  // filePathElement.innerText = JSON.stringify(fileData1,null,2)
  // console.log(fileData1)
  showDiv("editor")
  hideDiv("startup")
  loadDocument(fileData1);
})


document.addEventListener('keydown', async function (event) {
  // Check if Ctrl key (or Command key on macOS) is pressed and the "S" key is pressed
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    // Call your custom function here
    await saveData(); // Replace this with the function you want to call
    event.preventDefault(); // Prevent the browser's default Save dialog from appearing
  }
});

async function saveData() {
  // Your save data logic here
  console.log('Ctrl + S pressed! Saving data...');
  let decodedDoc = blockPage.decode(Doc)
  await window.electronAPI.saveFile(DocPath,decodedDoc)
  // Replace this with your actual save data code
}
