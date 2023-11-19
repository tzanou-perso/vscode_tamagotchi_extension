"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
function activate(context) {
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("tamagotchi_garden", new TamagotchiGardenProvider(context.extensionUri)));
    // Set the context value for 'tamagotchi.position'
    vscode.commands.executeCommand("setContext", "tamagotchi.position", "explorer");
    // Register command to open Explorer
    let disposable = vscode.commands.registerCommand("tamagotchi.openGarden", () => {
        vscode.commands.executeCommand("workbench.view.explorer");
    });
    context.subscriptions.push(disposable);
    let keystrokeCount = 0;
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
        console.log('onDidChangeTextDocument', event);
        // Send the keystroke count to the webview
        // file number of characters
        let numberOfCharacters = event.document.getText().length;
        vscode.commands.executeCommand("tamagotchi.updateKeystrokeCount", numberOfCharacters);
    }));
    // on new file opened or created, send message to webview to create new pet
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((event) => {
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
    }));
}
exports.activate = activate;
class TamagotchiGardenProvider {
    _view;
    _extensionUri;
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        // Send a message to the webview
        // webviewView.webview.postMessage({ tamagotchiImages: imageDataUrl });
        // let stroke = 0;
        vscode.commands.registerCommand("tamagotchi.updateKeystrokeCount", (numberOfCharacters) => {
            webviewView.webview.postMessage({ stroke: numberOfCharacters });
        });
        vscode.commands.registerCommand("tamagotchi.documentOpened", (numberOfCharacter) => {
            webviewView.webview.postMessage({
                fileOpened: numberOfCharacter,
            });
        });
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        const webview = webviewView.webview;
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
    getHtmlForWebview(webview) {
        const scriptUriMain = webview.asWebviewUri(vscode.Uri.file(path.join(this._extensionUri.fsPath, "src/media", "main-bundle.js")));
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
//# sourceMappingURL=extension.js.map