import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Leaf, MapPin, Mail } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                Crop<span className="text-green-400">Guard</span> AI
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{t("footer.tagline")}</p>
            <p className="text-xs text-gray-500 mt-3">{t("footer.developed")}</p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{t("footer.links")}</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: t("nav.home") },
                { href: "/about", label: t("nav.about") },
                { href: "/contact", label: t("nav.contact") },
                { href: "/signin", label: t("nav.signin") },
                { href: "/register", label: t("nav.register") },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{t("footer.contact")}</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">Mekelle, Tigray, Ethiopia</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:cropguard@mekelle.edu.et" className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                  cropguard@mekelle.edu.et
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} CropGuard AI — {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
