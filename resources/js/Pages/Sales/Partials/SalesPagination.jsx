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

    return (
        <div className="flex items-center justify-center gap-2">
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
                    {link.label.includes('Previous') ? (
                        <ChevronLeft className="w-4 h-4" />
                    ) : link.label.includes('Next') ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        link.label
                    )}
                </Button>
            ))}
        </div>
    )
}