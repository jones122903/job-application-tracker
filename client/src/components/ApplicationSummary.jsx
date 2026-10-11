import { STATUSES } from '../constants.js';

export default function ApplicationSummary({ applications }) {
  const counts = Object.fromEntries(STATUSES.map(status => [status, 0]));
  for (const application of applications) counts[application.status] += 1;
  return (
    <section aria-label="Application totals" className="summary">
      <div className="stat"><span>Total applications</span><strong>{applications.length}</strong></div>
      {STATUSES.map(status => <div key={status} className="stat"><span>{status}</span><strong>{counts[status]}</strong></div>)}
    </section>
  );
}
