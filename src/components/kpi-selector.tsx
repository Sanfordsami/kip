"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectableKpiTask {
  id: string;
  title: string;
  weight: number;
}

interface KpiSelectorProps {
  tasks: SelectableKpiTask[];
  value: string | undefined;
  onChange: (taskId: string) => void;
}

export function KpiSelector({ tasks, value, onChange }: KpiSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a KPI task" />
      </SelectTrigger>
      <SelectContent>
        {tasks.map((task) => (
          <SelectItem key={task.id} value={task.id}>
            {task.title} · suggested weight {task.weight}%
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
