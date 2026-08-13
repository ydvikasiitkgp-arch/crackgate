"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn btn-primary text-sm whitespace-nowrap">
      Save as PDF
    </button>
  );
}