import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

export async function collectPromptValues(prompts: { varName: string; prompt: string }[]) {
  const rl = createInterface({ input: stdin, output: stdout });

  const values: Record<string, string> = {};
  
  try {
    for (const item of prompts) {
      const answer = await rl.question(`\x1b[32m${item.prompt}\x1b[0m `);
      
      values[item.varName] = answer;
    }
  } finally {
    rl.close();
  }
  
  return values;
}