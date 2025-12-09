"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FiGlobe, FiSettings } from "react-icons/fi";

const Settings = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FiSettings className="w-8 h-8 text-brand-500" />
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* Language Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiGlobe className="w-5 h-5 text-brand-500" />
              Language Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Select your preferred language
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Choose the language you want to use across the application.
                </p>
                <LanguageSwitcher />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Settings Sections */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="text-gray-500">Additional Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              More settings options coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
