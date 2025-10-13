
"use client";

import { Card } from "@/components/ui/card";
import { Calculator, Sparkles, QrCode, FileEdit } from "lucide-react";
import Link from "next/link";

const featuredApps = [
    { name: 'Calput', url: 'https://calput.vercel.app/', icon: <Calculator size={28} className="text-primary" />, description: 'Calculator with history' },
    { name: 'Favic', url: 'https://favic.vercel.app/', icon: <Sparkles size={28} className="text-primary" />, description: 'Generate favicons' },
    { name: 'Qrick', url: 'https://qrick.vercel.app/', icon: <QrCode size={28} className="text-primary" />, description: 'QR & Barcode generator' },
    { name: 'PDFpro', url: 'https://pdfpro-app.vercel.app/', icon: <FileEdit size={28} className="text-primary" />, description: 'PDF Editor' },
];

export function AppGrid() {
    return (
        <section className="container mx-auto py-12 px-4">
            <h2 className="text-2xl font-bold font-headline mb-8 text-center">Explore Our Other Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredApps.map((app) => (
                    <Link href={app.url} key={app.name} target="_blank" rel="noopener noreferrer" className="group">
                        <Card className="h-full p-6 text-center hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                {app.icon}
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{app.name}</h3>
                            <p className="text-sm text-muted-foreground">{app.description}</p>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
}
