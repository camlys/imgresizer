
"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { apps as hubApps } from "./app-hub-card";

const featuredAppIds = ['bgbye', 'calput', 'qrick', 'pdfpro', 'favic'];
const featuredAppsData = hubApps.filter(app => featuredAppIds.includes(app.id));

const appNameOverrides: { [key: string]: { name: string, description: string } } = {
    'calput': { name: 'Calculator', description: 'with history' },
    'favic': { name: 'Favicon Generator', description: 'Generate favicons' },
    'qrick': { name: 'QR & Barcode Generator', description: 'Create QR/Barcodes' },
    'pdfpro': { name: 'PDF Editor', description: 'Edit PDF files' },
};


export function AppGrid() {
    const featuredApps = featuredAppsData.map(app => {
        if (appNameOverrides[app.id]) {
            return { ...app, ...appNameOverrides[app.id] };
        }
        return app;
    });

    return (
        <section className="container mx-auto py-12 px-4">
            <h2 className="text-2xl font-bold font-headline mb-8 text-center">Explore Our Other Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {featuredApps.map((app) => {
                    return (
                        <Link href={`/hub?app=${app.id}`} key={app.id} className="group">
                            <Card className={cn(
                                "h-full p-6 text-center border-purple-700/50 transition-all flex flex-col items-center justify-center relative overflow-hidden"
                            )}>
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br from-purple-700/40 to-pink-700/40 transition-opacity duration-300"
                                )}></div>
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br from-purple-700/50 to-pink-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                )}></div>
                                <div className={cn(
                                    "p-4 bg-purple-700/50 text-purple-900 rounded-full mb-4 group-hover:scale-110 transition-transform relative"
                                )}>
                                    {app.icon}
                                </div>
                                <h3 className="font-semibold text-lg mb-1 relative">{app.name}</h3>
                                <p className="text-sm text-muted-foreground relative">{app.description}</p>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
