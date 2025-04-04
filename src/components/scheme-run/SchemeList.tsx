import { useState } from 'react';
import { format } from 'date-fns';
import { Play, FileText, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Scheme } from '@/types/scheme-run';

interface SchemeListProps {
  schemes: Scheme[];
  loading: boolean;
  onSimulate: (scheme: Scheme) => void;
  onRunProduction: (scheme: Scheme) => void;
  onViewLogs: (scheme: Scheme) => void;
  runningScheme: boolean;
}

export function SchemeList({
  schemes,
  loading,
  onSimulate,
  onRunProduction,
  onViewLogs,
  runningScheme
}: SchemeListProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'Approved':
        return <Badge variant="success" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'Simulated':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Simulated</Badge>;
      case 'ProdRun':
        return <Badge variant="destructive" className="bg-purple-100 text-purple-800">Production Run</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2">Loading schemes...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Scheme Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Effective Period</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schemes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No schemes found. Create a scheme to get started.
              </TableCell>
            </TableRow>
          ) : (
            schemes.map((scheme) => (
              <TableRow key={scheme.schemeId}>
                <TableCell className="font-medium">{scheme.name}</TableCell>
                <TableCell>{getStatusBadge(scheme.status)}</TableCell>
                <TableCell>{format(new Date(scheme.createdAt), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  {format(new Date(scheme.effectiveStart), 'MMM dd, yyyy')} - {format(new Date(scheme.effectiveEnd), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {scheme.lastRun ? (
                    <div className="text-sm">
                      <div>{format(new Date(scheme.lastRun.date), 'MMM dd, yyyy')}</div>
                      <div className="text-gray-500">{scheme.lastRun.agentsProcessed} agents</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Never run</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSimulate(scheme)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Simulate
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={scheme.status !== 'Approved' || runningScheme || scheme.status === 'ProdRun'}
                      onClick={() => onRunProduction(scheme)}
                    >
                      <BarChart className="h-4 w-4 mr-1" />
                      Run Production
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onViewLogs(scheme)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Logs
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
