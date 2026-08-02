"use client";

import { useState, useMemo } from "react";
import SubscriberList from "./subscriber-list";
import RegisteredUsersList from "./registered-users-list";
import AdditionalEmails from "./additional-emails";
import NewsletterComposer from "./newsletter-composer";
import SendHistory from "./send-history";
import ScheduledSends from "./scheduled-sends";

interface Subscriber {
  email: string;
  source: string;
  subscribedAt: string;
  plan: string | null;
  isPaid: boolean;
}

interface RegisteredUser {
  email: string;
  name: string | null;
  phone: string | null;
  plan: string;
  isPaid: boolean;
  joinedAt: string;
}

interface Props {
  subscribers: Subscriber[];
  subscriberCount: number;
  users: RegisteredUser[];
  userCount: number;
  shareholderEmails: string[];
}

export default function NewsletterPageClient({
  subscribers,
  subscriberCount,
  users,
  userCount,
  shareholderEmails: SHAREHOLDER_EMAILS,
}: Props) {
  const [subscriberSelected, setSubscriberSelected] = useState<Map<string, string | null>>(new Map());
  const [userSelected, setUserSelected] = useState<Map<string, string | null>>(new Map());
  const [additionalEmails, setAdditionalEmails] = useState<Map<string, string | null>>(new Map());
  const [includeShareholders, setIncludeShareholders] = useState(false);
  const [sendHistoryKey, setSendHistoryKey] = useState(0);
  const [scheduleKey, setScheduleKey] = useState(0);

  const allSelected = useMemo(() => {
    const merged = new Map<string, string | null>();
    subscriberSelected.forEach((name, email) => merged.set(email, name));
    userSelected.forEach((name, email) => merged.set(email, name));
    additionalEmails.forEach((name, email) => merged.set(email, name));
    if (includeShareholders) SHAREHOLDER_EMAILS.forEach((email) => merged.set(email, null));
    return merged;
  }, [subscriberSelected, userSelected, additionalEmails, includeShareholders, SHAREHOLDER_EMAILS]);

  const paidUsers = users.filter((u) => u.isPaid).length;
  const paidSubscribers = subscribers.filter((s) => s.isPaid).length;

  return (
    <>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-3xl font-extrabold">{subscriberCount}</div>
          <div className="text-sm text-muted mt-0.5">Subscribers</div>
        </div>
        <div className="card p-5">
          <div className="text-3xl font-extrabold">{userCount}</div>
          <div className="text-sm text-muted mt-0.5">Registered users</div>
        </div>
        <div className="card p-5">
          <div className="text-3xl font-extrabold text-emerald-600">{paidSubscribers}</div>
          <div className="text-sm text-muted mt-0.5">Paid subscribers</div>
        </div>
        <div className="card p-5">
          <div className="text-3xl font-extrabold text-emerald-600">{paidUsers}</div>
          <div className="text-sm text-muted mt-0.5">Paid users</div>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <SubscriberList
          subscribers={subscribers}
          selectedEmails={subscriberSelected}
          onSelectionChange={setSubscriberSelected}
        />
        <RegisteredUsersList
          users={users}
          selectedEmails={userSelected}
          onSelectionChange={setUserSelected}
        />
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <AdditionalEmails
          additionalEmails={additionalEmails}
          onChange={setAdditionalEmails}
        />

        <div className="card p-5">
          <h2 className="font-bold text-lg mb-3">Quick add</h2>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={includeShareholders}
              onChange={(e) => setIncludeShareholders(e.target.checked)}
              className="accent-brand mt-1 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-sm font-semibold group-hover:text-brand transition-colors">
                Include testers / developers / shareholders
              </span>
              <ul className="mt-2 space-y-0.5">
                {SHAREHOLDER_EMAILS.map((email) => (
                  <li key={email} className="text-xs font-mono text-muted truncate">
                    {email}
                  </li>
                ))}
              </ul>
            </div>
          </label>
        </div>
      </div>

      <div className="mt-6">
        <NewsletterComposer
          subscriberCount={subscriberCount}
          selectedEmails={allSelected}
          subscriberSelectedCount={subscriberSelected.size}
          userSelectedCount={userSelected.size}
          additionalCount={additionalEmails.size}
          shareholdersCount={includeShareholders ? SHAREHOLDER_EMAILS.length : 0}
          onSent={() => setSendHistoryKey((k) => k + 1)}
          onScheduled={() => setScheduleKey((k) => k + 1)}
        />
      </div>

      <ScheduledSends refreshKey={scheduleKey} />

      <SendHistory refreshKey={sendHistoryKey} />
    </>
  );
}
