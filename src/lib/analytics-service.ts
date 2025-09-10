import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  startAt,
  endAt,
  getCountFromServer
} from 'firebase/firestore';
import { 
  FormView, 
  FormInteraction, 
  FormSubmission, 
  DailyAnalytics, 
  FormAnalytics, 
  AnalyticsOverview 
} from './analytics-schema';

export class AnalyticsService {
  // Track form view
  static async trackFormView(data: Omit<FormView, 'id' | 'timestamp'>): Promise<void> {
    try {
      const viewData: FormView = {
        ...data,
        id: crypto.randomUUID(),
        timestamp: new Date()
      };

      await addDoc(collection(db, 'form_views'), {
        ...viewData,
        timestamp: Timestamp.fromDate(viewData.timestamp)
      });

      // Update daily analytics
      await this.updateDailyAnalytics(data.formId, 'view');
    } catch (error) {
      console.error('Error tracking form view:', error);
    }
  }

  // Track form interaction
  static async trackFormInteraction(data: Omit<FormInteraction, 'id' | 'timestamp'>): Promise<void> {
    try {
      const interactionData: FormInteraction = {
        ...data,
        id: crypto.randomUUID(),
        timestamp: new Date()
      };

      await addDoc(collection(db, 'form_interactions'), {
        ...interactionData,
        timestamp: Timestamp.fromDate(interactionData.timestamp)
      });

      // Update daily analytics for specific actions
      if (data.action === 'start') {
        await this.updateDailyAnalytics(data.formId, 'start');
      } else if (data.action === 'submit') {
        await this.updateDailyAnalytics(data.formId, 'submit');
      }
    } catch (error) {
      console.error('Error tracking form interaction:', error);
    }
  }

  // Track form submission
  static async trackFormSubmission(data: Omit<FormSubmission, 'id' | 'timestamp'>): Promise<void> {
    try {
      const submissionData: FormSubmission = {
        ...data,
        id: crypto.randomUUID(),
        timestamp: new Date()
      };

      await addDoc(collection(db, 'form_submissions'), {
        ...submissionData,
        timestamp: Timestamp.fromDate(submissionData.timestamp)
      });

      // Update daily analytics
      await this.updateDailyAnalytics(data.formId, 'completion');
    } catch (error) {
      console.error('Error tracking form submission:', error);
    }
  }

  // Update daily analytics
  private static async updateDailyAnalytics(formId: string, action: 'view' | 'start' | 'submit' | 'completion'): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyId = `${formId}_${today}`;
      const dailyRef = doc(db, 'daily_analytics', dailyId);

      const dailyDoc = await getDoc(dailyRef);
      
      if (dailyDoc.exists()) {
        const currentData = dailyDoc.data();
        const updates: any = {};

        switch (action) {
          case 'view':
            updates.views = (currentData.views || 0) + 1;
            break;
          case 'start':
            updates.submissions = (currentData.submissions || 0) + 1;
            break;
          case 'submit':
            updates.completions = (currentData.completions || 0) + 1;
            break;
          case 'completion':
            updates.completions = (currentData.completions || 0) + 1;
            break;
        }

        await setDoc(dailyRef, updates, { merge: true });
      } else {
        // Create new daily analytics entry
        const newDailyData: DailyAnalytics = {
          id: dailyId,
          formId,
          date: today,
          views: action === 'view' ? 1 : 0,
          submissions: action === 'start' ? 1 : 0,
          completions: action === 'completion' ? 1 : 0,
          abandonmentRate: 0,
          avgCompletionTime: 0,
          avgFieldsCompleted: 0,
          deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
          countryBreakdown: {},
          hourlyBreakdown: {}
        };

        await setDoc(dailyRef, {
          ...newDailyData,
          lastUpdated: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error updating daily analytics:', error);
    }
  }

  // Get form analytics
  static async getFormAnalytics(formId: string, days: number = 30): Promise<FormAnalytics | null> {
    try {
      // Get daily analytics for the period - using simpler query to avoid index requirement
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Use simpler query without composite index requirement
      const dailyQuery = query(
        collection(db, 'daily_analytics'),
        where('formId', '==', formId)
      );

      const dailySnapshot = await getDocs(dailyQuery);
      const dailyData: DailyAnalytics[] = dailySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            formId: data.formId || '',
            date: data.date || '',
            views: data.views || 0,
            submissions: data.submissions || 0,
            completions: data.completions || 0,
            abandonmentRate: data.abandonmentRate || 0,
            avgCompletionTime: data.avgCompletionTime || 0,
            avgFieldsCompleted: data.avgFieldsCompleted || 0,
            deviceBreakdown: data.deviceBreakdown || { desktop: 0, mobile: 0, tablet: 0 },
            countryBreakdown: data.countryBreakdown || {},
            hourlyBreakdown: data.hourlyBreakdown || {}
          } as DailyAnalytics;
        })
        .filter((data) => 
          data.date >= startDateStr && data.date <= endDateStr
        )
        .sort((a, b) => b.date.localeCompare(a.date));

