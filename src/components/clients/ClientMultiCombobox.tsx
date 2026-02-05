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
import { FiChevronDown, FiX, FiSearch, FiCheck, FiUser, FiMail, FiPhone } from "react-icons/fi";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
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

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
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
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 pl-2 pr-1 py-1 rounded-lg text-sm transition-all animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                  {getInitials(client.name)}
              </div>
              <span className="font-medium text-xs">{client.name}</span>
              <button
                type="button"
                onClick={() => removeClient(client.id)}
                className="w-5 h-5 flex items-center justify-center hover:bg-emerald-200/50 rounded-full transition-colors text-emerald-600/70 hover:text-emerald-800"
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
            className={cn(
                "w-full h-12 justify-between rounded-xl border-gray-200 px-4 hover:bg-gray-50 hover:border-emerald-300 transition-all text-left font-normal",
                error && "border-red-300 ring-red-50",
                selectedClients.length > 0 && "bg-gray-50/50"
            )}
          >
            {selectedClients.length > 0 ? (
                <span className="text-gray-900 font-medium">
                    {selectedClients.length} cliente{selectedClients.length !== 1 ? 's' : ''} seleccionado{selectedClients.length !== 1 ? 's' : ''}
                </span>
            ) : (
                <span className="text-gray-400">Seleccionar múltiples clientes...</span>
            )}
            <FiChevronDown className={cn(
              "ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200",
              open && "rotate-180 text-emerald-500"
            )} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 rounded-2xl border-gray-200 shadow-xl overflow-hidden" align="start">
          <Command className="bg-white">
            <div className="flex items-center border-b border-gray-100 px-3">
              <FiSearch className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
              <CommandInput placeholder="Buscar clientes..." className="h-11 border-none focus:ring-0 text-sm" />
            </div>
            <CommandList className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
              <CommandEmpty className="py-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                    <FiUser className="text-gray-300 text-lg" />
                  </div>
                  <p className="text-xs text-gray-500 italic font-medium">No se encontraron clientes</p>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {clients.map((client) => {
                  const isSelected = safeValue.includes(client.id);
                  return (
                    <CommandItem
                      key={client.id}
                      value={`${client.name} ${client.email} ${client.phone || ''}`}
                      onSelect={() => toggleClient(client.id)}
                      className={cn(
                        "flex flex-col items-start gap-1 p-3 rounded-xl cursor-pointer transition-all mb-1",
                        isSelected ? "bg-emerald-50 text-emerald-900 border border-emerald-100/50" : "hover:bg-gray-50 border border-transparent"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div onClick={(e) => {
                               e.stopPropagation();
                               toggleClient(client.id);
                           }}>
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleClient(client.id)}
                                    className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                />
                           </div>
                          
                          <div className="flex items-center gap-3 min-w-0">
                             <div className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0",
                                isSelected ? "bg-emerald-200 text-emerald-800" : "bg-gray-100 text-gray-600"
                              )}>
                                {getInitials(client.name)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={cn(
                                    "text-sm font-bold truncate",
                                    isSelected ? "text-emerald-900" : "text-gray-900"
                                )}>{client.name}</span>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                    <span className="flex items-center gap-1 truncate">
                                        <FiMail className="w-2.5 h-2.5 flex-shrink-0" />
                                        <span className="truncate">{client.email}</span>
                                    </span>
                                </div>
                              </div>
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-[10px] font-medium text-red-500 mt-1 pl-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default ClientMultiCombobox;
