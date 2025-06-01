import React from 'react';
import { useSettingsStore } from '../../../store/settings-store';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';

export const ProfileSettings: React.FC = () => {
  const { settings, updateProfileSettings } = useSettingsStore();
  const { profile } = settings;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) => updateProfileSettings({ name: e.target.value })}
            placeholder="Enter your name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            onChange={(e) => updateProfileSettings({ email: e.target.value })}
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium">
            Bio
          </label>
          <Textarea
            id="bio"
            value={profile.bio || ''}
            onChange={(e) => updateProfileSettings({ bio: e.target.value })}
            placeholder="Tell us about yourself"
            className="h-24"
          />
        </div>

        <div className="pt-4">
          <Button variant="gradient" className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};