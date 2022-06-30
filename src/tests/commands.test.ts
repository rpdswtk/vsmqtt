import assert = require("assert");
import { Workbench, InputBox } from "vscode-extension-tester";

describe('Dummy tests', () => {

    it('Passing test', async () => {
        await new Workbench().executeCommand('add broker profile');
        assert.equal(1, 1);
    });

    it('Failing test', async () => {
        await new Workbench().executeCommand('add broker profile');
        assert.equal(1, 1);
    });
});