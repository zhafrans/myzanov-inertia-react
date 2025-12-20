import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function TopColor({ data, loading = false, onLoadMore, currentLimit }) {
    const showLoadMore = onLoadMore && data?.length > 0 && data.length >= currentLimit;
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Color</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8" />
                        <Skeleton className="h-8" />
                        <Skeleton className="h-8" />
                    </div>
                ) : data?.length > 0 ? (
                    <>
                        <Table>
                            <TableBody>
                                {data.map((item, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">
                                            {item.name}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.total}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {showLoadMore && (
                            <div className="mt-4 flex justify-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onLoadMore}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                    Tampilkan lebih banyak
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        Tidak ada data color
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
