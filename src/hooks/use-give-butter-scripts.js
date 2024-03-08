'use client'

import { useEffect } from 'react';

const useGiveButterScripts = () => {
    useEffect(() => {
        // Load the Givebutter script
        const script = document.createElement('script');
        script.src = "https://widgets.givebutter.com/latest.umd.cjs?acct=1IGQmUrsKL8BPFje&p=other";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Cleanup the script when the component unmounts
            document.body.removeChild(script);
        };
    }, []);
};

export default useGiveButterScripts;