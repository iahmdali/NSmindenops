
"use client";

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { getRecentSails, searchSails } from '@/lib/sail-progress-logic';
import type { SailProgress } from '@/lib/sail-progress-types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PackageSearch, ChevronsRight, CheckCircle, AlertTriangle } from 'lucide-react';

function SailCard({ sail }: { sail: SailProgress }) {
    const statusConfig = {
        Completed: { color: 'bg-green-500', icon: CheckCircle },
        'In Progress': { color: 'bg-blue-500', icon: ChevronsRight },
        'Issues Logged': { color: 'bg-red-500', icon: AlertTriangle },
        Pending: { color: 'bg-gray-500', icon: PackageSearch },
    };
    const { color, icon: Icon } = statusConfig[sail.overallStatus] || statusConfig.Pending;

    return (
        <Card className="hover:shadow-lg transition-shadow">
             <CardHeader>
                <div className="flex justify-between items-start">
                     <div>
                        <CardTitle className="text-lg font-bold">
                            <Link href={`/progress/${sail.id}`} className="hover:underline">{sail.sailNumber}</Link>
                        </CardTitle>
                        <CardDescription>Last updated: {format(sail.lastUpdated, 'PPP')}</CardDescription>
                     </div>
                     <Badge className={cn("text-white", color)}>
                        <Icon className="mr-1 h-3 w-3"/>
                        {sail.overallStatus}
                     </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm font-medium text-muted-foreground">Contains {sail.sections.length} OE Sections:</p>
                <ul className="text-xs list-disc pl-5 mt-1 text-muted-foreground">
                    {sail.sections.map(s => <li key={s.oe_number}>{s.oe_number}</li>)}
                </ul>
            </CardContent>
        </Card>
    );
}


export default function SailSearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const [searchQuery, setSearchQuery] = React.useState(query);
    const [sails, setSails] = React.useState<SailProgress[]>([]);

    React.useEffect(() => {
        const results = query ? searchSails(query) : getRecentSails(10);
        setSails(results);
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/progress?q=${searchQuery}`);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Sail Status Viewer"
                description="Search for an OE# to see its progress across all departments."
            />
            <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                    type="search"
                    placeholder="Enter OE Number (e.g., OAUS32162)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-lg"
                />
                <Button type="submit">Search</Button>
            </form>

            <div>
                <h2 className="text-xl font-semibold mb-4">
                    {query ? `Search Results for "${query}"` : 'Recently Updated Sails'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sails.length > 0 ? (
                        sails.map(sail => <SailCard key={sail.id} sail={sail} />)
                    ) : (
                         <Card className="col-span-full">
                            <CardContent className="p-6 text-center text-muted-foreground">
                                No sails found for your query.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
