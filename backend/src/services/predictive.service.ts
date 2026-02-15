/**
 * Predictive Analytics Service
 * 
 * Advanced analytics for predicting user success and providing insights
 */

import { UserProgress } from '../models/UserProgress';
import { PracticeLog } from '../models/PracticeLog';
import { User } from '../models/User';
import mongoose from 'mongoose';

export class PredictiveService {
    /**
     * Calculate success probability based on current progress
     * Returns a score from 0-100
     */
    static async calculateSuccessProbability(userId: string): Promise<number> {
        const userProgress = await UserProgress.findOne({ userId });
        if (!userProgress) return 0;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentPractice = await PracticeLog.find({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: thirtyDaysAgo },
        });

        // Factors that contribute to success
        const factors = {
            overallAccuracy: userProgress.overallAccuracy || 0,
            consistency: userProgress.overallConsistency || 0,
            topicsCovered: userProgress.topicProgress?.length || 0,
            practiceFrequency: recentPractice.length / 30, // practices per day
            timeInvested: recentPractice.reduce((sum, log) => sum + (log.timeSpent || 0), 0),
        };

        // Weighted calculation
        let probability = 0;
        probability += factors.overallAccuracy * 0.35; // 35% weight
        probability += factors.consistency * 0.25; // 25% weight
        probability += Math.min(factors.topicsCovered * 5, 20); // 20% weight, max 20
        probability += Math.min(factors.practiceFrequency * 10, 15); // 15% weight, max 15
        probability += Math.min(factors.timeInvested / 60, 5); // 5% weight, max 5

