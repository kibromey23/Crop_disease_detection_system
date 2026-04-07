// src/pages/FarmPage.jsx v10 — per-user storage, premium limit, full i18n
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

const CROP_ICONS = {
  Tomato:"🍅",Corn:"🌽",Apple:"🍎",Grape:"🍇",Potato:"🥔",
  Pepper:"🫑",Peach:"🍑",Strawberry:"🍓",Squash:"🎃",
  Orange:"🍊",Blueberry:"🫐",Cherry:"🍒",Raspberry:"🍇",Soybean:"🌱",Other:"🌾",
};
const STAGES       = ["Seedling","Vegetative","Flowering","Fruiting","Harvest","Dormant"];
const STAGE_COLORS = ["var(--blue)","var(--green)","var(--purple)","var(--amber-text)","var(--green)","var(--text3)"];
const EMPTY        = { id:null, name:"", crop:"Tomato", area:"", stage:"Vegetative", notes:"" };

export default function FarmPage({ nav, t }) {
  const { isPremium } = useAuth();
  const maxFarms = isPremium ? 10 : 2;
  const farmsKey = `cg_farms_${useAuth().user?.id||"local"}`;
  function getFarms(){try{return JSON.parse(localStorage.getItem(farmsKey)||"[]");}catch{return[];}}
  function saveFarms(f){localStorage.setItem(farmsKey,JSON.stringify(f));}
  const [farms,   setFarms]   = useState(() => getFarms());
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const toast = useToast();

  useEffect(() => { saveFarms(farms); }, [farms]);

  function openNew() {
    if (!isPremium && farms.length >= maxFarms) {
      toast(t("farm_premium_limit"), "warning"); return;
    }
    setEditing({...EMPTY}); setForm(true);
  }

  function save(f) {
    if (f.id) {
      setFarms(p => p.map(x => x.id===f.id ? f : x));
      toast(t("farm_updated"), "success");
    } else {
      setFarms(p => [...p, {...f, id:Date.now(), lastScanned:null}]);
      toast(t("farm_saved"), "success");
    }
    setForm(false); setEditing(null);
  }

  function remove(id) {
    setDeleteModal(id);
  }

  function confirmDelete(id) {
    setFarms(p => p.filter(f => f.id!==id));
    setDeleteModal(null);
    toast(t("farm_deleted"), "info");
  }

  return (
    <div className="page-anim">
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10 }}>
        <p style={{ fontSize:13,color:"var(--text2)" }}>{t("farm_sub")}</p>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          {!isPremium && (
            <span className="badge badge-amber">{farms.length}/{maxFarms} farms</span>
          )}
          <button className="btn btn-primary" onClick={openNew}>+ {t("farm_add")}</button>
        </div>
      </div>

      {/* Premium limit banner */}
      {!isPremium && farms.length >= maxFarms && (
        <div className="upgrade-banner" style={{ marginBottom:18 }} onClick={() => nav("pricing")}>
          <span style={{fontSize:20}}>🌾</span>
          <div className="upgrade-banner-text">
            <div className="upgrade-banner-title">{t("farm_premium_limit")}</div>
          </div>
          <span style={{ fontSize:12,color:"var(--gold)",fontWeight:700 }}>{t("go_premium")}</span>
        </div>
      )}

      {farms.length === 0 ? (
        <div className="empty-state" style={{paddingTop:60}}>
          <span className="empty-icon">🌾</span>
          <div className="empty-title">{t("farm_empty_title")}</div>
          <div className="empty-sub">{t("farm_empty_sub")}</div>
          <button className="btn btn-primary" style={{marginTop:16}} onClick={openNew}>
            + {t("farm_add_first")}
          </button>
        </div>
      ) : (
        <div className="farm-grid">
          {farms.map(farm => {
            const stageIdx   = STAGES.indexOf(farm.stage);
            const stageColor = STAGE_COLORS[stageIdx] || "var(--text3)";
            const icon       = CROP_ICONS[farm.crop] || "🌾";
            return (
              <div key={farm.id} className="farm-card">
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                  <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                    <div style={{ width:42,height:42,borderRadius:11,background:"var(--green-glow2)",border:"1px solid var(--green-dim)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontFamily:"var(--fh)",fontSize:14,fontWeight:700,color:"var(--text1)" }}>
                        {farm.name || t("farm_name_ph").split("e.g.").pop().trim()}
                      </div>
                      <div style={{ fontSize:11.5,color:"var(--text3)" }}>
                        {farm.crop}{farm.area ? ` · ${farm.area}` : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex",gap:5 }}>
                    <button onClick={() => { setEditing(farm); setForm(true); }}
                      style={{ fontSize:13,color:"var(--text3)",background:"none",border:"none",cursor:"pointer",padding:"3px 5px" }}>✏</button>
                    <button onClick={() => remove(farm.id)}
                      style={{ fontSize:13,color:"var(--red-text)",background:"none",border:"none",cursor:"pointer",padding:"3px 5px" }}>✕</button>
                  </div>
                </div>

                {/* Growth stage bar */}
                <div>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:5 }}>
                    <span style={{ color:"var(--text3)" }}>{t("farm_stage")}</span>
                    <span style={{ color:stageColor,fontWeight:600 }}>{t(`stage_${farm.stage.toLowerCase()}`) || farm.stage}</span>
                  </div>
                  <div style={{ display:"flex",gap:3 }}>
                    {STAGES.map((s,i) => (
                      <div key={s} style={{ flex:1,height:4,borderRadius:3,
                        background:i<=stageIdx?stageColor:"var(--bg4)",transition:"background .3s" }}/>
                    ))}
                  </div>
                </div>

                {farm.notes && (
                  <div style={{ fontSize:12,color:"var(--text2)",background:"var(--bg2)",borderRadius:8,padding:"8px 10px",lineHeight:1.55 }}>
                    {farm.notes}
                  </div>
                )}

                <div style={{ display:"flex",gap:8,paddingTop:4,borderTop:"1px solid var(--border)",marginTop:"auto" }}>
                  <button className="btn btn-primary btn-sm btn-full" onClick={() => nav("detect")}>
                    📷 {t("farm_scan_btn")}
                  </button>
                  <div style={{ fontSize:10,color:"var(--text3)",display:"flex",alignItems:"center",flexShrink:0,whiteSpace:"nowrap" }}>
                    {farm.lastScanned || t("farm_not_scanned")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit modal */}
      {form && editing && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)",z:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease",zIndex:700 }}>
          <div style={{ background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:20,padding:28,width:"100%",maxWidth:440,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.5)" }}>
            <div style={{ fontFamily:"var(--fh)",fontSize:17,fontWeight:800,color:"var(--text1)",marginBottom:20 }}>
              {editing.id ? t("farm_edit") : t("farm_add")}
            </div>

            {/* Text fields */}
            {[
              { key:"name", label:t("farm_name"), ph:t("farm_name_ph") },
              { key:"area", label:t("farm_area"), ph:t("farm_area_ph") },
              { key:"notes",label:t("farm_notes"),ph:t("farm_notes_ph") },
            ].map(({ key,label,ph }) => (
              <div key={key} style={{ marginBottom:14 }}>
                <label className="form-label">{label}</label>
                {key === "notes" ? (
                  <textarea className="form-textarea" value={editing[key]} placeholder={ph}
                    onChange={e => setEditing(p=>({...p,[key]:e.target.value}))}/>
                ) : (
                  <input className="form-input" value={editing[key]} placeholder={ph}
                    onChange={e => setEditing(p=>({...p,[key]:e.target.value}))}/>
                )}
              </div>
            ))}

            {/* Crop type */}
            <div style={{ marginBottom:14 }}>
              <label className="form-label">{t("farm_crop")}</label>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {Object.entries(CROP_ICONS).map(([crop,icon]) => (
                  <button key={crop} onClick={() => setEditing(p=>({...p,crop}))} style={{
                    padding:"6px 11px",borderRadius:20,
                    border:`1.5px solid ${editing.crop===crop?"var(--green)":"var(--border)"}`,
                    background:editing.crop===crop?"var(--green-glow2)":"var(--bg2)",
                    color:editing.crop===crop?"var(--green)":"var(--text2)",
                    cursor:"pointer",fontSize:12,fontWeight:500,transition:"all .15s",
                    fontFamily:"var(--fb)",
                  }}>{icon} {crop}</button>
                ))}
              </div>
            </div>

            {/* Growth stage */}
            <div style={{ marginBottom:22 }}>
              <label className="form-label">{t("farm_stage")}</label>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                {STAGES.map((s,i) => (
                  <button key={s} onClick={() => setEditing(p=>({...p,stage:s}))} style={{
                    padding:"6px 12px",borderRadius:20,
                    border:`1.5px solid ${editing.stage===s?STAGE_COLORS[i]:"var(--border)"}`,
                    background:editing.stage===s?`${STAGE_COLORS[i]}18`:"var(--bg2)",
                    color:editing.stage===s?STAGE_COLORS[i]:"var(--text2)",
                    cursor:"pointer",fontSize:12,fontWeight:500,transition:"all .15s",
                    fontFamily:"var(--fb)",
                  }}>{t(`stage_${s.toLowerCase()}`) || s}</button>
                ))}
              </div>
            </div>

            <div style={{ display:"flex",gap:9 }}>
              <button className="btn btn-ghost btn-full"
                onClick={() => { setForm(false); setEditing(null); }}>{t("farm_cancel")}</button>
              <button className="btn btn-primary btn-full" onClick={() => save(editing)}>
                {editing.id ? t("farm_save") : t("farm_add")}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal !== null && (
        <ConfirmModal
          title={t("farm_delete_confirm").replace("?","")}
          message="This will permanently remove the field and all associated data."
          confirmLabel={t("farm_delete")}
          cancelLabel={t("farm_cancel")}
          danger={true}
          onConfirm={() => confirmDelete(deleteModal)}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
}
