import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
export function activate(context) {
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('tamagotchi_garden', new TamagotchiGardenProvider(context.extensionUri)));
    // Set the context value for 'tamagotchi.position'
    vscode.commands.executeCommand('setContext', 'tamagotchi.position', 'explorer');
    // Register command to open Explorer
    let disposable = vscode.commands.registerCommand('tamagotchi.openGarden', () => {
        vscode.commands.executeCommand('workbench.view.explorer');
    });
    context.subscriptions.push(disposable);
    let keystrokeCount = 0;
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        console.log('onDidChangeTextDocument', event);
        // Send the keystroke count to the webview
        vscode.commands.executeCommand('tamagotchi.updateKeystrokeCount', keystrokeCount);
    }));
}
class TamagotchiGardenProvider {
    _view;
    _extensionUri;
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        const tamagotchiImages = path.join(this._extensionUri.fsPath, 'media', 'images', 'pets', 'tamagotchi', 'tamagotchi.png');
        const tamagotchiJsonRaw = path.join(this._extensionUri.fsPath, 'media', 'images', 'pets', 'tamagotchi', 'tamagotchi.json');
        const tamagotchiJsonFile = fs.readFileSync(tamagotchiJsonRaw);
        const tamagotchiJson = tamagotchiJsonFile.toString();
        const imageBuffer = fs.readFileSync(tamagotchiImages);
        const imageBase64 = imageBuffer.toString('base64');
        const imageDataUrl = 'data:image/png;base64,' + imageBase64;
        // Send a message to the webview
        webviewView.webview.postMessage({ tamagotchiImages: imageDataUrl });
        let stroke = 0;
        vscode.commands.registerCommand('tamagotchi.updateKeystrokeCount', () => {
            stroke += 1;
            webviewView.webview.postMessage({ stroke: stroke });
        });
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        const webview = webviewView.webview;
        webviewView.webview.html = this.getHtmlForWebview(webview, imageDataUrl, tamagotchiJson);
    }
    getHtmlForWebview(webview, tamagotchiImages = '', tamagotchiJson = '') {
        const scriptUriMain = webview.asWebviewUri(vscode.Uri.file(path.join(this._extensionUri.fsPath, 'media', 'main.js')));
        const scriptUriPixi = webview.asWebviewUri(vscode.Uri.file(path.join(this._extensionUri.fsPath, 'media/libs', 'pixi.min.js')));
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
                <script src="${scriptUriPixi}"></script>
                <script type="text/javascript">
                    var tamagotchiImages = ${JSON.stringify(tamagotchiImages)};
                    var tamagotchiJson = ${tamagotchiJson};
                </script>
				<script src="${scriptUriMain}"></script>
            </body>
            </html>`;
    }
}