      if (dailyData.length === 0) {
        // Return empty analytics data instead of null to avoid breaking the UI
        return {
          formId,
          totalViews: 0,
          totalSubmissions: 0,
          totalCompletions: 0,
          conversionRate: 0,
          completionRate: 0,
          avgCompletionTime: 0,
          avgFieldsCompleted: 0,
          bounceRate: 0,
          lastUpdated: new Date(),
          dailyData: []
        };
      }

      // Calculate aggregated metrics
      const totalViews = dailyData.reduce((sum, day) => sum + day.views, 0);
      const totalSubmissions = dailyData.reduce((sum, day) => sum + day.submissions, 0);
      const totalCompletions = dailyData.reduce((sum, day) => sum + day.completions, 0);

      const conversionRate = totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0;
      const completionRate = totalSubmissions > 0 ? (totalCompletions / totalSubmissions) * 100 : 0;
      const bounceRate = totalViews > 0 ? ((totalViews - totalSubmissions) / totalViews) * 100 : 0;

      const avgCompletionTime = dailyData.reduce((sum, day) => sum + day.avgCompletionTime, 0) / dailyData.length;
      const avgFieldsCompleted = dailyData.reduce((sum, day) => sum + day.avgFieldsCompleted, 0) / dailyData.length;

      return {
        formId,
        totalViews,
        totalSubmissions,
        totalCompletions,
        conversionRate,
        completionRate,
        avgCompletionTime,
        avgFieldsCompleted,
        bounceRate,
        lastUpdated: new Date(),
        dailyData
      };
    } catch (error) {
      console.error('Error getting form analytics:', error);
      return null;
    }
  }

  // Get analytics overview
  static async getAnalyticsOverview(userId: string, days: number = 30): Promise<AnalyticsOverview | null> {
    try {
      // Get user's forms
      const formsQuery = query(
        collection(db, 'forms'),
        where('userId', '==', userId)
      );
      const formsSnapshot = await getDocs(formsQuery);
      const formIds = formsSnapshot.docs.map(doc => doc.id);

      if (formIds.length === 0) {
        return {
          totalForms: 0,
          totalViews: 0,
          totalSubmissions: 0,
          totalCompletions: 0,
          avgConversionRate: 0,
          avgCompletionRate: 0,
          avgBounceRate: 0,
          mostPopularForm: null,
          trends: {
            views: { current: 0, previous: 0, change: 0 },
            submissions: { current: 0, previous: 0, change: 0 },
            conversion: { current: 0, previous: 0, change: 0 }
          },
          deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
          countryBreakdown: {},
          hourlyActivity: {}
        };
      }

      // Get daily analytics for all forms - using simpler query to avoid index requirement
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Use simpler query without composite index requirement
      const dailyQuery = query(
        collection(db, 'daily_analytics'),
        where('formId', 'in', formIds)
      );

      const dailySnapshot = await getDocs(dailyQuery);
      const dailyData: DailyAnalytics[] = dailySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            formId: data.formId || '',
            date: data.date || '',
            views: data.views || 0,
            submissions: data.submissions || 0,
            completions: data.completions || 0,
            abandonmentRate: data.abandonmentRate || 0,
            avgCompletionTime: data.avgCompletionTime || 0,
            avgFieldsCompleted: data.avgFieldsCompleted || 0,
            deviceBreakdown: data.deviceBreakdown || { desktop: 0, mobile: 0, tablet: 0 },
            countryBreakdown: data.countryBreakdown || {},
            hourlyBreakdown: data.hourlyBreakdown || {}
          } as DailyAnalytics;
        })
        .filter((data) => 
          data.date >= startDateStr && data.date <= endDateStr
        );

      // Calculate overview metrics
      const totalViews = dailyData.reduce((sum, day) => sum + day.views, 0);
      const totalSubmissions = dailyData.reduce((sum, day) => sum + day.submissions, 0);
      const totalCompletions = dailyData.reduce((sum, day) => sum + day.completions, 0);

      const avgConversionRate = totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0;
      const avgCompletionRate = totalSubmissions > 0 ? (totalCompletions / totalSubmissions) * 100 : 0;
      const avgBounceRate = totalViews > 0 ? ((totalViews - totalSubmissions) / totalViews) * 100 : 0;

      // Find most popular form
      const formStats = new Map<string, { views: number; submissions: number; title: string }>();
      
      formsSnapshot.docs.forEach(formDoc => {
        const formData = formDoc.data();
        formStats.set(formDoc.id, {
          views: 0,
          submissions: 0,
          title: formData.title
        });
      });

      dailyData.forEach(day => {
        const stats = formStats.get(day.formId);
        if (stats) {
          stats.views += day.views;
          stats.submissions += day.submissions;
        }
      });

      let mostPopularForm = null;
      let maxViews = 0;
      formStats.forEach((stats, formId) => {
        if (stats.views > maxViews) {
          maxViews = stats.views;
          mostPopularForm = {
            id: formId,
            title: stats.title,
            views: stats.views,
            submissions: stats.submissions
          };
        }
      });

      // Calculate trends (current vs previous period)
      const currentPeriod = dailyData.filter(day => {
        const dayDate = new Date(day.date);
        const midPoint = new Date();
        midPoint.setDate(midPoint.getDate() - days / 2);
        return dayDate >= midPoint;
      });

      const previousPeriod = dailyData.filter(day => {
        const dayDate = new Date(day.date);
        const midPoint = new Date();
        midPoint.setDate(midPoint.getDate() - days / 2);
        return dayDate < midPoint;
      });

      const currentViews = currentPeriod.reduce((sum, day) => sum + day.views, 0);
      const previousViews = previousPeriod.reduce((sum, day) => sum + day.views, 0);
      const currentSubmissions = currentPeriod.reduce((sum, day) => sum + day.submissions, 0);
      const previousSubmissions = previousPeriod.reduce((sum, day) => sum + day.submissions, 0);

      const viewsChange = previousViews > 0 ? ((currentViews - previousViews) / previousViews) * 100 : 0;
      const submissionsChange = previousSubmissions > 0 ? ((currentSubmissions - previousSubmissions) / previousSubmissions) * 100 : 0;

      // Aggregate device and country breakdown
      const deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0 };
      const countryBreakdown: Record<string, number> = {};
      const hourlyActivity: Record<string, number> = {};

      dailyData.forEach(day => {
        deviceBreakdown.desktop += day.deviceBreakdown.desktop;
        deviceBreakdown.mobile += day.deviceBreakdown.mobile;
        deviceBreakdown.tablet += day.deviceBreakdown.tablet;

        Object.entries(day.countryBreakdown).forEach(([country, count]) => {
          countryBreakdown[country] = (countryBreakdown[country] || 0) + count;
        });

        Object.entries(day.hourlyBreakdown).forEach(([hour, count]) => {
          hourlyActivity[hour] = (hourlyActivity[hour] || 0) + count;
        });
      });

      return {
        totalForms: formIds.length,
        totalViews,
        totalSubmissions,
        totalCompletions,
        avgConversionRate,
        avgCompletionRate,
        avgBounceRate,
        mostPopularForm,
        trends: {
          views: { current: currentViews, previous: previousViews, change: viewsChange },
          submissions: { current: currentSubmissions, previous: previousSubmissions, change: submissionsChange },
          conversion: { current: avgConversionRate, previous: 0, change: 0 } // TODO: Calculate previous conversion rate
        },
        deviceBreakdown,
        countryBreakdown,
        hourlyActivity
      };
    } catch (error) {
      console.error('Error getting analytics overview:', error);
      return null;
    }
  }

  // Get device info from user agent
  static getDeviceInfo(userAgent: string): { device: 'desktop' | 'mobile' | 'tablet'; browser: string; os: string } {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent);
    
    let device: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (isTablet) device = 'tablet';
    else if (isMobile) device = 'mobile';

    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return { device, browser, os };
  }
}
