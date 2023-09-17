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

// window.addEventListener("beforeunload", function (e) {
//   if (UnsavedChanges) {
//     // Display a confirmation box with a custom message.
//     const confirmationMessage = "You have unsaved changes. Do you really want to leave?";
//     // (e || window.event).returnValue = confirmationMessage;
//     return confirmationMessage;
//   }
// });