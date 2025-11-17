

"use client";

import React, { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Loader2, ArrowLeft, Zap, Image as ImageIcon, FileText } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import Link from 'next/link';
import type { OptimizedResult } from '@/lib/types';

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

    const handleDownload = (type: 'image' | 'pdf') => {
        if (!result) return;
        const link = document.createElement('a');
        if (type === 'image' && result.image) {
            link.href = result.image.dataUrl;
            link.download = result.image.filename;
        } else if (type === 'pdf' && result.pdf) {
            link.href = result.pdf.dataUrl;
            link.download = result.pdf.filename;
        } else {
            return;
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (type === 'pdf') {
            URL.revokeObjectURL(link.href);
        }
    };

    const imageReduction = result && result.image ? Math.round(((result.originalSize - result.image.size) / result.originalSize) * 100) : 0;
    const pdfReduction = result && result.pdf ? Math.round(((result.originalSize - result.pdf.size) / result.originalSize) * 100) : 0;


    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <SiteHeader />
            <main className="flex-1 container mx-auto py-12 px-6">
                <Card className="max-w-5xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-3xl font-bold font-headline">
                            <Zap className="text-primary" />
                            Optimization Result
                        </CardTitle>
                        <CardDescription>
                            Your file has been optimized to your target file size. Review and download your file(s).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                                <p>Loading result...</p>
                            </div>
                        ) : result ? (
                            <div className={`grid ${result.image && result.pdf ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8 items-start`}>
                                {/* Image Result */}
                                {result.image && (
                                <Card className={!result.pdf ? 'max-w-md mx-auto w-full' : ''}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="text-primary" />
                                            Image Result
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="relative rounded-lg shadow-lg overflow-hidden bg-muted flex justify-center items-center aspect-[4/3] p-4">
                                            <img src={result.image.dataUrl} alt="Optimized image" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="p-4 bg-green-500/10 text-green-700 rounded-lg text-center">
                                            <p className="text-4xl font-bold">{imageReduction}%</p>
                                            <p className="font-semibold">Size Reduction</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Original Size</p>
                                                <p className="text-xl font-bold">{formatBytes(result.originalSize)}</p>
                                            </div>
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Optimized Size</p>
                                                <p className="text-xl font-bold text-primary">{formatBytes(result.image.size)}</p>
                                            </div>
                                        </div>
                                        <Button onClick={() => handleDownload('image')} className="w-full">
                                            <Download className="mr-2" />
                                            Download Image
                                        </Button>
                                    </CardContent>
                                </Card>
                                )}

                                {/* PDF Result */}
                                {result.pdf && (
                                <Card>
                                     <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="text-primary" />
                                            PDF Result
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="relative rounded-lg shadow-lg overflow-hidden bg-muted flex justify-center items-center aspect-[4/3] p-4">
                                            <iframe src={result.pdf.dataUrl} className="w-full h-full" title="PDF Preview"></iframe>
                                        </div>
                                         <div className="p-4 bg-green-500/10 text-green-700 rounded-lg text-center">
                                            <p className="text-4xl font-bold">{pdfReduction}%</p>
                                            <p className="font-semibold">Size Reduction</p>
                                        </div>
                                         <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Original Size</p>
                                                <p className="text-xl font-bold">{formatBytes(result.originalSize)}</p>
                                            </div>
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">New PDF Size</p>
                                                <p className="text-xl font-bold text-primary">{formatBytes(result.pdf.size)}</p>
                                            </div>
                                        </div>
                                        <Button onClick={() => handleDownload('pdf')} className="w-full">
                                            <Download className="mr-2" />
                                            Download PDF
                                        </Button>
                                    </CardContent>
                                </Card>
                                )}
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
