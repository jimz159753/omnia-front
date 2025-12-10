"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketStatus } from "@/constants/status";

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  value,
  onChange,
}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value={TicketStatus.Pending}>Pending</SelectItem>
        <SelectItem value={TicketStatus.Confirmed}>Confirmed</SelectItem>
        <SelectItem value={TicketStatus.Done}>Done</SelectItem>
        <SelectItem value={TicketStatus.Canceled}>Canceled</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusFilter;

