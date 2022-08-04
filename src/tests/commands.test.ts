const assert = require("assert");
const path = require('path');
var rimraf = require("rimraf");
import * as fs from 'node:fs';
import { Workbench, InputBox, VSBrowser, TitleBar } from "vscode-extension-tester";
import {sleep} from './utils';

describe('Commands', function () {
    const BROKER_PROFILE = {
        name: "test_broker",
        host: "localhost",
        port: 1883
    };
    const TEST_PROJECT_FOLDER = 'testProject';

    const projectPath = path.join(__dirname, TEST_PROJECT_FOLDER);

    this.beforeAll(async function () {
        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath);
            console.log("Test project folder created");
        }
    });

    this.afterAll(async function () {
        rimraf(projectPath, function () { console.log("Test project folder removed"); });
    });

    it('Add broker profile', async function () {
        const workbench = new Workbench();
        await VSBrowser.instance.openResources(projectPath);
        await workbench.executeCommand('add broker profile');
        let input = await InputBox.create();
        await input.setText(BROKER_PROFILE.name);                                        
        await input.confirm();
        await input.setText(BROKER_PROFILE.host);
        await input.confirm();
        await input.setText(BROKER_PROFILE.port.toString());
        await input.confirm();

        await sleep(2000);
        const rawData = fs.readFileSync(path.join(projectPath, '.vscode/settings.json'));
        const settings = JSON.parse(rawData.toString());

        const savedProfile = settings['vsmqtt.brokerProfiles'][0];

        assert.equal(savedProfile.name, BROKER_PROFILE.name);
        assert.equal(savedProfile.host, BROKER_PROFILE.host);
        assert.equal(savedProfile.port, BROKER_PROFILE.port);
    });
});