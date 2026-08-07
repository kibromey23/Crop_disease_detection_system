import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Menu, X, Leaf, Globe } from "lucide-react";

const languages = [
  { code: "en", label: "English" },
  { code: "am", label: "አማርኛ" },
  { code: "ti", label: "ትግርኛ" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("cropguard_lang", code);
    try {
      const cgUser = JSON.parse(localStorage.getItem("cg_user") || "{}");
      cgUser.language = code;
      localStorage.setItem("cg_user", JSON.stringify(cgUser));
    } catch {}
    setLangOpen(false);
  };

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/about", label: t("nav.about") },
    { href: "/diseases", label: t("nav.diseases") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md group-hover:shadow-green-300 transition-shadow">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              Crop<span className="text-green-600">Guard</span> AI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location === link.href
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLang.label}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px] z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        lang.code === i18n.language ? "text-green-600 font-medium" : "text-gray-700"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/signin"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
            >
              {t("nav.signin")}
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
            >
              {t("nav.register")}
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location === link.href
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 space-y-1">
            <div className="flex gap-2 py-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { changeLanguage(lang.code); setMobileOpen(false); }}
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                    lang.code === i18n.language
                      ? "border-green-500 bg-green-50 text-green-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <Link
              href="/signin"
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 text-center"
              onClick={() => setMobileOpen(false)}
            >
              {t("nav.signin")}
            </Link>
            <Link
              href="/register"
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 text-center"
              onClick={() => setMobileOpen(false)}
            >
              {t("nav.register")}
            </Link>
          </div>
        </div>
      )}

      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
      )}
    </nav>
  );
}
