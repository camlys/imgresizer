
"use client";

import React, { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Loader2, ArrowLeft, Zap, FileText, Image as ImageIcon } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import Link from 'next/link';

interface CompressionFormatResult {
    dataUrl: string;
    size: number;
}

interface CompressionResult {
    jpeg: CompressionFormatResult;
    pdf: CompressionFormatResult;
    originalSize: number;
    quality: 'less' | 'medium' | 'extreme';
}

export default function CompressPage() {
    const [result, setResult] = useState<CompressionResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedResult = sessionStorage.getItem('compressionResult');
            if (storedResult) {
                const parsedResult = JSON.parse(storedResult);
                // The PDF data URL needs to be handled carefully as it's a blob URL
                // We assume it's still valid from the previous page.
                setResult(parsedResult);
            }
        } catch (error) {
            console.error("Failed to parse compression result from sessionStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDownload = (format: 'jpeg' | 'pdf') => {
        if (!result) return;
        const formatResult = result[format];
        const link = document.createElement('a');
        link.href = formatResult.dataUrl;
        link.download = `imgresizer-compressed-${result.quality}.${format === 'jpeg' ? 'jpg' : 'pdf'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // We don't revoke object URLs for PDFs as they might be used for preview
    };

    const qualityTextMap = {
        less: 'Less Compression',
        medium: 'Medium Compression',
        extreme: 'Extreme Compression',
    };

    const jpegReductionPercentage = result ? Math.round(((result.originalSize - result.jpeg.size) / result.originalSize) * 100) : 0;
    const pdfReductionPercentage = result ? Math.round(((result.originalSize - result.pdf.size) / result.originalSize) * 100) : 0;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <SiteHeader />
            <main className="flex-1 container mx-auto py-12 px-6">
                <Card className="max-w-5xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-3xl font-bold font-headline">
                            <Zap className="text-primary" />
                            Compression Result
                        </CardTitle>
                        <CardDescription>
                            Your image has been compressed into JPEG and PDF formats. Review the results and download your preferred file.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                                <p>Loading result...</p>
                            </div>
                        ) : result ? (
                            <div className="grid md:grid-cols-2 gap-8 items-start">
                                {/* JPEG Result */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="text-primary" />
                                            JPEG Result
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="relative rounded-lg shadow-lg overflow-hidden bg-muted flex justify-center items-center aspect-[4/3]">
                                            <img src={result.jpeg.dataUrl} alt="Compressed JPEG image" className="w-full h-full object-contain" />
                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                                                {qualityTextMap[result.quality]}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-green-500/10 text-green-700 rounded-lg text-center">
                                            <p className="text-4xl font-bold">{jpegReductionPercentage}%</p>
                                            <p className="font-semibold">Size Reduction</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Original Size</p>
                                                <p className="text-xl font-bold">{formatBytes(result.originalSize)}</p>
                                            </div>
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Compressed Size</p>
                                                <p className="text-xl font-bold text-primary">{formatBytes(result.jpeg.size)}</p>
                                            </div>
                                        </div>
                                        <Button onClick={() => handleDownload('jpeg')} className="w-full">
                                            <Download className="mr-2" />
                                            Download JPEG
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* PDF Result */}
                                <Card>
                                     <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="text-primary" />
                                            PDF Result
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="relative rounded-lg shadow-lg overflow-hidden bg-muted flex justify-center items-center aspect-[4/3]">
                                            <iframe src={result.pdf.dataUrl} className="w-full h-full" title="PDF Preview"></iframe>
                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                                                {qualityTextMap[result.quality]}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-green-500/10 text-green-700 rounded-lg text-center">
                                            <p className="text-4xl font-bold">{pdfReductionPercentage}%</p>
                                            <p className="font-semibold">Size Reduction</p>
                                        </div>
                                         <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Original Size</p>
                                                <p className="text-xl font-bold">{formatBytes(result.originalSize)}</p>
                                            </div>
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Compressed Size</p>
                                                <p className="text-xl font-bold text-primary">{formatBytes(result.pdf.size)}</p>
                                            </div>
                                        </div>
                                        <Button onClick={() => handleDownload('pdf')} className="w-full">
                                            <Download className="mr-2" />
                                            Download PDF
                                        </Button>
                                    </CardContent>
                                </Card>
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
