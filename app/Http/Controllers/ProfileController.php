<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $profileImageUrl = $user->profile_image ? Storage::url($user->profile_image) : null;

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'profileImageUrl' => $profileImageUrl,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $oldValues = $user->toArray();
        $validated = $request->validated();

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        $newValues = $user->fresh()->toArray();

        // Filter field yang tidak perlu di-log
        $ignoredFields = ['created_at', 'updated_at', 'email_verified_at', 'password'];

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

        // Log activity
        if (!empty($changedFields)) {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'update',
                'module' => 'profile',
                'description' => "Mengupdate profil: {$user->name} ({$user->email})",
                'model_id' => $user->id,
                'model_type' => User::class,
                'old_values' => array_intersect_key($oldValues, $changedFields),
                'new_values' => $changedFields,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } else {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'update',
                'module' => 'profile',
                'description' => "Mencoba mengupdate profil: {$user->name} ({$user->email}) (tidak ada perubahan)",
                'model_id' => $user->id,
                'model_type' => User::class,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Update the user's profile image.
     */
    public function updateImage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'profile_image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ]);

        $user = $request->user();
        $oldImagePath = $user->profile_image;

        // Delete old image if exists
        if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
            Storage::disk('public')->delete($user->profile_image);
        }

        // Store new image
        $imagePath = $request->file('profile_image')->store('profiles', 'public');
        $user->profile_image = $imagePath;
        $user->save();

        // Log activity
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'update',
            'module' => 'profile',
            'description' => "Mengupdate foto profil: {$user->name} ({$user->email})",
            'model_id' => $user->id,
            'model_type' => User::class,
            'old_values' => [
                'profile_image' => $oldImagePath,
            ],
            'new_values' => [
                'profile_image' => $imagePath,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return Redirect::route('profile.edit')->with('status', 'profile-image-updated');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user = $request->user();
        $user->password = Hash::make($validated['password']);
        $user->save();

        // Log activity (jangan simpan password di log untuk security)
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'update',
            'module' => 'profile',
            'description' => "Mengupdate password: {$user->name} ({$user->email})",
            'model_id' => $user->id,
            'model_type' => User::class,
            'new_values' => [
                'password' => '***HIDDEN***',
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return Redirect::route('profile.edit')->with('status', 'password-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        $oldValues = $user->toArray();

        // Filter field yang tidak perlu di-log
        $ignoredFields = ['created_at', 'updated_at', 'email_verified_at', 'password'];

        // Hapus field yang diabaikan dari old values
        foreach ($ignoredFields as $field) {
            unset($oldValues[$field]);
        }

        // Log activity sebelum logout dan delete
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'delete',
            'module' => 'profile',
            'description' => "Menghapus akun: {$user->name} ({$user->email})",
            'model_id' => $oldValues['id'],
            'model_type' => User::class,
            'old_values' => $oldValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
