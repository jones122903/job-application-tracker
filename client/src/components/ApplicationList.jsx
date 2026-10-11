import ApplicationCard from './ApplicationCard.jsx';

export default function ApplicationList({ applications, total, disabled, onEdit, onStatus, onDelete, onClear }) {
  if (!total) return <p className="empty">No applications yet. Add your first application using the form.</p>;
  if (!applications.length) return <div className="empty"><p>No applications match your search and filter.</p><button onClick={onClear}>Clear search and filter</button></div>;
  return <ul className="application-list">{applications.map(application => <li key={application._id}><ApplicationCard application={application} disabled={disabled} onEdit={onEdit} onStatus={onStatus} onDelete={onDelete} /></li>)}</ul>;
}
