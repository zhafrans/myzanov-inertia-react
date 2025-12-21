import AppLayout from "@/Layouts/AppLayout";
import { useForm, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Eye } from "lucide-react";

export default function LandingPageAdmin({ contents }) {
    const sections = {
        home_hero: {
            title: "Home Hero Section",
            fields: [
                { key: "title", label: "Title", defaultValue: "ZANOV SHOES" },
                {
                    key: "subtitle",
                    label: "Subtitle",
                    defaultValue: "Premium Quality Footwear",
                },
                {
                    key: "background_image",
                    label: "Background Image",
                    defaultValue: "",
                    isImage: true,
                },
            ],
        },
        home_about: {
            title: "Home About Section",
            fields: [
                { key: "title", label: "Title", defaultValue: "About ZANOV" },
                {
                    key: "description",
                    label: "Description",
                    defaultValue: "ZANOV Shoes adalah brand sepatu premium...",
                },
            ],
        },
        about_content: {
            title: "About Page Content",
            fields: [
                { key: "title", label: "Title", defaultValue: "About ZANOV" },
                {
                    key: "description",
                    label: "Description",
                    defaultValue: "ZANOV Shoes adalah brand...",
                },
                {
                    key: "mission",
                    label: "Mission",
                    defaultValue: "Misi kami adalah...",
                },
                {
                    key: "vision",
                    label: "Vision",
                    defaultValue: "Menjadi brand sepatu terdepan...",
                },
            ],
        },
        contact_info: {
            title: "Contact Page",
            fields: [
                {
                    key: "address",
                    label: "Address",
                    defaultValue: "Jl. Contoh No. 123, Jakarta",
                },
                {
                    key: "phone",
                    label: "Phone",
                    defaultValue: "+62 123 456 7890",
                },
                {
                    key: "email",
                    label: "Email",
                    defaultValue: "info@zanovshoes.com",
                },
                {
                    key: "map_url",
                    label: "Google Maps Embed URL",
                    defaultValue: "https://www.google.com/maps/embed?pb=...",
                },
            ],
        },
        footer: {
            title: "Footer",
            fields: [
                {
                    key: "address",
                    label: "Address",
                    defaultValue: "Jl. Contoh No. 123, Jakarta",
                },
                {
                    key: "phone",
                    label: "Phone",
                    defaultValue: "+62 123 456 7890",
                },
                {
                    key: "email",
                    label: "Email",
                    defaultValue: "info@zanovshoes.com",
                },
                { key: "facebook", label: "Facebook URL", defaultValue: "" },
                { key: "instagram", label: "Instagram URL", defaultValue: "" },
                { key: "twitter", label: "Twitter URL", defaultValue: "" },
            ],
        },
    };

    return (
        <AppLayout title="Landing Page CMS">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Landing Page Content Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage content for your landing page
                        </p>
                    </div>
                    <Link href={route("landing.home")} target="_blank">
                        <Button className="gap-2">
                            <Eye className="w-4 h-4" />
                            Preview Page
                        </Button>
                    </Link>
                </div>

                <Tabs defaultValue="home_hero" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="home_hero">Home Hero</TabsTrigger>
                        <TabsTrigger value="home_about">Home About</TabsTrigger>
                        <TabsTrigger value="about_content">
                            About Page
                        </TabsTrigger>
                        <TabsTrigger value="contact_info">Contact</TabsTrigger>
                        <TabsTrigger value="footer">Footer</TabsTrigger>
                    </TabsList>

                    {Object.entries(sections).map(([sectionKey, section]) => (
                        <TabsContent key={sectionKey} value={sectionKey}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{section.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {section.fields.map((field) => {
                                            const existingContent = contents?.[
                                                sectionKey
                                            ]?.find((c) => c.key === field.key);
                                            const currentValue =
                                                existingContent?.value ||
                                                field.defaultValue ||
                                                "";

                                            return (
                                                <ContentField
                                                    key={field.key}
                                                    section={sectionKey}
                                                    fieldKey={field.key}
                                                    label={field.label}
                                                    defaultValue={
                                                        field.defaultValue
                                                    }
                                                    currentValue={currentValue}
                                                    isImage={field.isImage}
                                                />
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </AppLayout>
    );
}

function ContentField({
    section,
    fieldKey,
    label,
    defaultValue,
    currentValue,
    isImage = false,
}) {
    const [isEditing, setIsEditing] = useState(
        !currentValue || currentValue === defaultValue
    );
    const [previewImage, setPreviewImage] = useState(null);
    const { data, setData, post, processing } = useForm({
        section,
        key: fieldKey,
        value: isImage ? "" : currentValue || defaultValue || "",
        image: null,
        type: isImage ? "image" : "text",
        order: 0,
    });

    // Get image URL for preview
    const getImageUrl = (value) => {
        if (!value) return null;
        if (value.startsWith("landing/")) {
            return `/storage/${value}`;
        }
        if (value.startsWith("http")) {
            return value;
        }
        return `/storage/${value}`;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        post(route("landing-page.store"), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setIsEditing(false);
                setPreviewImage(null);
            },
        });
    };

    const imageUrl = isImage ? getImageUrl(currentValue) : null;

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                    {isImage ? (
                        <>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: JPG, PNG, GIF, WEBP (Max: 5MB)
                            </p>
                            {(previewImage || imageUrl) && (
                                <div className="mt-2">
                                    <Label>Preview</Label>
                                    <img
                                        src={previewImage || imageUrl}
                                        alt="Preview"
                                        className="w-full max-w-md h-48 object-cover rounded border mt-2"
                                    />
                                </div>
                            )}
                        </>
                    ) : label.toLowerCase().includes("description") ||
                      label.toLowerCase().includes("mission") ||
                      label.toLowerCase().includes("vision") ? (
                        <Textarea
                            value={data.value}
                            onChange={(e) => setData("value", e.target.value)}
                            className="flex-1"
                            rows={4}
                        />
                    ) : (
                        <Input
                            value={data.value}
                            onChange={(e) => setData("value", e.target.value)}
                            className="flex-1"
                        />
                    )}
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={processing}>
                            {processing ? "Saving..." : "Save"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setData(
                                    "value",
                                    currentValue || defaultValue || ""
                                );
                                setData("image", null);
                                setPreviewImage(null);
                                setIsEditing(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="space-y-2">
                    {isImage && imageUrl ? (
                        <div className="space-y-2">
                            <img
                                src={imageUrl}
                                alt={label}
                                className="w-full max-w-md h-48 object-cover rounded border"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setData(
                                        "value",
                                        currentValue || defaultValue || ""
                                    );
                                    setIsEditing(true);
                                }}
                            >
                                Change Image
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="flex-1 p-3 bg-muted rounded-md">
                                <p className="text-sm">
                                    {currentValue || defaultValue || (
                                        <span className="text-muted-foreground">
                                            Not set
                                        </span>
                                    )}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setData(
                                        "value",
                                        currentValue || defaultValue || ""
                                    );
                                    setIsEditing(true);
                                }}
                            >
                                Edit
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
