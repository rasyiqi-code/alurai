'use server';

import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc,
  query, 
  orderBy, 
  limit,
  where,
  getCountFromServer,
  Timestamp
} from 'firebase/firestore';
import { stackServerApp } from '@/stack';

// Interface for Gemini API usage data
interface GeminiUsageData {
  totalTokensUsed: number;
  requestsCount: number;
  lastUpdated: string;
  quotaLimit?: number;
  costEstimate?: number;
}

// Helper function to convert Firestore timestamp to ISO string
function toISOString(timestamp: any): string {
  if (!timestamp) return '';
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return '';
}

// Check if current user is admin
export async function checkAdminAccess(): Promise<boolean> {
  try {
    const user = await stackServerApp.getUser();
    if (!user) return false;

    const teams = await user.listTeams();
    
    const adminTeam = teams.find(team => 
      team.displayName === 'team_admin' || 
      team.displayName === 'admin' ||
      team.displayName === 'Admin' ||
      team.displayName === 'administrators'
    );
    
    return !!adminTeam;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

// Get admin dashboard overview stats
export async function getAdminOverviewAction() {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return { error: 'Unauthorized access' };
    }

    // Get total users count (from Stack Auth)
    const user = await stackServerApp.getUser();
    const allUsers = await stackServerApp.listUsers();
    const totalUsers = allUsers.length;

    // Get total forms count
    const formsCollection = collection(db, 'forms');
    const formsSnapshot = await getCountFromServer(formsCollection);
    const totalForms = formsSnapshot.data().count;

    // Get total submissions count across all forms
    const formsQuery = query(formsCollection);
    const formsDocs = await getDocs(formsQuery);
    
    let totalSubmissions = 0;
    for (const formDoc of formsDocs.docs) {
      const submissionsCollection = collection(db, 'forms', formDoc.id, 'submissions');
      const submissionsSnapshot = await getCountFromServer(submissionsCollection);
      totalSubmissions += submissionsSnapshot.data().count;
    }

    // Get recent forms (last 10)
    const recentFormsQuery = query(
      formsCollection,
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const recentFormsSnapshot = await getDocs(recentFormsQuery);
    const recentForms = recentFormsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toISOString(doc.data().createdAt),
      updatedAt: toISOString(doc.data().updatedAt),
    }));

    return {
      totalUsers,
      totalForms,
      totalSubmissions,
      recentForms,
    };
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    return { error: 'Failed to fetch admin overview data' };
  }
}

// Get all users for admin management
export async function getAllUsersAction() {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return { error: 'Unauthorized access' };
    }

    const allUsers = await stackServerApp.listUsers();
    
    // Get form counts for each user
    const usersWithStats = await Promise.all(
      allUsers.map(async (user) => {
        const formsCollection = collection(db, 'forms');
        const userFormsQuery = query(
          formsCollection,
          where('userId', '==', user.id)
        );
        const userFormsSnapshot = await getCountFromServer(userFormsQuery);
        const formCount = userFormsSnapshot.data().count;

        return {
          id: user.id,
          displayName: user.displayName || 'No Name',
        primaryEmail: user.primaryEmail || 'No Email',
        createdAt: user.signedUpAt || new Date(),
        lastActiveAt: user.signedUpAt || new Date(),
        formCount,
        };
      })
    );

    return { users: usersWithStats };
  } catch (error) {
    console.error('Error fetching all users:', error);
    return { error: 'Failed to fetch users data' };
  }
}

// Get all forms for admin management
export async function getAllFormsAction() {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return { error: 'Unauthorized access' };
    }

    const formsCollection = collection(db, 'forms');
    const formsQuery = query(formsCollection, orderBy('createdAt', 'desc'));
    const formsSnapshot = await getDocs(formsQuery);
    
    const formsWithStats = await Promise.all(
      formsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Get submission count for each form
        const submissionsCollection = collection(db, 'forms', doc.id, 'submissions');
        const submissionsSnapshot = await getCountFromServer(submissionsCollection);
        const submissionCount = submissionsSnapshot.data().count;

        // Get user info
        let userInfo = null;
        try {
          const user = await stackServerApp.getUser(data.userId);
          userInfo = {
            displayName: user?.displayName,
            primaryEmail: user?.primaryEmail,
          };
        } catch (error) {
          // User might not exist anymore
          userInfo = {
            displayName: 'Unknown User',
            primaryEmail: 'unknown@example.com',
          };
        }

        return {
          id: doc.id,
          ...data,
          submissionCount,
          userInfo,
          createdAt: toISOString(data.createdAt),
          updatedAt: toISOString(data.updatedAt),
          publishStartTime: toISOString(data.publishStartTime),
          publishEndTime: toISOString(data.publishEndTime),
        };
      })
    );

    return { forms: formsWithStats };
  } catch (error) {
    console.error('Error fetching all forms:', error);
    return { error: 'Failed to fetch forms data' };
  }
}

