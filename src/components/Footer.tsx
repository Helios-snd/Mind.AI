import Link from "next/link";
import { footerNav, EMERGENCY_HELPLINE } from "@/data/nav";

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-gray-300">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {footerNav.map((group) => (
          <div key={group.label}>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
              {group.label}
            </h3>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-300 hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">
            Subscribe to our Newsletter
          </h3>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-brand focus:outline-none"
            />
            <button type="submit" className="btn-primary px-4 py-2">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container-x flex flex-col gap-3 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Mind.AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-brand">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-brand">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
        {/* pb-28 keeps this last line clear of the fixed dock. */}
        <div className="container-x pb-28 text-xs text-gray-500">
          Emergency Helpline: If you are in crisis or need urgent support, please
          call {EMERGENCY_HELPLINE}
        </div>
      </div>
    </footer>
  );
}
