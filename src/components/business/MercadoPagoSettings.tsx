"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BiCreditCard, BiLockAlt } from "react-icons/bi";
import { SiMercadopago } from "react-icons/si";

export const MercadoPagoSettings = () => {
  const { t } = useTranslation("settings");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [accessToken, setAccessToken] = useState("");
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/business/mercado-pago");
        const result = await response.json();
        if (result.data) {
          setAccessToken(result.data.mercadoPagoAccessToken || "");
          setPublicKey(result.data.mercadoPagoPublicKey || "");
        }
      } catch (error) {
        console.error("Error fetching Mercado Pago settings:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/business/mercado-pago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken,
          publicKey,
        }),
      });

      if (response.ok) {
        toast.success(t("mercadoPagoSaveSuccess") || "Mercado Pago settings saved");
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      toast.error(t("mercadoPagoSaveError") || "Error saving Mercado Pago settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-omnia-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-omnia-navy">
          {t("mercadoPagoTitle") || "Mercado Pago Configuration"}
        </h1>
        <p className="text-gray-500">
          {t("mercadoPagoDescription") || "Configure your Mercado Pago credentials to process online payments."}
        </p>
      </div>

      <Card className="border-omnia-navy/10 shadow-sm overflow-hidden">
        <CardHeader className="bg-omnia-light/30 border-b border-omnia-navy/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#009EE3]/10 flex items-center justify-center text-[#009EE3]">
              <SiMercadopago className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t("mercadoPagoCredentials") || "Credentials"}
              </CardTitle>
              <CardDescription>
                {t("mercadoPagoCredentialsDescription") || "Enter your production keys to connect your account."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="publicKey" className="text-sm font-semibold text-omnia-navy/70 uppercase tracking-wider flex items-center gap-2">
                <BiCreditCard className="w-4 h-4" />
                {t("mercadoPagoPublicKeyLabel") || "Public Key"}
              </Label>
              <Input
                id="publicKey"
                placeholder="APP_USR-..."
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                className="h-11 rounded-xl border-2 border-omnia-navy/10 focus:ring-omnia-blue bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken" className="text-sm font-semibold text-omnia-navy/70 uppercase tracking-wider flex items-center gap-2">
                <BiLockAlt className="w-4 h-4" />
                {t("mercadoPagoAccessTokenLabel") || "Access Token"}
              </Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="APP_USR-..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="h-11 rounded-xl border-2 border-omnia-navy/10 focus:ring-omnia-blue bg-white"
              />
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm flex gap-3">
            <div className="mt-0.5">⚠️</div>
            <p>
              Recuerda utilizar tus llaves de <strong>Producción</strong> para poder recibir pagos reales de tus clientes. Puedes encontrarlas en tu Dashboard de Mercado Pago.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-omnia-blue hover:bg-omnia-blue/90 text-white px-8 h-11 rounded-xl font-bold shadow-lg shadow-omnia-blue/20 transition-all active:scale-95"
            >
              {loading ? t("saving") || "Saving..." : t("mercadoPagoSave") || "Save configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
