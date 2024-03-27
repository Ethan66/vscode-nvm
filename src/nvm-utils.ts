import { promisify } from "util";
import { exec } from "child_process";
import { join } from "path";
import { readFileSync } from 'fs';
const execAsync = promisify(exec);

import * as vscode from "vscode";
export async function useNvm() {
    const packageNodeVersions = getPackageNodeVersion();
    if (packageNodeVersions.length < 2) {
        return vscode.window.showErrorMessage('package.json中 engines.node的值有问题，正确格式为“">=16.0.0 <=17.0.0"”');
    }

    let { stdout: curVersion } = await execAsync('node -v');
    curVersion = curVersion.slice(1).split('.')[0]
    // vscode.window.showInformationMessage(curVersion);
    if (!(+packageNodeVersions[0] <= +curVersion && +packageNodeVersions[1] >= +curVersion)) {
        const newVersion = await getNewVersion(packageNodeVersions);
        // vscode.window.showInformationMessage(newVersion);
        newVersion && changeNvmVersion(newVersion);
    }
}

function getPackageNodeVersion (): string[] {
    const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || './';
    const packageJsonPath = join(rootPath, 'package.json');
    const data = readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(data);
    let value = packageJson.engines?.node || '';
    value = value.replace(/^>=?(\d+)[^<]+<=?(\d+).*$/, '$1,$2')
    // vscode.window.showInformationMessage(`项目要求的node版本号: ${value}`);
    return (value || '').split(',');
}

async function getNewVersion (arr: string[]): Promise<string> {
    const { stdout } = await execAsync('nvm ls');
    const versions = stdout.replace(/\(.+\)|\*/g, '').split(' ');
    const result = versions.find(version => {
        const versionPrefix = +version.replace(/(\d+).+/, '$1')
        return versionPrefix >= +arr[0] && versionPrefix <= +arr[1]
    });
    return result || '';
}

async function changeNvmVersion(newVersion:string) {
    // vscode.window.showInformationMessage(`正要切换的node版本号: ${newVersion}`);
    const terminals = vscode.window.terminals;
    let disposable: vscode.Disposable
    const sendText = (t: vscode.Terminal) => {
        t.sendText(`nvm use ${newVersion}`)
        disposable.dispose()
    };
    if (terminals.length) {
        sendText(terminals[0])
      }
      disposable = vscode.window.onDidOpenTerminal(sendText);
}