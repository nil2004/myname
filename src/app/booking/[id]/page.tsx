'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TotalCostSummary from '@/components/TotalCostSummary';

export default function BookingConfirmation() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBooking();
  }, []);

  async function fetchBooking() {
    try {
      const response = await fetch(`/api/bookings?id=${params.id}`);
      
      if (!response.ok) {
        throw new Error('Booking not found');
      }
      
      const data = await response.json();
      setBooking(data);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  }

  async function handlePayAdvance() {
    // For now, just mark as paid and redirect to dashboard
    // In production, integrate with payment gateway
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booking.id,
          advancePaid: true,
          paymentMethod: 'online',
          paymentId: `PAY_${Date.now()}`,
          transactionId: `TXN_${Date.now()}`,
        }),
      });

      if (response.ok) {
        alert('Payment successful! Your booking is confirmed.');
        router.push('/plan/process');
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg font-medium">Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg font-medium text-[var(--coral)] mb-4">{error || 'Booking not found'}</div>
          <button
            onClick={() => router.push('/plan')}
            className="px-6 py-3 rounded-full bg-[var(--purple)] text-white font-medium hover:bg-[var(--purple-light)] transition-colors"
          >
            Back to Planning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Success Message */}
        <div className="bg-white rounded-[24px] p-8 mb-6 text-center shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-playfair font-bold text-3xl mb-2">
            Booking Created Successfully!
          </h1>
          <p className="text-[var(--text-muted)] mb-4">
            Your booking has been created. Complete the payment to confirm your vendors.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]">
            <span className="font-medium">Booking ID:</span>
            <span className="font-mono font-bold">{booking.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Event & Customer Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
              <h2 className="font-playfair font-bold text-2xl mb-4">Event Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[var(--text-muted)] mb-1">Event Type</div>
                  <div className="font-medium text-lg">{booking.event_type}</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--text-muted)] mb-1">Date & Time</div>
                  <div className="font-medium text-lg">
                    {new Date(booking.event_date).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                    {booking.event_time && ` at ${booking.event_time}`}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[var(--text-muted)] mb-1">Guest Count</div>
                  <div className="font-medium text-lg">{booking.guest_count} guests</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--text-muted)] mb-1">Location</div>
                  <div className="font-medium text-lg">{booking.city}</div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
              <h2 className="font-playfair font-bold text-2xl mb-4">Customer Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-[var(--text-muted)] mb-1">Name</div>
                  <div className="font-medium text-lg">{booking.customer_name}</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--text-muted)] mb-1">Phone</div>
                  <div className="font-medium text-lg">{booking.customer_phone}</div>
                </div>
                {booking.customer_email && (
                  <div className="sm:col-span-2">
                    <div className="text-sm text-[var(--text-muted)] mb-1">Email</div>
                    <div className="font-medium text-lg">{booking.customer_email}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Vendors */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
              <h2 className="font-playfair font-bold text-2xl mb-4">Selected Vendors</h2>
              <div className="space-y-3">
                {booking.selected_vendors.map((vendor: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-[rgba(107,63,160,0.05)] to-[rgba(255,200,87,0.05)] border border-[var(--border)]"
                  >
                    <div>
                      <div className="font-semibold text-lg text-[var(--deep)]">
                        {vendor.category.charAt(0).toUpperCase() + vendor.category.slice(1)}
                      </div>
                      <div className="text-sm text-[var(--text-muted)] mt-1">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-[rgba(107,63,160,0.12)] text-[var(--purple)] text-xs font-medium mr-2">
                          {vendor.tier} tier
                        </span>
                        <span className="opacity-60">{vendor.vendor_name.toLowerCase()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[var(--purple)]">
                        ₹{vendor.price_min.toLocaleString()}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        to ₹{vendor.price_max.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
                <h2 className="font-playfair font-bold text-2xl mb-4">Special Requests</h2>
                <p className="text-[var(--text-muted)]">{booking.special_requests}</p>
              </div>
            )}
          </div>

          {/* Right Column - Cost Summary */}
          <div className="lg:col-span-1">
            <TotalCostSummary
              categoryCosts={booking.selected_vendors.map((v: any) => ({
                category: v.category,
                categoryLabel: v.category.charAt(0).toUpperCase() + v.category.slice(1),
                priceMin: v.price_min,
                priceMax: v.price_max,
                vendorName: v.vendor_name,
                tier: v.tier,
              }))}
              advancePercentage={booking.advance_percentage || 30}
            />

            {/* Payment Button */}
            <div className="mt-6">
              {booking.payment_status === 'pending' ? (
                <button
                  onClick={handlePayAdvance}
                  className="w-full px-6 py-4 rounded-full bg-gradient-to-r from-[var(--purple)] to-[var(--purple-light)] text-white font-bold text-lg hover:shadow-[0_10px_30px_rgba(107,63,160,0.3)] transition-all"
                >
                  Pay ₹{booking.advance_amount.toLocaleString()} to Confirm
                </button>
              ) : (
                <div className="w-full px-6 py-4 rounded-full bg-[rgba(29,158,117,0.12)] text-[#1D9E75] font-bold text-lg text-center">
                  ✓ Payment Completed
                </div>
              )}
            </div>

            {/* Booking Status */}
            <div className="mt-4 p-4 rounded-xl bg-[rgba(255,200,87,0.12)] border border-[rgba(255,200,87,0.3)]">
              <div className="flex items-start gap-2">
                <span className="text-lg">ℹ️</span>
                <div className="text-xs text-[var(--text-muted)]">
                  <p className="font-medium mb-1">Booking Status:</p>
                  <p className="mb-2">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[rgba(255,200,87,0.3)] text-[var(--deep)] font-medium">
                      {booking.booking_status.toUpperCase()}
                    </span>
                  </p>
                  <p>Complete the advance payment to confirm your booking. Our team will contact you within 24 hours.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
