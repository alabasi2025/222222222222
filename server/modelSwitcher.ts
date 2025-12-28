// server/modelSwitcher.ts
import fs from 'fs';
import path from 'path';

/**
 * Agent Connector for Standalone Memory
 * Connects to the external "Brain" located at D:\AntigravityAgent
 */

const AGENT_BASE_PATH = 'D:\\AntigravityAgent';
const CONFIG_PATH = path.join(AGENT_BASE_PATH, 'config.json');
const LOGS_PATH = path.join(AGENT_BASE_PATH, 'logs');

// Ensure base directories exist (just in case)
if (!fs.existsSync(AGENT_BASE_PATH)) {
  // In a real scenario, we might error out, but here we assume it exists as per previous steps
  console.warn(`Agent Base Path ${AGENT_BASE_PATH} not found! Memory features may fail.`);
}

export const availableModels = [
  "gemini-3-pro-high",
  "claude-opus-4.5-thinking",
  "claude-sonnet-4.5",
  "gemini-3-flash",
];

interface AgentConfig {
    agentName: string;
    activeModel: string;
    status: string;
}

// Helper to log actions to the external brain
export function logToBrain(action: string, details: any) {
    try {
        if (!fs.existsSync(LOGS_PATH)) {
             // Try to create if missing, though we created it earlier
             fs.mkdirSync(LOGS_PATH, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logFile = path.join(LOGS_PATH, `action_${timestamp}.json`);
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            action,
            details
        };
        
        fs.writeFileSync(logFile, JSON.stringify(logEntry, null, 2));
    } catch (error) {
        console.error('Failed to log to Agent Brain:', error);
    }
}

export function getActiveModel(): string {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
        const configRaw = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const config: AgentConfig = JSON.parse(configRaw);
        return config.activeModel || "gemini-3-pro-high";
    }
  } catch (error) {
    console.error('Error reading Agent config:', error);
  }
  return "gemini-3-pro-high"; // Fallback
}

export function setActiveModel(model: string): void {
  if (!availableModels.includes(model)) {
    throw new Error(`Model "${model}" is not in the list of available models.`);
  }

  try {
      let config: AgentConfig = {
          agentName: "الوكيل المساعد",
          activeModel: "gemini-3-pro-high",
          status: "idle"
      };

      if (fs.existsSync(CONFIG_PATH)) {
          config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      }

      const oldModel = config.activeModel;
      config.activeModel = model;

      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
      
      logToBrain('model_switch', {
          from: oldModel,
          to: model,
          triggeredBy: 'user_interface'
      });

  } catch (error) {
      console.error('Error writing to Agent config:', error);
      throw new Error('Failed to update Agent Memory on disk.');
  }
}
