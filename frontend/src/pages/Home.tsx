import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Brain, Globe2, Zap, ClipboardList, MessageSquare, Leaf,
  ArrowRight, Camera, Shield, ChevronRight, TrendingUp, Users, Star
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const CROP_COLORS: Record<string, { bg: string; emoji: string }> = {
  Wheat: { bg: "from-yellow-400 to-amber-500", emoji: "🌾" },
  ስንዴ: { bg: "from-yellow-400 to-amber-500", emoji: "🌾" },
  ስርናይ: { bg: "from-yellow-400 to-amber-500", emoji: "🌾" },
  Teff: { bg: "from-lime-400 to-green-500", emoji: "🌿" },
  ጤፍ: { bg: "from-lime-400 to-green-500", emoji: "🌿" },
  ጣፍ: { bg: "from-lime-400 to-green-500", emoji: "🌿" },
  Maize: { bg: "from-orange-400 to-yellow-500", emoji: "🌽" },
  በቆሎ: { bg: "from-orange-400 to-yellow-500", emoji: "🌽" },
  ሽምብራ: { bg: "from-orange-400 to-yellow-500", emoji: "🌽" },
  Tomato: { bg: "from-red-400 to-rose-500", emoji: "🍅" },
  ቲማቲም: { bg: "from-red-400 to-rose-500", emoji: "🍅" },
  Potato: { bg: "from-stone-400 to-amber-700", emoji: "🥔" },
  ድንች: { bg: "from-stone-400 to-amber-700", emoji: "🥔" },
  ድንሽ: { bg: "from-stone-400 to-amber-700", emoji: "🥔" },
  Pepper: { bg: "from-green-400 to-emerald-600", emoji: "🌶️" },
  ፍርሻ: { bg: "from-green-400 to-emerald-600", emoji: "🌶️" },
  ፎሮ: { bg: "from-green-400 to-emerald-600", emoji: "🌶️" },
};

