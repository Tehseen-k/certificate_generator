'use client';

import React, { useState } from 'react';
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCertificateStore } from '@/lib/store';
import type { CertificateUser } from '@/types/certificate';

export const ManageStep = () => {
  const store = useCertificateStore();
  const [newName, setNewName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [bulkCourseName, setBulkCourseName] = useState(store.data.globalCourseName || 'IOSH Managing Safely');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  const [editingCourseValue, setEditingCourseValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddUser = () => {
    if (newName.trim()) {
      const newUser: CertificateUser = {
        id: `user_${Date.now()}`,
        fullName: newName.trim(),
        courseName: newCourseName.trim() || store.data.globalCourseName || 'IOSH Managing Safely',
      };
      store.addUser(newUser);
      setNewName('');
      setNewCourseName('');
    }
  };

  const handleRemoveUser = (userId: string) => {
    store.removeUser(userId);
  };

  const handleEditStart = (user: CertificateUser) => {
    setEditingId(user.id);
    setEditingNameValue(user.fullName);
    setEditingCourseValue(user.courseName || '');
  };

  const handleEditSave = () => {
    if (editingId && editingNameValue.trim()) {
      store.updateUser(editingId, {
        fullName: editingNameValue.trim(),
        courseName: editingCourseValue.trim() || undefined,
      });
      setEditingId(null);
      setEditingNameValue('');
      setEditingCourseValue('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingNameValue('');
    setEditingCourseValue('');
  };

  const applyCourseToAll = () => {
    const nextCourse = bulkCourseName.trim() || 'IOSH Managing Safely';
    store.setGlobalCourseName(nextCourse);
    store.updateUsers(
      store.data.users.map((user) => ({
        ...user,
        courseName: nextCourse,
      }))
    );
  };

  const applyCourseToMissing = () => {
    const nextCourse = bulkCourseName.trim() || 'IOSH Managing Safely';
    store.setGlobalCourseName(nextCourse);
    store.updateUsers(
      store.data.users.map((user) => ({
        ...user,
        courseName: user.courseName?.trim() ? user.courseName : nextCourse,
      }))
    );
  };

  const filteredUsers = store.data.users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return user.fullName.toLowerCase().includes(search) || (user.courseName || '').toLowerCase().includes(search);
  });

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
          <CardTitle>Manage Participants</CardTitle>
          <CardDescription>Review and edit participant names before generating certificates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-8">
          {/* Add New User */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 space-y-3">
            <label className="block text-sm font-semibold mb-3 text-indigo-900">Add New Participant</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter participant name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
                className="flex-1"
              />
              <Input
                placeholder="Course name (optional)"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddUser} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
            <p className="text-xs text-indigo-700">
              If course is empty, default/global course will be used: <strong>{store.data.globalCourseName}</strong>
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-3">
            <label className="block text-sm font-semibold text-blue-900">Global Course Assignment</label>
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Default course name"
                value={bulkCourseName}
                onChange={(e) => setBulkCourseName(e.target.value)}
                className="min-w-[280px] flex-1"
              />
              <Button onClick={applyCourseToMissing} variant="outline">
                Fill Missing Only
              </Button>
              <Button onClick={applyCourseToAll}>Apply To All</Button>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full">
              <Input
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="flex gap-4 text-sm font-medium">
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="text-blue-600">Total: </span>
                <span className="text-blue-900 font-bold text-lg">{store.data.users.length}</span>
              </div>
              {searchTerm && (
                <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
                  <span className="text-purple-600">Found: </span>
                  <span className="text-purple-900 font-bold text-lg">{filteredUsers.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Participants List */}
          <div>
            {store.data.users.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <p className="text-slate-500 text-lg font-medium">No participants added yet</p>
                <p className="text-slate-400 text-sm mt-2">Upload a file or add participants manually above</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <p className="text-slate-500">No participants match your search</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group"
                  >
                    {/* Index */}
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm">
                        {index + 1}
                      </span>
                    </div>

                    {/* Edit or Display */}
                    {editingId === user.id ? (
                      <div className="flex gap-2 flex-1 items-center">
                        <Input
                          value={editingNameValue}
                          onChange={(e) => setEditingNameValue(e.target.value)}
                          autoFocus
                          className="flex-1 border-indigo-400 focus:border-indigo-600"
                        />
                        <Input
                          value={editingCourseValue}
                          onChange={(e) => setEditingCourseValue(e.target.value)}
                          placeholder="Course name"
                          className="flex-1 border-indigo-400 focus:border-indigo-600"
                        />
                        <Button
                          onClick={handleEditSave}
                          size="sm"
                          variant="default"
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </Button>
                        <Button
                          onClick={handleEditCancel}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div
                          className="flex-1 cursor-pointer px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                          onClick={() => handleEditStart(user)}
                        >
                          <p className="font-medium text-slate-900">{user.fullName}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            Course: <strong>{user.courseName || store.data.globalCourseName}</strong>
                          </p>
                        </div>
                        <Button
                          onClick={() => handleEditStart(user)}
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleRemoveUser(user.id)}
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">💡 Tip: Edit Names</p>
              <p className="text-xs text-blue-800">Click on any name to edit it directly</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 mb-1">✓ Ready to Continue</p>
              <p className="text-xs text-green-800">Review all names carefully before moving to the next step</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
