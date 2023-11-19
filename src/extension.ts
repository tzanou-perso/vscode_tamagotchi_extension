import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as PIXI from "pixi.js";

declare namespace GlobalMixins {
  interface DisplayObjectEvents extends PIXI.FederatedEventEmitterTypes {
    [x: string | number | symbol]: any;
  }

  interface DisplayObject
    extends Omit<PIXI.FederatedEventTarget, keyof PIXI.IFederatedDisplayObject>,
      PIXI.IFederatedDisplayObject {
    [x: string | number | symbol]: any;
  }
}

let fileId = "";
let filesSaved: string;
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "tamagotchi_garden",
      new TamagotchiGardenProvider(context.extensionUri)
    )
  );

  // Set the context value for 'tamagotchi.position'
  vscode.commands.executeCommand(
    "setContext",
    "tamagotchi.position",
    "explorer"
  );

  // Register command to open Explorer
  let disposable = vscode.commands.registerCommand(
    "tamagotchi.openGarden",
    () => {
      vscode.commands.executeCommand("workbench.view.explorer");
    }
  );

  context.subscriptions.push(disposable);

  let keystrokeCount = 0;

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      console.log("onDidChangeTextDocument", event);
      // Send the keystroke count to the webview
      // file number of characters
      let numberOfCharacters = 1;
      if (event.contentChanges.length > 0) {
        vscode.commands.executeCommand(
          "tamagotchi.updateKeystrokeCount",
          numberOfCharacters
        );
      }
    })
  );
  // save config

  // on new file opened or created, send message to webview to create new pet
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((event) => {
      console.log("onDidChangeActiveTextEditor", event);
      let numberOfCharacters;
      let fileId;
      if (event) {
        fileId = event.document.uri.path;
        numberOfCharacters = event.document.getText().length;
      }
      vscode.commands.executeCommand("tamagotchi.documentOpened", {
        numberOfCharacters,
        fileId,
      });
    })
  );
}

class TamagotchiGardenProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    // Send a message to the webview
    // webviewView.webview.postMessage({ tamagotchiImages: imageDataUrl });
    // let stroke = 0;
    vscode.commands.registerCommand(
      "tamagotchi.updateKeystrokeCount",
      (numberOfCharacters) => {
        webviewView.webview.postMessage({ stroke: numberOfCharacters });
      }
    );
    vscode.commands.registerCommand(
      "tamagotchi.documentOpened",
      (numberOfCharacter) => {
        webviewView.webview.postMessage({
          fileOpened: numberOfCharacter,
        });
      }
    );

    vscode.commands.registerCommand("tamagotchi.resetState", () => {
      webviewView.webview.postMessage({
        resetState: true,
      });
    });

    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    const webview = webviewView.webview;
    webview.onDidReceiveMessage((data) => {
      if (data.command === "isInitialized") {
        console.log("isInitialized", data.text);
        let fileFromFileId = vscode.workspace.textDocuments.find(
          (file) => file.uri.path === fileId
        );
        // get number of characters in file
        let numberOfCharacters = fileFromFileId?.getText().length;
        // send the file id to the webview
        webview.postMessage({
          initialised: {
            numberOfCharacters,
            filesSaved,
          },
        });
      } else if (data.command === "setInitialised") {
        console.log("setInitialised", data.text);
        fileId = data.text;
        // save the file id to the config
      }
    });
    webviewView.webview.html = this.getHtmlForWebview(webview);
    setTimeout(() => {
      if (vscode.window.activeTextEditor != null) {
        let activeDocument = vscode.window.activeTextEditor.document;
        let numberOfCharacters = activeDocument.getText().length;
        let fileId = activeDocument.uri.path;
        webview.postMessage({
          fileOpened: { numberOfCharacters, fileId },
        });
      }
    }, 1000);
  }

  private getHtmlForWebview(webview: vscode.Webview) {
    const scriptUriMain = webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this._extensionUri.fsPath, "media", "main-bundle.js")
      )
    );
    // const styleUri = webview.asWebviewUri(vscode.Uri.file(
    // 	path.join(this._extensionUri.fsPath, 'media', 'styles.css')
    // ));
    return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Tamagotchi Garden</title>
            </head>
            <body>
              <script src="${scriptUriMain}"></script>
              <script>
                const vscode = acquireVsCodeApi();
              </script>
            </body>
            </html>`;
  }
}
