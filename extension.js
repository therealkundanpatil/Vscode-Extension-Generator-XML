const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

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

            // panel.webview.onDidReceiveMessage((message) => {
            //   console.log(message);
            // });

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
                            <div id = "right" style="float:right;">
                            </div>

                            <script >
                              window.addEventListener('message', event => {
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
                                  rightSideDiv.appendChild(songsTable);
                                  console.log(rightSideDiv);
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
