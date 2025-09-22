
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const apps = [
    { name: 'Camly', url: 'https://camly.site' },
    { name: 'Calput', url: 'https://calput.vercel.app/' },
    { name: 'Favic', url: 'https://favic.vercel.app/' },
    { name: 'Qrick', url: 'https://qrick.vercel.app/' },
]

export function AppHub() {
    return (
        <Tabs defaultValue={apps[0].name} className="w-full h-full flex flex-col">
            <div className="flex-shrink-0 border-b">
                <TabsList className="bg-transparent p-0 m-2 rounded-md">
                    {apps.map((app) => (
                        <TabsTrigger key={app.name} value={app.name} className="data-[state=active]:bg-muted data-[state=inactive]:hover:bg-muted/50 rounded-sm">
                            {app.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>
            {apps.map((app) => (
                <TabsContent key={app.name} value={app.name} className="flex-grow m-0 ring-offset-0">
                    <iframe src={app.url} className="w-full h-full border-0" title={app.name}></iframe>
                </TabsContent>
            ))}
        </Tabs>
    )
}
