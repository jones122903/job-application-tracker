import mongoose from 'mongoose';
import { APPLICATION_STATUSES } from '../models/Application.js';

const allowedFields = ['company', 'role', 'applicationDate', 'status', 'jobLink', 'notes'];

export function validateApplication(req, res, next) {
  const body = req.body;
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ message: 'Request body must be a JSON object.' });
  }

  const fields = Object.keys(body);
  if (req.method === 'PATCH' && fields.length === 0) {
    errors.push('Provide at least one field to update.');
  }
  for (const field of fields) {
    if (!allowedFields.includes(field)) errors.push(`Unknown field: ${field}.`);
  }

  for (const field of ['company', 'role']) {
    if (req.method === 'POST' || Object.hasOwn(body, field)) {
      if (typeof body[field] !== 'string' || !body[field].trim()) {
        errors.push(`${field} must be a non-empty string.`);
      }
    }
  }
  for (const field of ['jobLink', 'notes']) {
    if (Object.hasOwn(body, field) && typeof body[field] !== 'string') {
      errors.push(`${field} must be a string.`);
    }
  }
  if (Object.hasOwn(body, 'status') && !APPLICATION_STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${APPLICATION_STATUSES.join(', ')}.`);
  }

  // Date-only input avoids ambiguous formats and catches impossible calendar dates.
  if (Object.hasOwn(body, 'applicationDate')) {
    const value = body.applicationDate;
    const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00.000Z`) : new Date(NaN);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      errors.push('applicationDate must be a valid date in YYYY-MM-DD format.');
    }
  }
  if (typeof body.jobLink === 'string' && body.jobLink.trim()) {
    try {
      const url = new URL(body.jobLink.trim());
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
    } catch {
      errors.push('jobLink must be a valid HTTP or HTTPS URL, or an empty string.');
    }
  }
  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed.', errors });
  }
  // Pass only the supported fields to Mongoose, never raw update operators.
  req.applicationData = Object.fromEntries(fields.map(field => [field, body[field]]));
  next();
}

export function validateId(req, res, next, id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({ message: 'Invalid application ID.' });
  }
  next();
}
