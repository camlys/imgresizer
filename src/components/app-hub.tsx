
"use client"

import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apps } from "./app-hub-card";
import Link from "next/link";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Suspense } from "react";

function AppHubContent() {
    const searchParams = useSearchParams();
    const appParam = searchParams.get('app');
    const defaultTab = appParam && apps.some(app => app.id === appParam) ? appParam : apps[0].id;
    
    return (
        <Tabs defaultValue={defaultTab} className="w-full h-full flex flex-col">
            <div className="flex-shrink-0 border-b flex items-center justify-between pr-2">
                <TabsList className="bg-transparent p-0 m-2 rounded-md">
                    {apps.map((app) => (
                        <TabsTrigger key={app.id} value={app.id} className="data-[state=active]:bg-muted data-[state=inactive]:hover:bg-muted/50 rounded-sm">
                            {app.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <Link href="/" passHref>
                    <Button variant="ghost" size="icon">
                        <X />
                    </Button>
                </Link>
            </div>
            {apps.map((app) => (
                <TabsContent key={app.id} value={app.id} className="flex-grow m-0 ring-offset-0">
                    <iframe src={app.url} className="w-full h-full border-0" title={app.name}></iframe>
                </TabsContent>
            ))}
        </Tabs>
    )
}


export function AppHub() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AppHubContent />
      </Suspense>
    )
}
