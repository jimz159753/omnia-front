"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BiCheck, BiX, BiLoader, BiCalendar } from "react-icons/bi";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function StatusContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const ticketId = searchParams.get("ticketId");
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    if (ticketId) {
      // Fetch ticket status to verify
      fetch(`/api/tickets?id=${ticketId}`)
        .then(res => res.json())
        .then(data => {
          setTicket(data.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BiLoader className="w-12 h-12 animate-spin mx-auto text-brand-500 mb-4" />
          <p className="text-gray-500">Verifying booking...</p>
        </div>
      </div>
    );
  }

  const isSuccess = status === "success" || (ticket && ticket.status === "Confirmed");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div
          className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
            isSuccess ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isSuccess ? (
            <BiCheck className="w-10 h-10 text-green-600" />
          ) : (
            <BiX className="w-10 h-10 text-red-600" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isSuccess ? "Booking Confirmed!" : "Payment Failed"}
        </h1>
        <p className="text-gray-500 mb-8">
          {isSuccess
            ? "Your payment was successful and your appointment has been scheduled."
            : "There was an issue processing your payment. Please try again or contact us."}
        </p>

        {ticket && (
          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 mb-8">
            <p className="text-sm">
              <span className="text-gray-500">Ticket ID:</span>{" "}
              <span className="font-medium">{ticket.id}</span>
            </p>
            {ticket.services && ticket.services[0] && (
              <p className="text-sm">
                <span className="text-gray-500">Service:</span>{" "}
                <span className="font-medium">{ticket.services[0].service.name}</span>
              </p>
            )}
            <p className="text-sm">
              <span className="text-gray-500">Status:</span>{" "}
              <span className={`font-semibold ${isSuccess ? "text-green-600" : "text-red-500"}`}>
                {ticket.status}
              </span>
            </p>
          </div>
        )}

        <Button asChild className="w-full bg-brand-500 hover:bg-brand-600">
          <Link href="/">
            Return to Homepage
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function BookingStatusPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StatusContent />
    </Suspense>
  );
}
