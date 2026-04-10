'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ 
        backgroundColor: '#020617', 
        color: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 'screen',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            backgroundColor: '#ef4444', 
            borderRadius: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
            fontSize: '32px',
            fontWeight: '900'
          }}>!</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.05em' }}>
            Something Went Wrong
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>
            An unexpected error occurred. Our team has been notified and we are working to fix it.
          </p>
          <button
            onClick={() => reset()}
            style={{ 
              backgroundColor: '#fff', 
              color: '#0f172a', 
              border: 'none', 
              padding: '16px 32px', 
              borderRadius: '16px', 
              fontWeight: '900', 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
