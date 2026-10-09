import Application from '../models/Application.js';

export async function createApplication(req, res) {
  const application = await Application.create(req.applicationData);
  res.status(201).json(application);
}

export async function listApplications(req, res) {
  const applications = await Application.find().sort({ createdAt: -1 });
  res.json(applications);
}

export async function getApplication(req, res) {
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  res.json(application);
}

export async function updateApplication(req, res) {
  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { $set: req.applicationData },
    { returnDocument: 'after', runValidators: true },
  );
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  res.json(application);
}

export async function deleteApplication(req, res) {
  const application = await Application.findByIdAndDelete(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  res.status(204).end();
}