        return Math.min(Math.round(probability), 100);
    }

    /**
     * Forecast performance trend (improving, declining, stable)
     */
    static async forecastPerformance(userId: string): Promise<{
        trend: 'improving' | 'declining' | 'stable';
        confidence: number;
        details: string;
    }> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        // Get practice logs for last 60 days
        const allLogs = await PracticeLog.find({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: sixtyDaysAgo },
        }).sort({ createdAt: 1 });

        if (allLogs.length < 10) {
            return {
                trend: 'stable',
                confidence: 30,
                details: 'Not enough data to predict trend accurately',
            };
        }

        // Split into two periods
        const midpoint = new Date();
        midpoint.setDate(midpoint.getDate() - 30);
        const olderLogs = allLogs.filter((log) => log.createdAt < midpoint);
        const recentLogs = allLogs.filter((log) => log.createdAt >= midpoint);

        // Calculate average accuracy for each period
        const olderAccuracy =
            olderLogs.reduce((sum, log) => sum + (log.isCorrect ? 100 : 0), 0) / olderLogs.length;
        const recentAccuracy =
            recentLogs.reduce((sum, log) => sum + (log.isCorrect ? 100 : 0), 0) / recentLogs.length;

        const difference = recentAccuracy - olderAccuracy;

        let trend: 'improving' | 'declining' | 'stable';
        let details: string;

        if (difference > 10) {
            trend = 'improving';
            details = `Accuracy improved by ${Math.round(difference)}% in the last 30 days`;
        } else if (difference < -10) {
            trend = 'declining';
            details = `Accuracy declined by ${Math.round(Math.abs(difference))}% in the last 30 days`;
        } else {
            trend = 'stable';
            details = 'Performance has been consistent over the last 60 days';
        }

        const confidence = Math.min(allLogs.length * 2, 100);

        return { trend, confidence, details };
    }

    /**
     * Detect optimal study time based on performance patterns
     */
    static async detectOptimalStudyTime(userId: string): Promise<{
        bestHour: number;
        worstHour: number;
        recommendation: string;
    }> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const logs = await PracticeLog.find({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: thirtyDaysAgo },
        });

        if (logs.length < 20) {
            return {
                bestHour: 18,
                worstHour: 2,
                recommendation: 'Not enough data. Try practicing at different times to find your peak.',
            };
        }

        // Group by hour and calculate accuracy
        const hourlyPerformance: { [hour: number]: { correct: number; total: number } } = {};

        logs.forEach((log) => {
            const hour = new Date(log.createdAt).getHours();
            if (!hourlyPerformance[hour]) {
                hourlyPerformance[hour] = { correct: 0, total: 0 };
            }
            hourlyPerformance[hour].total++;
            if (log.isCorrect) hourlyPerformance[hour].correct++;
        });

        // Calculate accuracy for each hour
        const hourlyAccuracy: { hour: number; accuracy: number }[] = [];
        Object.keys(hourlyPerformance).forEach((hourStr) => {
            const hour = parseInt(hourStr);
            const data = hourlyPerformance[hour];
            if (data.total >= 3) {
                // Only consider hours with at least 3 practices
                hourlyAccuracy.push({
                    hour,
                    accuracy: (data.correct / data.total) * 100,
                });
            }
        });

        if (hourlyAccuracy.length === 0) {
            return {
                bestHour: 18,
                worstHour: 2,
                recommendation: 'Practice more consistently to identify your optimal study time.',
            };
        }

        // Sort by accuracy
        hourlyAccuracy.sort((a, b) => b.accuracy - a.accuracy);

        const bestHour = hourlyAccuracy[0].hour;
        const worstHour = hourlyAccuracy[hourlyAccuracy.length - 1].hour;

        const formatHour = (h: number) => {
            const period = h >= 12 ? 'PM' : 'AM';
            const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
            return `${displayHour}:00 ${period}`;
        };

        return {
            bestHour,
            worstHour,
            recommendation: `You perform best around ${formatHour(bestHour)}. Try to schedule important practice sessions during this time.`,
        };
    }

    /**
     * Detect signs of burnout
     */
    static async detectBurnout(userId: string): Promise<{
        riskLevel: 'low' | 'medium' | 'high';
        indicators: string[];
        recommendation: string;
    }> {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const recentLogs = await PracticeLog.find({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: sevenDaysAgo },
        });

        const olderLogs = await PracticeLog.find({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
        });

        const indicators: string[] = [];
        let riskScore = 0;

        // Check for declining accuracy
        if (recentLogs.length > 5 && olderLogs.length > 5) {
            const recentAccuracy =
                recentLogs.filter((l) => l.isCorrect).length / recentLogs.length;
            const olderAccuracy = olderLogs.filter((l) => l.isCorrect).length / olderLogs.length;

            if (recentAccuracy < olderAccuracy - 0.15) {
                indicators.push('Significant drop in accuracy');
                riskScore += 30;
            }
        }

        // Check for excessive practice
        const totalTimeThisWeek = recentLogs.reduce((sum, log) => sum + (log.timeSpent || 0), 0);
        if (totalTimeThisWeek > 20 * 60) {
            // More than 20 hours
            indicators.push('Excessive study time (>20 hours/week)');
            riskScore += 25;
        }

        // Check for irregular patterns
        const practicesPerDay = recentLogs.length / 7;
        if (practicesPerDay > 10) {
            indicators.push('Very high practice frequency');
            riskScore += 20;
        }

        // Check for late night sessions
        const lateNightSessions = recentLogs.filter((log) => {
            const hour = new Date(log.createdAt).getHours();
            return hour >= 0 && hour < 5;
        });

        if (lateNightSessions.length > 3) {
            indicators.push('Multiple late-night study sessions');
            riskScore += 25;
        }

        let riskLevel: 'low' | 'medium' | 'high';
        let recommendation: string;

        if (riskScore >= 50) {
            riskLevel = 'high';
            recommendation =
                'Take a break! Consider reducing study hours and ensuring adequate rest. Quality over quantity.';
        } else if (riskScore >= 25) {
            riskLevel = 'medium';
            recommendation =
                'Monitor your study patterns. Ensure you are taking regular breaks and maintaining work-life balance.';
        } else {
            riskLevel = 'low';
            recommendation = 'Your study patterns look healthy. Keep up the good work!';
        }

        if (indicators.length === 0) {
            indicators.push('No burnout indicators detected');
        }

        return { riskLevel, indicators, recommendation };
    }

    /**
     * Get comprehensive user insights
     */
    static async getUserInsights(userId: string) {
        const [successProbability, performanceForecast, optimalTime, burnoutRisk] =
            await Promise.all([
                this.calculateSuccessProbability(userId),
                this.forecastPerformance(userId),
                this.detectOptimalStudyTime(userId),
                this.detectBurnout(userId),
            ]);

        return {
            successProbability,
            performanceForecast,
            optimalTime,
            burnoutRisk,
            generatedAt: new Date(),
        };
    }
}
