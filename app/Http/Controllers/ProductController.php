<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
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

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $products = $query->paginate(10)->withQueryString();

        // Add image URL to each product
        $products->getCollection()->transform(function ($product) {
            $product->image_url = $product->image ? Storage::url($product->image) : null;
            return $product;
        });

        return Inertia::render('Catalogue/Index', [
            'products' => $products,
            'filters' => $request->only(['search']),
            'sort' => ['field' => $sortField, 'direction' => $sortDirection]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:255',
            'material' => 'nullable|string|max:255',
            'cash_price' => 'nullable|numeric|min:0',
            'credit_price' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image'] = $imagePath;
        }

        $product = Product::create($validated);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'create',
            'module' => 'products',
            'description' => "Membuat produk baru: {$product->name}",
            'model_id' => $product->id,
            'model_type' => Product::class,
            'new_values' => $product->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil ditambahkan');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:255',
            'material' => 'nullable|string|max:255',
            'cash_price' => 'nullable|numeric|min:0',
            'credit_price' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
        ]);

        $oldValues = $product->toArray();

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image'] = $imagePath;
        }

        $product->update($validated);
        $newValues = $product->fresh()->toArray();

        // Filter field yang tidak perlu di-log
        $ignoredFields = ['updated_at'];

        // Hapus field yang diabaikan dari old dan new values
        foreach ($ignoredFields as $field) {
            unset($oldValues[$field]);
            unset($newValues[$field]);
        }

        // Cari field yang berubah (setelah filter)
        $changedFields = [];
        foreach ($newValues as $key => $value) {
            if (!isset($oldValues[$key]) || $oldValues[$key] != $value) {
                $changedFields[$key] = $value;
            }
        }

        // Buat log jika ada perubahan (setelah filter)
        if (!empty($changedFields)) {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'update',
                'module' => 'products',
                'description' => "Mengupdate produk: {$product->name}",
                'model_id' => $product->id,
                'model_type' => Product::class,
                'old_values' => array_intersect_key($oldValues, $changedFields),
                'new_values' => $changedFields,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } else {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'update',
                'module' => 'products',
                'description' => "Mencoba mengupdate produk: {$product->name} (tidak ada perubahan)",
                'model_id' => $product->id,
                'model_type' => Product::class,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil diperbarui');
    }

    public function destroy(Product $product)
    {
        $oldValues = $product->toArray();

        // Delete image if exists
        if ($product->image && Storage::disk('public')->exists($product->image)) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'delete',
            'module' => 'products',
            'description' => "Menghapus produk: {$oldValues['name']}",
            'model_id' => $oldValues['id'],
            'model_type' => Product::class,
            'old_values' => $oldValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil dihapus');
    }
}
