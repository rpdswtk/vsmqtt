import * as vscode from 'vscode';
import { saveBrokerProfile } from './helpers';


export class CommandProvider {

    async addProfile() {
        let name = await vscode.window.showInputBox({
            prompt: "Name"
        });
        if (!name) { return; }

        let address = await vscode.window.showInputBox({
            prompt: "Address",
            placeHolder: "localhost"
        });
        if (!address) { return; }

        let port = await vscode.window.showInputBox({
            prompt: "Port",
            placeHolder: "1883"
        });
        if (!port) { return; }

        saveBrokerProfile({ name, address, port: parseInt(port) });
    }
}