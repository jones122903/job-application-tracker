export const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];

export function today() {
  const date = new Date();
  // Use the local calendar date, rather than shifting it into UTC.
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function emptyApplication() {
  return { company: '', role: '', applicationDate: today(), status: 'Applied', jobLink: '', notes: '' };
}
