const rimraf = require("rimraf");

import * as fs from 'node:fs';
import * as path from 'node:path';
import { VSBrowser, Workbench } from 'vscode-extension-tester';
import sleep from './sleep';

const TEST_PROJECT_FOLDER = 'testProject';

export const initWorkspace = async (dirname: string) => {
    const projectPath = path.join(dirname, TEST_PROJECT_FOLDER);
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath);
    }

    return await VSBrowser.instance.openResources(projectPath);
};

export const cleanWorkspace = async (dirname: string) => {
    const projectPath = path.join(dirname, TEST_PROJECT_FOLDER);
    await new Workbench().executeCommand("close workspace");
    await rimraf(projectPath, function (error: any) {
        if (error) {
            console.log("Could not remove test project folder");
            console.log(error);
        }
    });
    return await sleep(500);
};