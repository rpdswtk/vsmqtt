const spawn = require('cross-spawn');
const fork = require('child_process').fork;

const broker = fork('src\/tests\/utils\/broker.js');
const tests = spawn(
    `npm run test-compile && npx extest setup-and-run out/tests/*.js -m .mocharc.js`,
    [], { stdio: 'inherit' }
);


tests.on('close', (code) => {
    console.log('CLOSED ', code);
    gracefullyCloseBroker(code);
});


tests.on('error', (code) => {
    console.log('ERROR ', code);
    gracefullyCloseBroker(code);
});

const gracefullyCloseBroker = (code) => {
    broker.send({code});
};