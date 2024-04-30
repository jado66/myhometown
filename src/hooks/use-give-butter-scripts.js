'use client'

import { useEffect, useState } from 'react';
import '@/styles/givebutter.css';

const useGiveButterScripts = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load the Givebutter script
        const script = document.createElement('script');
        script.src = "https://widgets.givebutter.com/latest.umd.cjs?acct=1IGQmUrsKL8BPFje&p=other";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            setIsLoaded(true);
        };

        return () => {
            // Cleanup the script when the component unmounts
            document.body.removeChild(script);
        };
    }, []);

    return {isLoaded};
};

export default useGiveButterScripts;