
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Calculator, Sparkles, QrCode } from "lucide-react";
import Link from "next/link";

export const apps = [
    { name: 'Camly', url: 'https://camly.site', icon: <Camera size={24} />, description: 'AI-powered camera filters' },
    { name: 'Calput', url: 'https://calput.vercel.app/', icon: <Calculator size={24} />, description: 'Calculator with history' },
    { name: 'Favic', url: 'https://favic.vercel.app/', icon: <Sparkles size={24} />, description: 'Generate favicons' },
    { name: 'Qrick', url: 'https://qrick.vercel.app/', icon: <QrCode size={24} />, description: 'QR & Barcode generator' },
];

export function AppHubCard() {
    return (
        <div>
            <div className="mb-4">
                <h4 className="font-bold text-lg">App Hub</h4>
                <p className="text-sm text-muted-foreground">Explore other useful tools.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {apps.map((app) => (
                    <Link href={app.url} key={app.name} target="_blank" rel="noopener noreferrer">
                        <div className="group rounded-lg p-3 hover:bg-accent transition-colors">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-primary/10 text-primary rounded-full">
                                    {app.icon}
                                </div>
                                <h5 className="font-semibold text-sm">{app.name}</h5>
                            </div>
                            <p className="text-xs text-muted-foreground pl-1">{app.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
