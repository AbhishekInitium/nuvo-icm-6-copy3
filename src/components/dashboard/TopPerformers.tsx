
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Performer {
  id: string;
  name: string;
  value: number;
  image?: string;
}

interface TopPerformersProps {
  performers: Performer[];
}

export function TopPerformers({ performers }: TopPerformersProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Top Performers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performers.map((performer, index) => (
            <div key={performer.id} className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-muted font-bold">
                {index + 1}
              </div>
              <Avatar className="flex-shrink-0">
                <AvatarImage src={performer.image} />
                <AvatarFallback>
                  {getInitials(performer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{performer.name}</p>
              </div>
              <div className="font-mono font-medium">
                {formatCurrency(performer.value)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
