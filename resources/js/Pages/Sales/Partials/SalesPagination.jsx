import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { router } from "@inertiajs/react"

export default function SalesPagination({ links }) {
    const getButtonVariant = (url, label) => {
        if (!url) return "outline"
        if (label === "&laquo; Previous" || label === "Next &raquo;") return "outline"
        if (url.includes('page=')) return "outline"
        return "secondary"
    }

    // Find previous and next links
    const previousLink = links.find(link => 
        link.label.includes('Previous') || 
        link.label.includes('pagination.previous') ||
        link.label.includes('&laquo;')
    )
    const nextLink = links.find(link => 
        link.label.includes('Next') || 
        link.label.includes('pagination.next') ||
        link.label.includes('&raquo;')
    )

    return (
        <>
            {/* Mobile: Only show arrow buttons */}
            <div className="md:hidden w-full -mx-6 px-6 flex items-center justify-between gap-4 py-3 overflow-hidden">
                <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={() => previousLink?.url && router.get(previousLink.url)}
                    disabled={!previousLink?.url}
                    className="flex-1"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={() => nextLink?.url && router.get(nextLink.url)}
                    disabled={!nextLink?.url}
                    className="flex-1"
                >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            {/* Desktop: Show full pagination */}
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