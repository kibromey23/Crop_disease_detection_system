// src/pages/EncyclopediaPage.jsx — fully localised (en / am / ti)
import { useState, useMemo } from "react";

// ── Helper: pick localised field ────────────────────────────────────────────
function L(d, field, lang) {
  return (lang && lang !== "en" && d[`${field}_${lang}`]) || d[field];
}

// ── Disease database with Amharic (am) and Tigrinya (ti) translations ───────
const DISEASES = [
  { id:"apple_scab", crop:"Apple", icon:"🍎", name:"Apple Scab", severity:"Medium", type:"Fungal",
    scientific:"Venturia inaequalis",
    symptoms:"Olive-green to brown scab-like lesions on leaves and fruit. Leaves curl and drop early.",
    cause:"Fungal spores spread by rain during cool, wet spring weather.",
    treatment:"Apply Captan or Mancozeb at green tip stage. Remove fallen infected leaves. Prune for air circulation.",
    prevention:"Plant resistant varieties. Rake and destroy fallen leaves in autumn. Avoid overhead irrigation.",
    symptoms_am:"በቅጠሎቹና ፍሬዎቹ ላይ ወይታ-አረንጓዴ እስከ ቡናማ ቀለም ያለው ሸካራ ቁስለት። ቅጠሎቹ ጠምዝዘው ቀድሞ ይረግፋሉ።",
    cause_am:"ቀዝቃዛ እርጥብ የፀደይ ወቅት ዝናብ የሚያሰራጭ የፈንጋስ ስፖሮች።",
    treatment_am:"ቅጠሉ ከቡቃያ ወጭ ሲሆን ካፕታን ወይም ማንኮዘብ ይርጩ። የወደቁ የተበከሉ ቅጠሎችን ያስወግዱ። አየር ዝውውር ለማሻሻል ይቁረጡ።",
    prevention_am:"ለበሽታ ጠንካሮቹን ዝርያዎች ይትከሉ። በልቅሶ ወቅት የወደቁ ቅጠሎችን ሰብስበው ያስወግዱ። ከላይ ውሃ ማጠጣት ያስወግዱ።",
    symptoms_ti:"ኣብ ቆጽልን ፍርያትን ዝሊ-ቱ-ዝሊ ዝሓሸበ ናይ ዒዳ ቁስለታት። ቆጽሊ ዝምጸጸ ቀዲሙ ይወድቕ።",
    cause_ti:"ኣብ ርጥብ ቀዝቃዝ ናይ ጸደቅ ኩነታት ዝናም ዝሰራጭ ናይ ፈንጋስ ስፖሮ።",
    treatment_ti:"ቆጽሊ ካብ ቡቃያ ምስ ወጸ ካፕታን ወይ ማንኮዘብ ስርጩ። ዝወደቑ ዝሓመሙ ቆጽሊ ኣርሑቕ። ናይ ኣየር ዝውውር ንምምሕያሽ ቁረጹ።",
    prevention_ti:"ነቲ ሕማም ዝቕኑዕ ዝርያ ኣትኽሉ። ኣብ ምልቃሕ ዝወደቑ ቆጽሊ ኣኺልኩም ኣርሑቕ። ካብ ላዕሊ ምጥሓን ጥቀሙ ኣወግዱ።" },

  { id:"apple_blackrot", crop:"Apple", icon:"🍎", name:"Apple Black Rot", severity:"High", type:"Fungal",
    scientific:"Botryosphaeria obtusa",
    symptoms:"Brown leaf lesions with purple borders. Fruit rots and turns black. Cankers on branches.",
    cause:"Fungal infection entering through wounds after hail or insect damage.",
    treatment:"Prune infected cankers and mummified fruit. Apply Captan or Thiophanate-methyl. Remove all infected material.",
    prevention:"Avoid wounding trees. Remove dead wood promptly. Keep orchard clean of mummified fruit.",
    symptoms_am:"ሐምራዊ ዳርቻ ያለው ቡናማ ቅጠል ቁስለት። ፍሬ ይበሰብሳል ጥቁር ይሆናል። በቅርንጫፎቹ ላይ ቁስለት።",
    cause_am:"በበረዶ ወይም ነፍሳት ጉዳት ወዲያ ቁስሎች ውስጥ የሚገባ የፈንጋስ ኢንፌክሽን።",
    treatment_am:"የተያዙ ቁስሎቹን እና የደረቁ ፍሬዎቹን ይቁረጡ። ካፕታን ወይም ቲዮፋኔት-ሜቲል ይተግብሩ።",
    prevention_am:"ዛፎቹን ቁስለት ያስወግዱ። የሞቱ ቅርንጫፎችን ቶሎ ያስወግዱ። የደረቁ ፍሬዎች ከጓሮው ያስወግዱ።",
    symptoms_ti:"ሐምራዊ ዳርቻ ዝሓዘ ቡናዊ ቁስለት ቆጽሊ። ፍሪ ይበሰብስ ጸሊም ይኸውን። ኣብ ቀናን ቁስለታት።",
    cause_ti:"ብዝናብ ቋሕ ወይ ኣንሸለት ጉዳት ዝፍጠሩ ቁስሎ ኣቢሉ ዝኣቱ ናይ ፈንጋስ ምልካፍ።",
    treatment_ti:"ዝሓመሙ ቁስሎን ዝደርቑ ፍርያትን ቁረጹ። ካፕታን ወይ ቲዮፋኔት-ሜቲል ተጠቀሙ።",
    prevention_ti:"ኦም ካብ ምቁሳል ኣወግዱ። ዝሞቱ ቀናን ቀልጢፍኩም ኣርሑቕ። ዝደርቁ ፍርያት ካብ ቦስታ ኣርሑቕ።" },

  { id:"apple_rust", crop:"Apple", icon:"🍎", name:"Cedar Apple Rust", severity:"Medium", type:"Fungal",
    scientific:"Gymnosporangium juniperi-virginianae",
    symptoms:"Bright orange-yellow spots on upper leaf surface. Small tubes growing on leaf undersides.",
    cause:"Requires both apple and cedar/juniper trees to complete its life cycle.",
    treatment:"Apply myclobutanil or propiconazole fungicide from pink bud stage.",
    prevention:"Plant rust-resistant apple varieties. Avoid planting near juniper or cedar trees.",
    symptoms_am:"በቅጠሉ ላይ ብሩህ ብርቱካናማ-ቢጫ ነጠላ ቀለሞች። ከቅጠሉ ስር ትናናሽ ቱቦዎች ያድጋሉ።",
    cause_am:"የዑደቱን ሕይወት ለማጠናቀቅ ሁለቱም አፕልና ሳዊር/ጁኒፐር ዛፎች ያስፈልጋሉ።",
    treatment_am:"ከሮዝ ቡቃያ ደረጃ ጀምሮ ማይክሎቡታኒል ወይም ፕሮፒኮናዞል ፈንጋሳይድ ይተግብሩ።",
    prevention_am:"ዝገት-ጠንካሮቹን የአፕል ዝርያ ይትከሉ። ከጁኒፐር ወይም ሳዊር ዛፎች አጠገብ መትከልን ያስወግዱ።",
    symptoms_ti:"ኣብ ጎቦ ቆጽሊ ብሩህ ብርቱካናዊ-ቢጫ ነጥቢ። ካብ ትሕቲ ቆጽሊ ዝዓብዩ ጸቢብ ትዑቢ ቱቦ።",
    cause_ti:"ናይ ሂወቱ ዑደት ንምፍጻም ክልቲኡ ፖም ን ሳዊር/ጁኒፐር ዛፍ ይሓትት።",
    treatment_ti:"ካብ ሮዝ-ቡቃያ ደረጃ ጀሚርካ ማይክሎቡታኒል ወይ ፕሮፒኮናዞል ፈንጋሳይድ ተጠቀሙ።",
    prevention_ti:"ዝተቓወምዎ ዝርያ ፖም ኣትኽሉ። ካብ ጁኒፐር ወይ ሳዊር ዛፍ ቀረባ ምትካል ኣወግዱ።" },

  { id:"corn_gls", crop:"Maize", icon:"🌽", name:"Gray Leaf Spot", severity:"High", type:"Fungal",
    scientific:"Cercospora zeae-maydis",
    symptoms:"Rectangular gray to tan lesions with yellow borders running parallel to leaf veins.",
    cause:"Fungal spores thrive in warm, humid conditions with heavy dew. Worsened by dense planting.",
    treatment:"Apply Azoxystrobin or Propiconazole at early signs. Use resistant hybrids.",
    prevention:"Rotate crops. Bury crop residue after harvest. Ensure good plant spacing.",
    symptoms_am:"ከቅጠሉ ደም ወሳጅ ጋር ትይዩ ሚሮ ያለው ቢጫ ዳርቻ ያለው አራት ቅርፅ ያለው ግራጫ ቁስለት።",
    cause_am:"ሞቃት እርጥብ አካባቢ ከባድ ጠሉ ውስጥ ፈንጋስ ስፖሮ ይበቅላሉ። ጥቅጥቅ ዝርያ ሲትከሉ ያባብሳሉ።",
    treatment_am:"ቀደምት ምልክቶች ሲታዩ አዞክሲስትሮቢን ወይም ፕሮፒኮናዞል ይርጩ። ጠንካሮቹን ዝርያ ይጠቀሙ።",
    prevention_am:"ሰብሎቹን ያሽከርክሩ። ከመሰብሰብ በኋላ ቅሪቶቹን ይቅበሩ። ጥሩ ክፍተት ያረጋግጡ።",
    symptoms_ti:"ምስ ደም ሮጢ ቆጽሊ ሰረዝ-ሰረዝ ዝሮጽ ቢጫ ዳርቻ ዝሓዘ ኦርቶጎናዊ ግራጫ ቁስለት።",
    cause_ti:"ሙቀት ዘለዎ ርጥብ ፅዮ ዘለዎ ኣብ ፈንጋስ ስፖሮ ይበቍሉ። ጽቡቕ ምትካል ምስ ዝሓሸ ይብስ።",
    treatment_ti:"ቀዳምቲ ምልክታት ምስ ዘርኣዩ አዞክሲስትሮቢን ወይ ፕሮፒኮናዞል ስርጩ። ዝቓወምዎ ዝርያ ተጠቀሙ።",
    prevention_ti:"ሰብሎ ሽዉሃ። ምስቆ ምስ ተወደኤ ቅሪቶ ቅበሩ። ጽቡቕ ናይ ተኽሊ ፍሕ ኣረጋግጹ።" },

  { id:"corn_rust", crop:"Maize", icon:"🌽", name:"Common Rust", severity:"Medium", type:"Fungal",
    scientific:"Puccinia sorghi",
    symptoms:"Small powdery brick-red pustules on both sides of leaves. Pustules turn dark brown with age.",
    cause:"Wind-blown spores. Favoured by cool, moist conditions.",
    treatment:"Apply Mancozeb or Chlorothalonil if infection is severe. Plant resistant hybrids.",
    prevention:"Plant early-maturing resistant varieties. Monitor fields during cool wet periods.",
    symptoms_am:"በቅጠሉ ሁለቱም ክፍሎች ትናናሽ ዱቄት ዝቅ-ቀይ ስባሪ ቁስሎቹ። ቁስሎቹ እየጠቆሩ ቡናማ ይሆናሉ።",
    cause_am:"ንፋስ ዘሰራጨው ስፖሮ። ቀዝቃዛ እርጥብ ሁኔታ ይወዳሉ።",
    treatment_am:"ኢንፌክሽኑ ከባድ ከሆነ ማንኮዘብ ወይም ክሎሮታሎኒል ይርጩ። ጠንካሮቹን ዝርያ ይትከሉ።",
    prevention_am:"ቶሎ የሚደርሱ ጠንካሮቹን ዝርያ ይትከሉ። ቀዝቃዛ እርጥብ ወቅት ሜዳዎቹን ይፈትሹ።",
    symptoms_ti:"ኣብ ክልቲኡ ወገን ቆጽሊ ዝርኤ ቀሺ-ቀይሕ ዝዙረጽ ቁስሎ። ቁስሎ ምስ ዕድሚኡ ጸሊም ቡናዊ ይኸውን።",
    cause_ti:"ብንፋስ ዝሰርጽ ስፖሮ። ቀዝቃዝ ርጥብ ምቅዝቃዝ ይፈቱ።",
    treatment_ti:"ምልካፍ ከቢድ ምስ ዝኸውን ማንኮዘብ ወይ ክሎሮታሎኒል ስርጩ። ዝቓወምዎ ዝርያ ኣትኽሉ።",
    prevention_ti:"ቀልጢፉ ዝዓብዩ ዝቓወምዎ ዝርያ ኣትኽሉ። ቀዝቃዝ ርጥብ ጊዜ ሜዳ ፈትሹ።" },

  { id:"corn_nlb", crop:"Maize", icon:"🌽", name:"Northern Leaf Blight", severity:"High", type:"Fungal",
    scientific:"Exserohilum turcicum",
    symptoms:"Long cigar-shaped gray-green to tan lesions (5–15 cm) on leaves with wavy edges.",
    cause:"Fungal infection in cool, moist weather. Spreads from infected crop residue.",
    treatment:"Apply Mancozeb or Azoxystrobin. Remove infected crop residue after harvest.",
    prevention:"Practice crop rotation. Use resistant hybrids. Bury infected residue.",
    symptoms_am:"በቅጠሎቹ ሲጋራ ቅርፅ ያለው ግራጫ-አረንጓዴ እስከ ቡናማ ቁስለት (5–15 ሴ.ሜ) ሞገዳዊ ጠርዝ ይዞ።",
    cause_am:"ቀዝቃዛ እርጥብ የአየር ሁኔታ ፈንጋስ ኢንፌክሽን። ከተበከለ ቅሪት ሰብሎ ይሰራጫሉ።",
    treatment_am:"ማንኮዘብ ወይም አዞክሲስትሮቢን ይርጩ። ከሰብሳቢ በኋላ ቅሪቶቹን ያስወግዱ።",
    prevention_am:"ሰብሎ ዝውዝወት ያድርጉ። ጠንካሮቹን ዝርያ ይጠቀሙ። የተበከሉ ቅሪቶቹን ቅበሩ።",
    symptoms_ti:"ኣብ ቆጽሊ ናይ ሽጋራ ቅርጺ ዝሓዘ ግራጫ-ቱ-ቡናዊ ቁስለት (5–15 ሴ.ሜ) ዝሓወሱ ኣጻምሮ ዘለዎ።",
    cause_ti:"ቀዝቃዝ ርጥብ ኩነታት ናይ ፈንጋስ ምልካፍ። ካብ ዝሓመመ ናይ ሰብሎ ቅሪቶ ይሰርጽ።",
    treatment_ti:"ማንኮዘብ ወይ አዞክሲስትሮቢን ስርጩ። ምስቆ ምስ ተወደኤ ቅሪቶ ኣርሑቕ።",
    prevention_ti:"ናይ ሰብሎ ሽዉሃ ምዝዋር ዕቀቡ። ዝቓወምዎ ዝርያ ተጠቀሙ። ዝሓመሙ ቅሪቶ ቅበሩ።" },

  { id:"grape_blackrot", crop:"Grape", icon:"🍇", name:"Grape Black Rot", severity:"High", type:"Fungal",
    scientific:"Guignardia bidwellii",
    symptoms:"Tan lesions with dark borders on leaves. Berries shrivel into hard black mummies.",
    cause:"Fungal spores released during wet weather from infected mummies and canes.",
    treatment:"Apply Mancozeb or Myclobutanil from bud break through harvest. Remove mummies.",
    prevention:"Remove mummified berries. Ensure good canopy management and air flow.",
    symptoms_am:"ጨለ ዳርቻ ያለው ቡናዊ ቅጠል ቁስለት። ወይን ፍሬዎች ጠንካሮቹ ጥቁር ሙሚ ሆነው ይቀሩ።",
    cause_am:"ዝናባማ ወቅት ከተበከሉ ሙሚዎቹና ቅርንጫፎቹ ከሚወጡ የፈንጋስ ስፖሮ።",
    treatment_am:"ቡቃያ ሲያቆጠቁጥ ጀምሮ ሲሰበሰብ ድረስ ማንኮዘብ ወይም ማይክሎቡታኒል ይርጩ። ሙሚዎቹን ያስወግዱ።",
    prevention_am:"የደረቁ ፍሬዎቹን ያስወግዱ። ጥሩ የዘውድ አስተዳደርና አየር ዝውውር ያረጋግጡ።",
    symptoms_ti:"ጸሊም ዳርቻ ዝሓዘ ቡናዊ ቁስለት ቆጽሊ። ወይኒ ጽፉፍ ጸሊም ሙሚ ኮይኑ ይተርፍ።",
    cause_ti:"ዝናባዊ ጊዜ ካብ ዝሓመሙ ሙሚን ቀናን ዝወጽእ ናይ ፈንጋስ ስፖሮ።",
    treatment_ti:"ቡቃያ ጀሚሩ ምስቆ ሓሊፉ ማንኮዘብ ወይ ማይክሎቡታኒል ስርጩ። ሙሚ ኣርሑቕ።",
    prevention_ti:"ዝደርቁ ፍርያት ኣርሑቕ። ጽቡቕ ናይ ጽላሎ ምምሕዳርን ናይ ኣየር ዝውውርን ኣረጋግጹ።" },

  { id:"grape_esca", crop:"Grape", icon:"🍇", name:"Grape Esca", severity:"High", type:"Fungal",
    scientific:"Phaeomoniella chlamydospora",
    symptoms:"Tiger-stripe pattern of yellow and brown on leaves. Sudden vine collapse in summer.",
    cause:"Fungal complex entering through pruning wounds.",
    treatment:"No effective cure. Remove and destroy severely infected vines. Protect pruning wounds with fungicide paste.",
    prevention:"Prune during dry weather. Apply wound sealant immediately after pruning.",
    symptoms_am:"ቅጠሎቹ ላይ ነብር-ጭረት ቢጫ እና ቡናማ ንድፍ። በበጋ ወቅት ዘሎ ሞቅ ድንገተኛ ሞት።",
    cause_am:"ከቁረጣ ቁስሎቹ ሚወጡ ዘሩ ናብ ውስጥ ፈንጋስ ስብስብ።",
    treatment_am:"ውጤታማ መፍትሔ የለም። በጣም የተበከሉ ቅርንጫፎቹን ያስወግዱ። ቁረጣ ቁስሎቹን በፈንጋሳይድ ቅባት ይጠብቁ።",
    prevention_am:"ደረቅ ወቅት ይቁረጡ። ወዲያ ቁስሉ ዘጋ ቅባት ይተግብሩ።",
    symptoms_ti:"ኣብ ቆጽሊ ናብ ናምር ዝቃዕዩ ቢጫን ቡናዊን ስርዓት። ኣብ ክረምቲ ዘሎ ሕምብርቲ ሽምሹ ምስቃጥ።",
    cause_ti:"ካብ ናይ ቁርጺ ቁስሎ ዝኣቱ ናይ ፈንጋስ ስብስብ።",
    treatment_ti:"ዝሰርሕ ፍወሳ የለን። ዝሓመሙ ሓምዛት ኣርሑቕ። ናይ ቁርጺ ቁስሎ ብናይ ፈንጋሳይድ ሽሮ ሓሉ።",
    prevention_ti:"ኣብ ጸቕጢ ጊዜ ቁረጹ። ምስ ቁርጺ ወዲኣ ቁስሊ ዘጋ ሽሮ ተጠቀሙ።" },

  { id:"grape_leafblight", crop:"Grape", icon:"🍇", name:"Grape Leaf Blight", severity:"Medium", type:"Fungal",
    scientific:"Isariopsis clavispora",
    symptoms:"Brown irregular spots on leaves. Leaves dry up and fall early, affecting yield.",
    cause:"Fungal infection in wet, humid conditions with poor air circulation.",
    treatment:"Apply copper-based fungicide or Mancozeb. Remove infected leaves promptly.",
    prevention:"Improve air circulation through canopy management. Avoid wetting foliage.",
    symptoms_am:"ቅጠሎቹ ላይ ቡናዊ ቅርፅ የሌለው ነጠባጠብ ቁስለቶቹ። ቅጠሎቹ ቀደም ሲሉ ይደርቃሉ ይረግፋሉ።",
    cause_am:"ደካማ አየር ዝውውር ባለው እርጥብ ሁኔታ ፈንጋስ ኢንፌክሽን።",
    treatment_am:"ኩፐር ፈንጋሳይድ ወይም ማንኮዘብ ይርጩ። የተበከሉ ቅጠሎቹን ቶሎ ያስወግዱ።",
    prevention_am:"ዘውድ አስተዳደር ሊሻሻሉ። ቅጠሎቹን ማርጠብ ያስወግዱ።",
    symptoms_ti:"ኣብ ቆጽሊ ብዘይ ቅርጺ ቡናዊ ነጥቢ ቁስለታት። ቆጽሊ ቀዲሙ ይደርቅ ይወድቕ።",
    cause_ti:"ደካሚ ናይ ኣየር ዝውውር ዘለዎ ርጥብ ኩነታት ናይ ፈንጋስ ምልካፍ።",
    treatment_ti:"ናይ ኩፐር ፈንጋሳይድ ወይ ማንኮዘብ ስርጩ። ዝሓመሙ ቆጽሊ ቀልጢፍኩም ኣርሑቕ።",
    prevention_ti:"ብናይ ጽላሎ ምምሕዳር ናይ ኣየር ዝውውር ምሕያሽ። ቆጽሊ ምርጣብ ኣወግዱ።" },

  { id:"tomato_bacterial", crop:"Tomato", icon:"🍅", name:"Bacterial Spot", severity:"Medium", type:"Bacterial",
    scientific:"Xanthomonas vesicatoria",
    symptoms:"Small water-soaked spots turning brown with yellow halos on leaves. Scabby spots on fruit.",
    cause:"Bacterial infection spread by rain splash and contaminated tools or transplants.",
    treatment:"Apply copper-based bactericide. Remove infected leaves. Avoid overhead irrigation.",
    prevention:"Use certified disease-free transplants. Avoid working with wet plants.",
    symptoms_am:"ቅጠሎቹ ላይ ቢጫ ዑደት ያለው ቡናዊ ትናናሽ ቦታዎቹ ፍሬዎቹ ላይ ሸካሮቹ ቦታዎቹ አሉ።",
    cause_am:"ዝናብ ርጭት እና ናቀቀ መሳሪያ ወይም ችግኞቹ አማካኝነት ባክቴሪያ ምሰርጭት።",
    treatment_am:"ኩፐር ባክቴሪሳይድ ይተግብሩ። ቀደም ሲሉ ያስወግዱ። ከላይ ማጠጣት ያስወግዱ።",
    prevention_am:"ምስከሩ ተሰናጠቆ ነፃ ችግኞቹን ይጠቀሙ። እርጥብ ተክሎቹን ሲሠሩ ያስወግዱ።",
    symptoms_ti:"ቆጽሊ ቢጫ ዑደት ዝሓዘ ቡናዊ ንእሽቶ ነጥቢ ቦታ። ፍርያት ሸካሮ ቦታ ኣለዎ።",
    cause_ti:"ብዝናብ ርጭት ወይ ዝናቀቐ ሜርጊ ወይ ሕምብርቲ ዝሰርጽ ናይ ባክቴሪያ ምልካፍ።",
    treatment_ti:"ናይ ኩፐር ባክቴሪሳይድ ተጠቀሙ። ዝሓመሙ ቆጽሊ ኣርሑቕ። ካብ ላዕሊ ምጥሓን ኣወግዱ።",
    prevention_ti:"ዝተረጋገጸ ካብ ሕማም ናጻ ሕምብርቲ ተጠቀሙ። ርጥብ ተኽሊ ምስ ሰርሕ ኣወግዱ።" },

  { id:"tomato_early", crop:"Tomato", icon:"🍅", name:"Early Blight", severity:"Medium", type:"Fungal",
    scientific:"Alternaria solani",
    symptoms:"Dark brown target-ring spots on lower leaves. Yellow halo surrounds spots. Leaves drop early.",
    cause:"Soil-borne fungus splashed onto leaves by rain. Worse in warm, wet weather.",
    treatment:"Apply Chlorothalonil or Mancozeb. Remove lower infected leaves. Stake plants for air circulation.",
    prevention:"Rotate crops. Mulch around base to prevent soil splash. Avoid overhead watering.",
    symptoms_am:"ታችኛ ቅጠሎቹ ላይ ጥቁር ቡናዊ ዒላማ ቀለበት ቁስለቶቹ። ቢጫ ዑደት ቁስሉ ዙሪያ ይደበበ። ቅጠሎቹ ቀደም ሲሉ ይረግፋሉ።",
    cause_am:"ዝናብ ቅጠሎቹ ላይ የሚርጨው ከአፈሩ ፈንጋስ። ሞቃት እርጥብ የአየር ሁኔታ ያባብሳሉ።",
    treatment_am:"ክሎሮታሎኒል ወይም ማንኮዘብ ይርጩ። ታች ያሉ ያለው ቅጠሎቹን ያስወግዱ። አየር ዝውውር ለማሻሻሉ ቁልቁሉ ያስሩ።",
    prevention_am:"ሰብሎ ያሽከርክሩ። ዝናብ ርጭት ለመከላከሉ ሥሩ ዙሪያ ቅሪቶ ይጣሉ። ከላዕሊ ማጠጣት ያስወግዱ።",
    symptoms_ti:"ኣብ ታሕቲ ቆጽሊ ጸሊም ቡናዊ ዒላማ-ቀለበት ቁስለታት። ቢጫ ዑደት ቁስሊ ዙሪያ ይፋሕ። ቆጽሊ ቀዲሙ ይወድቕ።",
    cause_ti:"ዝናብ ናብ ቆጽሊ ዝናፍሶ ካብ ሓመድ ናይ ፈንጋስ። ሙቀት ርጥብ ኩነታት ይባስ።",
    treatment_ti:"ክሎሮታሎኒል ወይ ማንኮዘብ ስርጩ። ታሕቲ ዝሓመሙ ቆጽሊ ኣርሑቕ። ናይ ኣየር ዝውውር ን ቋዓ ኣቁሙ።",
    prevention_ti:"ሰብሎ ሽዉሃ። ናይ ዝናብ ርጭት ንምክልኻል ጎቦ ቅሪቶ ድርቡ። ካብ ላዕሊ ምጥሓን ኣወግዱ።" },

  { id:"tomato_late", crop:"Tomato", icon:"🍅", name:"Late Blight", severity:"High", type:"Fungal",
    scientific:"Phytophthora infestans",
    symptoms:"Water-soaked gray-green lesions turning brown. White mold on leaf undersides. Fruit rots rapidly.",
    cause:"Spreads extremely fast in cool, wet, humid conditions. Can destroy a crop within days.",
    treatment:"⚠️ Act immediately — apply Mancozeb or Cymoxanil. Remove all infected plant parts.",
    prevention:"Avoid wetting foliage. Use resistant varieties. Ensure good ventilation.",
    symptoms_am:"ቡናዊ የሚሆን ውሃ-ቅዱ ግራጫ-አረንጓዴ ቁስለቶቹ። ቅጠሉ ስር ነጭ ፈንጋስ። ፍሬ ፈጠን ብሎ ይበሰብሳሉ።",
    cause_am:"ቀዝቃዛ እርጥብ ሁኔታ ውስጥ ፈጠን ብሎ ይሰራጫሉ። ሰብሎቹን ቀናቶቹ ውስጥ ሊያጠፋ ይችሉ።",
    treatment_am:"⚠️ ወዲያ ይሠሩ — ማንኮዘብ ወይም ሲሞክሳኒል ይርጩ። ሁሉም የተበከሉ ቅጠሎቹን ያስወግዱ።",
    prevention_am:"ቅጠሎቹን ማርጠብ ያስወግዱ። ጠንካሮቹን ዝርያ ይጠቀሙ። ጥሩ ዝውውር ያረጋግጡ።",
    symptoms_ti:"ቡናዊ ዝኸውን ማያዊ-ቁዑ ግራጫ-ቱ-ቆጽሊ ቁስለታት። ካብ ትሕቲ ቆጽሊ ጻዕዳ ፈንጋስ። ፍሪ ቀልጢፉ ይበሰብስ።",
    cause_ti:"ቀዝቃዝ ርጥብ ኩነታት ፈጺሙ ቀልጢፉ ይሰርጽ። ሰብሎ ኣብ ቀናት ሓጺር ጊዜ ክጠፍእ ይኽእል።",
    treatment_ti:"⚠️ ወዲኡ ሰርሑ — ማንኮዘብ ወይ ሲሞክሳኒል ስርጩ። ኩሎም ዝሓመሙ ቅጽሊ ኣርሑቕ።",
    prevention_ti:"ቆጽሊ ምርጣብ ኣወግዱ። ዝቓወምዎ ዝርያ ተጠቀሙ። ጽቡቕ ናይ ኣየር ዝውውር ኣረጋግጹ።" },

  { id:"tomato_leafmold", crop:"Tomato", icon:"🍅", name:"Leaf Mold", severity:"Medium", type:"Fungal",
    scientific:"Fulvia fulva",
    symptoms:"Yellow patches on upper leaf surface. Olive-green fuzzy mold on leaf underside.",
    cause:"High humidity and poor air circulation. Very common in greenhouses.",
    treatment:"Improve ventilation. Apply Chlorothalonil or copper fungicide. Avoid wetting leaves.",
    prevention:"Space plants well. Use resistant varieties. Keep humidity below 85%.",
    symptoms_am:"ቅጠሉ ላይ ቢጫ ነጠባጠብ። ቅጠሉ ስር ወይታ-አረንጓዴ ለስጣ ፈንጋስ።",
    cause_am:"ከፍተኛ እርጥበት ደካማ አየር ዝውውር። ግሪን ሃውስ ውስጥ የተለመደ።",
    treatment_am:"አየር ዝውውር ያሻሽሉ። ክሎሮታሎኒል ወይም ኩፐር ፈንጋሳይድ ይርጩ። ቅጠሎቹን ማርጠብ ያስወግዱ።",
    prevention_am:"ተክሎቹን ጥሩ ክፍተት ይሰጡ። ጠንካሮቹን ዝርያ ይጠቀሙ። እርጥበቱ ከ85% ማሕዘን ያቆዩ።",
    symptoms_ti:"ኣብ ጎቦ ቆጽሊ ቢጫ ምዕባለ ቦታ። ካብ ትሕቲ ቆጽሊ ወይታ-ቱ ለስጣ ፈንጋስ።",
    cause_ti:"ልዑል ርጥበት ደካሚ ናይ ኣየር ዝውውር። ኣብ ናይ ድኹዕ ግሪን ሃውስ ልሙድ።",
    treatment_ti:"ናይ ኣየር ዝውውር ምሕያሽ። ክሎሮታሎኒል ወይ ናይ ኩፐር ፈንጋሳይድ ስርጩ። ቆጽሊ ምርጣብ ኣወግዱ።",
    prevention_ti:"ተኽሊ ጽቡቕ ፍሕ ሃቡ። ዝቓወምዎ ዝርያ ተጠቀሙ። ርጥበት ካብ 85% ትሕቲ ሓሉ።" },

  { id:"tomato_septoria", crop:"Tomato", icon:"🍅", name:"Septoria Leaf Spot", severity:"Medium", type:"Fungal",
    scientific:"Septoria lycopersici",
    symptoms:"Many small circular spots with dark borders and light gray centers. Tiny black dots inside spots.",
    cause:"Fungal spores splashed from soil. Spreads rapidly in warm, wet weather.",
    treatment:"Apply Chlorothalonil or Mancozeb. Remove and destroy infected leaves.",
    prevention:"Mulch soil surface. Avoid overhead irrigation. Rotate crops annually.",
    symptoms_am:"ጨለ ዳርቻ ቀለል ያለ ግራጫ ማዕከን ያለው ብዙ ትናናሽ ክብ ቁስለቶቹ። ቁስሎቹ ውስጥ ትናናሽ ጥቁር ነጠቦቹ።",
    cause_am:"ዝናብ ከአፈሩ የሚርጨው የፈንጋስ ስፖሮ። ሞቃት እርጥብ የአየር ሁኔታ ፈጠን ብሎ ይሰራጭ።",
    treatment_am:"ክሎሮታሎኒል ወይም ማንኮዘብ ይርጩ። ያለው ቅጠሎቹን ሰብስቡ ያስወግዱ።",
    prevention_am:"ሥሩ አፈሩ ቅሪቶ ይጣሉ። ከላዕሊ ማጠጣት ያስወግዱ። ዓመታዊ ሰብሎ ያሽከርክሩ።",
    symptoms_ti:"ጸሊም ዳርቻ ቀለል ዝበለ ግራጫ ማእከል ዝሓዘ ብዙሕ ንእሽቶ ክቡ ቁስለታት። ኣብ ቁስሊ ዝሳዊ ጸሊም ነጥቢ።",
    cause_ti:"ዝናብ ካብ ሓመድ ዝናፍሶ ናይ ፈንጋስ ስፖሮ። ሙቀት ርጥብ ኩነታት ቀልጢፉ ይሰርጽ።",
    treatment_ti:"ክሎሮታሎኒል ወይ ማንኮዘብ ስርጩ። ዝሓመሙ ቆጽሊ ኣኺልኩም ኣርሑቕ።",
    prevention_ti:"ናይ ሓመድ ጎቦ ቅሪቶ ድርቡ። ካብ ላዕሊ ምጥሓን ኣወግዱ። ዓምዊ ሰብሎ ሽዉሃ።" },

  { id:"tomato_mites", crop:"Tomato", icon:"🍅", name:"Spider Mites", severity:"Medium", type:"Pest",
    scientific:"Tetranychus urticae",
    symptoms:"Tiny yellow or white speckles on leaves. Fine webbing on leaf undersides. Leaves dry and curl.",
    cause:"Hot, dry conditions. Dust and drought stress increase infestations significantly.",
    treatment:"Apply Abamectin or Bifenazate miticide. Use neem oil as an organic option. Increase humidity.",
    prevention:"Keep plants well-watered. Introduce predatory mites. Avoid dusty conditions.",
    symptoms_am:"ቅጠሎቹ ላይ ትናናሽ ቢጫ ወይም ነጭ ነጠቦቹ። ቅጠሉ ስር ዝርዘር ድር ጥቃጥቅ። ቅጠሎቹ ይደርቃሉ ይጠምዛሉ።",
    cause_am:"ሙቀት ደረቅ ሁኔታ። አቧራ ድርቅ ጫና ወረርሽኝ ይጨምሩ።",
    treatment_am:"አባሜክቲን ወይም ቢፌናዜት ማይቲሳይድ ይርጩ። ኦርጋኒክ አማራጭ ኒም ዘይት ይጠቀሙ። እርጥበቱ ይጨምሩ።",
    prevention_am:"ተክሎቹን ጥሩ ያጠጡ። አዳኝ ሚቶቹን ያስገቡ። ዱቄታማ ሁኔታ ያስወግዱ።",
    symptoms_ti:"ኣብ ቆጽሊ ንእሽቶ ቢጫ ወይ ጻዕዳ ነጥቢ። ካብ ትሕቲ ቆጽሊ ሓሪሩ ዝቁምቀምዎ ድርዕ። ቆጽሊ ይደርቅ ይጸምጸም።",
    cause_ti:"ሙቀት ዘለዎ ደረቅ ኩነታት። ትካእ ድርቅ ጫና ወረርሽኝ ይውስኽ።",
    treatment_ti:"አባሜክቲን ወይ ቢፌናዜት ማይቲሳይድ ስርጩ። ዘይቲ ኒም ኦርጋኒካዊ ኣማራጺ ተጠቀሙ። ርጥበት ዕቀቡ።",
    prevention_ti:"ተኽሊ ጽቡቕ ኣጥሕኑ። ዓዳዋይ ሚት ኣምጽኡ። ትካእ ዝሕዝ ኩነታት ኣወግዱ።" },

  { id:"tomato_target", crop:"Tomato", icon:"🍅", name:"Target Spot", severity:"Medium", type:"Fungal",
    scientific:"Corynespora cassiicola",
    symptoms:"Brown circular spots with concentric rings on leaves and fruit. Premature leaf drop.",
    cause:"Fungal infection in warm, humid conditions with prolonged leaf wetness.",
    treatment:"Apply Chlorothalonil or Azoxystrobin. Remove heavily infected leaves.",
    prevention:"Improve air circulation through staking and pruning. Avoid overhead irrigation.",
    symptoms_am:"ቅጠሎቹና ፍሬዎቹ ላይ ቡናዊ ክብ ቁስሎቹ ስርዓተ ክብ ቀለበቶቹ ይዘው። ቅጠሎቹ ቀድሞ ይረግፋሉ።",
    cause_am:"ሞቃት እርጥብ ሁኔታ ቅጠሉ ለረጅም ጊዜ ሲርጥብ ፈንጋስ ኢንፌክሽን።",
    treatment_am:"ክሎሮታሎኒል ወይም አዞክሲስትሮቢን ይርጩ። በጣም የተበከሉ ቅጠሎቹን ያስወግዱ።",
    prevention_am:"ቁልቁሉ ማሰርና ቁረጣ አማካኝነት አየር ዝውውር ያሻሽሉ። ከላዕሊ ማጠጣት ያስወግዱ።",
    symptoms_ti:"ኣብ ቆጽሊን ፍርያትን ቡናዊ ሰርዓዊ ዑደት ዝሓዘ ክቡ ቁስለታት። ቆጽሊ ቀዲሙ ምልቃሕ።",
    cause_ti:"ሙቀት ዘለዎ ርጥብ ኩነታት ቆጽሊ ነዊሕ ጊዜ ርጥብ ምስ ዝኸውን ናይ ፈንጋስ ምልካፍ።",
    treatment_ti:"ክሎሮታሎኒል ወይ አዞክሲስትሮቢን ስርጩ። ብዙሕ ዝሓመሙ ቆጽሊ ኣርሑቕ።",
    prevention_ti:"ብምቓሙን ምቕራጽን ናይ ኣየር ዝውውር ምሕያሽ። ካብ ላዕሊ ምጥሓን ኣወግዱ።" },

  { id:"tomato_ylcv", crop:"Tomato", icon:"🍅", name:"Yellow Leaf Curl Virus", severity:"High", type:"Viral",
    scientific:"TYLCV (Begomovirus)",
    symptoms:"Upward curling and yellowing of leaves. Stunted growth. Flowers drop without fruiting.",
    cause:"Transmitted by whiteflies. Cannot spread plant-to-plant without the insect vector.",
    treatment:"No cure. Remove and destroy infected plants immediately. Control whitefly with sticky traps.",
    prevention:"Use TYLCV-resistant varieties. Install insect-proof mesh. Monitor for whiteflies regularly.",
    symptoms_am:"ቅጠሎቹ ወደ ላይ ጠምዝዘው ይቀጣሉ። ዕድገቱ ያዝ። አበቦቹ ፍሬ ሳያፈሩ ይረግፋሉ።",
    cause_am:"ነጭ ዝንብ ያሰራጨዋቸው። ያለ ነፍሳቱ ቬክተር ከተክሉ ወደ ተክሉ ሊሰራጭ አይችልም።",
    treatment_am:"ፈውስ የለም። የተበከሉ ተክሎቹን ወዲያ ያስወግዱ። ነጭ ዝንብ ወጥ ወጥ አቸርቃቾቹ ቁጥጥር ያድርጉ።",
    prevention_am:"ቫይረሱ-ጠንካሮቹን ዝርያ ይጠቀሙ። ነፍሳት-ጠርሴ አውታር ይጫኑ። ነጭ ዝንብ በቋሚ ይፈትሹ።",
    symptoms_ti:"ቆጽሊ ናብ ላዕሊ ዝጽምጸሙ ቢጫ ዝኸዉኑ። ዕቤቱ ጠጠው ይብሉ። ዕምባባ ፍሪ ሳይኾን ይወድቕ።",
    cause_ti:"ብጻዕዳ ዝምባ ዝሰርጽ። ብዘይ ናይ ነፍሳ ቬክተር ካብ ተኽሊ ናብ ተኽሊ ክሰርጽ ኣይኽእልን።",
    treatment_ti:"ፍወሳ የለን። ዝሓመሙ ተኽሊ ወዲኡ ኣርሑቕ። ጻዕዳ ዝምባ ብነቀዝ ወጥ ቁጽጽሩ።",
    prevention_ti:"ቫይረሱ ዝቓወምዎ ዝርያ ተጠቀሙ። ናይ ነፍሳ-ጠርሴ ኣውታር ኣቐምጡ። ጻዕዳ ዝምባ ቀዋሚ ፈትሹ።" },

  { id:"tomato_mosaic", crop:"Tomato", icon:"🍅", name:"Tomato Mosaic Virus", severity:"High", type:"Viral",
    scientific:"Tomato mosaic virus (ToMV)",
    symptoms:"Mottled light and dark green mosaic pattern on leaves. Distorted, fern-like new growth.",
    cause:"Highly contagious virus spread by touch, tools, and infected transplants.",
    treatment:"No cure. Remove infected plants. Disinfect tools with 10% bleach solution.",
    prevention:"Use resistant varieties. Wash hands before handling plants. Use certified transplants.",
    symptoms_am:"ቅጠሎቹ ላይ ቀለቅለው ነጭ-ጨለ አረንጓዴ ሞዛይክ ስዕል። ዝርዝር-ዝርዝር አዲስ ቅጠሎቹ ቅርፅ ያልናቸው።",
    cause_am:"ነካካ መሳሪያ ወይም ተበከሉ ችግኞቹ አማካኝነት ፈጠን ብሎ ሊሰርጭ ቫይረስ።",
    treatment_am:"ፈውስ የለም። ያለው ተክሎቹን ያስወግዱ። 10% ብሊቺ ሶሌሽን አናካቢ ሰርቶ ያርጡ።",
    prevention_am:"ጠንካሮቹን ዝርያ ይጠቀሙ። ቀደም ሲሉ ተክሎቹን ሲዳሱ እጅ ይታጠቡ። ምስከሩ ችግኞቹን ይጠቀሙ።",
    symptoms_ti:"ቆጽሊ ቀልቂሉ ቀሊልን ጸሊምን ናይ ሞዛይክ ስዕሊ። ዝተሰናኸለ ናይ ዳዊን ዝኸሊ ሓድሽ ምዕባለ።",
    cause_ti:"ብምትንካፍ ሜርጊ ወይ ዝሓመሙ ሕምብርቲ ዝሰርጽ ዝቀጽዕ ቫይረስ።",
    treatment_ti:"ፍወሳ የለን። ዝሓመሙ ተኽሊ ኣርሑቕ። 10% ብሊቺ ብምስታው ሜርጊ ኣጽርዩ።",
    prevention_ti:"ዝቓወምዎ ዝርያ ተጠቀሙ። ቀደም ስሉ ተኽሊ ትትንክፉ እዱ ምሕጻብ። ዝተረጋገጸ ሕምብርቲ ተጠቀሙ።" },

  { id:"potato_early", crop:"Potato", icon:"🥔", name:"Early Blight", severity:"Medium", type:"Fungal",
    scientific:"Alternaria solani",
    symptoms:"Dark brown target-ring spots on older lower leaves. Yellow tissue surrounds spots.",
    cause:"Soil-borne fungus splashed onto leaves. Worse in warm, wet weather.",
    treatment:"Apply Chlorothalonil or Mancozeb. Remove infected lower leaves. Ensure adequate potassium.",
    prevention:"Rotate crops. Mulch to reduce soil splash. Avoid drought stress.",
    symptoms_am:"ቀደምት ታችኛ ቅጠሎቹ ላይ ጥቁር ቡናዊ ዒላማ-ቀለበት ቁስሎቹ። ቢጫ ቲሹ ቁስሉ ዙሪያ ይደበበ።",
    cause_am:"ዝናብ ቅጠሎቹ ላይ ዘሩ ካብ አፈሩ ፈንጋስ። ሞቃት እርጥብ ሁኔታ ያባብሳሉ።",
    treatment_am:"ክሎሮታሎኒል ወይም ማንኮዘብ ይርጩ። ታች የሚበከሉ ቅጠሎቹን ያስወግዱ። በቂ ፖታሲየም ያረጋግጡ።",
    prevention_am:"ሰብሎ ያሽከርክሩ። ዝናብ ርጭት ለቁቤር ቅሪቶ ይጣሉ። ድርቅ ጫና ያስወግዱ።",
    symptoms_ti:"ቀደምቲ ታሕቲ ቆጽሊ ዘለዋ ጸሊም ቡናዊ ዒላማ-ቀለበት ቁስለታት። ቢጫ ቲሹ ቁስሊ ዙሪያ ይፋሕ።",
    cause_ti:"ዝናብ ናብ ቆጽሊ ዝናፍሶ ካብ ሓመድ ፈንጋስ። ሙቀት ርጥብ ኩነታት ይባስ።",
    treatment_ti:"ክሎሮታሎኒል ወይ ማንኮዘብ ስርጩ። ዝሓመሙ ታሕቲ ቆጽሊ ኣርሑቕ። ዉሑዳት ፖታሲየም ኣረጋግጹ።",
    prevention_ti:"ሰብሎ ሽዉሃ። ናይ ዝናብ ርጭት ንምቕናሽ ቅሪቶ ድርቡ። ናይ ድርቅ ጫና ኣወግዱ።" },

  { id:"potato_late", crop:"Potato", icon:"🥔", name:"Late Blight", severity:"High", type:"Fungal",
    scientific:"Phytophthora infestans",
    symptoms:"Water-soaked lesions on leaves and stems turning brown-black. White mold in humid conditions.",
    cause:"Spreads extremely rapidly in cool, wet weather. The same pathogen that caused the Irish Famine.",
    treatment:"⚠️ Apply Mancozeb or Cymoxanil immediately. Remove all infected material.",
    prevention:"Avoid overhead irrigation. Use resistant varieties. Scout fields regularly.",
    symptoms_am:"ቅጠሎቹና ቅርንጫፎቹ ላይ ቡናዊ-ጸሊም ወደሚሆን ፈሰሰ ቁስሎቹ። ርጥብ ሁኔታ ነጭ ፈንጋስ።",
    cause_am:"ቀዝቃዛ እርጥብ ሁኔታ ፈጠን ብሎ ይሰራጭ። አይሪሽ ቀውስ ያስከተለው ተመሳሳይ ወባ።",
    treatment_am:"⚠️ ወዲያ ማንኮዘብ ወይም ሲሞክሳኒል ይርጩ። ሁሉም የተበከሉ ቅጠሎቹን ያስወግዱ።",
    prevention_am:"ከላዕሊ ማጠጣት ያስወግዱ። ጠንካሮቹን ዝርያ ይጠቀሙ። ሜዳዎቹን ቀዋሚ ይፈትሹ።",
    symptoms_ti:"ኣብ ቆጽሊን ጨናፍርን ቡናዊ-ጸሊም ዝኸውን ማያዊ ቁስለታት። ርጥብ ኩነታት ጻዕዳ ፈንጋስ።",
    cause_ti:"ቀዝቃዝ ርጥብ ኩነታት ፈጺሙ ቀልጢፉ ይሰርጽ። ናይ ኢርላንዳዊ ቀውሲ ዝፈጸሞ ሓበቲ ወባ።",
    treatment_ti:"⚠️ ወዲኡ ማንኮዘብ ወይ ሲሞክሳኒል ስርጩ። ኩሎም ዝሓመሙ ቆጽሊ ኣርሑቕ።",
    prevention_ti:"ካብ ላዕሊ ምጥሓን ኣወግዱ። ዝቓወምዎ ዝርያ ተጠቀሙ። ሜዳ ቀዋሚ ፈትሹ።" },

  { id:"wheat_leaf_rust", crop:"Wheat", icon:"🌾", name:"Leaf Rust", severity:"High", type:"Fungal",
    scientific:"Puccinia triticina",
    symptoms:"Small round orange-brown pustules on upper leaf surface. Leaves yellow and die early.",
    cause:"Wind-blown spores. Favoured by moderate temperatures and high humidity.",
    treatment:"Apply Propiconazole or Tebuconazole at first signs. Use certified clean seed.",
    prevention:"Plant resistant varieties. Monitor fields from tillering stage onwards.",
    symptoms_am:"ቅጠሉ ላይ ትናናሽ ክብ ብርቱካናዊ-ቡናዊ ስባሪ ቁስሎቹ። ቅጠሎቹ ቀጣሉ ቀድሞ ይሞታሉ።",
    cause_am:"ንፋስ ዘሰራጨው ስፖሮ። ሞቅ ያለ ሙቀት ከፍተኛ እርጥበት ዘወቅ ይወዳሉ።",
    treatment_am:"ቀደምት ምልክቶቹ ሲያዩ ፕሮፒኮናዞል ወይም ቴቡኮናዞል ይርጩ። ምስከሩ ዘር ይጠቀሙ።",
    prevention_am:"ጠንካሮቹን ዝርያ ይትከሉ። ቅርጽ ደረጃ ጀምሮ ሜዳዎቹን ይፈትሹ።",
    symptoms_ti:"ኣብ ጎቦ ቆጽሊ ንእሽቶ ክቡ ብርቱካናዊ-ቡናዊ ቁስሎ። ቆጽሊ ቢጫ ኮይኑ ቀዲሙ ይሞቱ።",
    cause_ti:"ብንፋስ ዝሰርጽ ስፖሮ። ምቁር ሙቀትን ልዑል ርጥበትን ይፈቱ።",
    treatment_ti:"ቀዳምቲ ምልክታት ምስ ዘርኣዩ ፕሮፒኮናዞል ወይ ቴቡኮናዞል ስርጩ። ዝተረጋገጸ ዘሪ ተጠቀሙ።",
    prevention_ti:"ዝቓወምዎ ዝርያ ኣትኽሉ። ካብ ናይ ቅርጺ ደረጃ ጀሚርካ ሜዳ ፈትሹ።" },

  { id:"wheat_stem_rust", crop:"Wheat", icon:"🌾", name:"Stem Rust", severity:"High", type:"Fungal",
    scientific:"Puccinia graminis",
    symptoms:"Brick-red elongated pustules on stems and leaves. Stems weaken and break easily.",
    cause:"Wind-blown spores. Warm, humid conditions. Can travel thousands of kilometers.",
    treatment:"Apply Propiconazole or Trifloxystrobin immediately. Quarantine affected fields.",
    prevention:"Use Ug99-resistant varieties. Early sowing to avoid peak rust season.",
    symptoms_am:"ቅርንጫፎቹና ቅጠሎቹ ላይ ቀይ-ጡቦ ቀለም ርዝማኔ ያለው ስባሪ ቁስሎቹ። ቅርንጫፎቹ ያዝ ብሎ ቶሎ ይሰብሩ።",
    cause_am:"ንፋስ ዘሰራጨው ስፖሮ። ሞቃት እርጥብ ሁኔታ። ሺዎቹ ኪሎሜትሮቹ ሊዘዋወር ይችሉ።",
    treatment_am:"ፕሮፒኮናዞል ወይም ትሪፍሎክሲስትሮቢን ወዲያ ይርጩ። የተሰጠ ሜዳዎቹን ቅዋሜ ያደርጉ።",
    prevention_am:"Ug99-ጠንካሮቹን ዝርያ ይጠቀሙ። ዝገት ጫፍ ወቅቱ ሳይደርስ ቀደም ይዘሩ።",
    symptoms_ti:"ኣብ ቀናን ቆጽሊን ቀይሕ-ጡቦ ቀለም ዝርዝር ዝሓዘ ቁስሎ። ቀናን ደካሚ ኮይኖም ቀልጢፎም ይስበሩ።",
    cause_ti:"ብንፋስ ዝሰርጽ ስፖሮ። ሙቀት ርጥብ ኩነታት። ሺሕ ኪሎሜትር ክኸዱ ይኽእሉ።",
    treatment_ti:"ፕሮፒኮናዞል ወይ ትሪፍሎክሲስትሮቢን ወዲኡ ስርጩ። ዝሓመሙ ሜዳ ምፍላይ ዕቀቡ።",
    prevention_ti:"Ug99-ዝቓወምዎ ዝርያ ተጠቀሙ። ቀዳማይ ምዝራእ ናይ ዝገት ጫፍ ወቅቲ ንምሕላፍ።" },

  { id:"wheat_yellow_rust", crop:"Wheat", icon:"🌾", name:"Yellow (Stripe) Rust", severity:"High", type:"Fungal",
    scientific:"Puccinia striiformis",
    symptoms:"Yellow pustules arranged in stripes along leaf veins. Leaves turn yellow then die.",
    cause:"Cool temperatures (10–15°C) and high humidity. Spreads rapidly in highland areas.",
    treatment:"Apply Propiconazole or Tebuconazole at first signs. Early treatment is critical.",
    prevention:"Plant resistant varieties. Monitor highland fields closely in cool seasons.",
    symptoms_am:"ቅጠሉ ደም ወሳጅ ጋር ስርዓተ ቢጫ ስባሪ ቁስሎቹ። ቅጠሎቹ ቢጫ ሆነው ይሞታሉ።",
    cause_am:"ቀዝቃዛ ሙቀት (10–15°ሴ) ከፍተኛ እርጥበት። ወደ ደጋ አካባቢ ፈጠን ብሎ ይሰራጭ።",
    treatment_am:"ቀደምት ምልክቶቹ ሲያዩ ፕሮፒኮናዞል ወይም ቴቡኮናዞል ይርጩ። ቶሎ ህክምናው ወሳኝ ነው።",
    prevention_am:"ጠንካሮቹን ዝርያ ይትከሉ። ቀዝቃዛ ወቅቶቹ ደጋ ሜዳዎቹን ቅርብ ይፈትሹ።",
    symptoms_ti:"ምስ ደም ሮጢ ቆጽሊ ሰረዝ-ሰረዝ ዝሰርዑ ቢጫ ቁስሎ። ቆጽሊ ቢጫ ኮይኑ ይሞቱ።",
    cause_ti:"ቀዝቃዝ ሙቀት (10–15°ሴ) ልዑል ርጥበት። ኣብ ደጋ ዓዲ ቀልጢፉ ይሰርጽ።",
    treatment_ti:"ቀዳምቲ ምልክታት ምስ ዘርኣዩ ፕሮፒኮናዞል ወይ ቴቡኮናዞል ስርጩ። ቀዳማይ ህክምና ወሳኒ ኢዩ።",
    prevention_ti:"ዝቓወምዎ ዝርያ ኣትኽሉ። ቀዝቃዝ ወቅቲ ናይ ደጋ ሜዳ ቀሪቡ ፈትሹ።" },

  { id:"orange_hlb", crop:"Orange", icon:"🍊", name:"Citrus Greening (HLB)", severity:"High", type:"Bacterial",
    scientific:"Candidatus Liberibacter",
    symptoms:"Yellow mottling of leaves. Fruit stays partially green. Small, bitter, lopsided fruit.",
    cause:"Transmitted by the Asian citrus psyllid insect. No cure once infected.",
    treatment:"No cure. Remove and destroy infected trees immediately to prevent spread.",
    prevention:"Control psyllid vector with insecticides. Plant certified disease-free trees only.",
    symptoms_am:"ቅጠሎቹ ቢጫ ቀልቅሎ። ፍሬ ከፊሉ አረንጓዴ ሆኖ ይቀራሉ። ትናናሽ ምሬት ዘርፍ ፍሬዎቹ።",
    cause_am:"የእስያ ሲትረስ ሳይሊድ ነፍሳ ያሰሩ። አንዴ ምስ ተሸካሙ ፈውስ የለም።",
    treatment_am:"ፈውስ የለም። ወዲያ ያለው ዛፎቹን ያስወግዱ ወረርሽኝን ይከላከሉ።",
    prevention_am:"ሳይሊድ ቬክተር በፀረ-ነፍሳ ቁጥጥር ያድርጉ። ምስከሩ ዛፎቹን ብቻ ይትከሉ።",
    symptoms_ti:"ቆጽሊ ቢጫ ቀልቂሉ። ፍሪ ንሓሸፋ ቱ-ቀጽሊ ቢጫ ይቐርብ። ንእሽቶ ምሬት ዘርፍ ፍርያት።",
    cause_ti:"ናይ ኤዥያ ሲትረስ ሳይሊድ ነፍሳ ዝሰርጸሉ። ሓጺ ምስ ተሸካሙ ፍወሳ የለን።",
    treatment_ti:"ፍወሳ የለን። ወዲኡ ዛፍ ኣርሑቕ ወረርሽኝ ሓሉ።",
    prevention_ti:"ናይ ሳይሊድ ቬክተር ብፀረ-ነፍሳ ቁጽጽር ግበሩ። ዝተረጋገጸ ዛፍ ጥራሕ ኣትኽሉ።" },

  { id:"peach_bacterial", crop:"Peach", icon:"🍑", name:"Bacterial Spot", severity:"Medium", type:"Bacterial",
    scientific:"Xanthomonas arboricola",
    symptoms:"Small water-soaked spots on leaves turning brown with yellow halos. Lesions on fruit surface.",
    cause:"Bacterial infection spread by rain splash. Worse in warm, wet, windy conditions.",
    treatment:"Apply copper-based bactericide in autumn and spring. Avoid overhead irrigation.",
    prevention:"Choose resistant varieties. Remove infected twigs during dry weather.",
    symptoms_am:"ቅጠሎቹ ላይ ቢጫ ዑደት ያለው ቡናዊ ትናናሽ ፈሰሰ ቁስሎቹ። ፍሬ ላይ ቁስሎቹ።",
    cause_am:"ዝናብ ርጭት ዘሰራጨው ባክቴሪያ ኢንፌክሽን። ሞቃት እርጥብ ንፋሳማ ሁኔታ ያባብሳሉ።",
    treatment_am:"ልቅሶና ፀደይ ኩፐር ባክቴሪሳይድ ይርጩ። ከላዕሊ ማጠጣት ያስወግዱ።",
    prevention_am:"ጠንካሮቹን ዝርያ ይምረጡ። ደረቅ ወቅቶቹ ያለው ቅርንጫፎቹን ያስወግዱ።",
    symptoms_ti:"ቆጽሊ ቢጫ ዑደት ዝሓዘ ቡናዊ ንእሽቶ ማያዊ ቁስለታት። ፍሪ ጎቦ ቁስለታት።",
    cause_ti:"ብዝናብ ርጭት ዝሰርጽ ናይ ባክቴሪያ ምልካፍ። ሙቀት ርጥብ ንፋሳዊ ኩነታት ይባስ።",
    treatment_ti:"ምልቃሕን ጸደቅን ናይ ኩፐር ባክቴሪሳይድ ስርጩ። ካብ ላዕሊ ምጥሓን ኣወግዱ።",
    prevention_ti:"ዝቓወምዎ ዝርያ ምረጹ። ደረቅ ጊዜ ዝሓመሙ ቀናን ኣርሑቕ።" },

  { id:"strawberry_scorch", crop:"Strawberry", icon:"🍓", name:"Leaf Scorch", severity:"Medium", type:"Fungal",
    scientific:"Diplocarpon earlianum",
    symptoms:"Small dark purple spots on upper leaf surface. Spots enlarge, leaves turn brown and die.",
    cause:"Fungal infection. Favoured by warm, moist conditions and overhead irrigation.",
    treatment:"Apply Captan or Myclobutanil. Remove infected leaves. Ensure good drainage.",
    prevention:"Avoid overhead irrigation. Ensure good air circulation. Remove old leaves after harvest.",
    symptoms_am:"ቅጠሉ ላይ ትናናሽ ጨለ ሐምራዊ ቁስሎቹ። ቁስሎቹ እያሰፉ ቅጠሎቹ ቡናዊ ሆነው ይሞታሉ።",
    cause_am:"ፈንጋስ ኢንፌክሽን። ሞቃት እርጥብ ሁኔታ ከላዕሊ ማጠጣት ዘወቅ ይወዳሉ።",
    treatment_am:"ካፕታን ወይም ማይክሎቡታኒል ይርጩ። ያሉ ቅጠሎቹን ያስወግዱ። ጥሩ ፍሰት ያረጋግጡ።",
    prevention_am:"ከላዕሊ ማጠጣት ያስወግዱ። ጥሩ አየር ዝውውር ያረጋግጡ። ሰብሳቢ ቀደምቲ ቅጠሎቹን ያስወግዱ።",
    symptoms_ti:"ኣብ ጎቦ ቆጽሊ ንእሽቶ ጸሊም ሐምራዊ ቁስለታት። ቁስሎ እናዓበዩ ቆጽሊ ቡናዊ ኮይኖም ይሞቱ።",
    cause_ti:"ናይ ፈንጋስ ምልካፍ። ሙቀት ርጥብ ኩነታት ካብ ላዕሊ ምጥሓን ይፈቱ።",
    treatment_ti:"ካፕታን ወይ ማይክሎቡታኒል ስርጩ። ዝሓመሙ ቆጽሊ ኣርሑቕ። ጽቡቕ ናይ ዝናብ ፍሰት ኣረጋግጹ።",
    prevention_ti:"ካብ ላዕሊ ምጥሓን ኣወግዱ። ጽቡቕ ናይ ኣየር ዝውውር ኣረጋግጹ። ምስ ምስቆ ቀደምቲ ቆጽሊ ኣርሑቕ።" },
];

