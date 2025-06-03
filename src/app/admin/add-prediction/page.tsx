
// This admin page has been replaced by /admin/manage-prediction/page.tsx
// and is no longer used for the simplified "Predict and Win" feature.
// For a full cleanup, this file can be deleted.
'use client';

import { PageHeader } from '@/components/shared/page-header';

export default function AddPredictionPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Prediction Question (Deprecated)"
        description="This page is no longer in use. Please use 'Manage Prediction' instead."
      />
      <p>The functionality for adding prediction questions has been moved to the 'Manage Prediction' page.</p>
    </div>
  );
}
