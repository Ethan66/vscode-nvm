import * as vscode from "vscode";
import { useNvm } from "./nvm-utils";
export function activate(ctx: vscode.ExtensionContext) {
    useNvm();
//   type Args = { nvmDir?: string };
//   const disposable = vscode.commands.registerCommand(
//     "extension.node-version",
//     async (args?: Args) => {
//         useNvm()
//     }
//   );
//   ctx.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
