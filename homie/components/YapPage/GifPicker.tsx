"use client"
import { useState, useEffect, useCallback } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';

const giphyFetch = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || '');

interface GifPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onGifSelect: (gif: any) => void;
    showGifPicker: any;
}

export default function GifPicker({ isOpen, onClose, onGifSelect, showGifPicker }: GifPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [width, setWidth] = useState(310);
    
    // Handle responsive width
    useEffect(() => {
        const handleResize = () => {
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            setWidth(vw < 400 ? vw - 40 : 310); // 40px for padding
        };

        handleResize(); // Initial call
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchGifs = useCallback((offset: number) => {
        if (debouncedQuery) {
            return giphyFetch.search(debouncedQuery, { offset, limit: 10 });
        }
        return giphyFetch.trending({ offset, limit: 10 });
    }, [debouncedQuery]);

    if (!isOpen) return null;

    return (
        <>
        <div className={`fixed inset-0 z-50 items-end justify-center sm:items-center ${showGifPicker ? "flex" : "hidden"}}`} onClick={onClose}>
        </div>
        <div 
            className="absolute translate-y-[-60%] mr-[10vw] md:mr-0 z-50 w-[350px] bg-bgPrimary border border-[#666] rounded-[15px] p-4"
            onClick={e => e.stopPropagation()}
        >
            {/* <button
                onClick={onClose}
                className="absolute right-3 top-3 rounded-full p-1.5 hover:bg-bgSecondary transition-colors"
            >
                <RxCross2 className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button> */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search GIFs..."
                        className="w-full bg-bgSecondary text-fontPrimary px-4 py-2 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#666]"
                    />
                </div>
                <div className="overflow-y-auto overflow-x-hidden h-[300px] sm:h-[400px]">
                    <Grid
                        key={debouncedQuery}
                        onGifClick={(gif, e) => {
                            e.preventDefault();
                            onGifSelect(gif);
                            onClose();
                        }}
                        fetchGifs={fetchGifs}
                        width={width}
                        columns={width < 300 ? 1 : 2}
                        gutter={6}
                        noLink={true}
                        hideAttribution={true}
                    />
                </div>
            </div>
        </div>
        </>
    );
} 