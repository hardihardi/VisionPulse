"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Calendar as CalendarIcon,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Clock,
  MapPin,
  Car,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List
} from "lucide-react"
import { format } from "date-fns"

const mockHistory = [
  { id: 1, plate: "B 1234 KKI", type: "Motorcycle", location: "CCTV - Simpang Bekasi", time: "2024-05-20 10:45:22", speed: "45 km/h", status: "Normal" },
  { id: 2, plate: "B 8888 ABC", type: "Car", location: "CCTV - Ahmad Yani", time: "2024-05-20 10:44:15", speed: "62 km/h", status: "Speeding" },
  { id: 3, plate: "D 4321 XYZ", type: "Car", location: "CCTV - Kalimalang", time: "2024-05-20 10:43:58", speed: "38 km/h", status: "Normal" },
  { id: 4, plate: "B 555 SOS", type: "Bus", location: "CCTV - Simpang Bekasi", time: "2024-05-20 10:42:30", speed: "25 km/h", status: "Normal" },
  { id: 5, plate: "B 9999 PRO", type: "Truck", location: "CCTV - Depan Pemkot", time: "2024-05-20 10:41:12", speed: "48 km/h", status: "Normal" },
  { id: 6, plate: "B 2468 TST", type: "Motorcycle", location: "CCTV - Ahmad Yani", time: "2024-05-20 10:40:05", speed: "55 km/h", status: "Normal" },
  { id: 7, plate: "F 7777 GAN", type: "Car", location: "CCTV - Kalimalang", time: "2024-05-20 10:38:44", speed: "75 km/h", status: "Speeding" },
]

export default function HistoryPage() {
  const [isListView, setIsListView] = useState(true)

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detection History</h1>
          <p className="text-muted-foreground mt-1">Review and filter all vehicle detection logs.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filter
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader className="p-4 sm:p-6 border-b border-border/50">
          <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search plate, location, or type..." className="pl-10 h-10 bg-accent/20 border-border/50" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-accent/30 p-1 rounded-lg border border-border/50">
                <Button
                  variant={isListView ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsListView(true)}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={!isListView ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsListView(false)}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" className="h-10 border-border/50">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Last 24 Hours
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop View: Table */}
          <div className="hidden md:block">
            <Table aria-label="Detection history table">
              <TableHeader className="bg-accent/30">
                <TableRow className="border-border/50">
                  <TableHead scope="col" className="w-[180px] font-bold">License Plate</TableHead>
                  <TableHead scope="col" className="font-bold">Type</TableHead>
                  <TableHead scope="col" className="font-bold">Location</TableHead>
                  <TableHead scope="col" className="font-bold">Timestamp</TableHead>
                  <TableHead scope="col" className="font-bold">Speed</TableHead>
                  <TableHead scope="col" className="font-bold text-center">Status</TableHead>
                  <TableHead scope="col" className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHistory.map((item) => (
                  <TableRow key={item.id} className="border-border/50 hover:bg-accent/20 transition-colors">
                    <TableCell className="font-mono font-bold text-primary">{item.plate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        {item.type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {item.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {item.time}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.speed}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={item.status === "Speeding" ? "destructive" : "secondary"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View: Cards */}
          <div className="md:hidden p-4 space-y-4">
            {mockHistory.map((item) => (
              <Card key={item.id} className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-mono font-bold text-lg text-primary">{item.plate}</div>
                    <Badge variant={item.status === "Speeding" ? "destructive" : "secondary"}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Car className="h-3.5 w-3.5" />
                      <span>{item.type}</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium justify-end">
                      {item.speed}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{item.time}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-4 sm:p-6 border-t border-border/50 bg-accent/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">Showing <span className="font-medium text-foreground">1-7</span> of <span className="font-medium text-foreground">156</span> results</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9 w-9 p-0" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  <Button size="sm" className="h-9 w-9 p-0">1</Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">2</Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">3</Button>
                </div>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
