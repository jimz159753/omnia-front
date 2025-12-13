"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiX } from "react-icons/fi";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddService: (data: {
    staffId: string;
    serviceId: string;
    time: string;
  }) => void;
  users: Array<{ id: string; email: string; name?: string }>;
  services: Array<{ id: string; name: string; price: number; duration: number }>;
}

export function AddServiceDialog({
  open,
  onOpenChange,
  onAddService,
  users,
  services,
}: AddServiceDialogProps) {
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStaff || !selectedService || !selectedTime) {
      return;
    }

    onAddService({
      staffId: selectedStaff,
      serviceId: selectedService,
      time: selectedTime,
    });

    // Reset form
    setSelectedStaff("");
    setSelectedService("");
    setSelectedTime("09:00");
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form
    setSelectedStaff("");
    setSelectedService("");
    setSelectedTime("09:00");
    onOpenChange(false);
  };

  // Format time to display format (12-hour with AM/PM)
  const formatTimeDisplay = (time24: string) => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "p. m." : "a. m.";
    const hours12 = hours % 12 || 12;
    return `${hours12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 [&>button]:hidden">
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">Agregar Servicio</DialogTitle>

        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Agregar Servicio</h2>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Staff Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">
                Colaborador <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              >
                <option value="">Seleccionar colaborador...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">
                Hora del servicio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  step="300"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Se creará una nueva tarjeta en el calendario a esta hora (intervalos de 5 minutos)
              </p>
            </div>

            {/* Service Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">
                Servicio <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              >
                <option value="">Seleccionar servicio...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price} ({service.duration} min)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="px-6 bg-brand-500 hover:bg-brand-600 text-white"
              disabled={!selectedStaff || !selectedService || !selectedTime}
            >
              Agregar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

