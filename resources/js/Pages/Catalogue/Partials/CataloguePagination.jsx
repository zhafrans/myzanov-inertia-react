import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { router } from "@inertiajs/react"

export default function CataloguePagination({ links }) {
    if (!links || links.length <= 1) return null

    const getButtonVariant = (url, label) => {
        if (!url) return "outline"
        if (label === "&laquo; Previous" || label === "Next &raquo;") return "outline"
        if (url.includes('page=')) return "outline"
        return "secondary"
    }

    const prevLink = links.find(link => 
        link.label.includes('Previous') || 
        link.label.includes('pagination.previous') ||
        link.label.includes('&laquo;')
    );
    const nextLink = links.find(link => 
        link.label.includes('Next') || 
        link.label.includes('pagination.next') ||
        link.label.includes('&raquo;')
    );

    return (
        <>
            {/* Mobile Pagination */}
            <div className="md:hidden flex items-center justify-between gap-4 px-4 py-3 -mx-6 md:mx-0">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => prevLink?.url && router.get(prevLink.url)}
                    disabled={!prevLink?.url}
                    className="flex-1 text-xs"
                >
                    <ChevronLeft className="w-3 h-3 mr-1" />
                    Previous
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => nextLink?.url && router.get(nextLink.url)}
                    disabled={!nextLink?.url}
                    className="flex-1 text-xs"
                >
                    Next
                    <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden md:flex items-center justify-center gap-2">
                {links.map((link, index) => (
                    <Button
                        type="button"
                        key={index}
                        variant={getButtonVariant(link.url, link.label)}
                        size="icon"
                        onClick={() => link.url && router.get(link.url)}
                        disabled={!link.url || link.active}
                        className={link.active ? "bg-primary text-primary-foreground" : ""}
                    >
                        {link.label.includes('Previous') || link.label.includes('pagination.previous') ? (
                            <ChevronLeft className="w-4 h-4" />
                        ) : link.label.includes('Next') || link.label.includes('pagination.next') ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        )}
                    </Button>
                ))}
            </div>
        </>
    )
}
