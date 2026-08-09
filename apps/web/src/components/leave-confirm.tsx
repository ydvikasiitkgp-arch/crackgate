export function LeaveConfirm({ onContinue, onSubmit }: {
  onContinue: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[85] bg-black/50 grid place-items-center p-4 text-center">
      <div className="bg-surface rounded-xl max-w-sm w-full p-6">
        <h2 className="text-xl font-extrabold">Leave test?</h2>
        <p className="text-sm text-muted mt-1">
          Submit to keep your answers.
        </p>
        <div className="mt-5 space-y-2">
          <button onClick={onContinue} className="btn btn-accent w-full text-sm">Continue test</button>
          <button onClick={onSubmit} className="btn btn-primary w-full text-sm">Submit test</button>
        </div>
      </div>
    </div>
  );
}
