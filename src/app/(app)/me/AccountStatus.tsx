"use client";

import { useT } from "@/i18n";
import { useMe } from "@/api/hooks";

/** The real backend account state -- GET /me was never actually surfaced
 *  to a student before this. */
export function AccountStatus() {
  const t = useT();
  const me = useMe();

  if (me.isPending) {
    return <p className="text-sm text-earth">{t("state.loading")}</p>;
  }

  if (me.isError || !me.data) {
    return <p className="text-sm text-earth">{t("state.error")}</p>;
  }

  if (!me.data.claimed) {
    return (
      <div>
        <p className="font-semibold text-ink">{t("me.account.anonymous")}</p>
        <p className="mt-1 text-sm text-earth">{t("me.account.anonymousBody")}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-semibold text-ink">{t("me.account.connected")}</p>
      <p className="mt-1 text-sm text-earth">
        {t("me.account.connectedBody", {
          contact: me.data.email ?? me.data.phone ?? "",
        })}
      </p>
    </div>
  );
}
