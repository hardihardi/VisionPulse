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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Car,
  MapPin,
  Clock,
  Filter,
  MoreHorizontal,
  Database,
  History
} from "lucide-react"

const mockResults = [
  { id: 1, plate: "B 1234 KKI", type: "Motorcycle", location: "CCTV - Simpang Bekasi", time: "2024-05-20 10:45:22", confidence: "98.5%", image: "/mock-plate.jpg" },
  { id: 2, plate: "B 8888 ABC", type: "Car", location: "CCTV - Ahmad Yani", time: "2024-05-20 10:44:15", confidence: "96.2%", image: "/mock-plate.jpg" },
  { id: 3, plate: "D 4321 XYZ", type: "Car", location: "CCTV - Kalimalang", time: "2024-05-20 10:43:58", confidence: "94.8%", image: "/mock-plate.jpg" },
]

export default function PlateSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setHasSearched(true)
  }

  return (
    <div className="p-4 sm:p-8 max-w-[1200px] mx-auto space-y-8">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
          <Database className="h-6 w-6" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Plate Search Central</h1>
        <p className="text-lg text-muted-foreground">Search our real-time database for any detected vehicle across the city network.</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Plate Number (e.g. B 1234...)"
              className="pl-12 h-14 text-lg bg-background border-border/50 shadow-lg rounded-xl focus-visible:ring-primary/20"
            />
          </div>
          <Button type="submit" size="lg" className="h-14 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            Search
          </Button>
        </form>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <p className="text-sm text-muted-foreground w-full text-center mb-1">Frequent Searches:</p>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery("B 1234")} className="rounded-full h-8 px-4 bg-background border-border/50">B 1234</Button>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery("D 4321")} className="rounded-full h-8 px-4 bg-background border-border/50">D 4321</Button>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery("Car")} className="rounded-full h-8 px-4 bg-background border-border/50">Car</Button>
        </div>
      </div>

      {hasSearched && (
        <Card className="border-border/50 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="bg-accent/30 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Search Results
                </CardTitle>
                <CardDescription>Found {mockResults.length} matches in the last 24 hours.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-9 border-border/50">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop View */}
            <div className="hidden md:block">
              <Table aria-label="Vehicle search results table">
                <TableHeader>
                  <TableRow className="border-border/50 bg-muted/30">
                    <TableHead scope="col" className="font-bold">License Plate</TableHead>
                    <TableHead scope="col" className="font-bold">Type</TableHead>
                    <TableHead scope="col" className="font-bold">Location</TableHead>
                    <TableHead scope="col" className="font-bold">Time Detected</TableHead>
                    <TableHead scope="col" className="font-bold">AI Confidence</TableHead>
                    <TableHead scope="col" className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockResults.map((item) => (
                    <TableRow key={item.id} className="border-border/50 hover:bg-accent/10 transition-colors">
                      <TableCell className="font-mono font-bold text-lg text-primary">{item.plate}</TableCell>
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
                      <TableCell>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 font-medium">
                          {item.confidence}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden p-4 space-y-4">
              {mockResults.map((item) => (
                <Card key={item.id} className="border-border/50 overflow-hidden shadow-sm">
                  <div className="h-1 bg-primary/20 w-full" />
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="font-mono font-extrabold text-xl text-primary">{item.plate}</div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">{item.confidence}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Type</p>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Car className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.type}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Detected</p>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.time.split(' ')[1]}
                        </div>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Location</p>
                        <div className="flex items-center gap-1.5 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.location}
                        </div>
                      </div>
                    </div>
                    <Button variant="secondary" className="w-full h-10 mt-2 text-xs font-bold uppercase tracking-widest">
                      View full report
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
