"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { es, enUS } from "date-fns/locale";
import {
  BiCalendar,
  BiTime,
  BiPhone,
  BiEnvelope,
  BiUser,
  BiLeftArrowAlt,
  BiCheck,
} from "react-icons/bi";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  image: string;
}

interface Schedule {
  dayOfWeek: string;
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
}

interface CalendarData {
  calendar: {
    id: string;
    name: string;
    fullName: string;
    description: string | null;
    backgroundImage: string | null;
    logoImage: string | null;
    primaryColor: string;
  };
  services: Service[];
  schedules: Schedule[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AvailabilityData {
  date: string;
  dayOfWeek: string;
  isOpen: boolean;
  slots: TimeSlot[];
  service: Service;
}

export default function BookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState<"service" | "datetime" | "confirm">("service");
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Contact form
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const fetchCalendarData = useCallback(async () => {
    try {
      const response = await fetch(`/api/booking-calendars/availability?slug=${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Calendar not found");
        } else {
          setError("Failed to load calendar");
        }
        return;
      }
      const data = await response.json();
      setCalendarData(data);
    } catch (err) {
      console.error("Error fetching calendar:", err);
      setError("Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchAvailability = useCallback(async (date: Date, serviceId: string) => {
    setLoadingSlots(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const timezoneOffset = new Date().getTimezoneOffset(); // Get user's timezone offset
      const response = await fetch(
        `/api/booking-calendars/availability?slug=${slug}&date=${dateStr}&serviceId=${serviceId}&timezoneOffset=${timezoneOffset}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch (err) {
      console.error("Error fetching availability:", err);
    } finally {
      setLoadingSlots(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailability(selectedDate, selectedService.id);
    }
  }, [selectedDate, selectedService, fetchAvailability]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedTime(null);
    setStep("datetime");
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("confirm");
  };

  const handleBack = () => {
    if (step === "confirm") {
      setStep("datetime");
      setSelectedTime(null);
    } else if (step === "datetime") {
      setStep("service");
      setSelectedService(null);
      setSelectedDate(null);
    }
  };

  const handleSubmitBooking = async () => {
    if (!contactForm.name || !contactForm.phone) {
      alert("Please fill in your name and phone number");
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      alert("Please select a service, date, and time");
      return;
    }

    setSubmitting(true);
    try {
      // Get the user's timezone offset in minutes
      const timezoneOffset = new Date().getTimezoneOffset();
      
      const response = await fetch("/api/booking-calendars/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          serviceId: selectedService.id,
          date: format(selectedDate, "yyyy-MM-dd"),
          time: selectedTime,
          timezoneOffset, // Send timezone offset so server can adjust
          clientName: contactForm.name,
          clientEmail: contactForm.email || null,
          clientPhone: contactForm.phone,
          notes: contactForm.notes || null,
        }),
      });

      if (response.ok) {
        setBookingComplete(true);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create booking. Please try again.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getDaySchedule = (date: Date) => {
    if (!calendarData) return null;
    const dayName = format(date, "EEEE");
    return calendarData.schedules.find(
      (s) => s.dayOfWeek.toLowerCase() === dayName.toLowerCase()
    );
  };

  const primaryColor = calendarData?.calendar.primaryColor || "#059669";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  if (error || !calendarData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BiCalendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Calendar Not Found</h1>
          <p className="text-gray-500">This booking calendar doesn&apos;t exist or has been deactivated.</p>
        </div>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <BiCheck className="w-10 h-10" style={{ color: primaryColor }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 mb-6">
            Your appointment has been scheduled. We&apos;ll send you a confirmation shortly.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
            <p className="text-sm">
              <span className="text-gray-500">Service:</span>{" "}
              <span className="font-medium">{selectedService?.name}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Date:</span>{" "}
              <span className="font-medium">{selectedDate && format(selectedDate, "MMMM d, yyyy")}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Time:</span>{" "}
              <span className="font-medium">{selectedTime}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with background */}
      <div
        className="h-48 md:h-64 relative"
        style={
          calendarData.calendar.backgroundImage
            ? {
                backgroundImage: `url(${calendarData.calendar.backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
              }
        }
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            {calendarData.calendar.logoImage && (
              <img
                src={calendarData.calendar.logoImage}
                alt="Logo"
                className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white/50 object-cover"
              />
            )}
            <h1 className="text-2xl md:text-3xl font-bold">{calendarData.calendar.fullName}</h1>
            {calendarData.calendar.description && (
              <p className="text-white/80 mt-2 max-w-md mx-auto px-4">
                {calendarData.calendar.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto mt-10 px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Steps */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-center gap-4">
              {["service", "datetime", "confirm"].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step === s
                        ? "text-white"
                        : i < ["service", "datetime", "confirm"].indexOf(step)
                        ? "text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    style={
                      step === s || i < ["service", "datetime", "confirm"].indexOf(step)
                        ? { backgroundColor: primaryColor }
                        : undefined
                    }
                  >
                    {i + 1}
                  </div>
                  {i < 2 && (
                    <div
                      className={`w-12 h-0.5 mx-2 ${
                        i < ["service", "datetime", "confirm"].indexOf(step)
                          ? ""
                          : "bg-gray-200"
                      }`}
                      style={
                        i < ["service", "datetime", "confirm"].indexOf(step)
                          ? { backgroundColor: primaryColor }
                          : undefined
                      }
                    ></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-8 mt-2 text-xs text-gray-500">
              <span>Service</span>
              <span>Date & Time</span>
              <span>Confirm</span>
            </div>
          </div>

          {/* Back Button */}
          {step !== "service" && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800"
            >
              <BiLeftArrowAlt className="w-5 h-5" />
              Back
            </button>
          )}

          {/* Step Content */}
          <div className="p-6">
            {/* Step 1: Select Service */}
            {step === "service" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select a Service</h2>
                <div className="space-y-3">
                  {calendarData.services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="w-full text-left p-4 rounded-lg border-2 hover:border-opacity-100 transition-all flex items-center gap-4 group"
                      style={{ borderColor: `${primaryColor}40` }}
                    >
                      {service.image && (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-emerald-600">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{service.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-sm">
                          <span className="flex items-center gap-1 text-gray-500">
                            <BiTime className="w-4 h-4" />
                            {service.duration} min
                          </span>
                          <span className="font-medium" style={{ color: primaryColor }}>
                            ${service.price}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Date & Time */}
            {step === "datetime" && selectedService && (
              <div>
                <div className="mb-6 p-3 rounded-lg flex items-center gap-3" style={{ backgroundColor: `${primaryColor}10` }}>
                  <BiCalendar className="w-5 h-5" style={{ color: primaryColor }} />
                  <span className="font-medium">{selectedService.name}</span>
                  <span className="text-sm text-gray-500">• {selectedService.duration} min</span>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Select a Date</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWeekStart(addDays(weekStart, -7))}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setWeekStart(addDays(weekStart, 7))}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      →
                    </button>
                  </div>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {weekDays.map((date) => {
                    const schedule = getDaySchedule(date);
                    const isOpen = schedule?.isOpen;
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => isOpen && !isPast && handleDateSelect(date)}
                        disabled={!isOpen || isPast}
                        className={`p-3 rounded-lg text-center transition-all ${
                          isSelected
                            ? "text-white"
                            : !isOpen || isPast
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                        style={isSelected ? { backgroundColor: primaryColor } : undefined}
                      >
                        <div className="text-xs uppercase">{format(date, "EEE")}</div>
                        <div className="text-lg font-semibold">{format(date, "d")}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div>
                    <h3 className="font-semibold mb-3">
                      Available Times - {format(selectedDate, "MMMM d")}
                    </h3>
                    {loadingSlots ? (
                      <div className="flex justify-center py-8">
                        <div
                          className="animate-spin rounded-full h-8 w-8 border-b-2"
                          style={{ borderColor: primaryColor }}
                        ></div>
                      </div>
                    ) : availability && availability.slots.filter((slot) => slot.available).length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {availability.slots
                          .filter((slot) => slot.available)
                          .map((slot) => (
                            <button
                              key={slot.time}
                              onClick={() => handleTimeSelect(slot.time)}
                              className={`p-2 rounded-lg text-center border-2 transition-all ${
                                selectedTime === slot.time
                                  ? "text-white border-transparent"
                                  : "hover:border-opacity-100"
                              }`}
                              style={
                                selectedTime === slot.time
                                  ? { backgroundColor: primaryColor }
                                  : { borderColor: `${primaryColor}40` }
                              }
                            >
                              {slot.time}
                            </button>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BiTime className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No available times for this date</p>
                        <p className="text-sm mt-1">Please select another date</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Confirm & Contact Info */}
            {step === "confirm" && selectedService && selectedDate && selectedTime && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Complete Your Booking</h2>

                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-700 mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service</span>
                      <span className="font-medium">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="font-medium">{format(selectedDate, "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium">{selectedService.duration} minutes</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t mt-2">
                      <span className="text-gray-700 font-medium">Total</span>
                      <span className="font-bold" style={{ color: primaryColor }}>
                        ${selectedService.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <BiUser className="inline w-4 h-4 mr-1" />
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                      style={{ focusRingColor: primaryColor } as React.CSSProperties}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <BiPhone className="inline w-4 h-4 mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                      placeholder="+52 33 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <BiEnvelope className="inline w-4 h-4 mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={contactForm.notes}
                      onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
                      rows={3}
                      placeholder="Any special requests..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitBooking}
                  disabled={submitting || !contactForm.name || !contactForm.phone}
                  className="w-full mt-6 py-3 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Powered by <span className="font-medium">Omnia</span>
        </div>
      </div>
    </div>
  );
}
