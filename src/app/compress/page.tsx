
"use client";

import React, { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Loader2, ArrowLeft, Zap } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import Link from 'next/link';

interface CompressionResult {
    dataUrl: string;
    originalSize: number;
    compressedSize: number;
    quality: 'less' | 'medium' | 'extreme';
}

export default function CompressPage() {
    const [result, setResult] = useState<CompressionResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedResult = sessionStorage.getItem('compressionResult');
            if (storedResult) {
                setResult(JSON.parse(storedResult));
            }
        } catch (error) {
            console.error("Failed to parse compression result from sessionStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDownload = () => {
        if (!result) return;
        const link = document.createElement('a');
        link.href = result.dataUrl;
        link.download = `imgresizer-compressed-${result.quality}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    const qualityTextMap = {
        less: 'Less Compression',
        medium: 'Medium Compression',
        extreme: 'Extreme Compression',
    };

    const reductionPercentage = result ? Math.round(((result.originalSize - result.compressedSize) / result.originalSize) * 100) : 0;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <SiteHeader />
            <main className="flex-1 container mx-auto py-12 px-6">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-3xl font-bold font-headline">
                            <Zap className="text-primary" />
                            Compression Result
                        </CardTitle>
                        <CardDescription>
                            Your image has been compressed. Review the result and download your file.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                                <p>Loading result...</p>
                            </div>
                        ) : result ? (
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="relative">
                                    <img src={result.dataUrl} alt="Compressed image" className="rounded-lg shadow-lg w-full" />
                                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                                        {qualityTextMap[result.quality]}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Original Size</p>
                                            <p className="text-2xl font-bold">{formatBytes(result.originalSize)}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Compressed Size</p>
                                            <p className="text-2xl font-bold text-primary">{formatBytes(result.compressedSize)}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-green-500/10 text-green-700 rounded-lg text-center">
                                        <p className="text-4xl font-bold">{reductionPercentage}%</p>
                                        <p className="font-semibold">Size Reduction</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Button onClick={handleDownload} className="w-full">
                                            <Download className="mr-2" />
                                            Download Image
                                        </Button>
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href="/">
                                                <ArrowLeft className="mr-2" />
                                                Back to Editor
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16 text-muted-foreground">
                                <p className="mb-4">No compression data found. Please go back and compress an image first.</p>
                                <Button asChild>
                                    <Link href="/">
                                        <ArrowLeft className="mr-2" />
                                        Back to Editor
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
            <SiteFooter />
        </div>
    );
}

    