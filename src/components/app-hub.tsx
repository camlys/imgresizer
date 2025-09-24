
"use client"

import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { apps } from "./app-hub-card";
import Link from "next/link";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { AppHubCard } from "./app-hub-card";
import { useRouter } from "next/navigation";

function AppHubContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const appParam = searchParams.get('app');
    const initialTab = appParam && apps.some(app => app.id === appParam) ? appParam : apps[0].id;
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    
    useEffect(() => {
        const newTab = appParam && apps.some(app => app.id === appParam) ? appParam : apps[0].id;
        if (newTab !== activeTab) {
            setActiveTab(newTab);
        }
    }, [appParam, activeTab]);
    
    const handleValueChange = (value: string) => {
        setActiveTab(value);
        router.push(`/hub?app=${value}`);
    };

    const handleAppSelect = (appId: string) => {
        handleValueChange(appId);
        setIsPopoverOpen(false);
    };
    
    return (
        <Tabs value={activeTab} onValueChange={handleValueChange} className="w-full h-full flex flex-col relative">
            <motion.div 
                className="absolute top-4 right-4 z-20"
                drag
                dragMomentum={false}
            >
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                         <Button variant="outline" size="icon" className="cursor-grab active:cursor-grabbing shadow-lg">
                            <Menu />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-background/80 backdrop-blur-md border-primary/20">
                        <AppHubCard onAppSelect={handleAppSelect} />
                        <div className="mt-4">
                             <Link href="/" passHref>
                                <Button variant="ghost" className="w-full">
                                    Close Hub
                                </Button>
                            </Link>
                        </div>
                    </PopoverContent>
                </Popover>
            </motion.div>
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
