
import { Accordion } from '@/components/ui/accordion';
import { ExecutionLog } from '@/types/scheme-run';
import { AgentResultItem } from './AgentResultItem';

interface AgentResultsListProps {
  selectedLog: ExecutionLog;
}

export function AgentResultsList({ selectedLog }: AgentResultsListProps) {
  return (
    <div>
      <h3 className="font-medium text-lg mb-2">Agent Results</h3>
      <Accordion type="single" collapsible className="w-full">
        {selectedLog.agents.map((agent, index) => (
          <AgentResultItem key={agent.agentId} agent={agent} index={index} />
        ))}
      </Accordion>
    </div>
  );
}
