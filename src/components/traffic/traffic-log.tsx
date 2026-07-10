'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListTodo, Clock, Car } from "lucide-react";

interface TrafficLogProps {
  logs: any[];
  isAnalyzing: boolean;
}

export function TrafficLog({ logs, isAnalyzing }: TrafficLogProps) {
  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-primary" />
            Log Deteksi
        </CardTitle>
        <CardDescription className="text-[10px] sm:text-xs">Aktivitas kendaraan terbaru.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[250px] lg:h-[320px] px-4">
          <div className="space-y-3 py-4">
            {isAnalyzing && logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-3 text-xs border-b border-muted pb-2 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 bg-primary/10 rounded shrink-0">
                        <Car className="w-3 h-3 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold capitalize truncate">{log.type}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{log.direction}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <Badge variant="outline" className="text-[9px] px-1.5 h-4 font-normal">
                      <Clock className="w-2 h-2 mr-1" />
                      {log.time}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground italic text-xs gap-2">
                 <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <ListTodo className="w-4 h-4 opacity-30" />
                 </div>
                 {isAnalyzing ? "Menunggu deteksi..." : "Mulai analisis untuk melihat log."}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
