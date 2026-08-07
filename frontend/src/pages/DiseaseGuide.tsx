import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronUp, AlertTriangle, Leaf, FlaskConical, Shield } from "lucide-react";

const severityColors: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: "bg-red-50 border-red-200", text: "text-red-700", dot: "bg-red-500" },
  medium: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  low: { bg: "bg-green-50 border-green-200", text: "text-green-700", dot: "bg-green-500" },
};

const cropEmoji: Record<string, string> = {
  Wheat: "🌾", Maize: "🌽", Tomato: "🍅", Potato: "🥔", Pepper: "🌶️", Teff: "🌿", Sorghum: "🌾",
  ስንዴ: "🌾", በቆሎ: "🌽", ቲማቲም: "🍅", ድንች: "🥔", ፍርሻ: "🌶️", ጤፍ: "🌿", ማሽላ: "🌾",
  ስርናይ: "🌾", ሽምብራ: "🌽", ድንሽ: "🥔", ፎሮ: "🌶️", ጣፍ: "🌿",
};

function getCropEmoji(crop: string) {
  return cropEmoji[crop] || "🌱";
}

type Disease = {
  id: string;
  name: string;
  crop: string;
  severity: string;
  symptoms: string;
  causes: string;
  chemical: string;
  organic: string;
  prevention: string;
};

function DiseaseCard({ disease, labels }: { disease: Disease; labels: Record<string, string> }) {
  const [expanded, setExpanded] = useState(false);
  const colors = severityColors[disease.severity] || severityColors.medium;
  const { t } = useTranslation();
  const severityLabel = t(`diseases.severity.${disease.severity}`);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`rounded-2xl border ${expanded ? colors.bg : "bg-white border-gray-100"} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
    >
      <button
        className="w-full text-left p-5 flex items-start gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="text-3xl flex-shrink-0 mt-0.5">{getCropEmoji(disease.crop)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-base leading-snug">{disease.name}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                {severityLabel}
              </span>
              {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Leaf className="w-3.5 h-3.5 text-green-500" />
            <span className="text-sm text-gray-500">{disease.crop}</span>
          </div>
          {!expanded && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{disease.symptoms}</p>
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {labels.symptoms}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{disease.symptoms}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                  <Search className="w-4 h-4 text-blue-500" />
                  {labels.causes}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{disease.causes}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-1.5">
                    <FlaskConical className="w-4 h-4" />
                    {labels.chemical}
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">{disease.chemical}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-1.5">
                    <Leaf className="w-4 h-4" />
                    {labels.organic}
                  </div>
                  <p className="text-xs text-green-700 leading-relaxed">{disease.organic}</p>
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 mb-1.5">
                  <Shield className="w-4 h-4" />
                  {labels.prevention}
                </div>
                <p className="text-xs text-purple-700 leading-relaxed">{disease.prevention}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const ALL_CROP_KEYS = ["wheat", "maize", "sorghum", "tomato", "potato", "pepper", "teff"];

export default function DiseaseGuide() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const diseases = t("diseases.list", { returnObjects: true }) as Disease[];
  const labels = t("diseases.labels", { returnObjects: true }) as Record<string, string>;

  const filters = useMemo(() => {
    const active = ALL_CROP_KEYS.filter((key) =>
      diseases.some(
        (d) => d.crop.toLowerCase() === key || d.id.startsWith(key)
      )
    );
    return [
      { key: "all", label: t("diseases.filter.all") },
      ...active.map((key) => ({ key, label: t(`diseases.filter.${key}`) })),
    ];
  }, [diseases, t]);

  const filtered = useMemo(() => {
    return diseases.filter((d) => {
      const matchesFilter =
        activeFilter === "all" ||
        d.crop.toLowerCase().includes(activeFilter) ||
        d.id.startsWith(activeFilter);
      const matchesSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.crop.toLowerCase().includes(search.toLowerCase()) ||
        d.symptoms.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [diseases, activeFilter, search]);

  const highCount = diseases.filter((d) => d.severity === "high").length;
  const mediumCount = diseases.filter((d) => d.severity === "medium").length;

  return (
    <div className="min-h-screen bg-white pt-16">
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-5"
          >
            <Leaf className="w-4 h-4" />
            {t("nav.diseases")}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5"
          >
            {t("diseases.hero.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 leading-relaxed"
          >
            {t("diseases.hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-6 mt-8"
          >
            {[
              { label: `${diseases.length} Diseases`, color: "text-gray-900" },
              { label: `${highCount} High Risk`, color: "text-red-600" },
              { label: `${mediumCount} Medium Risk`, color: "text-amber-600" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className={`font-bold text-xl ${s.color}`}>{s.label.split(" ")[0]}</div>
                <div className="text-xs text-gray-500">{s.label.split(" ").slice(1).join(" ")}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("diseases.search")}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === f.key
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No diseases found. Try a different search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((disease) => (
                  <DiseaseCard key={disease.id} disease={disease} labels={labels} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
