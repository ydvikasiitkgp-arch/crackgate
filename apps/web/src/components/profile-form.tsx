"use client";

import { useActionState } from "react";
import { updateProfile, type UpdateProfileState } from "@/app/settings/actions";
import { useImpersonation } from "@/components/impersonation-context";

const initial: UpdateProfileState = {};

export function ProfileForm({
  defaultName,
  defaultTargetYear,
  defaultTargetRank,
  defaultCurrentStatus,
  email,
  phone,
  phoneVerified,
}: {
  defaultName: string;
  defaultTargetYear: string;
  defaultTargetRank: string;
  defaultCurrentStatus: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
}) {
  const [state, action, pending] = useActionState(updateProfile, initial);
  const impersonating = useImpersonation();

  return (
    <form action={action} className="space-y-4">
      <Row label="Full name">
        <input
          name="name"
          type="text"
          defaultValue={defaultName}
          maxLength={80}
          className="input w-full sm:max-w-xs"
          placeholder="Your name"
        />
      </Row>

      <Row label="Target rank (AIR)">
        <input
          name="targetRank"
          type="number"
          inputMode="numeric"
          min={1}
          max={100000}
          defaultValue={defaultTargetRank}
          className="input w-full sm:max-w-[140px]"
          placeholder="e.g. 100"
        />
      </Row>

      <Row label="Target year">
        <select
          name="targetYear"
          defaultValue={defaultTargetYear}
          className="input w-full sm:max-w-[160px]"
        >
          <option value="">—</option>
          <option value="2027">GATE 2027</option>
          <option value="2028">GATE 2028</option>
          <option value="2029">GATE 2029</option>
        </select>
      </Row>

      <Row label="Current status">
        <select
          name="currentStatus"
          defaultValue={defaultCurrentStatus}
          className="input w-full sm:max-w-xs"
        >
          <option value="">—</option>
          <option value="student">B.Tech student</option>
          <option value="final-year">Final-year student</option>
          <option value="graduate">Graduate (drop year)</option>
          <option value="working">Working professional</option>
          <option value="other">Other</option>
        </select>
      </Row>

      <div className="pt-2 border-t border-line space-y-3">
        <ReadRow label="Email" value={email} />
        <ReadRow label="Phone" value={phone} verified={phoneVerified} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending || impersonating} className="btn btn-accent text-sm">
          {impersonating ? "Read-only admin mode" : pending ? "Saving…" : "Save changes"}
        </button>
        {state.ok && <span className="text-sm text-ok">✓ Saved</span>}
        {state.error && <span className="text-sm text-bad">{state.error}</span>}
      </div>
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}

function ReadRow({ label, value, verified }: { label: string; value: string; verified?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm gap-3">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-right">
        {value}
        {verified && <span className="ml-2 text-ok text-xs">✓ verified</span>}
      </span>
    </div>
  );
}
