"use client";

import { useState } from "react";

type Booking = {
  id: string;
  vendorName: string;
  customerName: string;
  eventDate: string;
  service: string;
  amount: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  createdAt: string;
};

export default function VendorBookingsManager() {
  const [bookings] = useState<Booking[]>([
    {
      id: "bk1",
      vendorName: "Dream Decor Studio",
      customerName: "Priya Sharma",
      eventDate: "2026-05-15",
      service: "Decoration",
      amount: 8500,
      status: "confirmed",
      createdAt: "2026-04-28T10:30:00Z",
    },
    {
      id: "bk2",
      vendorName: "Sweetie's Cake House",
      customerName: "Rahul Verma",
      eventDate: "2026-05-10",
      service: "Cake",
      amount: 3500,
      status: "confirmed",
      createdAt: "2026-04-25T14:20:00Z",
    },
    {
      id: "bk3",
      vendorName: "Happy Moments Studio",
      customerName: "Anjali Gupta",
      eventDate: "2026-04-29",
      service: "Photography",
      amount: 7500,
      status: "completed",
      createdAt: "2026-04-15T09:15:00Z",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6">
        <div className="font-playfair font-bold text-2xl mb-6">Vendor Bookings</div>
        
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border border-[var(--border)] rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{booking.vendorName}</div>
                  <div className="text-sm text-[var(--text-muted)]">
                    Customer: {booking.customerName}
                  </div>
                  <div className="text-sm mt-2">
                    {booking.service} · {new Date(booking.eventDate).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{booking.amount.toLocaleString("en-IN")}</div>
                  <div className={`text-xs px-2 py-1 rounded-full mt-2 ${
                    booking.status === "completed" ? "bg-[rgba(29,158,117,0.12)] text-[#1D9E75]" :
                    booking.status === "confirmed" ? "bg-[rgba(107,63,160,0.12)] text-[var(--purple)]" :
                    "bg-[rgba(255,200,87,0.12)] text-[var(--gold)]"
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
