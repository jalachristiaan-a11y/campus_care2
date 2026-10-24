import { useRef, useState } from 'react';
import './SubmitGrievance.css';
import ConfirmationModal from './ConfirmationModal.jsx';

const categories = [
  'Academic Affairs',
  'Campus Facilities',
  'Financial Aid',
  'Student Services',
  'Safety and Security',
  'Other',
];

export default function SubmitGrievance({ user = {}, onCancel, onSubmit, onViewTickets }) {
  const attachmentInputRef = useRef(null);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    location: '',
    description: '',
    attachment: null,
    confirmAccurate: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadingImage, setIsReadingImage] = useState(false);
  const [submittedGrievance, setSubmittedGrievance] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAttachmentChange = (event) => {
    const [file] = event.target.files ?? [];
    if (!file) {
      return;
    }

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedImageTypes.includes(file.type)) {
      setSubmitError('Choose a JPEG, PNG, WebP, or GIF image.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSubmitError('The image must be 2 MB or smaller.');
      event.target.value = '';
      return;
    }

    setIsReadingImage(true);
    const reader = new FileReader();
    reader.onload = () => {
      setIsReadingImage(false);
      if (typeof reader.result !== 'string') {
        setSubmitError('Unable to read the selected image. Please try another image.');
        return;
      }

      setFormData((previous) => ({
        ...previous,
        attachment: {
          name: file.name,
          type: file.type,
          data: reader.result,
        },
      }));
      setSubmitError('');
    };
    reader.onerror = () => {
      setIsReadingImage(false);
      setSubmitError('Unable to read the selected image. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setFormData((previous) => ({ ...previous, attachment: null }));
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const savedGrievance = onSubmit?.(formData);
      if (!savedGrievance) {
        throw new Error('Unable to save your grievance. Please try again.');
      }
      setSubmittedGrievance(savedGrievance);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Unable to save your grievance. Please try again.',
      );
    }
  };

  return (
    <main className="submit-grievance-page">
      <header className="submit-grievance-header">
        <div>
          <span className="submit-grievance-brand">WMSU CampusCare</span>
          <span className="submit-grievance-subtitle">Student Grievance &amp; Redressal Portal</span>
        </div>
        <button type="button" className="submit-back-button" onClick={onCancel}>
          Back to dashboard
        </button>
      </header>

      <section className="submit-grievance-card">
        <div className="submit-grievance-heading">
          <span className="submit-eyebrow">NEW SUBMISSION</span>
          <h1>File a grievance</h1>
          <p>Share the details of your concern. Your submission will be handled confidentially.</p>
          {user.universityEmail && (
            <p className="submit-account">Submitting as {user.universityEmail}</p>
          )}
        </div>

        {submitError && (
          <div className="submit-error" role="alert">
            {submitError}
          </div>
        )}

        <form className="submit-grievance-form" onSubmit={handleSubmit}>
          <div className="submit-form-grid">
            <label className="submit-field">
              <span>Category</span>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className="submit-field submit-field-full">
              <span>Subject</span>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                maxLength={120}
                placeholder="Briefly describe your concern"
                required
              />
            </label>

            <label className="submit-field submit-field-full">
              <span>Location (optional)</span>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                maxLength={120}
                placeholder="Building, office, or campus area"
              />
            </label>

            <label className="submit-field submit-field-full">
              <span>Details</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                maxLength={3000}
                placeholder="Explain what happened, when it happened, and what support you need."
                required
              />
              <small>{formData.description.length}/3000 characters</small>
            </label>

            <div className="submit-field submit-field-full">
              <label htmlFor="grievance-attachment">Picture (optional)</label>
              <input
                ref={attachmentInputRef}
                id="grievance-attachment"
                className="submit-image-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAttachmentChange}
              />
              <small>JPEG, PNG, WebP, or GIF. Maximum size: 2 MB.</small>
              {formData.attachment && (
                <div className="submit-image-preview">
                  <img src={formData.attachment.data} alt="Selected grievance attachment" />
                  <div>
                    <span>{formData.attachment.name}</span>
                    <button type="button" onClick={handleRemoveAttachment}>
                      Remove picture
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <label className="submit-confirmation">
            <input
              type="checkbox"
              name="confirmAccurate"
              checked={formData.confirmAccurate}
              onChange={handleChange}
              required
            />
            <span>I confirm that the information provided is accurate to the best of my knowledge.</span>
          </label>

          <div className="submit-form-actions">
            <button type="button" className="submit-cancel-button" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="submit-send-button"
              disabled={isSubmitting || isReadingImage || Boolean(submittedGrievance)}
            >
              {isReadingImage ? 'Loading picture…' : isSubmitting ? 'Submitting…' : submittedGrievance ? 'Submitted' : 'Submit grievance'}
            </button>
          </div>
        </form>
      </section>
      {submittedGrievance && (
        <ConfirmationModal
          ticketId={`#${submittedGrievance.id}`}
          assignedDepartment={submittedGrievance.category}
          onClose={onCancel}
          onReturnDashboard={onCancel}
          onViewTickets={onViewTickets}
        />
      )}
    </main>
  );
}
