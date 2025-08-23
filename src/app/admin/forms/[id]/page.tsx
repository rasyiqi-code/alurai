'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Send, FileText } from 'lucide-react';
import Link from 'next/link';
import { getFormAction, getSubmissionsAction } from '@/app/actions';

import { FormFlowData } from '@/lib/types';

interface SubmissionData {
  id: string;
  data: Record<string, any>;
  submittedAt: any;
}

export default function AdminFormDetailPage() {
  const params = useParams();
  const formId = params.id as string;
  
  const [form, setForm] = useState<FormFlowData | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch form data
        const formResult = await getFormAction(formId);
        if (!formResult || 'error' in formResult) {
          setError(formResult?.error || 'Form not found');
          return;
        }
        setForm(formResult);

        // Fetch submissions
        const submissionsResult = await getSubmissionsAction(formId);
        if ('error' in submissionsResult) {
          console.error('Error fetching submissions:', submissionsResult.error);
        } else {
          setSubmissions(submissionsResult);
        }
      } catch (err) {
        setError('Failed to fetch form data');
      } finally {
        setLoading(false);
      }
    }

    if (formId) {
      fetchData();
    }
  }, [formId]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    return status === 'published' ? (
      <Badge className="bg-green-100 text-green-800">Published</Badge>
    ) : (
      <Badge variant="secondary">Draft</Badge>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading form details...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !form) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">
              Error: {error || 'Form not found'}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/admin/forms">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {form.title || 'Untitled Form'}
            </h1>
            <p className="text-muted-foreground">
              Form ID: {form.id}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(form.status || 'draft')}
          </div>
        </div>

        {/* Form Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Form Information</CardTitle>
              <CardDescription>
                Basic details about this form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <p className="text-sm">{form.title || 'Untitled Form'}</p>
              </div>
              

              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  {getStatusBadge(form.status || 'draft')}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Form ID</label>
                <p className="text-sm font-mono">{form.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
              <CardDescription>
                Important dates for this form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{formatDate(form.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">{formatDate(form.updatedAt)}</p>
                </div>
              </div>
              
              {form.publishStartTime && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Publish Start</label>
                    <p className="text-sm">{formatDate(form.publishStartTime)}</p>
                  </div>
                </div>
              )}
              
              {form.publishEndTime && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Publish End</label>
                    <p className="text-sm">{formatDate(form.publishEndTime)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Form Fields ({form.flow?.length || 0})</span>
            </CardTitle>
            <CardDescription>
              Structure and configuration of form fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            {form.flow && form.flow.length > 0 ? (
              <div className="space-y-4">
                {form.flow.map((field, index) => (
                  <div key={field.id || index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{field.question || `Field ${index + 1}`}</h4>
                      <Badge variant="outline">{field.inputType}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Key: {field.key}
                      {field.validationRules && field.validationRules.length > 0 && (
                        ` • Validation: ${field.validationRules.join(', ')}`
                      )}
                      {field.options && field.options.length > 0 && (
                        ` • Options: ${field.options.join(', ')}`
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No fields configured
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Submissions ({submissions.length})</span>
            </CardTitle>
            <CardDescription>
              Recent submissions to this form
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.slice(0, 10).map((submission) => (
                  <div key={submission.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Submission {submission.id.substring(0, 8)}...</h4>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(submission.submittedAt)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {submission.data && Object.entries(submission.data).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium text-muted-foreground">{key}:</span>
                          <span className="ml-2">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                      {!submission.data && (
                        <div className="text-sm text-muted-foreground">
                          No data available
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {submissions.length > 10 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Showing 10 of {submissions.length} submissions
                    </p>
                    <Link href={`/admin/forms/${form.id}/submissions`}>
                      <Button variant="outline" size="sm" className="mt-2">
                        View All Submissions
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No submissions yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}