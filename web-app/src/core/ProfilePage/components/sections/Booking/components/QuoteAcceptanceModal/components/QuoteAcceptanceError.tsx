"use client";

interface QuoteAcceptanceErrorProps {
  error: string | null;
}

export function QuoteAcceptanceError({ error }: QuoteAcceptanceErrorProps) {
  if (!error) return null;

  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg mx-6 mt-4">
      <p className="text-red-700 text-sm">{error}</p>
    </div>
  );
}
