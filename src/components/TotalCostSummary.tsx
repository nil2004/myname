interface CategoryCost {
  category: string;
  categoryLabel: string;
  priceMin: number;
  priceMax: number;
  vendorName: string;
  tier?: string;
}

interface TotalCostSummaryProps {
  categoryCosts: CategoryCost[];
  advancePercentage: number;
}

export default function TotalCostSummary({ categoryCosts, advancePercentage }: TotalCostSummaryProps) {
  const totalMin = categoryCosts.reduce((sum, item) => sum + item.priceMin, 0);
  const totalMax = categoryCosts.reduce((sum, item) => sum + item.priceMax, 0);
  const advanceAmount = Math.round((totalMin * advancePercentage) / 100);
  const remainingMin = totalMin - advanceAmount;
  const remainingMax = totalMax - advanceAmount;

  function formatPrice(amount: number): string {
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString();
  }

  return (
    <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)] sticky top-24">
      <div className="font-playfair font-bold text-xl mb-4">Cost Summary</div>

      {/* Category Breakdown */}
      <div className="space-y-3 mb-4 pb-4 border-b border-[var(--border)]">
        {categoryCosts.map((item, index) => (
          <div key={index} className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-sm font-medium">{item.categoryLabel}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{item.vendorName}</div>
              {item.tier && (
                <div className="text-[0.65rem] text-[var(--purple)] mt-0.5 capitalize">
                  {item.tier} tier
                </div>
              )}
            </div>
            <div className="text-sm font-medium text-right">
              ₹{formatPrice(item.priceMin)} - ₹{formatPrice(item.priceMax)}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="space-y-3 mb-4 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="font-medium">Total Estimate</div>
          <div className="font-bold text-lg">
            ₹{formatPrice(totalMin)} - ₹{formatPrice(totalMax)}
          </div>
        </div>
      </div>

      {/* Advance Payment */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--text-muted)]">
            Advance ({advancePercentage}%)
          </div>
          <div className="text-sm font-medium">₹{formatPrice(advanceAmount)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--text-muted)]">Remaining</div>
          <div className="text-sm font-medium">
            ₹{formatPrice(remainingMin)} - ₹{formatPrice(remainingMax)}
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <div className="text-xs text-[var(--text-muted)] leading-relaxed">
          💡 Pay {advancePercentage}% advance to confirm your booking. Remaining amount to be paid before the event.
        </div>
      </div>
    </div>
  );
}
