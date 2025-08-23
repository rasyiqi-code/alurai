'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { getAllFormsAction } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText, Send, Calendar, User, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface FormData {
  id: string;
  title?: string;
  flow?: any[];
  slug?: string;
  status?: 'draft' | 'published';
  submissionCount: number;
  userId?: string;
  userInfo: {
    displayName: string | null;
    primaryEmail: string | null;
  };
  createdAt: string;
  updatedAt: string;
  publishStartTime?: string;
  publishEndTime?: string;
  [key: string]: any;
}

export default function AdminFormsPage() {
  const [forms, setForms] = useState<FormData[]>([]);
  const [filteredForms, setFilteredForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchForms() {
      try {
        const result = await getAllFormsAction();
        if ('error' in result) {
          setError(result.error || 'An error occurred');
        } else {
          setForms(result.forms);
          setFilteredForms(result.forms);
        }
      } catch (err) {
        setError('Failed to fetch forms data');
      } finally {
        setLoading(false);
      }
    }

    fetchForms();
  }, []);

  useEffect(() => {
    let filtered = forms;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(form => 
        form.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.userInfo.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.userInfo.primaryEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(form => {
        if (statusFilter === 'published') return form.status === 'published';
        if (statusFilter === 'draft') return form.status === 'draft';
        return true;
      });
    }

    setFilteredForms(filtered);
  }, [searchTerm, statusFilter, forms]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
            <div className="text-lg">Loading forms...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error: {error}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Form Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all forms across the platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forms.length}</div>
              <p className="text-xs text-muted-foreground">
                All forms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {forms.filter(form => form.status === 'published').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Published forms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {forms.filter(form => form.status === 'draft').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Unpublished forms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {forms.reduce((total, form) => total + form.submissionCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                All submissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Forms</CardTitle>
            <CardDescription>
              Search and filter all platform forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forms by title, description, or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear
              </Button>
            </div>

            {/* Forms Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForms.length > 0 ? (
                    filteredForms.map((form) => (
                      <TableRow key={form.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {form.title || 'Untitled Form'}
                            </div>
                            {form.description && (
                              <div className="text-sm text-muted-foreground">
                                {form.description.length > 60 
                                  ? `${form.description.substring(0, 60)}...` 
                                  : form.description
                                }
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              ID: {form.id.substring(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {form.userInfo.displayName || 'Unknown User'}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {form.userInfo.primaryEmail || 'No email'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(form.status || 'draft')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Send className="h-4 w-4 text-muted-foreground" />
                            <span>{form.submissionCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(form.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link 
                              href={`/admin/forms/${form.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>View</span>
                            </Link>

                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'No forms found matching your criteria.' 
                          : 'No forms found.'
                        }
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredForms.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredForms.length} of {forms.length} forms
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}