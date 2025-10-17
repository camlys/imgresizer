
"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { apps as hubApps } from "./app-hub-card";

const featuredAppIds = ['bgbye', 'calput', 'qrick', 'pdfpro', 'favic'];
const featuredApps = hubApps.filter(app => featuredAppIds.includes(app.id));

export function AppGrid() {
    return (
        <section className="container mx-auto py-12 px-4">
            <h2 className="text-2xl font-bold font-headline mb-8 text-center">Explore Our Other Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {featuredApps.map((app) => {
                    const isBgBye = app.id === 'bgbye';
                    return (
                        <Link href={`/hub?app=${app.id}`} key={app.name} className="group">
                            <Card className={cn(
                                "h-full p-6 text-center border-primary/10 transition-all flex flex-col items-center justify-center relative overflow-hidden",
                                isBgBye && "border-purple-700/50"
                            )}>
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 transition-opacity duration-300",
                                    isBgBye && "from-purple-600/40 to-pink-600/40"
                                )}></div>
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                     isBgBye && "from-purple-700/50 to-pink-700/50"
                                )}></div>
                                <div className={cn(
                                    "p-4 bg-primary/10 rounded-full mb-4 group-hover:scale-110 transition-transform relative",
                                    isBgBye && "bg-purple-700/40 text-purple-900"
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
