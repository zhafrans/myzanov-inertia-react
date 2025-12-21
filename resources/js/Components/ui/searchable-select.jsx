import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function SearchableSelect({
    value,
    onValueChange,
    options = [],
    placeholder = "Pilih...",
    searchPlaceholder = "Cari...",
    emptyText = "Tidak ada data.",
    disabled = false,
    className,
}) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const scrollContainerRef = React.useRef(null);

    const selectedOption = options.find(
        (opt) => String(opt.id) === String(value)
    );

    const filteredOptions = React.useMemo(() => {
        if (!searchQuery) return options;
        return options.filter((option) =>
            option.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [options, searchQuery]);

    const handleSelect = (optionId) => {
        onValueChange(String(optionId));
        setOpen(false);
        setSearchQuery("");
    };

    // Handle wheel event to ensure scrolling works
    const handleWheel = React.useCallback((e) => {
        if (scrollContainerRef.current) {
            e.stopPropagation();
        }
    }, []);

    // Ensure scroll wheel works by adding capture phase listener
    React.useEffect(() => {
        if (open && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const popoverContent =
                container.closest('[role="dialog"]') ||
                container.closest("[data-radix-popper-content-wrapper]");

            // Add listener in capture phase to intercept before Radix handlers
            const handleWheelCapture = (e) => {
                // Check if event target is within our scroll container
                if (container.contains(e.target) || container === e.target) {
                    const { scrollTop, scrollHeight, clientHeight } = container;
                    const canScrollUp = scrollTop > 0;
                    const canScrollDown =
                        scrollTop + clientHeight < scrollHeight;

                    // If we can scroll in the direction of the wheel, stop propagation
                    if (
                        (e.deltaY < 0 && canScrollUp) ||
                        (e.deltaY > 0 && canScrollDown)
                    ) {
                        e.stopPropagation();
                    }
                }
            };

            // Use capture phase to intercept before other handlers
            // Add to both container and popover content
            container.addEventListener("wheel", handleWheelCapture, {
                passive: false,
                capture: true,
            });

            if (popoverContent) {
                popoverContent.addEventListener("wheel", handleWheelCapture, {
                    passive: false,
                    capture: true,
                });
            }

            return () => {
                container.removeEventListener("wheel", handleWheelCapture, {
                    capture: true,
                });
                if (popoverContent) {
                    popoverContent.removeEventListener(
                        "wheel",
                        handleWheelCapture,
                        { capture: true }
                    );
                }
            };
        }
    }, [open]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    {selectedOption ? selectedOption.name : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
            >
                <div className="flex flex-col">
                    <div className="border-b p-2">
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9"
                        />
                    </div>
                    <div
                        ref={scrollContainerRef}
                        className="max-h-[300px] overflow-y-auto overscroll-contain"
                        tabIndex={0}
                        onWheel={handleWheel}
                        onMouseEnter={() => {
                            // Ensure container can receive focus for scroll events
                            if (scrollContainerRef.current) {
                                scrollContainerRef.current.focus();
                            }
                        }}
                        style={{
                            WebkitOverflowScrolling: "touch",
                            pointerEvents: "auto",
                        }}
                    >
                        <div className="p-1">
                            {filteredOptions.length === 0 ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    {emptyText}
                                </div>
                            ) : (
                                filteredOptions.map((option) => {
                                    const isSelected =
                                        String(value) === String(option.id);
                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() =>
                                                handleSelect(option.id)
                                            }
                                            className={cn(
                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                                                isSelected && "bg-accent"
                                            )}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {option.name}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
