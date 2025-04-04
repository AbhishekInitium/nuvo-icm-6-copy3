
import { useState } from "react";
import { AgentResult } from "@/api/agent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface AgentResultDetailsProps {
  result: AgentResult;
}

export function AgentResultDetails({ result }: AgentResultDetailsProps) {
  const [activeTab, setActiveTab] = useState("summary");
  
  const formattedDate = format(new Date(result.executedAt), "PPP");
  const modeLabel = result.mode === "production" ? "Production" : "Simulation";

  // Helper function to render criterion result
  const renderResult = (passed: boolean) => {
    return passed ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Check className="mr-1 h-3 w-3" /> Passed
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <X className="mr-1 h-3 w-3" /> Failed
      </Badge>
    );
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">
          {result.schemeName} - Execution Details
          <Badge className="ml-2" variant={result.mode === "production" ? "default" : "secondary"}>
            {modeLabel}
          </Badge>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Executed on {formattedDate} • Run ID: {result.runId}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Final Payout</div>
            <div className="text-2xl font-bold">${result.commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Qualification Status</div>
            <div className="font-medium">
              {result.qualified ? (
                <span className="text-green-600">Qualified</span>
              ) : (
                <span className="text-red-600">Not Qualified</span>
              )}
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Base Metric</div>
            <div className="font-medium">{result.totalSales ? `$${result.totalSales.toLocaleString('en-US')}` : 'N/A'}</div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="qualifying">Qualifying Criteria</TabsTrigger>
            <TabsTrigger value="exclusions">Exclusions</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Base Data</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(result.baseData, null, 2)}
                </pre>
              </div>
            </div>
            
            {result.customLogic && result.customLogic.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Custom Logic Output</h3>
                <Accordion type="single" collapsible className="w-full">
                  {result.customLogic.map((logic, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-sm">
                        {logic.rule} {renderResult(logic.result)}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-3 bg-muted/50 rounded-md">
                          <p className="text-sm">{logic.notes}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="qualifying">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.qualifyingCriteria.map((criterion, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{criterion.rule}</TableCell>
                    <TableCell>{renderResult(criterion.result)}</TableCell>
                    <TableCell>
                      <pre className="text-xs whitespace-pre-wrap">
                        {typeof criterion.data === 'object' 
                          ? JSON.stringify(criterion.data, null, 2)
                          : criterion.data}
                      </pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="exclusions">
            {result.exclusions && result.exclusions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.exclusions.map((exclusion, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{exclusion.rule}</TableCell>
                      <TableCell>{renderResult(!exclusion.applied)}</TableCell>
                      <TableCell>
                        <pre className="text-xs whitespace-pre-wrap">
                          {typeof exclusion.details === 'object' 
                            ? JSON.stringify(exclusion.details, null, 2)
                            : exclusion.details}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No exclusions were applied to this incentive calculation.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="adjustments">
            {result.adjustments && result.adjustments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adjustment</TableHead>
                    <TableHead>Before</TableHead>
                    <TableHead>After</TableHead>
                    <TableHead>Difference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.adjustments.map((adjustment, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{adjustment.name}</TableCell>
                      <TableCell>${adjustment.before.toFixed(2)}</TableCell>
                      <TableCell>${adjustment.after.toFixed(2)}</TableCell>
                      <TableCell className={adjustment.after > adjustment.before ? "text-green-600" : "text-red-600"}>
                        {adjustment.after > adjustment.before ? "+" : ""}
                        ${(adjustment.after - adjustment.before).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No adjustments were applied to this incentive calculation.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
