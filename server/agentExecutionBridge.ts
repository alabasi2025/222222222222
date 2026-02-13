/**
 * Agent Execution Bridge
 * Watches for new command files in the execution queue.
 * Cross-platform compatible (Linux/Windows).
 * Uses environment variables for configuration.
 */

import fs from 'fs';
import path from 'path';

const AGENT_BASE_PATH = process.env.AGENT_BASE_PATH || path.join(process.cwd(), 'agent_data');
const QUEUE_PATH = path.join(AGENT_BASE_PATH, 'execution_queue');
const HISTORY_PATH = path.join(AGENT_BASE_PATH, 'history');
const LOGS_PATH = path.join(AGENT_BASE_PATH, 'logs');

function ensureDirs() {
  [QUEUE_PATH, HISTORY_PATH, LOGS_PATH].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

function logAction(action: string, details: any) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(
      path.join(LOGS_PATH, `exec_${timestamp}.json`),
      JSON.stringify({ timestamp: new Date(), action, details }, null, 2)
    );
  } catch (e) {
    console.error('[AgentBridge] Logging failed:', e);
  }
}

export function startExecutionWatcher() {
  try {
    ensureDirs();
    console.log(`[AgentBridge] Watching ${QUEUE_PATH} for commands...`);

    fs.watch(QUEUE_PATH, (eventType, filename) => {
      if (eventType === 'rename' && filename) {
        const filePath = path.join(QUEUE_PATH, filename);
        if (fs.existsSync(filePath)) {
          setTimeout(() => processCommandFile(filePath, filename), 100);
        }
      }
    });

    // Process any pending files on startup
    const pendingFiles = fs.readdirSync(QUEUE_PATH);
    if (pendingFiles.length > 0) {
      console.log(`[AgentBridge] Processing ${pendingFiles.length} pending commands...`);
      pendingFiles.forEach(file => {
        processCommandFile(path.join(QUEUE_PATH, file), file);
      });
    }
  } catch (error) {
    console.error('[AgentBridge] Failed to start watcher:', error);
  }
}

async function processCommandFile(filePath: string, filename: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let commandData;
    try {
      commandData = JSON.parse(content);
    } catch {
      console.error(`[AgentBridge] Invalid JSON in ${filename}`);
      moveToHistory(filePath, filename, { error: 'Invalid JSON' });
      return;
    }

    console.log(`[AgentBridge] Received command: ${commandData.command}`);
    logAction('command_received', commandData);

    const result = await simulateAgentExecution(commandData);

    moveToHistory(filePath, filename, result);
    logAction('command_executed', result);
  } catch (error: any) {
    console.error(`[AgentBridge] Error processing ${filename}:`, error);
    logAction('command_failed', { filename, error: error.message });
  }
}

async function simulateAgentExecution(data: any): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const cmd = data.command?.toLowerCase() || '';

  if (cmd.includes('model') || cmd.includes('switch')) {
    return {
      status: 'success',
      response: 'understood',
      message: 'Model switch request processed.',
      timestamp: new Date().toISOString(),
    };
  } else if (cmd.includes('hello') || cmd.includes('hi')) {
    return {
      status: 'success',
      response: 'reply',
      message: 'Hello! Agent bridge is active and ready.',
      timestamp: new Date().toISOString(),
    };
  } else {
    return {
      status: 'success',
      response: 'unknown_command',
      message: `Command received: "${data.command}". No specific handler found.`,
      timestamp: new Date().toISOString(),
    };
  }
}

function moveToHistory(sourcePath: string, filename: string, result: any) {
  try {
    const destPath = path.join(HISTORY_PATH, `processed_${filename}`);
    let original = {};
    try {
      original = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
    } catch { /* ignore */ }

    const fullRecord = {
      request: original,
      result,
      processedAt: new Date().toISOString(),
    };

    fs.writeFileSync(destPath, JSON.stringify(fullRecord, null, 2));
    fs.unlinkSync(sourcePath);
    console.log(`[AgentBridge] Finished ${filename}`);
  } catch (error) {
    console.error(`[AgentBridge] Error moving ${filename} to history:`, error);
  }
}
