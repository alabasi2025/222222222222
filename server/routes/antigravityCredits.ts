// server/routes/antigravityCredits.ts
// Route to check Google Antigravity credits/quota status
import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

const AGENT_BASE_PATH = 'D:\\AntigravityAgent';
const LOGS_PATH = path.join(AGENT_BASE_PATH, 'logs');
const CONFIG_PATH = path.join(AGENT_BASE_PATH, 'config.json');

// Helper to calculate time until next renewal (5 hours cycle)
function getNextRenewalTime(lastRenewal?: Date): { nextRenewal: Date; timeRemaining: string; hours: number; minutes: number } {
    const now = new Date();
    const fiveHoursInMs = 5 * 60 * 60 * 1000;
    
    // If we have last renewal, calculate from there, otherwise assume renewal happened at start of current cycle
    const lastRenewalTime = lastRenewal ? lastRenewal.getTime() : now.getTime();
    
    // Calculate next renewal time
    let nextRenewalTime = lastRenewalTime + fiveHoursInMs;
    
    // If next renewal is in the past, calculate the next valid renewal
    while (nextRenewalTime <= now.getTime()) {
        nextRenewalTime += fiveHoursInMs;
    }
    
    const nextRenewal = new Date(nextRenewalTime);
    const remaining = nextRenewal.getTime() - now.getTime();
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return {
        nextRenewal,
        timeRemaining: `${hours} ساعة و ${minutes} دقيقة`,
        hours,
        minutes
    };
}

// Get Antigravity credits/quota info
router.get('/', async (req, res) => {
    try {
        // Read current config
        let config: any = null;
        if (fs.existsSync(CONFIG_PATH)) {
            try {
                config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
            } catch {
                console.error('Error reading config');
            }
        }
        
        // Get activity statistics
        let lastActivity: Date | undefined;
        let totalRequests = 0;
        let recentActivities: any[] = [];
        
        if (fs.existsSync(LOGS_PATH)) {
            const logFiles = fs.readdirSync(LOGS_PATH)
                .filter(f => f.endsWith('.json'))
                .sort()
                .reverse()
                .slice(0, 10);
            
            totalRequests = logFiles.length;
            
            // Get the most recent log files
            logFiles.forEach(file => {
                try {
                    const logContent = JSON.parse(
                        fs.readFileSync(path.join(LOGS_PATH, file), 'utf-8')
                    );
                    if (logContent.timestamp) {
                        const logTime = new Date(logContent.timestamp);
                        if (!lastActivity || logTime > lastActivity) {
                            lastActivity = logTime;
                        }
                        recentActivities.push({
                            time: logTime.toISOString(),
                            action: logContent.action,
                            details: logContent.details
                        });
                    }
                } catch {
                    // Skip invalid logs
                }
            });
        }
        
        const renewal = getNextRenewalTime(lastActivity);
        
        // Prepare response
        const response = {
            status: 'success',
            service: 'Google Antigravity IDE',
            info: {
                // Current status
                activeModel: config?.activeModel || 'Unknown',
                agentStatus: config?.status || 'Unknown',
                
                // Quota/Renewal information
                renewalCycle: 'كل 5 ساعات',
                nextRenewal: {
                    iso: renewal.nextRenewal.toISOString(),
                    local: renewal.nextRenewal.toLocaleString('ar-SA', {
                        timeZone: 'Asia/Riyadh',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }),
                    timeRemaining: renewal.timeRemaining,
                    hours: renewal.hours,
                    minutes: renewal.minutes
                },
                
                // Activity statistics
                activity: {
                    totalRequests: totalRequests,
                    lastActivity: lastActivity?.toISOString() || null,
                    lastActivityLocal: lastActivity?.toLocaleString('ar-SA', {
                        timeZone: 'Asia/Riyadh',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) || null,
                    recentActivities: recentActivities.slice(0, 5)
                },
                
                // Notes
                notes: [
                    'الرصيد (Quota) يجدد تلقائياً كل 5 ساعات للمشتركين في خطط Google AI Pro و Ultra',
                    'للمزيد من المعلومات، قم بزيارة: https://antigravity.google/docs/get-started',
                    'للتحقق من الحساب والخطة الخاصة بك، قم بتسجيل الدخول في Google Antigravity IDE'
                ]
            }
        };
        
        res.json(response);
    } catch (error: any) {
        console.error('Error fetching Antigravity credits:', error);
        res.status(500).json({ 
            status: 'error',
            error: 'فشل في جلب معلومات الرصيد',
            message: error.message 
        });
    }
});

export default router;

