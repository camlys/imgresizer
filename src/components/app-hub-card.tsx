

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Sparkles, QrCode, Wand2 } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { InstallPwaButton } from "./install-pwa-button";

export const apps = [
    { name: 'Camly', id: 'camly', url: '/', icon: <img src="/camly.png" alt="Camly" className="w-8 h-8 rounded-sm" />, description: 'Image Editor & Resizer' },
    { name: 'Background Remover', id: 'bgbye', url: 'https://bgbye.fyrean.com/', icon: <Wand2 size={24} />, description: 'AI Background Remover' },
    { name: 'Calculator', id: 'calput', url: 'https://calput.vercel.app/', icon: <Calculator size={24} />, description: 'with history' },
    { name: 'Favicon Generator', id: 'favic', url: 'https://favic.vercel.app/', icon: <Sparkles size={24} />, description: 'Generate favicons' },
    { name: 'QR & Barcode Generator', id: 'qrick', url: 'https://qrick.vercel.app/', icon: <QrCode size={24} />, description: 'Create QR/Barcodes' },
];

interface AppHubCardProps {
    onAppSelect?: (appId: string) => void;
}

export function AppHubCard({ onAppSelect }: AppHubCardProps) {
    const handleAppClick = (e: React.MouseEvent, appId: string) => {
        if (onAppSelect) {
            e.preventDefault();
            onAppSelect(appId);
        }
    };
    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-lg">App Hub</h4>
                  <p className="text-sm text-muted-foreground">Explore other useful tools.</p>
                </div>
                <div className="flex items-center gap-2">
                    <InstallPwaButton />
                    <ThemeToggle />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {apps.map((app) => (
                     <Link href={`/hub?app=${app.id}`} key={app.name} className="flex" onClick={(e) => handleAppClick(e, app.id)}>
                        <div className="group rounded-lg p-3 hover:bg-accent transition-colors border w-full flex flex-col">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                    {app.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-sm truncate" title={app.name}>{app.name}</h5>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground pl-1">{app.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
