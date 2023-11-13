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
      // console.log('onDidChangeTextDocument', event);
      // Send the keystroke count to the webview
      vscode.commands.executeCommand(
        "tamagotchi.updateKeystrokeCount",
        keystrokeCount
      );
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
    // vscode.commands.registerCommand("tamagotchi.updateKeystrokeCount", () => {
    //   stroke += 1;
    //   webviewView.webview.postMessage({ stroke: stroke });
    // });

    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    const webview = webviewView.webview;
    webviewView.webview.html = this.getHtmlForWebview(webview);
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
            </body>
            </html>`;
  }
}
