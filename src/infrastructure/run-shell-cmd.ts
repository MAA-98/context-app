import { spawn } from 'node:child_process';

export function runShellCommand(command: string, env: Record<string, string> = {}) {
  return new Promise<number>((resolve, reject) => {
    const child = spawn('sh', ['-lc', command], {
      stdio: 'inherit',
      env: {
        ...process.env,
        ...env,
      },
    });
    
    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 1));
  });
}