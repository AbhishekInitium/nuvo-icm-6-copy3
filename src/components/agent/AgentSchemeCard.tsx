
import { format } from "date-fns";
import { AgentScheme, AgentResult } from "@/api/agent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

interface AgentSchemeCardProps {
  scheme: AgentScheme;
  result: AgentResult | null | undefined;
  isSelected: boolean;
  onClick: () => void;
}

export function AgentSchemeCard({
  scheme,
  result,
  isSelected,
  onClick,
}: AgentSchemeCardProps) {
  const formattedDate = format(new Date(scheme.executedAt), "PPP");
  const modeLabel = scheme.mode === "production" ? "Production" : "Simulation";

  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{scheme.schemeName}</CardTitle>
        <Badge variant={scheme.mode === "production" ? "default" : "secondary"}>
          {modeLabel}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Execution Date:</span>
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center justify-between font-medium">
            <span>Payout Earned:</span>
            <span className="text-xl">
              ${result ? result.commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
            </span>
          </div>
          
          <div className="flex items-center justify-end text-sm text-muted-foreground pt-2">
            <span className="mr-1">
              {isSelected ? "Hide details" : "View details"}
            </span>
            {isSelected ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
