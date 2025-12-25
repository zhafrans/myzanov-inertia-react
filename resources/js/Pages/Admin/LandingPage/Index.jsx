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
                    defaultValue:
                        "Sepatu premium dengan kualitas terbaik, dirancang untuk kenyamanan dan ketahanan maksimal.",
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
                { key: "title", label: "Title", defaultValue: "Tentang ZANOV" },
                {
                    key: "description",
                    label: "Description",
                    defaultValue:
                        "ZANOV Shoes adalah brand sepatu yang mengutamakan kualitas material, kenyamanan pemakaian, dan desain stylish untuk menunjang penampilan sehari-hari Anda.",
                },
            ],
        },
    
        about_content: {
            title: "About Page Content",
            fields: [
                { key: "title", label: "Title", defaultValue: "Kenapa Memilih ZANOV?" },
                {
                    key: "description",
                    label: "Description",
                    defaultValue:
                        "Kami percaya bahwa sepatu bukan hanya pelengkap gaya, tetapi investasi kenyamanan jangka panjang. Setiap produk ZANOV dibuat dengan detail, presisi, dan standar kualitas tinggi.",
                },
                {
                    key: "mission",
                    label: "Mission",
                    defaultValue:
                        "Memberikan sepatu berkualitas premium dengan harga yang tetap terjangkau, serta menghadirkan pengalaman terbaik bagi setiap pelanggan.",
                },
                {
                    key: "vision",
                    label: "Vision",
                    defaultValue:
                        "Menjadi brand sepatu lokal kebanggaan Indonesia yang diakui karena kualitas, kenyamanan, dan inovasi desain.",
                },
            ],
        },
    
        contact_info: {
            title: "Contact Page",
            fields: [
                {
                    key: "address",
                    label: "Address",
                    defaultValue:
                        "Workshop & Store: Jl. Contoh No. 123, Jakarta – Indonesia",
                },
                {
                    key: "phone",
                    label: "Phone",
                    defaultValue: "+62 812-3456-7890",
                },
                {
                    key: "email",
                    label: "Email",
                    defaultValue: "support@zanovshoes.com",
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
                    defaultValue:
                        "Jl. Arsadimeja RT 3/4 Teluk, Purwokerto Selatan, Banyumas, Jawa Tengah",
                },
                {
                    key: "phone",
                    label: "Phone",
                    defaultValue: "+6281329235551",
                },
                {
                    key: "email",
                    label: "Email",
                    defaultValue: "zanovshoes@gmail.com",
                },
                { key: "facebook", label: "Facebook URL", defaultValue: "https://facebook.com/zanov" },
                { key: "instagram", label: "Instagram URL", defaultValue: "https://instagram.com/zanov" },
                { key: "twitter", label: "Twitter URL", defaultValue: "https://twitter.com/zanov" },
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
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 md:gap-0 mb-6 h-auto">
                        <TabsTrigger value="home_hero" className="text-xs md:text-sm">Home Hero</TabsTrigger>
                        <TabsTrigger value="home_about" className="text-xs md:text-sm">Home About</TabsTrigger>
                        <TabsTrigger value="about_content" className="text-xs md:text-sm">
                            About Page
                        </TabsTrigger>
                        <TabsTrigger value="contact_info" className="text-xs md:text-sm">Contact</TabsTrigger>
                        <TabsTrigger value="footer" className="text-xs md:text-sm">Footer</TabsTrigger>
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
