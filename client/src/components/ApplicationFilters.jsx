import { STATUSES } from '../constants.js';

export default function ApplicationFilters({ search, status, onSearch, onStatus }) {
  return (
    <div className="filters">
      <div><label htmlFor="search">Search company or role</label><input id="search" type="search" placeholder="Search applications…" value={search} onChange={event => onSearch(event.target.value)} /></div>
      <div><label htmlFor="status-filter">Filter by status</label><select id="status-filter" value={status} onChange={event => onStatus(event.target.value)}><option value="">All statuses</option>{STATUSES.map(item => <option key={item}>{item}</option>)}</select></div>
    </div>
  );
}
