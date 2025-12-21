<?php

namespace App\Http\Controllers;

use App\Models\LandingPageContent;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LandingPageController extends Controller
{
    // Public pages
    public function home()
    {
        $contents = LandingPageContent::where('section', 'home_hero')
            ->orWhere('section', 'home_about')
            ->orWhere('section', 'footer')
            ->orderBy('order')
            ->get()
            ->groupBy('section');

        // Get default values if not set
        $heroTitle = $contents->get('home_hero')?->where('key', 'title')->first()?->value ?? 'ZANOV SHOES';
        $heroSubtitle = $contents->get('home_hero')?->where('key', 'subtitle')->first()?->value ?? 'Premium Quality Footwear';
        $heroImageValue = $contents->get('home_hero')?->where('key', 'background_image')->first()?->value;
        // If value is a file path (starts with 'landing/'), use Storage URL, otherwise use as-is (for external URLs)
        $heroImage = $heroImageValue 
            ? (str_starts_with($heroImageValue, 'landing/') ? Storage::url($heroImageValue) : $heroImageValue)
            : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=80';
        $aboutTitle = $contents->get('home_about')?->where('key', 'title')->first()?->value ?? 'About ZANOV';
        $aboutDescription = $contents->get('home_about')?->where('key', 'description')->first()?->value ?? 'ZANOV Shoes adalah brand sepatu premium yang menghadirkan kualitas terbaik dengan desain yang elegan dan modern.';
        
        $footer = [
            'address' => $contents->get('footer')?->where('key', 'address')->first()?->value ?? 'Jl. Contoh No. 123, Jakarta',
            'phone' => $contents->get('footer')?->where('key', 'phone')->first()?->value ?? '+62 123 456 7890',
            'email' => $contents->get('footer')?->where('key', 'email')->first()?->value ?? 'info@zanovshoes.com',
            'facebook' => $contents->get('footer')?->where('key', 'facebook')->first()?->value ?? '',
            'instagram' => $contents->get('footer')?->where('key', 'instagram')->first()?->value ?? '',
            'twitter' => $contents->get('footer')?->where('key', 'twitter')->first()?->value ?? '',
        ];

        return Inertia::render('Landing/Home', [
            'hero' => [
                'title' => $heroTitle,
                'subtitle' => $heroSubtitle,
                'background_image' => $heroImage,
            ],
            'about' => [
                'title' => $aboutTitle,
                'description' => $aboutDescription,
            ],
            'footer' => $footer,
        ]);
    }

    public function catalogue(Request $request)
    {
        $query = Product::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('material', 'like', "%{$search}%");
            });
        }

        // Filter by gender
        if ($request->has('gender') && $request->gender) {
            $query->where('gender', $request->gender);
        }

        // Filter by material
        if ($request->has('material') && $request->material) {
            $query->where('material', 'like', "%{$request->material}%");
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if ($sortBy === 'cash_price' || $sortBy === 'credit_price') {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $products = $query->paginate(12)->withQueryString();

        // Add image URL
        $products->getCollection()->transform(function ($product) {
            $product->image_url = $product->image ? Storage::url($product->image) : null;
            return $product;
        });

        $footer = $this->getFooter();

        return Inertia::render('Landing/Catalogue', [
            'products' => $products,
            'filters' => $request->only(['search', 'gender', 'material', 'sort_by', 'sort_order']),
            'footer' => $footer,
        ]);
    }

    public function about()
    {
        $contents = LandingPageContent::where('section', 'about_content')
            ->orderBy('order')
            ->get();

        $aboutData = [
            'title' => $contents->where('key', 'title')->first()?->value ?? 'About ZANOV',
            'description' => $contents->where('key', 'description')->first()?->value ?? 'ZANOV Shoes adalah brand sepatu premium yang menghadirkan kualitas terbaik dengan desain yang elegan dan modern. Kami berkomitmen untuk memberikan produk berkualitas tinggi dengan harga yang terjangkau.',
            'mission' => $contents->where('key', 'mission')->first()?->value ?? 'Misi kami adalah menghadirkan sepatu berkualitas premium dengan desain yang timeless dan nyaman digunakan sehari-hari.',
            'vision' => $contents->where('key', 'vision')->first()?->value ?? 'Menjadi brand sepatu terdepan di Indonesia yang dikenal dengan kualitas, inovasi, dan pelayanan terbaik.',
        ];

        $footer = $this->getFooter();

        return Inertia::render('Landing/About', [
            'about' => $aboutData,
            'footer' => $footer,
        ]);
    }

    public function contact()
    {
        $contents = LandingPageContent::where('section', 'contact_info')
            ->orderBy('order')
            ->get();

        $contactData = [
            'address' => $contents->where('key', 'address')->first()?->value ?? 'Jl. Contoh No. 123, Jakarta Selatan, DKI Jakarta 12345',
            'phone' => $contents->where('key', 'phone')->first()?->value ?? '+62 123 456 7890',
            'email' => $contents->where('key', 'email')->first()?->value ?? 'info@zanovshoes.com',
            'map_url' => $contents->where('key', 'map_url')->first()?->value ?? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.3694!2d106.8167!3d-6.2088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMzEuNiJTIDEwNsKwNDknMDAuMSJF!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid',
        ];

        $footer = $this->getFooter();

        return Inertia::render('Landing/Contact', [
            'contact' => $contactData,
            'footer' => $footer,
        ]);
    }

    // Admin CMS methods
    public function adminIndex()
    {
        $contents = LandingPageContent::orderBy('section')->orderBy('order')->get()->groupBy('section');
        
        return Inertia::render('Admin/LandingPage/Index', [
            'contents' => $contents,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'section' => 'required|string|max:255',
            'key' => 'required|string|max:255',
            'value' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'type' => 'nullable|string|max:50',
            'order' => 'nullable|integer',
        ]);

        // Get existing content
        $existing = LandingPageContent::where('section', $validated['section'])
            ->where('key', $validated['key'])
            ->first();

        // Handle image upload for background_image
        if ($request->hasFile('image') && $validated['key'] === 'background_image') {
            // Delete old image if exists
            if ($existing && $existing->value && str_starts_with($existing->value, 'landing/')) {
                if (Storage::disk('public')->exists($existing->value)) {
                    Storage::disk('public')->delete($existing->value);
                }
            }

            // Store new image
            $imagePath = $request->file('image')->store('landing', 'public');
            $value = $imagePath;
            $type = 'image';
        } else {
            // For non-image fields or when no new image uploaded
            $value = $validated['value'] ?? ($existing?->value ?? '');
            $type = $validated['type'] ?? ($existing?->type ?? 'text');
        }

        LandingPageContent::updateOrCreate(
            [
                'section' => $validated['section'],
                'key' => $validated['key'],
            ],
            [
                'value' => $value,
                'type' => $type,
                'order' => $validated['order'] ?? 0,
            ]
        );

        return back()->with('success', 'Content berhasil disimpan');
    }

    public function update(Request $request, LandingPageContent $landingPageContent)
    {
        $validated = $request->validate([
            'value' => 'nullable|string',
            'type' => 'nullable|string|max:50',
            'order' => 'nullable|integer',
        ]);

        $landingPageContent->update($validated);

        return back()->with('success', 'Content berhasil diperbarui');
    }

    public function destroy(LandingPageContent $landingPageContent)
    {
        $landingPageContent->delete();

        return back()->with('success', 'Content berhasil dihapus');
    }

    private function getFooter()
    {
        $contents = LandingPageContent::where('section', 'footer')
            ->orderBy('order')
            ->get();

        return [
            'address' => $contents->where('key', 'address')->first()?->value ?? 'Jl. Contoh No. 123, Jakarta',
            'phone' => $contents->where('key', 'phone')->first()?->value ?? '+62 123 456 7890',
            'email' => $contents->where('key', 'email')->first()?->value ?? 'info@zanovshoes.com',
            'facebook' => $contents->where('key', 'facebook')->first()?->value ?? '',
            'instagram' => $contents->where('key', 'instagram')->first()?->value ?? '',
            'twitter' => $contents->where('key', 'twitter')->first()?->value ?? '',
        ];
    }
}
