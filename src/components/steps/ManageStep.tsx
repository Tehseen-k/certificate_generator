'use client';

import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCertificateStore } from '@/lib/store';
import type { CertificateUser } from '@/types/certificate';

export const ManageStep = () => {
  const store = useCertificateStore();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAddUser = () => {
    if (newName.trim()) {
      const newUser: CertificateUser = {
        id: `user_${Date.now()}`,
        fullName: newName.trim(),
      };
      store.addUser(newUser);
      setNewName('');
    }
  };

  const handleRemoveUser = (userId: string) => {
    store.removeUser(userId);
  };

  const handleEditStart = (user: CertificateUser) => {
    setEditingId(user.id);
    setEditingValue(user.fullName);
  };

  const handleEditSave = () => {
    if (editingId && editingValue.trim()) {
      store.updateUser(editingId, { fullName: editingValue.trim() });
      setEditingId(null);
      setEditingValue('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingValue('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Manage Participants</CardTitle>
          <CardDescription>Review and edit the parsed participant names</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New User */}
          <div className="flex gap-2 pb-6 border-b">
            <Input
              placeholder="Enter a participant name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
            />
            <Button onClick={handleAddUser} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {/* Participants List */}
          <div>
            <p className="text-sm font-semibold mb-4 text-slate-700">
              Total Participants: <span className="text-indigo-600">{store.data.users.length}</span>
            </p>

            <div className="space-y-2">
              {store.data.users.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No participants added yet</p>
              ) : (
                store.data.users.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                  >
                    <span className="text-sm font-semibold text-slate-500 w-8">{index + 1}.</span>

                    {editingId === user.id ? (
                      <div className="flex gap-2 flex-1">
                        <Input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          autoFocus
                          className="flex-1"
                        />
                        <Button onClick={handleEditSave} size="sm" variant="default">
                          Save
                        </Button>
                        <Button onClick={handleEditCancel} size="sm" variant="outline">
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div
                          className="flex-1 cursor-pointer p-2 rounded hover:bg-white transition"
                          onClick={() => handleEditStart(user)}
                        >
                          <p className="text-sm">{user.fullName}</p>
                          <p className="text-xs text-slate-500">Length: {user.fullName.length} characters</p>
                        </div>
                        <Button
                          onClick={() => handleRemoveUser(user.id)}
                          size="sm"
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Click on a name to edit it. Review all names carefully before generating certificates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
