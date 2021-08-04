const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const xmlParser = require("xml-js");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log(
    'Congratulations, your extension "TestingTheToolKitExtension" is now active!'
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "TestingTheToolKitExtension.run",
      function () {
        vscode.window.showInformationMessage(
          "Hello World from TestingTheToolKitExtension!"
        );

        const options = {
          canSelectMany: false,
          openLabel: "Open",
          filters: {
            "XML files": ["xml"],
          },
        };

        vscode.window.showOpenDialog(options).then((fileUri) => {
          if (fileUri && fileUri[0]) {
            console.log("Selected File : " + fileUri[0].fsPath);
            const filePath = fileUri[0].fsPath;
            const xmlFile = fs.readFileSync(filePath, "utf-8");
            const dom = new JSDOM(xmlFile, { contentType: "text/xml" });

            const panel = vscode.window.createWebviewPanel(
              "openWebView",
              "The Tool",
              vscode.ViewColumn.One,
              { enableScripts: true }
            );

            const cssOnDiskPath = vscode.Uri.file(
              path.join(context.extensionPath, "css", "style.css")
            );

            const cssURI = panel.webview.asWebviewUri(cssOnDiskPath);
            panel.webview.html = getWebviewContent();

            panel.webview.postMessage({
              command: "load",
              data: xmlFile,
            });

            panel.webview.onDidReceiveMessage(
              (message) => {
                switch (message.command) {
                  case "alert":
                    return;
                  case "SONGS":
                    const options = {
                      compact: true,
                      ignoreComment: true,
                      spaces: 4,
                    };
                    var modifiedSongsData = xmlParser.js2xml(
                      message.data,
                      options
                    );
                    console.log(modifiedSongsData);
                    return;
                }
              },
              undefined,
              context.subscriptions
            );

            function getWebviewContent() {
              return `<!DOCTYPE html>
                      <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link href="${cssURI}" type="text/css" rel="stylesheet">
                            <title>The Tool</title>
                        </head>
                        <body>
                            <h1>The Tool Kit </h1>    
                            <div id = "left" style="float:left; width: 20%">
                            </div>
                            <div id = "right" style="width:80%">
                              <div id = "rightButton"></div>
                              <div id = "rightTable"></div>
                            </div>

                            <script >
                              window.addEventListener('message', event => {
                                const vscode = acquireVsCodeApi();
                                const message = event.data;
                                const fileData = message.data;
                                var parser = new DOMParser();
                                var xmlDOM = parser.parseFromString(fileData, "application/xml");

                                for(var i = 0; i < xmlDOM.documentElement.children.length; i++){
                                  var leftSideDiv = document.getElementById("left");
                                  var paragraph = document.createElement("P");
                                  var button = document.createElement("BUTTON");
                                  var data = xmlDOM.documentElement.children[i];
                                  button.id = data.nodeName.toLowerCase()+"Button";
                                  button.innerHTML = data.nodeName;
                                  paragraph.appendChild(button);
                                  leftSideDiv.appendChild(paragraph);
                                }
                                document.getElementById("songsButton").addEventListener("click", displaySongsTableData);
                                
                                function displaySongsTableData(){
                                  var rightSideDiv = document.getElementById("right");
                                  var rightSideButton = document.getElementById("rightButton");
                                  var rightSideTable = document.getElementById("rightTable");


                                  var editButton = document.createElement("BUTTON");
                                  editButton.id = "editButtonId";
                                  editButton.innerHTML = "EDIT";
                                  

                                  var saveButton = document.createElement("BUTTON");
                                  saveButton.id = "saveButtonId";
                                  saveButton.innerHTML = "SAVE";
                                 
                                  
                                  rightSideButton.appendChild(editButton);
                                  rightSideButton.appendChild(saveButton);
                                  rightSideDiv.append(rightSideButton);
                                  document.getElementById("editButtonId").addEventListener("click",makeSongsTableEditable);
                                  document.getElementById("saveButtonId").addEventListener("click",saveSongsChanges);
                                  
                                  var songsTable = document.createElement("TABLE");
                                  songsTable.id = "songsTable";
                                  songsTable.cellPadding = "10px";
                                  var songsTableHead = document.createElement("THEAD");
                                  var songsTableBody = document.createElement("TBODY");
                                  
                                  var tableHeaderRow = document.createElement("tr");

                                  var tableColumnData = document.createElement("th");
                                  tableColumnData.innerHTML = "TITLE";
                                  tableHeaderRow.appendChild(tableColumnData);
                                  
                                  tableColumnData = document.createElement("th");
                                  tableColumnData.innerHTML = "ARTIST";
                                  tableHeaderRow.appendChild(tableColumnData);
                                  
                                  tableColumnData = document.createElement("th");
                                  tableColumnData.innerHTML = "COUNTRY";
                                  tableHeaderRow.appendChild(tableColumnData);
                                  
                                  tableColumnData = document.createElement("th");
                                  tableColumnData.innerHTML = "COMPANY";
                                  tableHeaderRow.appendChild(tableColumnData);
                                  
                                  tableColumnData = document.createElement("th");
                                  tableColumnData.innerHTML = "PRICE";
                                  tableHeaderRow.appendChild(tableColumnData);
                                  
                                  tableColumnData = document.createElement("th");
                                  tableColumnData.innerHTML = "YEAR";
                                  tableHeaderRow.appendChild(tableColumnData);

                                  songsTableHead.appendChild(tableHeaderRow);
                                  songsTable.appendChild(songsTableHead);
                                  songsTable.appendChild(songsTableBody);
                                  rightSideDiv.appendChild(songsTable);
                                  

                                  var songs = xmlDOM.querySelector("SONGS");
                                  for(var j = 0; j < songs.children.length; j++){
                                    var tableRow = document.createElement("tr");
                                    var songsData = songs.children[j]; 
                                    var currentSongTitle = songsData.children[0].innerHTML;
                                    var currentSongArtist = songsData.children[1].innerHTML;
                                    var currentSongCountry = songsData.children[2].innerHTML;
                                    var currentSongCompany = songsData.children[3].innerHTML;
                                    var currentSongPrice = songsData.children[4].innerHTML;
                                    var currentSongYear = songsData.children[5].innerHTML;

                                    var titleData = document.createElement("td");
                                    titleData.setAttribute("contenteditable", "true");
                                    titleData.innerHTML = currentSongTitle;
                                    tableRow.appendChild(titleData);

                                    var artistData = document.createElement("td");
                                    artistData.setAttribute("contenteditable", "true");
                                    artistData.innerHTML = currentSongArtist;
                                    tableRow.appendChild(artistData);

                                    var countryData = document.createElement("td");
                                    countryData.setAttribute("contenteditable", "true");
                                    countryData.innerHTML = currentSongCountry;
                                    tableRow.appendChild(countryData);

                                    var companyData = document.createElement("td");
                                    companyData.setAttribute("contenteditable", "true");
                                    companyData.innerHTML = currentSongCompany;
                                    tableRow.appendChild(companyData);

                                    var priceData = document.createElement("td");
                                    priceData.setAttribute("contenteditable", "true");
                                    priceData.innerHTML = currentSongPrice;
                                    tableRow.appendChild(priceData);

                                    var yearData = document.createElement("td");
                                    yearData.setAttribute("contenteditable", "true");
                                    yearData.innerHTML = currentSongYear;
                                    tableRow.appendChild(yearData);
                                    
                                    songsTable.children[1].appendChild(tableRow);
                                  }
                                  rightSideTable.appendChild(songsTable);
                                  rightSideDiv.append(rightSideTable);
                                  console.log(rightSideDiv);

                                }


                                function makeSongsTableEditable(){
                                  console.log("Editing");
                                }
                                

                                function saveSongsChanges(){                          
                                  var modifiedSongsData = [];
                                  var data = [];
                                  var tableData = document.getElementById("songsTable");
                                  var rowLength = tableData.rows.length;
                                  for( var rowCounter = 1; rowCounter < rowLength; rowCounter++ ){
                                      var rowEntry = {
                                        TITLE : tableData.rows[rowCounter].cells[0].innerHTML,
                                        ARTIST : tableData.rows[rowCounter].cells[1].innerHTML,
                                        COUNTRY : tableData.rows[rowCounter].cells[2].innerHTML,
                                        COMPANY : tableData.rows[rowCounter].cells[3].innerHTML,
                                        PRICE : tableData.rows[rowCounter].cells[4].innerHTML,
                                        YEAR : tableData.rows[rowCounter].cells[5].innerHTML
                                      }
                                      data.push({CD : rowEntry});        
                                  }
                                  modifiedSongsData.push({SONGS : data});
                                  console.log(modifiedSongsData);
                                  vscode.postMessage({
                                    command : "SONGS", 
                                    data: modifiedSongsData[0]
                                  });
                                }

                              }); 
                            </script>
                        </body>
                      </html>`;
            }
          }
        });
      }
    )
  );
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
