// server/agentExecutionBridge.ts
import fs from 'fs';
import path from 'path';

/**
 * Agent Execution Bridge
 * Watches D:\AntigravityAgent\execution_queue for new command files.
 * When a file is found, it "executes" it (simulates sending to LLM) and writes the result.
 */

const AGENT_BASE_PATH = 'D:\\AntigravityAgent';
const QUEUE_PATH = path.join(AGENT_BASE_PATH, 'execution_queue');
const HISTORY_PATH = path.join(AGENT_BASE_PATH, 'history');
const LOGS_PATH = path.join(AGENT_BASE_PATH, 'logs');

// Ensure directories exist
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
        console.error('Logging failed', e);
    }
}

export function startExecutionWatcher() {
    ensureDirs();
    console.log(`[AgentBridge] Watching ${QUEUE_PATH} for commands...`);

    // Simple polling for now (fs.watch can be flaky on network/external drives sometimes, but local is fine)
    // We'll use fs.watch for immediate reaction
    fs.watch(QUEUE_PATH, (eventType, filename) => {
        if (eventType === 'rename' && filename) {
            const filePath = path.join(QUEUE_PATH, filename);
            if (fs.existsSync(filePath)) {
               // Give a tiny delay for write completion
               setTimeout(() => processCommandFile(filePath, filename), 100);
            }
        }
    });

    // Also run a check on startup for any pending files
    fs.readdirSync(QUEUE_PATH).forEach(file => {
        processCommandFile(path.join(QUEUE_PATH, file), file);
    });
}

async function processCommandFile(filePath: string, filename: string) {
    try {
        // 1. Read the command
        const content = fs.readFileSync(filePath, 'utf-8');
        let commandData;
        try {
            commandData = JSON.parse(content);
        } catch (e) {
            console.error(`Invalid JSON in ${filename}`);
            // Move to history as failed
            moveToHistory(filePath, filename, { error: "Invalid JSON" });
            return;
        }

        console.log(`[AgentBridge] Received command: ${commandData.command}`);
        logAction('command_received', commandData);

        // 2. Execute (Simulate LLM Processing)
        // In a real system, this would call the AI Model API.
        // Here, we simulate the "Thinking" and processing.
        
        const result = await simulateAgentExecution(commandData);

        // 3. Write Result and Archive
        moveToHistory(filePath, filename, result);
        logAction('command_executed', result);

    } catch (error: any) {
        console.error(`Error processing ${filename}`, error);
        logAction('command_failed', { filename, error: error.message });
    }
}

async function simulateAgentExecution(data: any): Promise<any> {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const cmd = data.command?.toLowerCase() || "";
    
    // Simple command handling logic
    if (cmd.includes('model') || cmd.includes('switch')) {
        return {
            status: "success",
            response: "understood",
            message: "I have processed your request to switch models. (Simulation: Logic would trigger actual switch here)",
            timestamp: new Date().toISOString()
        };
    } else if (cmd.includes('hello') || cmd.includes('hi')) {
        return {
            status: "success",
            response: "reply",
            message: "Hello! I am your external agent brain. I am ready to serve.",
            timestamp: new Date().toISOString()
        };
    } else {
        return {
            status: "success",
            response: "unknown_command",
            message: `I received your command: "${data.command}", but I don't have a specific handler for it yet. I logged it in my memory.`,
            timestamp: new Date().toISOString()
        };
    }
}

function moveToHistory(sourcePath: string, filename: string, result: any) {
    const destPath = path.join(HISTORY_PATH, `processed_${filename}`);
    
    // Read original request to combine with result
    let original = {};
    try { original = JSON.parse(fs.readFileSync(sourcePath, 'utf-8')); } catch {}

    const fullRecord = {
        request: original,
        result: result,
        processedAt: new Date().toISOString()
    };

    fs.writeFileSync(destPath, JSON.stringify(fullRecord, null, 2));
    fs.unlinkSync(sourcePath); // Remove from queue
    console.log(`[AgentBridge] Finished ${filename}`);
}
