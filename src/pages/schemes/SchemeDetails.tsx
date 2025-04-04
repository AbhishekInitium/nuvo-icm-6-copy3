
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { schemeApi } from '@/api/schemes';
import { Scheme } from '@/types/scheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Edit, Copy } from 'lucide-react';

export function SchemeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const clientId = 'client_XYZ'; // This would normally come from user context

  // Fetch the scheme details
  const { 
    data: scheme,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['scheme', id],
    queryFn: () => schemeApi.getScheme(id as string),
    enabled: !!id,
  });

  // Create a new version mutation
  const createVersionMutation = useMutation({
    mutationFn: (schemeId: string) => schemeApi.createSchemeVersion(schemeId),
    onSuccess: (newScheme) => {
      toast({
        title: "Success",
        description: "New version created successfully",
      });
      navigate(`/schemes/${newScheme.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create new version",
        variant: "destructive",
      });
    },
  });

  const handleEditScheme = () => {
    navigate(`/schemes/edit/${id}`);
  };

  const handleCreateVersion = () => {
    if (id) {
      createVersionMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !scheme) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          {error instanceof Error ? error.message : "Failed to load scheme"}
        </div>
        <Link to="/schemes">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schemes List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/schemes">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{scheme.name}</h1>
          <Badge variant={getStatusVariant(scheme.status)} className="ml-3">
            {scheme.status}
          </Badge>
        </div>
        <div className="space-x-2">
          {scheme.status === 'Draft' ? (
            <Button onClick={handleEditScheme}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Scheme
            </Button>
          ) : (
            <Button onClick={handleCreateVersion}>
              <Copy className="mr-2 h-4 w-4" />
              Create Version
            </Button>
          )}
        </div>
      </div>

      {scheme.versionOf && (
        <div className="mb-6 p-4 bg-muted rounded-md">
          <p className="text-sm">
            This scheme is a version of scheme <Link to={`/schemes/${scheme.versionOf}`} className="text-primary underline">{scheme.versionOf}</Link>
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="font-medium">Description</div>
                <div className="text-muted-foreground">
                  {scheme.description || 'No description'}
                </div>
              </div>
              <div>
                <div className="font-medium">Effective Period</div>
                <div className="text-muted-foreground">
                  {new Date(scheme.effectiveStart).toLocaleDateString()} to {new Date(scheme.effectiveEnd).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="font-medium">Configuration</div>
                <div className="text-muted-foreground">
                  {scheme.configName}
                </div>
              </div>
              <div>
                <div className="font-medium">Quota Amount</div>
                <div className="text-muted-foreground">
                  {formatCurrency(scheme.quotaAmount)}
                </div>
              </div>
              <div>
                <div className="font-medium">Revenue Base</div>
                <div className="text-muted-foreground">
                  {scheme.revenueBase}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="font-medium">Created</div>
                <div className="text-muted-foreground">
                  {new Date(scheme.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="font-medium">Last Updated</div>
                <div className="text-muted-foreground">
                  {new Date(scheme.updatedAt).toLocaleString()}
                </div>
              </div>
              {scheme.approvalInfo && scheme.approvalInfo.approvedAt && (
                <>
                  <div>
                    <div className="font-medium">Approved At</div>
                    <div className="text-muted-foreground">
                      {new Date(scheme.approvalInfo.approvedAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Approved By</div>
                    <div className="text-muted-foreground">
                      {scheme.approvalInfo.approvedBy || 'Unknown'}
                    </div>
                  </div>
                  {scheme.approvalInfo.notes && (
                    <div>
                      <div className="font-medium">Approval Notes</div>
                      <div className="text-muted-foreground">
                        {scheme.approvalInfo.notes}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="rules">
          <AccordionTrigger>
            <h2 className="text-xl font-semibold">Qualification Rules</h2>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                {scheme.rules && Object.keys(scheme.rules).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(scheme.rules).map(([ruleType, rules]) => (
                      <div key={ruleType}>
                        <h3 className="text-lg font-medium capitalize mb-2">{ruleType} Rules</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Field</TableHead>
                              <TableHead>Operator</TableHead>
                              <TableHead>Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(rules).map(([field, config], idx) => (
                              <TableRow key={`${ruleType}-${field}-${idx}`}>
                                <TableCell>{field}</TableCell>
                                <TableCell>{config.operator}</TableCell>
                                <TableCell>{Array.isArray(config.value) 
                                  ? config.value.join(', ') 
                                  : config.value?.toString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No qualification rules defined
                  </div>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="credit">
          <AccordionTrigger>
            <h2 className="text-xl font-semibold">Credit Rules</h2>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                {scheme.customRules && scheme.customRules.length > 0 ? (
                  <div className="space-y-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rule</TableHead>
                          <TableHead>Criteria</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheme.customRules.map((rule, idx) => (
                          <TableRow key={`credit-rule-${idx}`}>
                            <TableCell>{rule.name}</TableCell>
                            <TableCell>{rule.criteria}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <h3 className="text-lg font-medium mb-2">Credit Distribution</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Role</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheme.payoutStructure.creditSplit?.map((split, idx) => (
                          <TableRow key={`credit-split-${idx}`}>
                            <TableCell>{split.role}</TableCell>
                            <TableCell>{split.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No credit rules defined
                  </div>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="payout">
          <AccordionTrigger>
            <h2 className="text-xl font-semibold">Payout Structure</h2>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                {scheme.payoutStructure && scheme.payoutStructure.tiers?.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="font-medium">Payout Type:</div>
                      <Badge variant="outline">
                        {scheme.payoutStructure.isPercentage ? 'Percentage' : 'Fixed Amount'}
                      </Badge>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>From</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead>{scheme.payoutStructure.isPercentage ? 'Rate (%)' : 'Amount'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheme.payoutStructure.tiers.map((tier, idx) => (
                          <TableRow key={`tier-${idx}`}>
                            <TableCell>{tier.from}{scheme.payoutStructure.isPercentage ? '%' : ''}</TableCell>
                            <TableCell>{tier.to === Infinity ? '∞' : `${tier.to}${scheme.payoutStructure.isPercentage ? '%' : ''}`}</TableCell>
                            <TableCell>
                              {scheme.payoutStructure.isPercentage 
                                ? `${tier.value}%` 
                                : formatCurrency(tier.value)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No payout structure defined
                  </div>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// Helper functions
function getStatusVariant(status: string) {
  switch (status) {
    case 'Draft': return 'secondary';
    case 'Approved': return 'success';
    case 'Simulated': return 'outline';
    case 'ProdRun': return 'default';
    default: return 'outline';
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default SchemeDetails;
