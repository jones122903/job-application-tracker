import { useState } from 'react';
import { emptyApplication, STATUSES } from '../constants.js';

export default function ApplicationForm({ application, disabled, onSave, onCancel }) {
  const [values, setValues] = useState(() => application ? {
    company: application.company,
    role: application.role,
    // Preserve the saved date without converting it to the local timezone.
    applicationDate: application.applicationDate.slice(0, 10),
    status: application.status,
    jobLink: application.jobLink || '',
    notes: application.notes || '',
  } : emptyApplication());
  const [validationError, setValidationError] = useState('');

  function change(event) {
    setValues(current => ({ ...current, [event.target.name]: event.target.value }));
    setValidationError('');
  }

  function submit(event) {
    event.preventDefault();
    if (disabled) return;
    if (!values.company.trim() || !values.role.trim()) {
      setValidationError('Company and role cannot be blank.');
      return;
    }
    if (values.jobLink.trim()) {
      try {
        const url = new URL(values.jobLink.trim());
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
      } catch {
        setValidationError('Job link must be a valid HTTP or HTTPS URL.');
        return;
      }
    }
    setValidationError('');
    onSave({ ...values, company: values.company.trim(), role: values.role.trim(), jobLink: values.jobLink.trim() });
  }

  return (
    <section className="panel form-panel" aria-labelledby="application-form-title">
      <h2 id="application-form-title" tabIndex={-1}>{application ? 'Edit application' : 'Add application'}</h2>
      <p className="hint">Company, role, date and status are required.</p>
      {validationError && <p role="alert" className="notice error">{validationError}</p>}
      <form onSubmit={submit}>
        <fieldset disabled={disabled}>
          <label htmlFor="company">Company</label>
          <input id="company" name="company" value={values.company} onChange={change} required />
          <label htmlFor="role">Role</label>
          <input id="role" name="role" value={values.role} onChange={change} required />
          <label htmlFor="applicationDate">Application date</label>
          <input id="applicationDate" name="applicationDate" type="date" value={values.applicationDate} onChange={change} required />
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={values.status} onChange={change}>
            {STATUSES.map(status => <option key={status}>{status}</option>)}
          </select>
          <label htmlFor="jobLink">Job link <span className="optional">(optional)</span></label>
          <input id="jobLink" name="jobLink" type="url" placeholder="https://example.com/jobs/1" value={values.jobLink} onChange={change} />
          <label htmlFor="notes">Notes <span className="optional">(optional)</span></label>
          <textarea id="notes" name="notes" rows={4} value={values.notes} onChange={change} />
          <div className="actions">
            <button type="submit" className="primary">{application ? 'Save changes' : 'Add application'}</button>
            {application && <button type="button" onClick={onCancel}>Cancel</button>}
          </div>
        </fieldset>
      </form>
    </section>
  );
}
