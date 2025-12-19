<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Filter by role jika ada
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Filter by status aktif jika ada
        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', $request->is_active);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $users = $query->paginate(10)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'is_active']),
            'sort' => ['field' => $sortField, 'direction' => $sortDirection]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:admin,sales,collector,user',
            'is_active' => 'boolean'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'address' => $validated['address'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'create',
            'module' => 'users',
            'description' => "Membuat user baru: {$user->name} ({$user->email})",
            'model_id' => $user->id,
            'model_type' => User::class,
            'new_values' => $user->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('users.index')
            ->with('success', 'User berhasil ditambahkan');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:admin,sales,collector,user',
            'is_active' => 'boolean',
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()]
        ]);

        $oldValues = $user->toArray();

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'address' => $validated['address'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);
        $newValues = $user->fresh()->toArray();

        // Filter field yang tidak perlu di-log
        $ignoredFields = ['email_verified_at', 'updated_at'];

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

        // Jika password diupdate, mask dalam log
        if (!empty($validated['password'])) {
            $changedFields['password'] = '******';
        }

        // Buat log jika ada perubahan (setelah filter)
        if (!empty($changedFields)) {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'update',
                'module' => 'users',
                'description' => "Mengupdate user: {$user->name}",
                'model_id' => $user->id,
                'model_type' => User::class,
                'old_values' => array_intersect_key($oldValues, $changedFields),
                'new_values' => $changedFields,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } else {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'update',
                'module' => 'users',
                'description' => "Mencoba mengupdate user: {$user->name} (tidak ada perubahan)",
                'model_id' => $user->id,
                'model_type' => User::class,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }

        return redirect()->route('users.index')
            ->with('success', 'User berhasil diperbarui');
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'delete',
                'module' => 'users',
                'description' => "Mencoba menghapus akun sendiri: {$user->name} (diblokir)",
                'model_id' => $user->id,
                'model_type' => User::class,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return back()->with('error', 'Tidak dapat menghapus akun sendiri');
        }

        $oldValues = $user->toArray();

        $user->delete();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'delete',
            'module' => 'users',
            'description' => "Menghapus user: {$oldValues['name']} ({$oldValues['email']})",
            'model_id' => $oldValues['id'],
            'model_type' => User::class,
            'old_values' => $oldValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('users.index')
            ->with('success', 'User berhasil dihapus');
    }

    public function show(User $user)
    {
        return Inertia::render('Users/Show', [
            'user' => $user
        ]);
    }
}
