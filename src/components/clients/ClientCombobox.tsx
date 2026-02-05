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
import { FiChevronDown, FiSearch, FiCheck, FiUser, FiMail, FiPhone } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
    <div className="space-y-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full h-12 justify-between rounded-xl border-gray-200 px-4 hover:bg-gray-50 hover:border-emerald-300 transition-all text-left font-normal",
              error && "border-red-300 ring-red-50",
              selectedClient && "bg-white"
            )}
          >
            {selectedClient ? (
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                  {getInitials(selectedClient.name)}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {selectedClient.name}
                  </span>
                  <span className="text-[10px] text-gray-500 truncate leading-none">
                    {selectedClient.email}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-gray-400">Buscar cliente existente...</span>
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
              <CommandInput 
                placeholder="Nombre, correo o teléfono..." 
                className="h-11 border-none focus:ring-0 text-sm" 
              />
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
                  const isSelected = value === client.id;
                  return (
                    <CommandItem
                      key={client.id}
                      value={`${client.name} ${client.email} ${client.phone || ''}`}
                      onSelect={() => {
                        onChange(client.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex flex-col items-start gap-1 p-3 rounded-xl cursor-pointer transition-all mb-1",
                        isSelected ? "bg-emerald-50 text-emerald-900" : "hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-colors",
                            isSelected ? "bg-emerald-200 text-emerald-800" : "bg-gray-100 text-gray-600"
                          )}>
                            {getInitials(client.name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{client.name}</span>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <span className="flex items-center gap-1">
                                    <FiMail className="w-2.5 h-2.5" />
                                    {client.email}
                                </span>
                                {client.phone && (
                                    <span className="flex items-center gap-1">
                                        <FiPhone className="w-2.5 h-2.5" />
                                        {client.phone}
                                    </span>
                                )}
                            </div>
                          </div>
                        </div>
                        {isSelected && <FiCheck className="h-4 w-4 text-emerald-600" />}
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

export default ClientCombobox;
