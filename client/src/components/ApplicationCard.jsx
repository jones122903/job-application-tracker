import { STATUSES } from '../constants.js';

export default function ApplicationCard({ application, disabled, onEdit, onStatus, onDelete }) {
  let safeLink = '';
  try {
    const url = new URL(application.jobLink);
    if (['http:', 'https:'].includes(url.protocol)) safeLink = url.href;
  } catch { /* Empty or invalid optional links are not rendered as anchors. */ }

  return (
    <article className="application-card">
      <div className="card-heading"><div><h3>{application.company}</h3><p className="role">{application.role}</p></div><span className={`badge ${application.status.toLowerCase()}`}>{application.status}</span></div>
      <p className="date">Applied: <time dateTime={application.applicationDate.slice(0, 10)}>{application.applicationDate.slice(0, 10)}</time></p>
      {safeLink && <p><a href={safeLink} target="_blank" rel="noopener noreferrer">View job posting <span className="sr-only">for {application.role} at {application.company} (opens in a new tab)</span></a></p>}
      {application.notes && <p className="notes">{application.notes}</p>}
      <label htmlFor={`status-${application._id}`}>Change status <span className="sr-only">for {application.role} at {application.company}</span></label>
      <select id={`status-${application._id}`} value={application.status} disabled={disabled} onChange={event => onStatus(application, event.target.value)}>{STATUSES.map(status => <option key={status}>{status}</option>)}</select>
      <div className="actions"><button disabled={disabled} onClick={() => onEdit(application)}>Edit<span className="sr-only"> {application.role} at {application.company}</span></button><button className="danger" disabled={disabled} onClick={() => onDelete(application)}>Delete<span className="sr-only"> {application.role} at {application.company}</span></button></div>
    </article>
  );
}
