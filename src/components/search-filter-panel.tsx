"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FilterState {
  search: string;
  status: "all" | "pending" | "in_progress" | "completed" | "rejected";
  priority: "all" | "low" | "medium" | "high" | "urgent";
  sortBy: "assignedDate" | "dueDate" | "priority" | "status";
  sortOrder: "asc" | "desc";
}

interface SearchFilterPanelProps {
  value: FilterState;
  onChange: (value: FilterState) => void;
}

export function SearchFilterPanel({ value, onChange }: SearchFilterPanelProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
      style={{ borderColor: "var(--color-line)", background: "var(--color-surface)" }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-muted)" }} />
        <Input
          placeholder="Search by employee or task title"
          className="pl-9"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
        />
      </div>

      <Select value={value.status} onValueChange={(v) => onChange({ ...value, status: v as FilterState["status"] })}>
        <SelectTrigger className="sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select value={value.priority} onValueChange={(v) => onChange({ ...value, priority: v as FilterState["priority"] })}>
        <SelectTrigger className="sm:w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={`${value.sortBy}:${value.sortOrder}`}
        onValueChange={(v) => {
          const [sortBy, sortOrder] = v.split(":") as [FilterState["sortBy"], FilterState["sortOrder"]];
          onChange({ ...value, sortBy, sortOrder });
        }}
      >
        <SelectTrigger className="sm:w-48"><SelectValue placeholder="Sort by" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="assignedDate:desc">Newest assigned first</SelectItem>
          <SelectItem value="assignedDate:asc">Oldest assigned first</SelectItem>
          <SelectItem value="dueDate:asc">Due date (soonest)</SelectItem>
          <SelectItem value="dueDate:desc">Due date (latest)</SelectItem>
          <SelectItem value="priority:desc">Priority (high to low)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
