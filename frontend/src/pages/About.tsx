import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Users, Target, Cpu, AlertTriangle, GraduationCap, CheckCircle, XCircle, Award, BookOpen, Code2, Database } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const avatarColors = [
  "from-green-400 to-emerald-600",
  "from-blue-400 to-indigo-600",
  "from-purple-400 to-violet-600",
  "from-orange-400 to-amber-600",
  "from-teal-400 to-cyan-600",
  "from-rose-400 to-pink-600",
  "from-yellow-400 to-lime-600",
];

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  0: Award,
  1: Code2,
  2: Code2,
  3: Database,
  4: Cpu,
  5: BookOpen,
  6: Target,
};

export default function About() {
  const { t } = useTranslation();

  const problems = t("about.problem.items", { returnObjects: true }) as { title: string; desc: string }[];
  const modelStats = t("about.model.stats", { returnObjects: true }) as { label: string; value: string }[];
  const techStack = t("about.model.techStack", { returnObjects: true }) as string[];
  const members = t("about.team.members", { returnObjects: true }) as { name: string; role: string }[];
  const compHeaders = t("about.comparison.headers", { returnObjects: true }) as string[];
  const compRows = t("about.comparison.rows", { returnObjects: true }) as {
    feature: string; plantvillage: boolean; plantix: boolean; cropguard: boolean;
  }[];

  const problemIcons = [AlertTriangle, Users, Cpu, Target];

  return (
    <div className="min-h-screen bg-white pt-16">
      <section className="py-24 px-4 bg-gradient-to-br from-green-50 via-emerald-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-green-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
          >
            <GraduationCap className="w-4 h-4" />
            Mekelle University – MIT
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-5 leading-tight"
          >
            {t("about.hero.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 leading-relaxed"
          >
            {t("about.hero.subtitle")}
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Target className="w-3.5 h-3.5" />
              {t("about.mission.title")}
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">{t("about.mission.text")}</p>
            <blockquote className="mt-6 pl-4 border-l-4 border-green-400 italic text-green-700 font-medium">
              "{t("about.mission.quote")}"
            </blockquote>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            custom={1}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-green-600 to-emerald-700 p-8 text-white relative"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold mb-2">CropGuard AI</h3>
            <p className="text-green-100 text-sm mb-6">AI-powered crop disease detection for Ethiopian farmers</p>
            <div className="grid grid-cols-2 gap-3">
              {modelStats.map((s, i) => (
                <div key={i} className="bg-white/15 rounded-xl p-3 text-center">
                  <div className="font-bold text-xl">{s.value}</div>
                  <div className="text-xs text-green-100 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{t("about.problem.title")}</h2>
            <p className="text-gray-500">{t("about.problem.subtitle")}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {problems.map((p, i) => {
              const Icon = problemIcons[i] || AlertTriangle;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  custom={i}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{t("about.model.title")}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-gray-600 leading-relaxed">
              {t("about.model.text")}
            </motion.p>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" custom={1} viewport={{ once: true }}>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {modelStats.map((s, i) => (
                  <div key={i} className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-4 text-center">
                    <div className="text-2xl font-extrabold text-green-700">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg border border-gray-200">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{t("about.comparison.title")}</h2>
            <p className="text-gray-500">{t("about.comparison.subtitle")}</p>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" custom={1} viewport={{ once: true }} className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-white">
                  {compHeaders.map((h, i) => (
                    <th key={i} className={`px-4 py-3.5 font-semibold text-left ${i === 3 ? "bg-green-600" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compRows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium text-gray-700">{row.feature}</td>
                    {[row.plantvillage, row.plantix, row.cropguard].map((v, j) => (
                      <td key={j} className={`px-4 py-3 text-center ${j === 2 ? "bg-green-50" : ""}`}>
                        {v ? (
                          <CheckCircle className={`w-5 h-5 mx-auto ${j === 2 ? "text-green-600" : "text-gray-400"}`} />
                        ) : (
                          <XCircle className="w-5 h-5 mx-auto text-red-200" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{t("about.team.title")}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{t("about.team.subtitle")}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
            {members.map((m, i) => {
              const Icon = roleIcons[i] || Award;
              const initials = m.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  custom={i}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:shadow-md transition-shadow hover:-translate-y-0.5 duration-200"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-md`}>
                    {initials}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{m.name}</h3>
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    <Icon className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-gray-500">{m.role}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-6 text-center"
          >
            <GraduationCap className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <p className="font-semibold text-gray-800 text-sm">{t("about.team.supervisor")}</p>
            <p className="text-gray-600 text-sm mt-1">{t("about.team.institution")}</p>
            <p className="text-gray-400 text-xs mt-2">{t("about.team.year")}</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
