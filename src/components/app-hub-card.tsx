
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Sparkles, QrCode } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export const apps = [
    { name: 'Camly', id: 'camly', url: 'https://camly.site', icon: <img src="/camly.png" alt="Camly" className="w-6 h-6" />, description: 'The current app' },
    { name: 'Calput', id: 'calput', url: 'https://calput.vercel.app/', icon: <Calculator size={24} />, description: 'Calculator with history' },
    { name: 'Favic', id: 'favic', url: 'https://favic.vercel.app/', icon: <Sparkles size={24} />, description: 'Generate favicons' },
    { name: 'Qrick', id: 'qrick', url: 'https://qrick.vercel.app/', icon: <QrCode size={24} />, description: 'QR & Barcode generator' },
];

export function AppHubCard() {
    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-lg">App Hub</h4>
                  <p className="text-sm text-muted-foreground">Explore other useful tools.</p>
                </div>
                <ThemeToggle />
            </div>
            <div className="grid grid-cols-2 gap-2">
                {apps.map((app) => (
                     <Link href={`/hub?app=${app.id}`} key={app.name}>
                        <div className="group rounded-lg p-3 hover:bg-accent transition-colors border">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-primary/10 text-primary rounded-full flex items-center justify-center">
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
