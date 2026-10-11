import { useEffect, useRef, useState } from 'react';
import { createApplication, deleteApplication, listApplications, updateApplication } from './api/applications.js';
import ApplicationForm from './components/ApplicationForm.jsx';
import ApplicationList from './components/ApplicationList.jsx';
import ApplicationFilters from './components/ApplicationFilters.jsx';
import ApplicationSummary from './components/ApplicationSummary.jsx';

export default function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [retry, setRetry] = useState(0);
  const [editing, setEditing] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [pending, setPending] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  // This guard changes immediately, before React renders disabled buttons.
  const pendingRequest = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    listApplications(controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(data)) throw new Error('The server returned an unexpected application list.');
      setApplications(data);
      setLoadError('');
      setLoading(false);
    }).catch(cause => {
      if (controller.signal.aborted) return;
      setLoadError(cause.message);
      setLoading(false);
    });
    return () => controller.abort();
  }, [retry]);

  function retryLoading() {
    setLoading(true);
    setLoadError('');
    setRetry(value => value + 1);
  }

  function resetForm() {
    setEditing(null);
    setFormVersion(value => value + 1);
  }

  async function mutate(action, message) {
    if (pendingRequest.current || loading || loadError) return false;
    pendingRequest.current = true;
    setPending(true);
    setError('');
    setSuccess('');
    try {
      await action();
      setSuccess(message);
      return true;
    } catch (cause) {
      setError(cause.message);
      return false;
    } finally {
      pendingRequest.current = false;
      setPending(false);
    }
  }

  async function saveApplication(data) {
    const saved = await mutate(async () => {
      const record = editing
        ? await updateApplication(editing._id, data)
        : await createApplication(data);
      setApplications(current => editing
        ? current.map(item => item._id === record._id ? record : item)
        : [record, ...current]);
    }, editing ? 'Application updated.' : 'Application added.');
    if (saved) resetForm();
  }

  function changeStatus(application, nextStatus) {
    if (application.status === nextStatus) return;
    mutate(async () => {
      const updated = await updateApplication(application._id, { status: nextStatus });
      setApplications(current => current.map(item => item._id === updated._id ? updated : item));
      // Remount the edit form only through an explicit edit action. Keep unsaved
      // form entries intact by disabling card actions while editing.
    }, 'Status updated.');
  }

  function removeApplication(application) {
    if (pendingRequest.current) return;
    if (!window.confirm(`Delete the ${application.role} application at ${application.company}?`)) return;
    mutate(async () => {
      await deleteApplication(application._id);
      setApplications(current => current.filter(item => item._id !== application._id));
    }, 'Application deleted.');
  }

  function startEditing(application) {
    if (pendingRequest.current) return;
    setEditing(application);
    setError('');
    setSuccess('');
    document.getElementById('application-form-title')?.focus();
  }

  const query = search.trim().toLowerCase();
  const visible = applications.filter(item =>
    (!status || item.status === status)
    && (item.company.toLowerCase().includes(query) || item.role.toLowerCase().includes(query)));

  return (
    <main className="container">
      <header className="page-header">
        <p className="eyebrow">Your next opportunity</p>
        <h1>Job Application Tracker</h1>
        <p>Keep your applications, interviews and offers in one place.</p>
      </header>
      {loading && <p role="status" className="notice">Loading applications…</p>}
      {loadError && <div role="alert" className="notice error"><p>{loadError}</p><button onClick={retryLoading}>Retry loading</button></div>}
      {success && <p role="status" className="notice success">{success}</p>}
      {error && <p role="alert" className="notice error">{error}</p>}
      {pending && <p role="status" className="notice">Saving changes…</p>}
      {!loading && !loadError && <ApplicationSummary applications={applications} />}
      <div className="workspace">
        <ApplicationForm
          key={`${editing?._id || 'new'}-${formVersion}`}
          application={editing}
          disabled={pending || loading || Boolean(loadError)}
          onSave={saveApplication}
          onCancel={() => { resetForm(); setError(''); setSuccess(''); }}
        />
        <section className="panel results" aria-labelledby="applications-title" aria-busy={loading || pending}>
          <div className="section-heading"><h2 id="applications-title">Applications</h2>{!loading && !loadError && <span>{visible.length} shown</span>}</div>
          <ApplicationFilters search={search} status={status} onSearch={setSearch} onStatus={setStatus} />
          {!loading && !loadError && <ApplicationList
            applications={visible}
            total={applications.length}
            disabled={pending || Boolean(editing)}
            onEdit={startEditing}
            onStatus={changeStatus}
            onDelete={removeApplication}
            onClear={() => { setSearch(''); setStatus(''); }}
          />}
          {editing && <p className="hint">Save or cancel your edit before changing another application.</p>}
        </section>
      </div>
    </main>
  );
}
