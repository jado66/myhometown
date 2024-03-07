'use client'

import { useEffect } from 'react';

function DonatePage() {
  useEffect(() => {
    // Load the Givebutter script
    const script = document.createElement('script');
    script.src = "https://widgets.givebutter.com/js/sdk.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup the script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div data-givebutter-campaign="HMSFounders"></div>
  );
}

export default DonatePage;
