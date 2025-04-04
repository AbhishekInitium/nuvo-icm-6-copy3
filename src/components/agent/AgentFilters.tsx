
import { Dispatch, SetStateAction } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AgentFiltersProps {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  setDateRange: Dispatch<
    SetStateAction<{
      start: Date | null;
      end: Date | null;
    }>
  >;
  schemeNameFilter: string;
  setSchemeNameFilter: Dispatch<SetStateAction<string>>;
}

export function AgentFilters({
  dateRange,
  setDateRange,
  schemeNameFilter,
  setSchemeNameFilter,
}: AgentFiltersProps) {
  const clearDateRange = () => {
    setDateRange({ start: null, end: null });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <div className="w-full sm:w-auto">
        <Label htmlFor="scheme-name">Scheme Name</Label>
        <div className="relative">
          <Input
            id="scheme-name"
            placeholder="Filter by scheme name"
            value={schemeNameFilter}
            onChange={(e) => setSchemeNameFilter(e.target.value)}
            className="w-full sm:w-auto min-w-[250px]"
          />
          {schemeNameFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full"
              onClick={() => setSchemeNameFilter("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>
      </div>

      <div className="w-full sm:w-auto">
        <Label>Date Range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal min-w-[250px]",
                !dateRange.start && !dateRange.end && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.start ? (
                dateRange.end ? (
                  <>
                    {format(dateRange.start, "LLL dd, y")} -{" "}
                    {format(dateRange.end, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.start, "LLL dd, y")
                )
              ) : (
                "Filter by date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.start || new Date()}
              selected={{
                from: dateRange.start || undefined,
                to: dateRange.end || undefined,
              }}
              onSelect={(range) => {
                setDateRange({
                  start: range?.from || null,
                  end: range?.to || null,
                });
              }}
              numberOfMonths={2}
            />
            <div className="flex items-center justify-end gap-2 p-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDateRange}
                disabled={!dateRange.start && !dateRange.end}
              >
                Clear
              </Button>
              <Button size="sm" onClick={() => document.body.click()}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
