import React from 'react';
import { NotificationToggle } from './notification-toggle';
import { NotificationType } from './notification-type';
import { SoundSettings } from './sound-settings';
import { DoNotDisturbSettings } from './do-not-disturb-settings';

export const NotificationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your notification preferences and alert settings.
        </p>
      </div>

      <div className="space-y-6">
        <NotificationToggle />
        <NotificationType />
        <SoundSettings />
        <DoNotDisturbSettings />
      </div>
    </div>
  );
};