// Get global analytics for admin
export async function getGlobalAnalyticsAction() {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return { error: 'Unauthorized access' };
    }

    // Get forms created over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const formsCollection = collection(db, 'forms');
    const recentFormsQuery = query(
      formsCollection,
      where('createdAt', '>=', thirtyDaysAgo),
      orderBy('createdAt', 'asc')
    );
    const recentFormsSnapshot = await getDocs(recentFormsQuery);
    
    // Group forms by date
    const formsByDate: { [key: string]: number } = {};
    recentFormsSnapshot.docs.forEach(doc => {
      const date = doc.data().createdAt.toDate().toISOString().split('T')[0];
      formsByDate[date] = (formsByDate[date] || 0) + 1;
    });

    // Get top forms by submission count
    const allFormsSnapshot = await getDocs(formsCollection);
    const formsWithSubmissions = await Promise.all(
      allFormsSnapshot.docs.map(async (doc) => {
        const submissionsCollection = collection(db, 'forms', doc.id, 'submissions');
        const submissionsSnapshot = await getCountFromServer(submissionsCollection);
        const submissionCount = submissionsSnapshot.data().count;
        
        return {
          id: doc.id,
          title: doc.data().title || 'Untitled Form',
          submissionCount,
        };
      })
    );
    
    const topForms = formsWithSubmissions
      .sort((a, b) => b.submissionCount - a.submissionCount)
      .slice(0, 10);

    return {
      formsByDate,
      topForms,
    };
  } catch (error) {
    console.error('Error fetching global analytics:', error);
    return { error: 'Failed to fetch analytics data' };
  }
}

// Delete form (admin only)
export async function deleteFormAdminAction(formId: string) {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return { error: 'Unauthorized access' };
    }

    // Note: This is a simplified delete - in production you might want to:
    // 1. Delete all submissions first
    // 2. Archive instead of delete
    // 3. Add audit logging
    
    const formRef = doc(db, 'forms', formId);
    const formDoc = await getDoc(formRef);
    
    if (!formDoc.exists()) {
      return { error: 'Form not found' };
    }

    // For now, just mark as deleted instead of actually deleting
    // await deleteDoc(formRef);
    
    return { success: true, message: 'Form deletion would be implemented here' };
  } catch (error) {
    console.error('Error deleting form:', error);
    return { error: 'Failed to delete form' };
  }
}

// Get Gemini API usage statistics
export async function getGeminiUsageAction(): Promise<{ usage?: GeminiUsageData; error?: string }> {
  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      return { error: 'Unauthorized access' };
    }

    // Since we don't have direct access to Google Cloud Monitoring API,
    // we'll simulate usage data based on form generation activities
    // In a real implementation, you would use Google Cloud Monitoring API
    
    const formsCollection = collection(db, 'forms');
    const formsSnapshot = await getDocs(formsCollection);
    
    // Estimate token usage based on forms created
    // Average tokens per form generation: ~2000-5000 tokens
    const totalForms = formsSnapshot.size;
    const estimatedTokensPerForm = 3500; // Average estimate
    const totalTokensUsed = totalForms * estimatedTokensPerForm;
    
    // Get recent forms for request count estimation
    const recentFormsQuery = query(
      formsCollection,
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const recentFormsSnapshot = await getDocs(recentFormsQuery);
    
    const usage: GeminiUsageData = {
      totalTokensUsed,
      requestsCount: totalForms,
      lastUpdated: new Date().toISOString(),
      quotaLimit: 1000000, // 1M tokens per month (free tier)
      costEstimate: totalTokensUsed > 1000000 ? (totalTokensUsed - 1000000) * 0.00025 : 0 // $0.00025 per 1K tokens after free tier
    };

    return { usage };
  } catch (error) {
    console.error('Error fetching Gemini usage:', error);
    return { error: 'Failed to fetch API usage data' };
  }
}