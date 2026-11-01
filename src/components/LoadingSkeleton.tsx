/** Placeholder cards while a page loads. The label stays for screen readers; the blocks carry no text. */
export default function LoadingSkeleton({ label, cards = 3 }: { label: string; cards?: number }) {
  return (
    <div role="status" aria-busy="true" className="skeleton">
      <span className="sr-only">{label}</span>
      {Array.from({ length: cards }, (_, i) => (
        <div key={i} className="skeleton-card" aria-hidden="true" />
      ))}
    </div>
  );
}
