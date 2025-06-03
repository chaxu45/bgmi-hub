
'use client';

import React, { useEffect, useRef } from 'react';

interface AdsenseAdUnitProps {
  adSlotId: string;
  adFormat?: string; // e.g., "auto", "rectangle", "vertical", "horizontal"
  responsive?: boolean; // Corresponds to data-full-width-responsive
  style?: React.CSSProperties;
  className?: string;
}

const DUMMY_PUBLISHER_ID = 'ca-pub-YOUR_PUBLISHER_ID'; // Used as a default if env var is missing
const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || DUMMY_PUBLISHER_ID;
const IS_PUBLISHER_ID_CONFIGURED = ADSENSE_PUBLISHER_ID && ADSENSE_PUBLISHER_ID !== DUMMY_PUBLISHER_ID;

export function AdsenseAdUnit({
  adSlotId,
  adFormat = 'auto',
  responsive = true,
  style = { display: 'block' },
  className = '',
}: AdsenseAdUnitProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!IS_PUBLISHER_ID_CONFIGURED || !adSlotId || adSlotId.startsWith('YOUR_AD_SLOT_ID')) {
      return; // Don't attempt to load ad if publisher or slot ID is not configured properly
    }

    // Check if the specific <ins> element for this ad unit has already been processed.
    // AdSense adds a 'data-ad-status' attribute when it processes an ad.
    // Or it might have an inner iframe if an ad was loaded.
    if (insRef.current) {
      if (insRef.current.getAttribute('data-ad-status')) {
        // console.log(`AdSense slot ${adSlotId} already has data-ad-status. Skipping push.`);
        return;
      }
      // Checking for an iframe might be too aggressive if the ad unit is valid but unfilled
      // if (insRef.current.querySelector('iframe')) {
      //   console.log(`AdSense slot ${adSlotId} already contains an iframe. Skipping push.`);
      //   return;
      // }
    }

    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        // console.log(`Pushing to adsbygoogle for slot ${adSlotId}`);
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      // Log errors, but TagErrors are often informational from AdSense
      if ((err as Error).name === 'TagError') {
        // console.warn('AdSense TagError for slot', adSlotId, err);
      } else {
        console.error('AdSense push error for slot', adSlotId, err);
      }
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
        ref={insRef}
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
