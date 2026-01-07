import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { router } from "@inertiajs/react";

export default function CollectorDataPagination({ links }) {
    if (!links || links.length <= 3) return null;

    const handlePageClick = (url) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    // Extract previous and next URLs
    const prevLink = links.find(link => link.label.includes('Previous'));
    const nextLink = links.find(link => link.label.includes('Next'));
    const pageLinks = links.filter(link => !link.label.includes('Previous') && !link.label.includes('Next'));

    return (
        <>
            {/* Desktop Pagination */}
            <div className="hidden md:flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    Menampilkan {pageLinks[0]?.label || '-'} dari {pageLinks[pageLinks.length - 1]?.label || '-'} data
                </div>
                <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageClick(prevLink?.url)}
                        disabled={!prevLink?.url}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                        {pageLinks.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageClick(link.url)}
                                disabled={!link.url}
                                className="h-8 w-8 p-0"
                            >
                                {link.label}
                            </Button>
                        ))}
                    </div>

                    {/* Next Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageClick(nextLink?.url)}
                        disabled={!nextLink?.url}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Mobile Pagination */}
            <div className="md:hidden flex items-center justify-between px-4 py-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageClick(prevLink?.url)}
                    disabled={!prevLink?.url}
                    className="h-9 px-4"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                </Button>
                
                <span className="text-sm text-gray-600">
                    {pageLinks.find(link => link.active)?.label || '-'}
                </span>
                
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageClick(nextLink?.url)}
                    disabled={!nextLink?.url}
                    className="h-9 px-4"
                >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </>
    );
}
