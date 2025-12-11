"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BiBuilding, BiLogoWhatsapp, BiUser } from "react-icons/bi";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation("settings");
  const pathname = usePathname();

  const menuSections = [
    {
      header: t("businessHeader"),
      icon: <BiBuilding className="w-5 h-5 text-brand-500" />,
      items: [
        {
          path: "/dashboard/settings/business-details",
          label: t("businessDetailsItem"),
        },
        { path: "/dashboard/settings/users", label: t("businessUsers") },
        {
          path: "/dashboard/settings/schedules",
          label: t("businessSchedules"),
        },
      ],
    },
    {
      header: t("accountHeader"),
      icon: <BiUser className="w-5 h-5 text-brand-500" />,
      items: [
        { path: "/dashboard/settings/account", label: t("accountDetailsItem") },
      ],
    },
    {
      header: t("whatsappHeader"),
      icon: <BiLogoWhatsapp className="w-5 h-5 text-brand-500" />,
      items: [
        {
          path: "/dashboard/settings/whatsapp",
          label: t("whatsappDetailsItem"),
        },
        {
          path: "/dashboard/settings/reminders",
          label: t("whatsappReminders"),
        },
        { path: "/dashboard/settings/credits", label: t("whatsappCredits") },
        { path: "/dashboard/settings/chatbot", label: t("whatsappChatBot") },
      ],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-1">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>{t("configurationHeader")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menuSections.map((section, idx) => (
                  <div key={idx}>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                      {section.icon}
                      <span className="text-xs font-semibold text-gray-600">
                        {section.header}
                      </span>
                    </p>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.path}>
                          <Link
                            href={item.path}
                            className={cn(
                              "block text-sm px-8 py-1 rounded-md transition-colors h-10 flex items-center justify-start cursor-pointer",
                              pathname === item.path
                                ? "bg-brand-50 text-brand-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                            )}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 space-y-4">{children}</div>
      </div>
    </div>
  );
}
