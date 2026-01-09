// server/routes/geminiCredits.ts
import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

const AGENT_BASE_PATH = 'D:\\AntigravityAgent';
const LOGS_PATH = path.join(AGENT_BASE_PATH, 'logs');
const HISTORY_PATH = path.join(AGENT_BASE_PATH, 'history');

// Helper to calculate time until next renewal (5 hours)
function getNextRenewalTime(lastRenewal?: Date): { nextRenewal: Date; timeRemaining: string } {
    const now = new Date();
    const fiveHoursInMs = 5 * 60 * 60 * 1000;
    
    // If we have last renewal, calculate from there, otherwise from now
    const lastRenewalTime = lastRenewal ? lastRenewal.getTime() : now.getTime();
    const nextRenewalTime = lastRenewalTime + fiveHoursInMs;
    const nextRenewal = new Date(nextRenewalTime);
    
    // If next renewal is in the past, it means we need a new renewal cycle
    if (nextRenewal <= now) {
        // Calculate how many cycles have passed
        const cyclesPassed = Math.floor((now.getTime() - lastRenewalTime) / fiveHoursInMs) + 1;
        const adjustedRenewalTime = lastRenewalTime + (cyclesPassed * fiveHoursInMs);
        const adjustedNextRenewal = new Date(adjustedRenewalTime);
        
        const remaining = adjustedNextRenewal.getTime() - now.getTime();
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        
        return {
            nextRenewal: adjustedNextRenewal,
            timeRemaining: `${hours} ساعة و ${minutes} دقيقة`
        };
    }
    
    const remaining = nextRenewal.getTime() - now.getTime();
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return {
        nextRenewal,
        timeRemaining: `${hours} ساعة و ${minutes} دقيقة`
    };
}

// Get credits info
router.get('/', async (req, res) => {
    try {
        // Try to find last activity time from logs
        let lastActivity: Date | undefined;
        let totalRequests = 0;
        
        if (fs.existsSync(LOGS_PATH)) {
            const logFiles = fs.readdirSync(LOGS_PATH)
                .filter(f => f.endsWith('.json'))
                .sort()
                .reverse();
            
            totalRequests = logFiles.length;
            
            // Get the most recent log file to estimate last renewal
            if (logFiles.length > 0) {
                try {
                    const recentLog = JSON.parse(
                        fs.readFileSync(path.join(LOGS_PATH, logFiles[0]), 'utf-8')
                    );
                    if (recentLog.timestamp) {
                        lastActivity = new Date(recentLog.timestamp);
                    }
                } catch (e) {
                    // Skip invalid logs
                }
            }
        }
        
        const renewal = getNextRenewalTime(lastActivity);
        
        // Estimate remaining credits (this is approximate)
        // Since we don't have exact credit info, we'll provide renewal info
        const response = {
            status: 'success',
            message: 'معلومات رصيد Google Gemini API',
            info: {
                renewalCycle: 'كل 5 ساعات',
                nextRenewal: renewal.nextRenewal.toISOString(),
                nextRenewalLocal: renewal.nextRenewal.toLocaleString('ar-SA', {
                    timeZone: 'Asia/Riyadh',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                timeRemaining: renewal.timeRemaining,
                totalRequests: totalRequests,
                lastActivity: lastActivity?.toISOString() || null,
                note: 'الرصيد يجدد تلقائياً كل 5 ساعات. للتحقق الدقيق من الرصيد، يرجى زيارة Google Cloud Console.'
            }
        };
        
        res.json(response);
    } catch (error: any) {
        console.error('Error fetching Gemini credits:', error);
        res.status(500).json({ 
            error: 'فشل في جلب معلومات الرصيد',
            message: error.message 
        });
    }
});

export default router;
