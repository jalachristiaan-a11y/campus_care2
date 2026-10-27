const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.join(__dirname, '..');
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const services = [
  { name: 'API', command: path.join(root, 'server.cjs'), args: [] },
  { name: 'Vite', command: viteCli, args: ['--host', '127.0.0.1'] },
];

let stopping = false;
const children = services.map(({ name, command, args }) => {
  const child = spawn(process.execPath, [command, ...args], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  });

  child.on('error', (error) => {
    console.error(`${name} failed to start:`, error.message);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (!stopping) {
      if (code === 0) {
        console.log(`${name} exited normally; stopping the other development service.`);
      } else {
        console.error(`${name} stopped${signal ? ` (${signal})` : ` with exit code ${code}`}.`);
      }
      stop(code === 0 ? 0 : code ?? 1);
    }
  });

  return child;
});

function stop(exitCode) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  children.forEach((child) => {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill();
    }
  });
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
