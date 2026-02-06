"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useAppointmentDetails } from "@/hooks/useAppointmentDetails";
import { AppointmentDetailsSection } from "./appointment/AppointmentDetailsSection";
import { ClientDetailsSection } from "./appointment/ClientDetailsSection";
import { AppointmentHeader } from "./appointment/AppointmentHeader";

import {
  AppointmentTicketTable,
  type NewTicketItem,
} from "./appointment/AppointmentTicketTable";
import { toast } from "sonner";

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialSlot?: {
    start: Date;
    end: Date;
    resourceId?: string;
  } | null;
  initialData?: {
    ticketId?: string;
    clientId?: string;
    serviceId?: string;
    notes?: string;
  } | null;
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  onSuccess,
  initialSlot,
  initialData,
}: AppointmentFormDialogProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();

  // State for date and time pickers
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialSlot?.start || new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    initialSlot?.start
      ? `${initialSlot.start
          .getHours()
          .toString()
          .padStart(2, "0")}:${initialSlot.start
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      : "09:00"
  );

  // State for new items added through the table
  const [newTicketItems, setNewTicketItems] = useState<NewTicketItem[]>([]);

  // State for tracking discount changes
  const [discountUpdates, setDiscountUpdates] = useState<
    Record<string, number>
  >({});

  // State for tracking quantity changes
  const [quantityUpdates, setQuantityUpdates] = useState<
    Record<string, number>
  >({});

  // Handle ticket deletion
  const handleDeleteTicket = async () => {
    if (!initialData?.ticketId && !ticketData?.id) {
      toast.error("No se puede eliminar: ticket no encontrado");
      return;
    }

    const ticketIdToDelete = ticketData?.id || initialData?.ticketId;

    // Confirm deletion
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/tickets?id=${ticketIdToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete ticket");
      }

      toast.success("Ticket eliminado correctamente");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Error al eliminar el ticket");
    }
  };

  // Update date and time when initialSlot changes (when clicking a calendar event)
  useEffect(() => {
    if (initialSlot?.start) {
      setSelectedDate(initialSlot.start);
      setSelectedTime(
        `${initialSlot.start
          .getHours()
          .toString()
          .padStart(2, "0")}:${initialSlot.start
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
    }
  }, [initialSlot]);

  // Use custom hook for all business logic
  const {
    services,
    users,
    clients,
    products,
    loading,
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    isSubmitting,
    includeNotes,
    setIncludeNotes,
    existingClientId,
    setExistingClientId,
    ticketData,
    setTicketData,
    selectedStatus,
    setSelectedStatus,
  } = useAppointmentDetails({
    open,
    onOpenChange,
    onSuccess,
    initialSlot,
    initialData,
    selectedDate,
    selectedTime,
    newItems: newTicketItems,
    discountUpdates,
    quantityUpdates,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[85vh] flex flex-col p-0 gap-0 [&>button]:hidden rounded-2xl overflow-hidden bg-omnia-light border-omnia-navy/20">
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">
          {initialData ? t("editAppointment") : t("createAppointment")}
        </DialogTitle>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center">
                <p className="text-sm text-gray-500">{t("loading")}</p>
              </div>
            ) : (
              <div className="flex h-full">
                {/* Left Side - Title, Date/Time + Appointment Details */}
                <div className="flex-1">
                  {/* Header with Title and Date/Time Pickers */}
                  <AppointmentHeader
                    initialData={initialData}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                  />

                  {/* Appointment Details Section */}
                  {initialData ? (
                    <AppointmentTicketTable
                      ticketData={ticketData}
                      selectedStatus={selectedStatus}
                      onStatusChange={(status) => {
                        setSelectedStatus(status);
                      }}
                      onDeleteItem={async (itemId, itemType) => {
                        try {
                          const response = await fetch(
                            `/api/ticket-items?id=${itemId}${
                              itemType ? `&type=${itemType}` : ""
                            }`,
                            {
                              method: "DELETE",
                            }
                          );

                          if (!response.ok) {
                            throw new Error("Failed to delete item");
                          }

                          toast.success("Elemento eliminado correctamente");

                          // Manually update ticketData to remove the item without closing dialog
                          if (ticketData) {
                            setTicketData({
                              ...ticketData,
                              items: ticketData.items.filter(
                                (item) => item.id !== itemId
                              ),
                            });
                          }
                        } catch (error) {
                          console.error("Error deleting item:", error);
                          toast.error("Error al eliminar el elemento");
                        }
                      }}
                      onDiscountChange={async (itemId, discount) => {
                        // Just update local state, no API call
                        // Will be saved when clicking "Guardar Cita"
                        console.log(
                          `Discount changed for item ${itemId}: ${discount}%`
                        );
                      }}
                      onAddProduct={(data) => {
                        console.log(
                          "Product added to table (local state):",
                          data
                        );
                        // Product is now in the table's newItems state
                        // Will be saved to database when clicking "Guardar Cita"
                      }}
                      onNewItemsChange={(items) => {
                        setNewTicketItems(items);
                        console.log("New items updated:", items);
                      }}
                      onDiscountUpdates={(updates) => {
                        setDiscountUpdates(updates);
                        console.log("Discount updates:", updates);
                      }}
                      onQuantityUpdates={(updates) => {
                        setQuantityUpdates(updates);
                        console.log("Quantity updates:", updates);
                      }}
                      onUseCertificate={() => {
                        console.log("Use certificate");
                        // TODO: Implement use certificate
                      }}
                      onAddTip={() => {
                        console.log("Add tip");
                        // TODO: Implement add tip
                      }}
                      includeNotes={includeNotes}
                      setIncludeNotes={setIncludeNotes}
                      control={control}
                      register={register}
                      errors={errors}
                      users={users}
                      products={products}
                      userId={user?.id}
                      googleCalendarId={watch("googleCalendarId")}
                      onGoogleCalendarChange={(calendarId) =>
                        setValue("googleCalendarId", calendarId)
                      }
                    />
                  ) : (
                    <>
                      <AppointmentDetailsSection
                        control={control}
                        register={register}
                        errors={errors}
                        users={users}
                        services={services}
                        includeNotes={includeNotes}
                        setIncludeNotes={setIncludeNotes}
                        selectedServiceId={watch("serviceId")}
                      />

                    </>
                  )}
                </div>

                {/* Right Side - Client Details */}
                <ClientDetailsSection
                  services={services}
                  selectedServiceId={watch("serviceId")}
                  isSubmitting={isSubmitting}
                  onCancel={() => onOpenChange(false)}
                  control={control}
                  register={register}
                  errors={errors}
                  clients={clients}
                  existingClientId={existingClientId}
                  setExistingClientId={setExistingClientId}
                  setValue={setValue}
                  ticketItems={[
                    ...(ticketData?.items || []),
                    ...newTicketItems,
                  ]}
                  quantities={quantityUpdates}
                  discounts={discountUpdates}
                  ticketId={ticketData?.id || initialData?.ticketId}
                  onDelete={handleDeleteTicket}
                />
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