function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-6 shadow-2xl">
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-emerald-400/20 rounded-full blur-xl" />
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-green-400/30 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">CropGuard AI</span>
          <div className="ml-auto flex gap-1">
            {[1, 2, 3].map((i) => <div key={i} className="w-2 h-2 rounded-full bg-white/40" />)}
          </div>
        </div>
        <div className="bg-white/10 rounded-2xl p-4 mb-4">
          <div className="text-xs text-green-200 mb-2 font-medium">📸 UPLOADED IMAGE</div>
          <div className="w-full h-28 rounded-xl bg-gradient-to-br from-green-500/40 to-emerald-400/40 flex items-center justify-center border border-white/20">
            <span className="text-5xl">🌿</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Analysis Result</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Complete</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="font-bold text-gray-900 text-sm">Wheat Stem Rust</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Confidence</span>
            <span className="font-semibold text-green-600">96.4%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "96.4%" }} />
          </div>
          <div className="mt-3 text-xs text-gray-600 bg-amber-50 rounded-lg p-2 border border-amber-100">
            💊 Apply tebuconazole fungicide. Repeat in 14 days.
          </div>
        </div>
      </div>
      <motion.div
        animate={{ y: [-6, 0, -6] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2"
      >
        <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
          <Star className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <div className="text-xs font-bold text-gray-900">93.7% Accuracy</div>
          <div className="text-xs text-gray-400">Validated</div>
        </div>
      </motion.div>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
        className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2"
      >
        <div className="text-2xl">🌍</div>
        <div>
          <div className="text-xs font-bold text-gray-900">3 Languages</div>
          <div className="text-xs text-gray-400">EN · አማ · ትግ</div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const cropList = t("home.crops.list", { returnObjects: true }) as { name: string; diseases: string }[];

  const features = [
    { icon: Brain, key: "ai", color: "bg-purple-100 text-purple-600" },
    { icon: Globe2, key: "multilingual", color: "bg-blue-100 text-blue-600" },
    { icon: Zap, key: "instant", color: "bg-amber-100 text-amber-600" },
    { icon: ClipboardList, key: "history", color: "bg-green-100 text-green-600" },
    { icon: MessageSquare, key: "chat", color: "bg-pink-100 text-pink-600" },
    { icon: Leaf, key: "crops", color: "bg-teal-100 text-teal-600" },
  ];

  const steps = [
    { icon: Camera, step: "01", key: "step1", color: "from-blue-500 to-indigo-600" },
    { icon: Brain, step: "02", key: "step2", color: "from-purple-500 to-violet-600" },
    { icon: Shield, step: "03", key: "step3", color: "from-green-500 to-emerald-600" },
  ];

  const stats = [
    { value: t("home.stats.accuracy"), label: t("home.stats.accuracyLabel"), icon: TrendingUp, color: "text-green-600" },
    { value: t("home.stats.diseases"), label: t("home.stats.diseasesLabel"), icon: Leaf, color: "text-purple-600" },
    { value: t("home.stats.languages"), label: t("home.stats.languagesLabel"), icon: Globe2, color: "text-blue-600" },
    { value: t("home.stats.farmers"), label: t("home.stats.farmersLabel"), icon: Users, color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-white pt-16">
      <section className="relative min-h-[90vh] flex items-center py-20 px-4 overflow-hidden bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-14 items-center relative">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/20 text-green-300 rounded-full text-sm font-medium mb-6 border border-green-500/30"
            >
              <Zap className="w-3.5 h-3.5" />
              {t("home.hero.badge")}
            </motion.div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              {t("home.hero.title")}
            </h1>
            <p className="text-lg text-green-100/80 leading-relaxed mb-8">
              {t("home.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-green-900/40">
                {t("home.hero.getStarted")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/diseases" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-all duration-200">
                {t("home.hero.learnMore")}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-sm text-green-300/60">{t("home.hero.supportedCrops")}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <HeroIllustration />
          </motion.div>
        </div>
      </section>

      <section className="py-14 px-4 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" custom={i} viewport={{ once: true }} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 mb-3 ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t("home.features.title")}</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">{t("home.features.subtitle")}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, key, color }, i) => (
              <motion.div
                key={key}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                custom={i}
                viewport={{ once: true }}
                className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{t(`home.features.${key}.title`)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t(`home.features.${key}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t("home.howItWorks.title")}</h2>
            <p className="text-lg text-gray-500">{t("home.howItWorks.subtitle")}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-blue-300 via-purple-300 to-green-300" />
            {steps.map(({ icon: Icon, step, key, color }, i) => (
              <motion.div key={key} variants={fadeUp} initial="hidden" whileInView="visible" custom={i} viewport={{ once: true }} className="relative text-center">
                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${color} flex flex-col items-center justify-center mx-auto mb-5 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white mb-1" />
                  <span className="text-white/70 text-xs font-bold">{step}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{t(`home.howItWorks.${key}.title`)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{t(`home.howItWorks.${key}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{t("home.crops.title")}</h2>
            <p className="text-lg text-gray-500">{t("home.crops.subtitle")}</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {cropList.map((crop, i) => {
              const colorData = CROP_COLORS[crop.name] || { bg: "from-green-400 to-emerald-600", emoji: "🌱" };
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  custom={i}
                  viewport={{ once: true }}
                  className="group rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-default"
                >
                  <div className={`h-24 bg-gradient-to-br ${colorData.bg} flex items-center justify-center text-4xl`}>
                    {colorData.emoji}
                  </div>
                  <div className="p-3 bg-white">
                    <div className="font-bold text-gray-900 text-sm">{crop.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5 leading-tight">{crop.diseases}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
        </div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-2xl mx-auto text-center relative">
          <div className="text-5xl mb-5">🌾</div>
          <h2 className="text-4xl font-extrabold text-white mb-4">{t("home.cta.title")}</h2>
          <p className="text-lg text-green-100/80 mb-8 leading-relaxed">{t("home.cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg">
              {t("home.cta.button")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/diseases" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-all">
              {t("home.cta.secondary")}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
