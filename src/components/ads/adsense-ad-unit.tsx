
'use client';

import React, { useEffect } from 'react';

interface AdsenseAdUnitProps {
  adSlotId: string;
  adFormat?: string; // e.g., "auto", "rectangle", "vertical", "horizontal"
  responsive?: boolean; // Corresponds to data-full-width-responsive
  style?: React.CSSProperties;
  className?: string;
}

// IMPORTANT: Replace 'ca-pub-YOUR_PUBLISHER_ID' with your actual AdSense Publisher ID
const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-YOUR_PUBLISHER_ID';
const IS_PUBLISHER_ID_CONFIGURED = ADSENSE_PUBLISHER_ID && ADSENSE_PUBLISHER_ID !== 'ca-pub-YOUR_PUBLISHER_ID';

export function AdsenseAdUnit({
  adSlotId,
  adFormat = 'auto',
  responsive = true,
  style = { display: 'block' },
  className = '',
}: AdsenseAdUnitProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && IS_PUBLISHER_ID_CONFIGURED) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense push error:', err);
    }
  }, [adSlotId]); // Re-run if adSlotId changes

  if (!IS_PUBLISHER_ID_CONFIGURED) {
    return (
      <div className={className} style={{ ...style, border: '1px dashed #ccc', padding: '20px', textAlign: 'center', minHeight: '100px' }}>
        <p className="text-muted-foreground">AdSense Ad Unit</p>
        <p className="text-xs text-muted-foreground">Ads not configured: Publisher ID missing in environment variables (e.g., .env.local or hosting provider).</p>
        <p className="text-xs text-muted-foreground">Current Slot ID (for reference): {adSlotId}</p>
      </div>
    );
  }

  if (adSlotId.startsWith('YOUR_AD_SLOT_ID')) {
     return (
      <div className={className} style={{ ...style, border: '1px dashed #ccc', padding: '20px', textAlign: 'center', minHeight: '100px' }}>
        <p className="text-muted-foreground">AdSense Ad Unit (Ready)</p>
        <p className="text-xs text-muted-foreground">Publisher ID is set. Now, please replace the placeholder Ad Slot ID below with a real one from your AdSense account.</p>
        <p className="text-xs text-muted-foreground">Placeholder Slot ID: {adSlotId}</p>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }} // AdSense requires this
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlotId}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive.toString()}
        aria-label={`AdSense ad unit ${adSlotId}`}
      />
    </div>
  );
}
