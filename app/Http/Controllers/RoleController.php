<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('roles/index', [
            'roles' => Role::latest()->paginate(20)
        ]);
    }

    public function create()
    {
        return Inertia::render('roles/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:roles',
        ]);

        Role::create($validated);

        return redirect()->route('roles.index')->with('success', 'Role created');
    }

    public function show(Role $role)
    {
        return Inertia::render('roles/show', [
            'role' => $role
        ]);
    }

    public function edit(Role $role)
    {
        return Inertia::render('roles/edit', [
            'role' => $role
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'nullable'
        ]);

        $role->update($validated);

        return redirect()->route('roles.index')->with('success', 'Role updated');
    }

    public function destroy(Role $role)
    {
        $role->delete();
        return back()->with('success', 'Role deleted');
    }
}
