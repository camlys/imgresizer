
"use client";

import React, { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Loader2, ArrowLeft, Zap, Image as ImageIcon } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import Link from 'next/link';

interface OptimizedResult {
    dataUrl: string;
    size: number;
    originalSize: number;
    filename: string;
}

export default function ResultPage() {
    const [result, setResult] = useState<OptimizedResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedResult = sessionStorage.getItem('optimizedResult');
            if (storedResult) {
                setResult(JSON.parse(storedResult));
            }
        } catch (error) {
            console.error("Failed to parse result from sessionStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDownload = () => {
        if (!result) return;
        const link = document.createElement('a');
        link.href = result.dataUrl;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const reductionPercentage = result ? Math.round(((result.originalSize - result.size) / result.originalSize) * 100) : 0;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <SiteHeader />
            <main className="flex-1 container mx-auto py-12 px-6">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-3xl font-bold font-headline">
                            <Zap className="text-primary" />
                            Optimization Result
                        </CardTitle>
                        <CardDescription>
                            Your image has been optimized to your target file size. Review the result and download your file.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                                <p>Loading result...</p>
                            </div>
                        ) : result ? (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="text-primary" />
                                            Optimized Image
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="relative">
                                            <img src={result.dataUrl} alt="Optimized image" className="rounded-lg shadow-lg w-full" />
                                        </div>
                                        <div className="p-4 bg-green-500/10 text-green-700 rounded-lg text-center">
                                            <p className="text-4xl font-bold">{reductionPercentage}%</p>
                                            <p className="font-semibold">Size Reduction</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Original Size</p>
                                                <p className="text-xl font-bold">{formatBytes(result.originalSize)}</p>
                                            </div>
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Optimized Size</p>
                                                <p className="text-xl font-bold text-primary">{formatBytes(result.size)}</p>
                                            </div>
                                        </div>
                                        <Button onClick={handleDownload} className="w-full">
                                            <Download className="mr-2" />
                                            Download Image
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="text-center py-16 text-muted-foreground">
                                <p className="mb-4">No optimization data found. Please go back and optimize an image first.</p>
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
