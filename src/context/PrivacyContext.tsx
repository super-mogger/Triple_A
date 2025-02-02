import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showProgress: boolean;
  showAchievements: boolean;
  allowFriendRequests: boolean;
  dataCollection: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  deviceHistory: boolean;
}

interface PrivacyContextType {
  privacySettings: PrivacySettings;
  securitySettings: SecuritySettings;
  updatePrivacySetting: <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => void;
  updateSecuritySetting: <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'friends',
    showProgress: true,
    showAchievements: true,
    allowFriendRequests: true,
    dataCollection: true
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    loginAlerts: true,
    deviceHistory: true
  });

  const updatePrivacySetting = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateSecuritySetting = <K extends keyof SecuritySettings>(
    key: K,
    value: SecuritySettings[K]
  ) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <PrivacyContext.Provider
      value={{
        privacySettings,
        securitySettings,
        updatePrivacySetting,
        updateSecuritySetting
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
} 