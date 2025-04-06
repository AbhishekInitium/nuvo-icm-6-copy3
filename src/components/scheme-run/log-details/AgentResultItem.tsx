import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { AgentResult } from '@/types/scheme-run';
import { QualifyingCriteriaTab } from './QualifyingCriteriaTab';
import { ExclusionsTab } from './ExclusionsTab';
import { AdjustmentsTab } from './AdjustmentsTab';
import { CustomLogicTab } from './CustomLogicTab';

interface AgentResultItemProps {
  agent: AgentResult;
  index: number;
}

export function AgentResultItem({ agent, index }: AgentResultItemProps) {
  return (
    <AccordionItem key={agent.agentId} value={agent.agentId}>
      <AccordionTrigger className="py-4 px-4 bg-gray-50 hover:bg-gray-100 rounded-t">
        <div className="flex items-center gap-4 w-full">
          <div className="font-medium">Agent {agent.agentId}</div>
          <Badge variant={agent.qualified ? "success" : "destructive"}>
            {agent.qualified ? 'Qualified' : 'Not Qualified'}
          </Badge>
          <div className="ml-auto text-sm">Commission: ${agent.commission.toLocaleString()}</div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="bg-white p-4 border border-t-0 rounded-b">
        <Tabs defaultValue="qualifying">
          <TabsList>
            <TabsTrigger value="qualifying">Qualifying Criteria</TabsTrigger>
            <TabsTrigger value="exclusions">Exclusions</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
            <TabsTrigger value="custom">Custom Logic</TabsTrigger>
          </TabsList>
          
          <TabsContent value="qualifying">
            <QualifyingCriteriaTab agent={agent} />
          </TabsContent>
          
          <TabsContent value="exclusions">
            <ExclusionsTab agent={agent} />
          </TabsContent>
          
          <TabsContent value="adjustments">
            <AdjustmentsTab agent={agent} />
          </TabsContent>
          
          <TabsContent value="custom">
            <CustomLogicTab agent={agent} />
          </TabsContent>
        </Tabs>
      </AccordionContent>
    </AccordionItem>
  );
}
