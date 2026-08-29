import { stdin, stdout } from 'node:process';
import type { CreateTerminalSession } from '../application/contracts.js';

/**
 * Manages terminal mode transitions for interactive command flows.
 *
 * This keeps stdin/stdout alive while collecting prompt input after leaving
 * Ink-based UI, and restores the terminal back to normal shell behavior
 * afterward.
 */
export const createTerminalSession: CreateTerminalSession = () => {
  let keepAlive: ReturnType<typeof setInterval> | undefined;
  let isPromptMode = false;
  
  function startKeepAlive() {
    if (!keepAlive) {
      keepAlive = setInterval(() => {}, 1000);
    }
  }
  
  function stopKeepAlive() {
    if (keepAlive) {
      clearInterval(keepAlive);
      keepAlive = undefined;
    }
  }
  
  function enterPromptMode() {
    if (isPromptMode) return;
    isPromptMode = true;
    
    if (typeof stdin.ref === 'function') stdin.ref();
    if (typeof stdout.ref === 'function') stdout.ref();
    if (typeof stdin.setRawMode === 'function') stdin.setRawMode(false);
    
    stdin.resume();
    startKeepAlive();
  }
  
  function leavePromptMode() {
    if (!isPromptMode) return;
    isPromptMode = false;
    
    stopKeepAlive();
    
    if (typeof stdin.unref === 'function') stdin.unref();
    if (typeof stdout.unref === 'function') stdout.unref();
  }
  
  return {
    enterPromptMode,
    leavePromptMode,
    close: leavePromptMode,
  };
};