"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FiCode } from "react-icons/fi";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface ClientComboboxProps {
  clients: Client[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const ClientCombobox: React.FC<ClientComboboxProps> = ({
  clients,
  value,
  onChange,
  error,
}) => {
  const [open, setOpen] = useState(false);

  const selectedClient = clients.find((c) => c.id === value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Select Client</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedClient
              ? `${selectedClient.name} - ${selectedClient.email}`
              : "Select client..."}
            <FiCode className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[24vw] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search client..." className="h-9" />
            <CommandList>
              <CommandEmpty>No client found.</CommandEmpty>
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={`${client.name} - ${client.email}`}
                    onSelect={() => {
                      onChange(client.id);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <span>
                      {client.name} - {client.email}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default ClientCombobox;
