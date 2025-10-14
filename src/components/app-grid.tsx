
"use client";

import { Card } from "@/components/ui/card";
import { Calculator, Sparkles, QrCode, FileEdit } from "lucide-react";
import Link from "next/link";
import { apps as hubApps } from "./app-hub-card";

const featuredAppIds = ['calput', 'favic', 'qrick', 'pdfpro'];
const featuredApps = hubApps.filter(app => featuredAppIds.includes(app.id));

export function AppGrid() {
    return (
        <section className="container mx-auto py-12 px-4">
            <h2 className="text-2xl font-bold font-headline mb-8 text-center">Explore Our Other Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredApps.map((app) => (
                    <Link href={`/hub?app=${app.id}`} key={app.name} className="group">
                        <Card className="h-full p-6 text-center border-primary/10 transition-all flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 transition-opacity duration-300"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:scale-110 transition-transform relative">
                                {app.icon}
                            </div>
                            <h3 className="font-semibold text-lg mb-1 relative">{app.name}</h3>
                            <p className="text-sm text-muted-foreground relative">{app.description}</p>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
}