// ── Severity colour mapping ───────────────────────────────────────────────
const SEV_STYLE = {
  High:   { badge:"badge-red",   boxClass:"enc-box amber" },
  Medium: { badge:"badge-amber", boxClass:"enc-box amber" },
  Low:    { badge:"badge-green", boxClass:"enc-box green" },
};

const TYPE_COLOR = {
  Fungal:    "var(--purple-text)",
  Bacterial: "var(--blue-text)",
  Viral:     "var(--red-text)",
  Pest:      "var(--amber-text)",
};

const CROPS = ["All", ...Array.from(new Set(DISEASES.map(d => d.crop))).sort()];

export default function EncyclopediaPage({ t, settings }) {
  const [search,     setSearch]  = useState("");
  const [cropFilter, setCrop]    = useState("All");
  const [sevFilter,  setSev]     = useState("All");
  const [selected,   setSelected]= useState(DISEASES[0]);

  const lang = settings?.language || "en";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return DISEASES.filter(d => {
      const matchSearch = !q ||
        d.name.toLowerCase().includes(q)       ||
        d.crop.toLowerCase().includes(q)       ||
        d.scientific.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)       ||
        (L(d, "symptoms", lang) || "").toLowerCase().includes(q);
      const matchCrop = cropFilter === "All" || d.crop === cropFilter;
      const matchSev  = sevFilter  === "All" || d.severity === sevFilter;
      return matchSearch && matchCrop && matchSev;
    });
  }, [search, cropFilter, sevFilter, lang]);

  return (
    <div className="page-anim" style={{
      display:"grid", gridTemplateColumns:"300px 1fr",
      gap:14, height:"calc(100vh - 130px)", overflow:"hidden",
    }}>

      {/* ── LEFT: filters + scrollable list ──────────────────────── */}
      <div style={{ display:"flex", flexDirection:"column", gap:9, overflow:"hidden" }}>
        <div>
          <div className="topbar-title">{t("enc_title")}</div>
          <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{t("enc_sub")}</div>
        </div>

        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("enc_search")}/>
        </div>

        <div style={{ display:"flex", gap:6, flexWrap:"wrap", flexShrink:0 }}>
          <select className="form-select" value={cropFilter} onChange={e => setCrop(e.target.value)}
            style={{ flex:1, minWidth:80, fontSize:11.5, padding:"6px 28px 6px 10px" }}>
            <option value="All">{t("all_crops")}</option>
            {CROPS.slice(1).map(c => <option key={c}>{c}</option>)}
          </select>
          {["All","High","Medium","Low"].map(s => {
            const isActive = sevFilter === s;
            const cls      = s === "All" ? "badge-green" : SEV_STYLE[s]?.badge || "badge-green";
            return (
              <button key={s} onClick={() => setSev(s)} className={`badge ${isActive ? cls : ""}`}
                style={{
                  cursor:"pointer",
                  border:     isActive ? undefined : "1px solid var(--border)",
                  background: isActive ? undefined : "var(--bg3)",
                  color:      isActive ? undefined : "var(--text3)",
                  fontSize:11, padding:"4px 11px",
                }}>
                {s === "All" ? t("filter_all").split(" ")[0] : t(`enc_${s.toLowerCase()}`) || s}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize:11, color:"var(--text3)", flexShrink:0 }}>
          {filtered.length === 0
            ? t("no_disease_found")
            : `${filtered.length} ${filtered.length === 1 ? t("enc_high").toLowerCase() || "disease" : t("no_disease_found").replace("ምንም","").replace("ዝኾነ","").trim() || "diseases"}`}
        </div>

        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:5, paddingRight:3 }}>
          {filtered.map(d => (
            <button key={d.id} onClick={() => setSelected(d)}
              className={`enc-item${selected?.id === d.id ? " active" : ""}`}
              style={{
                width:"100%", textAlign:"left", border:"1px solid",
                borderColor: selected?.id === d.id ? "var(--green)" : "var(--border)",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                gap:8, flexShrink:0, background:"none", cursor:"pointer", fontFamily:"var(--fb)",
              }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0, flex:1 }}>
                <span style={{ fontSize:17, flexShrink:0 }}>{d.icon}</span>
                <div style={{ minWidth:0 }}>
                  <div className="enc-name" style={{ color: selected?.id === d.id ? "var(--green)" : "var(--text1)" }}>
                    {d.name}
                  </div>
                  <div className="enc-meta">
                    {d.crop}
                    <span style={{ margin:"0 4px", opacity:.35 }}>·</span>
                    <span style={{ color: TYPE_COLOR[d.type] || "var(--text3)" }}>
                      {t(`cause_${d.type.toLowerCase()}`) || d.type}
                    </span>
                  </div>
                </div>
              </div>
              <span className={`badge ${SEV_STYLE[d.severity]?.badge || "badge-green"}`}
                style={{ fontSize:10, padding:"2px 8px", flexShrink:0 }}>
                {t(`enc_${d.severity.toLowerCase()}`) || d.severity}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state" style={{ paddingTop:30 }}>
              <span className="empty-icon">🔬</span>
              <div className="empty-title">{t("no_disease_found")}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: detail panel ────────────────────────────────── */}
      {selected ? (
        <div className="enc-detail" style={{
          top:76, overflowY:"auto", maxHeight:"calc(100vh - 130px)",
          display:"flex", flexDirection:"column", gap:12,
        }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:13 }}>
            <span style={{ fontSize:40, lineHeight:1, flexShrink:0 }}>{selected.icon}</span>
            <div>
              <div className="enc-detail-title">{selected.name}</div>
              <div style={{ fontSize:11.5, color:"var(--text3)", fontStyle:"italic", marginBottom:10 }}>
                {selected.scientific}
              </div>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                <span className={`badge ${SEV_STYLE[selected.severity]?.badge || "badge-green"}`}>
                  {t(`enc_${selected.severity.toLowerCase()}`)} {t("severity").toLowerCase()}
                </span>
                <span className="badge badge-blue" style={{ color: TYPE_COLOR[selected.type] }}>
                  {t(`cause_${selected.type.toLowerCase()}`) || selected.type}
                </span>
                <span className="badge" style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text3)" }}>
                  {selected.crop}
                </span>
              </div>
            </div>
          </div>

          <div style={{ height:1, background:"var(--border)", flexShrink:0 }}/>

          <div className="enc-section">
            <div className="enc-section-label" style={{ color:"var(--blue-text)" }}>
              🔍 {t("symptoms")}
            </div>
            <div className="enc-section-value">{L(selected, "symptoms", lang)}</div>
          </div>

          <div className="enc-box amber">
            <div className="enc-box-label">⚠️ {t("cause")}</div>
            <div className="enc-section-value">{L(selected, "cause", lang)}</div>
          </div>

          <div className="enc-box green">
            <div className="enc-box-label">✅ {t("treatment")}</div>
            <div className="enc-section-value">{L(selected, "treatment", lang)}</div>
          </div>

          <div className="enc-section">
            <div className="enc-section-label" style={{ color:"var(--purple-text)" }}>
              🛡️ {t("prevention")}
            </div>
            <div className="enc-section-value">{L(selected, "prevention", lang)}</div>
          </div>
        </div>
      ) : (
        <div className="enc-detail" style={{
          display:"flex", alignItems:"center", justifyContent:"center",
          flexDirection:"column", gap:10, top:76,
        }}>
          <div className="empty-state">
            <span className="empty-icon">🌿</span>
            <div className="empty-title">{t("enc_search")}</div>
          </div>
        </div>
      )}
    </div>
  );
}
