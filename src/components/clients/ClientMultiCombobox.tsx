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
import { FiCode, FiX } from "react-icons/fi";
import { Checkbox } from "@/components/ui/checkbox";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface ClientMultiComboboxProps {
  clients: Client[];
  value: string[]; // Array of client IDs
  onChange: (value: string[]) => void;
  error?: string;
}

export const ClientMultiCombobox: React.FC<ClientMultiComboboxProps> = ({
  clients,
  value = [],
  onChange,
  error,
}) => {
  const [open, setOpen] = useState(false);

  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];
  const selectedClients = clients.filter((c) => safeValue.includes(c.id));

  console.log("ClientMultiCombobox - value:", value);
  console.log("ClientMultiCombobox - safeValue:", safeValue);
  console.log("ClientMultiCombobox - selectedClients:", selectedClients);

  const toggleClient = (clientId: string) => {
    if (safeValue.includes(clientId)) {
      onChange(safeValue.filter((id) => id !== clientId));
    } else {
      onChange([...safeValue, clientId]);
    }
  };

  const removeClient = (clientId: string) => {
    onChange(safeValue.filter((id) => id !== clientId));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Select Clients (multiple)
      </label>

      {/* Selected clients chips */}
      {selectedClients.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedClients.map((client) => (
            <div
              key={client.id}
              className="flex items-center gap-1 bg-brand-100 text-brand-800 px-2 py-1 rounded-md text-sm"
            >
              <span>{client.name}</span>
              <button
                type="button"
                onClick={() => removeClient(client.id)}
                className="hover:bg-brand-200 rounded p-0.5"
              >
                <FiX className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedClients.length > 0
              ? `${selectedClients.length} client(s) selected`
              : "Select clients..."}
            <FiCode className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[24vw] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search client..." className="h-9" />
            <CommandList>
              <CommandEmpty>No client found.</CommandEmpty>
              <CommandGroup>
                {clients.map((client) => {
                  const isSelected = safeValue.includes(client.id);
                  return (
                    <CommandItem
                      key={client.id}
                      value={`${client.name} - ${client.email}`}
                      onSelect={() => toggleClient(client.id)}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleClient(client.id)}
                      />
                      <span>
                        {client.name} - {client.email}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default ClientMultiCombobox;
