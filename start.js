const { spawn } = require('child_process');

const port = process.env.PORT || '3000';
console.log(`[LUEM Frontend] Starting Next.js bound to 0.0.0.0 on port ${port}...`);

const nextCmd = process.platform === 'win32' ? 'next.cmd' : 'next';
const child = spawn(nextCmd, ['start', '-H', '0.0.0.0', '-p', String(port)], {
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
