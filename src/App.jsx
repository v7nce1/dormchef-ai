import { useState, useRef, useCallback, useEffect } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are DormChef AI, a fun cooking assistant for college students.
When given ingredients, generate EXACTLY 1-3 recipes as valid JSON array only (no markdown):
[{
  "name": "Recipe Name",
  "emoji": "🍳",
  "description": "One-sentence enticing description",
  "prepTime": "10 mins",
  "cookTime": "15 mins",
  "difficulty": "Easy",
  "costEstimate": "$2-4",
  "calories": 420,
  "healthTags": ["Brain food","Energy boost"],
  "dietTags": ["vegetarian"],
  "ingredients": ["ingredient 1"],
  "missingIngredients": ["missing item"],
  "substitutions": [{"missing":"item","sub":"alternative","reason":"cheaper/healthier"}],
  "steps": ["Step 1","Step 2"],
  "tips": "Pro tip here",
  "flavorPairings": ["sriracha","lime"],
  "cookingHack": "Quick hack for this recipe"
}]
Keep recipes dorm-friendly, cheap ($1-8), genuinely delicious. Be fun and encouraging!`;

const AVATARS = ["🧑‍🍳","👨‍🍳","👩‍🍳","🧑🏽‍🍳","👨🏿‍🍳","👩🏻‍🍳","🧑🏼‍🍳","👨🏾‍🍳"];
const BADGES = [
  { id:"first_cook", icon:"🍳", label:"First Cook", desc:"Made your first recipe" },
  { id:"snap_master", icon:"📸", label:"Snap Master", desc:"Scanned 5 fridges" },
  { id:"budget_boss", icon:"💸", label:"Budget Boss", desc:"Cooked 3 meals under $3" },
  { id:"social_chef", icon:"🎤", label:"Social Chef", desc:"Shared a recipe" },
  { id:"challenge_king", icon:"👑", label:"Challenge King", desc:"Won a challenge" },
  { id:"pantry_pro", icon:"🗄️", label:"Pantry Pro", desc:"Saved 10 pantry items" },
  { id:"streak_7", icon:"🔥", label:"7-Day Streak", desc:"Cooked 7 days in a row" },
  { id:"flavor_guru", icon:"🌶️", label:"Flavor Guru", desc:"Tried 10 different cuisines" },
];
const CHALLENGES = [
  { id:"3ing", icon:"🥉", title:"3-Ingredient Challenge", desc:"Make a meal with only 3 ingredients", points:50, deadline:"2d left" },
  { id:"10min", icon:"⚡", title:"10-Minute Dinner", desc:"Cook a full meal in under 10 minutes", points:75, deadline:"5d left" },
  { id:"budget5", icon:"💰", title:"$2 Meal Challenge", desc:"Feed yourself for under $2", points:100, deadline:"3d left" },
  { id:"ramen_remix", icon:"🍜", title:"Ramen Remix", desc:"Transform instant ramen into something gourmet", points:60, deadline:"1d left" },
];
const FEED_POSTS = [
  { id:1, user:"dormchef_maya", avatar:"👩🏻‍🍳", level:12, recipe:"Garlic Butter Ramen", emoji:"🍜", likes:47, comments:8, time:"2h ago", tags:["Energy boost"], img:"🍜" },
  { id:2, user:"noodle_king_93", avatar:"👨🏿‍🍳", level:7, recipe:"3-Ingredient Quesadilla", emoji:"🌮", likes:31, comments:4, time:"4h ago", tags:["Quick"], img:"🌮" },
  { id:3, user:"vegan_dorm_life", avatar:"🧑🏽‍🍳", level:15, recipe:"Microwave Mug Cake", emoji:"🎂", likes:89, comments:22, time:"6h ago", tags:["Brain food"], img:"🎂" },
  { id:4, user:"campus_foodie", avatar:"👨🏾‍🍳", level:4, recipe:"Egg Fried Rice", emoji:"🍚", likes:23, comments:3, time:"1d ago", tags:["Budget boss"], img:"🍚" },
];
const PANTRY_SUGGESTIONS = ["Eggs","Rice","Pasta","Butter","Garlic","Olive oil","Soy sauce","Hot sauce","Instant noodles","Canned beans","Frozen peas","Cheese","Onions","Potatoes","Bread","Peanut butter","Honey","Lemon","Salt","Black pepper"];

// ─── PLANS ────────────────────────────────────────────────────────────────────
const PLANS = {
  free: {
    id: "free", name: "Free", price: 0, period: "",
    color: "#907050", gradient: "linear-gradient(135deg,#3a3020,#2a2010)",
    badge: null, emoji: "🍳",
    scanLimit: 5,
    features: [
      { label: "5 recipe scans / month", included: true },
      { label: "Basic recipes", included: true },
      { label: "Community feed", included: true },
      { label: "Pantry manager", included: false },
      { label: "Recipe history & analytics", included: false },
      { label: "Premium recipes & meal plans", included: false },
      { label: "Calorie & macro tracking", included: false },
      { label: "AI weekly meal planner", included: false },
      { label: "Shopping list export", included: false },
      { label: "Exclusive challenge rewards", included: false },
      { label: "No ads", included: false },
    ],
  },
  plus: {
    id: "plus", name: "DormChef Plus", price: 5.99, period: "/mo",
    color: "#ff8c38", gradient: "linear-gradient(135deg,#ff7a20,#e55000)",
    badge: "MOST POPULAR", emoji: "🔥",
    scanLimit: Infinity,
    features: [
      { label: "Unlimited recipe scans", included: true },
      { label: "Premium recipes + meal plans", included: true },
      { label: "Full pantry manager", included: true },
      { label: "Recipe history & analytics", included: true },
      { label: "Community feed", included: true },
      { label: "No ads", included: true },
      { label: "AI weekly meal planner", included: false },
      { label: "Calorie & macro tracking", included: false },
      { label: "Shopping list export", included: false },
      { label: "Exclusive challenge rewards", included: false },
      { label: "Priority AI (faster)", included: false },
    ],
  },
  pro: {
    id: "pro", name: "DormChef Pro", price: 9.99, period: "/mo",
    color: "#ffcf5c", gradient: "linear-gradient(135deg,#ffcf5c,#ff8c38)",
    badge: "ALL-IN", emoji: "👑",
    scanLimit: Infinity,
    features: [
      { label: "Everything in Plus", included: true },
      { label: "AI weekly meal planner", included: true },
      { label: "Calorie & macro tracking", included: true },
      { label: "Shopping list export", included: true },
      { label: "Exclusive challenge rewards", included: true },
      { label: "Priority AI (faster responses)", included: true },
      { label: "Early access to new features", included: true },
      { label: "Discord community access", included: true },
    ],
  },
};

const canUseFeature = (user, feature) => {
  const plan = user?.plan || "free";
  const gates = {
    scan: plan !== "free" || (user?.stats?.scans || 0) < 5,
    pantry: plan !== "free",
    analytics: plan !== "free",
    mealPlan: plan === "pro",
    macros: plan === "pro",
    exportList: plan === "pro",
    exclusiveChallenges: plan === "pro",
    premiumRecipes: plan !== "free",
  };
  return gates[feature] ?? true;
};

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const loadState = async (key) => {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
};
const saveState = async (key, val) => {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function DormChef() {
  const [appScreen, setAppScreen] = useState("splash"); // splash|auth|main
  const [mainTab, setMainTab] = useState("home");
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [activeRecipe, setActiveRecipe] = useState(0);
  const [cookScreen, setCookScreen] = useState("home"); // home|input|analyzing|results|detail
  const [inputMode, setInputMode] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [imageData, setImageData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [cookedRecipes, setCookedRecipes] = useState([]);
  const [pantry, setPantry] = useState([]);
  const [feedLikes, setFeedLikes] = useState({});
  const [notification, setNotification] = useState(null);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [pantryInput, setPantryInput] = useState("");
  const [upgradeModal, setUpgradeModal] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const fileInputRef = useRef(null);

  const requirePlan = (feature, requiredPlan, action) => {
    if (canUseFeature(user, feature)) { action?.(); return true; }
    setUpgradeModal({ feature, requiredPlan: requiredPlan || "plus" });
    return false;
  };

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      await new Promise(r => setTimeout(r, 1800));
      const savedUser = await loadState("dormchef_user");
      if (savedUser) { setUser(savedUser); setAppScreen("main"); }
      else setAppScreen("auth");
      const sr = await loadState("dormchef_saved_recipes"); if (sr) setSavedRecipes(sr);
      const cr = await loadState("dormchef_cooked_recipes"); if (cr) setCookedRecipes(cr);
      const p = await loadState("dormchef_pantry"); if (p) setPantry(p);
      const fl = await loadState("dormchef_feed_likes"); if (fl) setFeedLikes(fl);
    })();
  }, []);

  const notify = (msg, icon = "✅") => {
    setNotification({ msg, icon });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAuth = async (method) => {
    const names = { email:"DormChef User", google:"Google Chef", apple:"Apple Cook", tiktok:"TikTok Chef" };
    const newUser = {
      username: names[method] || "Chef",
      email: `user@${method}.com`,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      level: 1, xp: 0, xpNext: 100,
      badges: [],
      dietPrefs: [],
      allergies: [],
      plan: "free",
      joinDate: new Date().toLocaleDateString(),
      stats: { cooked: 0, scans: 0, saved: 0, streak: 0 },
      authMethod: method,
    };
    setUser(newUser);
    await saveState("dormchef_user", newUser);
    setAppScreen("main");
    notify("Welcome to DormChef! 🍳", "🎉");
  };

  const updateUser = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    await saveState("dormchef_user", updated);
  };

  const addXP = async (amount, reason) => {
    if (!user) return;
    const newXP = (user.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const levelUp = newLevel > (user.level || 1);
    await updateUser({ xp: newXP % 100, level: newLevel, xpNext: 100, stats: { ...user.stats, cooked: (user.stats?.cooked||0)+1 }});
    if (levelUp) notify(`Level Up! You're now Level ${newLevel} 🎉`, "⬆️");
    else notify(`+${amount} XP — ${reason}`, "⭐");
  };

  const addBadge = async (badgeId) => {
    if (!user || user.badges?.includes(badgeId)) return;
    const badge = BADGES.find(b => b.id === badgeId);
    await updateUser({ badges: [...(user.badges||[]), badgeId] });
    notify(`Badge Unlocked: ${badge.icon} ${badge.label}!`, "🏆");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0]; if (!file) return;
    // Check scan limit for free users
    if (!canUseFeature(user, "scan")) {
      setUpgradeModal({ feature: "scan", requiredPlan: "plus" });
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(",")[1];
      setImageData({ base64, mediaType: file.type });
      setImagePreview(ev.target.result);
      setCookScreen("input");
      const newScans = (user?.stats?.scans || 0) + 1;
      const newStats = { ...user?.stats, scans: newScans };
      await updateUser({ stats: newStats });
      if (newScans >= 5) addBadge("snap_master");
    };
    reader.readAsDataURL(file);
  };

  const analyzeIngredients = useCallback(async () => {
    setCookScreen("analyzing");
    try {
      let messages;
      if (inputMode === "photo" && imageData) {
        const pantryStr = pantry.length ? ` Also in my pantry I have: ${pantry.slice(0,8).join(", ")}.` : "";
        const dietStr = user?.dietPrefs?.length ? ` Dietary preferences: ${user.dietPrefs.join(", ")}.` : "";
        const allergyStr = user?.allergies?.length ? ` Allergies: ${user.allergies.join(", ")}.` : "";
        messages = [{ role:"user", content:[
          { type:"image", source:{ type:"base64", media_type:imageData.mediaType, data:imageData.base64 }},
          { type:"text", text:`Identify ingredients visible.${pantryStr}${dietStr}${allergyStr} Generate 1-3 dorm recipes. JSON only.` }
        ]}];
      } else {
        const pantryStr = pantry.length ? ` Also: ${pantry.slice(0,8).join(", ")}.` : "";
        messages = [{ role:"user", content:`Ingredients: ${textInput}.${pantryStr}${user?.dietPrefs?.length ? ` Prefs: ${user.dietPrefs.join(", ")}.` : ""} JSON only.` }];
      }
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        notify("API key missing — add VITE_ANTHROPIC_API_KEY to your .env file", "🔑");
        setCookScreen("home");
        return;
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1000, system: SYSTEM_PROMPT, messages }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Anthropic API error:", response.status, errData);
        notify(`API error ${response.status} — check console for details`, "❌");
        setCookScreen("home");
        return;
      }

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setRecipes(parsed); setActiveRecipe(0);
      setCookScreen("results");
      addXP(10, "Found new recipes");
    } catch (err) {
      console.error("Recipe generation error:", err);
      notify("Couldn't generate recipes — check browser console for details.", "❌");
      setCookScreen("home");
    }
  }, [inputMode, imageData, textInput, pantry, user]);

  const markCooked = async (recipe) => {
    const entry = { ...recipe, cookedAt: new Date().toISOString(), id: Date.now(), note: "", favorite: false };
    const updated = [entry, ...cookedRecipes].slice(0, 50);
    setCookedRecipes(updated);
    await saveState("dormchef_cooked_recipes", updated);
    addXP(25, "Cooked a recipe");
    if (updated.length === 1) addBadge("first_cook");
    notify("Recipe marked as cooked! 🍴", "✅");
  };

  const toggleSave = async (recipe) => {
    const exists = savedRecipes.find(r => r.name === recipe.name);
    let updated;
    if (exists) { updated = savedRecipes.filter(r => r.name !== recipe.name); notify("Removed from saved", "📌"); }
    else { updated = [{ ...recipe, savedAt: new Date().toISOString() }, ...savedRecipes]; notify("Recipe saved! 📌", "💾"); addXP(5, "Saved a recipe"); }
    setSavedRecipes(updated);
    await saveState("dormchef_saved_recipes", updated);
  };

  const addToPantry = async (item) => {
    if (!item.trim() || pantry.includes(item.trim())) return;
    const updated = [...pantry, item.trim()];
    setPantry(updated);
    await saveState("dormchef_pantry", updated);
    if (updated.length >= 10) addBadge("pantry_pro");
    notify(`${item} added to pantry!`, "🥫");
  };

  const removeFromPantry = async (item) => {
    const updated = pantry.filter(p => p !== item);
    setPantry(updated);
    await saveState("dormchef_pantry", updated);
  };

  const toggleLike = async (postId) => {
    const updated = { ...feedLikes, [postId]: !feedLikes[postId] };
    setFeedLikes(updated);
    await saveState("dormchef_feed_likes", updated);
  };

  const resetCook = () => { setCookScreen("home"); setInputMode(null); setTextInput(""); setImageData(null); setImagePreview(null); setRecipes([]); };

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      <div style={S.grain} />
      <Orbs />
      {notification && <Toast msg={notification.msg} icon={notification.icon} />}
      <style>{CSS}</style>

      {appScreen === "splash" && <Splash />}
      {appScreen === "auth" && <AuthScreen onAuth={handleAuth} />}
      {appScreen === "main" && (
        <>
          <div style={S.mainContent}>
            {showPricing && (
              <PricingTab user={user} onUpgrade={async (planId) => {
                await updateUser({ plan: planId });
                setShowPricing(false);
                setUpgradeModal(null);
                notify(`🎉 Welcome to ${PLANS[planId].name}!`, "👑");
              }} onBack={() => setShowPricing(false)} />
            )}
            {!showPricing && mainTab === "home" && (
              <CookTab
                cookScreen={cookScreen} setCookScreen={setCookScreen}
                inputMode={inputMode} setInputMode={setInputMode}
                textInput={textInput} setTextInput={setTextInput}
                imagePreview={imagePreview} recipes={recipes}
                activeRecipe={activeRecipe} setActiveRecipe={setActiveRecipe}
                analyzeIngredients={analyzeIngredients}
                markCooked={markCooked} toggleSave={toggleSave}
                savedRecipes={savedRecipes} resetCook={resetCook}
                fileInputRef={fileInputRef} pantry={pantry}
                user={user} requirePlan={requirePlan}
                setUpgradeModal={setUpgradeModal}
              />
            )}
            {!showPricing && mainTab === "feed" && (
              <FeedTab posts={FEED_POSTS} feedLikes={feedLikes} toggleLike={toggleLike}
                challenges={CHALLENGES} notify={notify} addXP={addXP} addBadge={addBadge}
                user={user} requirePlan={requirePlan} />
            )}
            {!showPricing && mainTab === "pantry" && (
              canUseFeature(user, "pantry")
                ? <PantryTab pantry={pantry} pantryInput={pantryInput} setPantryInput={setPantryInput}
                    addToPantry={addToPantry} removeFromPantry={removeFromPantry}
                    suggestions={PANTRY_SUGGESTIONS} />
                : <LockedScreen icon="🗄️" title="Pantry Manager" desc="Save your staples and they'll auto-appear in every recipe scan."
                    requiredPlan="plus" onUpgrade={() => setShowPricing(true)} />
            )}
            {!showPricing && mainTab === "saved" && (
              <SavedTab savedRecipes={savedRecipes} cookedRecipes={cookedRecipes}
                setSavedRecipes={setSavedRecipes} setCookedRecipes={setCookedRecipes}
                saveState={saveState} notify={notify} user={user}
                requirePlan={requirePlan} setShowPricing={setShowPricing} />
            )}
            {!showPricing && mainTab === "profile" && (
              <ProfileTab user={user} updateUser={updateUser} savedRecipes={savedRecipes}
                cookedRecipes={cookedRecipes} pantry={pantry} profileEditOpen={profileEditOpen}
                setProfileEditOpen={setProfileEditOpen} addBadge={addBadge} notify={notify}
                BADGES={BADGES} AVATARS={AVATARS} setShowPricing={setShowPricing} PLANS={PLANS} />
            )}
          </div>
          {!showPricing && <BottomNav tab={mainTab} setTab={setMainTab} />}
          <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFileSelect} />
          {upgradeModal && (
            <UpgradeModal
              feature={upgradeModal.feature}
              requiredPlan={upgradeModal.requiredPlan}
              onUpgrade={() => { setUpgradeModal(null); setShowPricing(true); }}
              onClose={() => setUpgradeModal(null)}
              PLANS={PLANS}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── SPLASH ──────────────────────────────────────────────────────────────────
function Splash() {
  return (
    <div style={S.splash}>
      <div style={S.splashEmoji}>🍳</div>
      <h1 style={S.splashLogo}>DormChef AI</h1>
      <div style={S.splashDots}>
        {[0,1,2].map(i => <span key={i} style={{...S.dot, animationDelay:`${i*0.2}s`}} />)}
      </div>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  return (
    <div style={S.authWrap}>
      <div style={S.authCard}>
        <div style={S.authEmoji}>🍳</div>
        <h1 style={S.authTitle}>DormChef AI</h1>
        <p style={S.authSub}>Your campus cooking companion</p>
        <div style={S.authBtns}>
          {[
            { id:"google", icon:"🔵", label:"Continue with Google", color:"#4285f4" },
            { id:"apple", icon:"⚫", label:"Continue with Apple", color:"#333" },
            { id:"tiktok", icon:"🎵", label:"Continue with TikTok", color:"#ff0050" },
            { id:"email", icon:"📧", label:"Sign up with Email", color:"#ff7a20" },
          ].map(b => (
            <button key={b.id} style={{...S.authBtn, borderColor: b.color}} onClick={() => onAuth(b.id)}>
              <span style={S.authBtnIcon}>{b.icon}</span>
              <span style={{color:"#f5ede0"}}>{b.label}</span>
            </button>
          ))}
        </div>
        <p style={S.authFine}>By continuing you agree to our Terms & Privacy Policy</p>
      </div>
    </div>
  );
}

// ─── COOK TAB ────────────────────────────────────────────────────────────────
function CookTab({ cookScreen, setCookScreen, inputMode, setInputMode, textInput, setTextInput,
  imagePreview, recipes, activeRecipe, setActiveRecipe, analyzeIngredients,
  markCooked, toggleSave, savedRecipes, resetCook, fileInputRef, pantry, user,
  requirePlan, setUpgradeModal }) {

  const recipe = recipes[activeRecipe];
  const userPlan = user?.plan || "free";
  const scansUsed = user?.stats?.scans || 0;
  const scansLeft = userPlan === "free" ? Math.max(0, 5 - scansUsed) : Infinity;
  const atLimit = userPlan === "free" && scansUsed >= 5;

  if (cookScreen === "home") return (
    <div style={S.screen}>
      <div style={S.cookHeader}>
        <div>
          <h2 style={S.cookTitle}>What's cooking, {user?.username?.split(" ")[0]}?</h2>
          <p style={S.cookSub}>Snap or type your ingredients</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          {userPlan !== "free" && (
            <span style={{...S.levelPill, background:"linear-gradient(135deg,rgba(255,207,92,0.2),rgba(255,122,32,0.2))", border:"1px solid rgba(255,207,92,0.4)", color:"#ffcf5c", fontSize:"11px", fontWeight:700}}>
              {PLANS[userPlan]?.emoji} {PLANS[userPlan]?.name.replace("DormChef ","")}
            </span>
          )}
          <div style={S.levelPill}>
            <span>⭐</span><span style={{fontWeight:700}}>{user?.level || 1}</span>
          </div>
        </div>
      </div>

      {userPlan === "free" && (
        <div style={{...S.scanBanner, ...(atLimit ? S.scanBannerRed : {})}}>
          {atLimit ? (
            <>
              <span style={{fontSize:"18px"}}>🚫</span>
              <div style={{flex:1}}>
                <p style={{fontWeight:700, fontSize:"13px", color:"#ff7070"}}>Monthly scan limit reached</p>
                <p style={{fontSize:"11px", color:"#907050", marginTop:"2px"}}>Upgrade to Plus for unlimited scans</p>
              </div>
              <button style={S.scanBannerBtn} onClick={() => setUpgradeModal({feature:"scan",requiredPlan:"plus"})}>
                Upgrade
              </button>
            </>
          ) : (
            <>
              <span style={{fontSize:"18px"}}>📊</span>
              <div style={{flex:1}}>
                <p style={{fontWeight:600, fontSize:"13px", color:"#f5ede0"}}>{scansLeft} free scan{scansLeft !== 1 ? "s" : ""} left this month</p>
                <p style={{fontSize:"11px", color:"#907050"}}>Upgrade for unlimited</p>
              </div>
              <div style={S.scanMeter}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{...S.scanDot, background: i < scansUsed ? "#ff5500" : "#2a2010"}} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {pantry.length > 0 && (
        <div style={S.pantryPreview}>
          <span style={S.pantryPreviewLabel}>🗄️ Pantry:</span>
          {pantry.slice(0,4).map(p => <span key={p} style={S.pantryChip}>{p}</span>)}
          {pantry.length > 4 && <span style={S.pantryMore}>+{pantry.length-4}</span>}
        </div>
      )}
      <div style={S.actionCards}>
        <button style={{...S.actionCard, ...S.actionCardOrange, ...(atLimit ? {opacity:0.5} : {})}}
          onClick={() => {
            if (atLimit) { setUpgradeModal({feature:"scan",requiredPlan:"plus"}); return; }
            setInputMode("photo"); fileInputRef.current.click();
          }}>
          <span style={S.actionCardEmoji}>📸</span>
          <strong style={{fontSize:"15px"}}>Snap Fridge</strong>
          <small style={{opacity:.75, fontSize:"12px"}}>{atLimit ? "Limit reached" : "Photo analysis"}</small>
        </button>
        <button style={{...S.actionCard, ...S.actionCardDark, ...(atLimit ? {opacity:0.5} : {})}}
          onClick={() => {
            if (atLimit) { setUpgradeModal({feature:"scan",requiredPlan:"plus"}); return; }
            setInputMode("text"); setCookScreen("input");
          }}>
          <span style={S.actionCardEmoji}>✏️</span>
          <strong style={{fontSize:"15px"}}>Type List</strong>
          <small style={{opacity:.75, fontSize:"12px"}}>{atLimit ? "Limit reached" : "Manual entry"}</small>
        </button>
      </div>
      <div style={S.featureChips}>
        {["🧠 AI Substitutions","💸 Cost Estimates","⚡ 5-min meals","🌙 Late-night ideas"].map(c =>
          <span key={c} style={S.featureChip}>{c}</span>)}
      </div>
    </div>
  );

  if (cookScreen === "input") return (
    <div style={S.screen}>
      <button style={S.backBtn} onClick={resetCook}>← Back</button>
      {inputMode === "photo" && imagePreview && (
        <div style={S.imgPreviewWrap}>
          <img src={imagePreview} alt="Fridge" style={S.imgPreview} />
          <p style={S.imgLabel}>📷 Photo ready — tap below to analyze</p>
        </div>
      )}
      {inputMode === "text" && (
        <div style={{width:"100%"}}>
          <h2 style={S.inputTitle}>What do you have?</h2>
          <p style={S.inputHint}>e.g. "eggs, leftover rice, soy sauce, garlic"</p>
          <textarea style={S.textarea} placeholder="List your ingredients..."
            value={textInput} onChange={e => setTextInput(e.target.value)} rows={5} />
          {pantry.length > 0 && (
            <div style={S.pantryUsed}>
              <p style={{fontSize:"12px", color:"#907050", marginBottom:"8px"}}>🗄️ Using from your pantry:</p>
              <div style={{display:"flex", flexWrap:"wrap", gap:"6px"}}>
                {pantry.slice(0,6).map(p => (
                  <span key={p} style={S.pantryTag} onClick={() => setTextInput(t => t ? t+", "+p : p)}>{p} +</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <button style={{...S.analyzeBtn, opacity:(inputMode==="text"&&!textInput.trim())?0.4:1}}
        onClick={analyzeIngredients} disabled={inputMode==="text"&&!textInput.trim()}>
        🔮 Find My Recipes
      </button>
    </div>
  );

  if (cookScreen === "analyzing") return (
    <div style={{...S.screen, justifyContent:"center", textAlign:"center", gap:"20px"}}>
      <div style={{fontSize:"80px", animation:"float 1.5s ease-in-out infinite"}}>👨‍🍳</div>
      <h2 style={S.analyzingTitle}>Cooking up ideas...</h2>
      <p style={{color:"#907050", fontSize:"15px", lineHeight:1.6}}>Your AI sous-chef is scanning ingredients and crafting recipes.</p>
      <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
        {[0,1,2].map(i => <span key={i} style={{...S.dot, animationDelay:`${i*0.2}s`}} />)}
      </div>
    </div>
  );

  if (cookScreen === "results" && recipe) return (
    <div style={S.screen}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
        <button style={S.backBtn} onClick={resetCook}>← New Scan</button>
        <span style={{fontSize:"13px",color:"#ff8c38",fontWeight:600}}>{recipes.length} recipes found!</span>
      </div>
      <div style={S.recipeTabs}>
        {recipes.map((r,i) => (
          <button key={i} style={{...S.recipeTab, ...(i===activeRecipe?S.recipeTabActive:{})}}
            onClick={() => setActiveRecipe(i)}>{r.emoji} {r.name}</button>
        ))}
      </div>
      <RecipeCard recipe={recipe} onMarkCooked={() => markCooked(recipe)}
        onToggleSave={() => toggleSave(recipe)}
        isSaved={!!savedRecipes.find(r=>r.name===recipe.name)} />
    </div>
  );

  return null;
}

// ─── RECIPE CARD ─────────────────────────────────────────────────────────────
function RecipeCard({ recipe, onMarkCooked, onToggleSave, isSaved, showNoteSection = true }) {
  const [note, setNote] = useState(recipe.note || "");
  const [showNote, setShowNote] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={S.recipeCard}>
      <div style={S.rcHeader}>
        <span style={S.rcEmoji}>{recipe.emoji}</span>
        <div style={{flex:1}}>
          <h2 style={S.rcName}>{recipe.name}</h2>
          <p style={S.rcDesc}>{recipe.description}</p>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginTop:"6px"}}>
            {recipe.healthTags?.map(t => <span key={t} style={S.healthTag}>{t}</span>)}
            {recipe.dietTags?.map(t => <span key={t} style={S.dietTag}>{t}</span>)}
          </div>
        </div>
      </div>

      <div style={S.statsGrid}>
        {[["⏱️","Prep",recipe.prepTime],["🔥","Cook",recipe.cookTime],
          ["💸","Cost",recipe.costEstimate],["🔥","Cal",recipe.calories+"kcal"]].map(([ic,lb,vl]) => (
          <div key={lb} style={S.statCell}>
            <span style={{fontSize:"18px"}}>{ic}</span>
            <span style={S.statVal}>{vl}</span>
            <span style={S.statLbl}>{lb}</span>
          </div>
        ))}
      </div>

      <Section title="🛒 Ingredients">
        {recipe.ingredients?.map((ing,i) => (
          <div key={i} style={S.ingRow}><span style={S.check}>✓</span><span style={{color:"#d0b890"}}>{ing}</span></div>
        ))}
      </Section>

      {recipe.missingIngredients?.length > 0 && (
        <Section title="🔄 Missing + Swaps">
          {recipe.missingIngredients.map((m,i) => {
            const sub = recipe.substitutions?.find(s => s.missing===m);
            return (
              <div key={i} style={S.missingRow}>
                <span style={{color:"#ff7070"}}>❌ {m}</span>
                {sub && <span style={{color:"#c0a080",fontSize:"13px"}}>→ <strong style={{color:"#ffcf5c"}}>{sub.sub}</strong> <span style={{opacity:.6}}>({sub.reason})</span></span>}
              </div>
            );
          })}
          <a href="https://www.instacart.com" target="_blank" rel="noreferrer" style={S.deliveryLink}>
            🛵 Order Missing Items on Instacart →
          </a>
        </Section>
      )}

      <Section title="👨‍🍳 Steps">
        {recipe.steps?.map((step,i) => (
          <div key={i} style={S.stepRow}>
            <span style={S.stepNum}>{i+1}</span>
            <span style={{color:"#c0a080",lineHeight:1.6,fontSize:"14px"}}>{step}</span>
          </div>
        ))}
      </Section>

      {(recipe.tips || recipe.cookingHack) && (
        <div style={S.tipBox}>
          <span style={{fontSize:"20px"}}>💡</span>
          <div>
            {recipe.tips && <p style={{fontSize:"13px",color:"#d0a860",lineHeight:1.6}}><strong>Pro Tip:</strong> {recipe.tips}</p>}
            {recipe.cookingHack && <p style={{fontSize:"13px",color:"#d0a860",lineHeight:1.6,marginTop:"4px"}}><strong>Hack:</strong> {recipe.cookingHack}</p>}
          </div>
        </div>
      )}

      {recipe.flavorPairings?.length > 0 && (
        <Section title="🌶️ Flavor Pairings">
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {recipe.flavorPairings.map(fp => <span key={fp} style={S.flavorChip}>{fp}</span>)}
          </div>
        </Section>
      )}

      {showNoteSection && (
        <div style={S.noteSection}>
          <button style={S.noteToggle} onClick={() => setShowNote(!showNote)}>
            📝 {showNote ? "Hide" : "Add"} Personal Note
          </button>
          {showNote && (
            <textarea style={{...S.textarea, marginTop:"8px", minHeight:"80px"}}
              placeholder="e.g. Add more salt next time, use less oil..."
              value={note} onChange={e => setNote(e.target.value)} />
          )}
        </div>
      )}

      <div style={S.rcActions}>
        <button style={{...S.rcBtn, ...S.rcBtnGreen}} onClick={onMarkCooked}>✓ Cooked It!</button>
        <button style={{...S.rcBtn, ...(isSaved ? S.rcBtnSaved : S.rcBtnOutline)}} onClick={onToggleSave}>
          {isSaved ? "📌 Saved" : "📌 Save"}
        </button>
        <button style={{...S.rcBtn, ...S.rcBtnShare}} onClick={() => {
          const text = `Check out this recipe I made with DormChef AI: ${recipe.name} ${recipe.emoji} #DormChefChallenge`;
          if (navigator.share) navigator.share({ title: recipe.name, text });
          else window.open(`https://www.tiktok.com/`, "_blank");
        }}>🎵 Share</button>
      </div>

      <div style={S.shareTag}>#DormChefChallenge 🎬 — Share your creation!</div>
    </div>
  );
}

// ─── FEED TAB ─────────────────────────────────────────────────────────────────
function FeedTab({ posts, feedLikes, toggleLike, challenges, notify, addXP, addBadge, user }) {
  const [feedView, setFeedView] = useState("feed");
  const [joinedChallenges, setJoinedChallenges] = useState([]);

  const joinChallenge = (id) => {
    if (joinedChallenges.includes(id)) return;
    setJoinedChallenges([...joinedChallenges, id]);
    const ch = challenges.find(c => c.id === id);
    addXP(ch.points, `Joined ${ch.title}`);
    if (joinedChallenges.length >= 1) addBadge("challenge_king");
    notify(`Joined: ${ch.title}! +${ch.points} XP pending`, "🏆");
  };

  return (
    <div style={S.screen}>
      <div style={S.feedHeader}>
        <h2 style={S.tabTitle}>Campus Feed</h2>
        <div style={S.feedToggle}>
          {["feed","challenges","leaderboard"].map(v => (
            <button key={v} style={{...S.feedToggleBtn, ...(feedView===v?S.feedToggleBtnActive:{})}}
              onClick={() => setFeedView(v)}>
              {v==="feed"?"🍴":v==="challenges"?"🏆":"📊"} {v.charAt(0).toUpperCase()+v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {feedView === "feed" && (
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          {posts.map(post => (
            <div key={post.id} style={S.feedPost}>
              <div style={S.feedPostHeader}>
                <span style={{fontSize:"32px"}}>{post.avatar}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontWeight:700,color:"#f5ede0",fontSize:"14px"}}>@{post.user}</span>
                    <span style={S.userLevelBadge}>Lv.{post.level}</span>
                  </div>
                  <span style={{fontSize:"11px",color:"#706040"}}>{post.time}</span>
                </div>
                <span style={{fontSize:"36px"}}>{post.img}</span>
              </div>
              <p style={{color:"#d0b890",fontSize:"14px",marginBottom:"8px"}}>
                Made <strong style={{color:"#ffcf5c"}}>{post.recipe}</strong> {post.emoji}
              </p>
              <div style={{display:"flex",gap:"6px",marginBottom:"10px"}}>
                {post.tags.map(t => <span key={t} style={S.feedTag}>{t}</span>)}
              </div>
              <div style={S.feedActions}>
                <button style={{...S.feedActionBtn, color:feedLikes[post.id]?"#ff5050":"#907050"}}
                  onClick={() => toggleLike(post.id)}>
                  {feedLikes[post.id]?"❤️":"🤍"} {post.likes + (feedLikes[post.id]?1:0)}
                </button>
                <button style={{...S.feedActionBtn}}>💬 {post.comments}</button>
                <button style={{...S.feedActionBtn}} onClick={() => notify("Link copied!", "📋")}>📤 Share</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {feedView === "challenges" && (
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          {challenges.map(ch => (
            <div key={ch.id} style={S.challengeCard}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                  <span style={{fontSize:"36px"}}>{ch.icon}</span>
                  <div>
                    <p style={{fontWeight:700,color:"#f5ede0",fontFamily:"'Syne',sans-serif",fontSize:"15px"}}>{ch.title}</p>
                    <p style={{fontSize:"13px",color:"#907050",marginTop:"2px"}}>{ch.desc}</p>
                    <p style={{fontSize:"11px",color:"#ff8c38",marginTop:"4px"}}>⏰ {ch.deadline} · +{ch.points} XP</p>
                  </div>
                </div>
                <button style={{...S.joinBtn, ...(joinedChallenges.includes(ch.id)?S.joinBtnDone:{})}}
                  onClick={() => joinChallenge(ch.id)}>
                  {joinedChallenges.includes(ch.id) ? "✓ Joined" : "Join"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {feedView === "leaderboard" && (
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          <div style={S.lbHeader}>
            <span style={{color:"#907050",fontSize:"13px"}}>This Week's Top Chefs</span>
          </div>
          {[
            { rank:1, user:"dormchef_maya", avatar:"👩🏻‍🍳", xp:1240, badge:"🥇" },
            { rank:2, user:"noodle_king_93", avatar:"👨🏿‍🍳", xp:980, badge:"🥈" },
            { rank:3, user:"vegan_dorm_life", avatar:"🧑🏽‍🍳", xp:875, badge:"🥉" },
            { rank:4, user:"campus_foodie", avatar:"👨🏾‍🍳", xp:720, badge:"" },
            { rank:5, user:user?.username||"You", avatar:user?.avatar||"🧑‍🍳", xp:(user?.xp||0)+40, badge:"" },
          ].map(entry => (
            <div key={entry.rank} style={{...S.lbRow, ...(entry.user===user?.username?S.lbRowMe:{})}}>
              <span style={S.lbRank}>{entry.badge || `#${entry.rank}`}</span>
              <span style={{fontSize:"28px"}}>{entry.avatar}</span>
              <span style={{flex:1,color:"#f5ede0",fontSize:"14px",fontWeight:entry.user===user?.username?700:400}}>
                @{entry.user} {entry.user===user?.username && <span style={{color:"#ff8c38"}}>(you)</span>}
              </span>
              <span style={{color:"#ffcf5c",fontWeight:700,fontSize:"14px"}}>{entry.xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PANTRY TAB ───────────────────────────────────────────────────────────────
function PantryTab({ pantry, pantryInput, setPantryInput, addToPantry, removeFromPantry, suggestions }) {
  const filtered = suggestions.filter(s => !pantry.includes(s) && s.toLowerCase().includes(pantryInput.toLowerCase()));
  return (
    <div style={S.screen}>
      <h2 style={S.tabTitle}>My Pantry</h2>
      <p style={{fontSize:"13px",color:"#907050",marginBottom:"16px"}}>Save your staples — we'll include them in recipe suggestions automatically.</p>
      <div style={S.pantryInputRow}>
        <input style={S.pantryInputField} placeholder="Add ingredient..." value={pantryInput}
          onChange={e => setPantryInput(e.target.value)}
          onKeyDown={e => { if(e.key==="Enter" && pantryInput.trim()) { addToPantry(pantryInput); setPantryInput(""); }}}/>
        <button style={S.pantryAddBtn} onClick={() => { if(pantryInput.trim()) { addToPantry(pantryInput); setPantryInput(""); }}}>+</button>
      </div>

      {pantry.length > 0 && (
        <div style={S.pantryGrid}>
          {pantry.map(item => (
            <div key={item} style={S.pantryItem}>
              <span style={{fontSize:"13px",color:"#d0b890"}}>{item}</span>
              <button style={S.pantryRemove} onClick={() => removeFromPantry(item)}>×</button>
            </div>
          ))}
        </div>
      )}

      {pantry.length === 0 && (
        <div style={{textAlign:"center",padding:"40px 20px",color:"#503020"}}>
          <div style={{fontSize:"48px",marginBottom:"12px"}}>🗄️</div>
          <p>Your pantry is empty. Add your staples!</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{marginTop:"20px"}}>
          <p style={{fontSize:"12px",color:"#706040",marginBottom:"10px"}}>💡 Quick add suggestions:</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
            {filtered.slice(0,12).map(s => (
              <button key={s} style={S.suggestionChip} onClick={() => addToPantry(s)}>{s} +</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SAVED TAB ────────────────────────────────────────────────────────────────
function SavedTab({ savedRecipes, cookedRecipes, setSavedRecipes, setCookedRecipes, saveState, notify, user, requirePlan, setShowPricing }) {
  const [view, setView] = useState("saved");
  const [expandedId, setExpandedId] = useState(null);
  const userPlan = user?.plan || "free";
  const canAnalytics = userPlan !== "free";

  const totalCost = cookedRecipes.reduce((sum, r) => {
    const match = r.costEstimate?.match(/[\d.]+/);
    return sum + (match ? parseFloat(match[0]) : 0);
  }, 0);
  const totalTime = cookedRecipes.reduce((sum, r) => {
    const match = r.prepTime?.match(/\d+/);
    return sum + (match ? parseInt(match[0]) : 0);
  }, 0);
  const totalCals = cookedRecipes.reduce((sum, r) => sum + (r.calories || 0), 0);

  return (
    <div style={S.screen}>
      <h2 style={S.tabTitle}>Recipes</h2>
      <div style={S.savedToggle}>
        {["saved","cooked","analytics"].map(v => (
          <button key={v} style={{...S.savedToggleBtn, ...(view===v?S.savedToggleBtnActive:{})}}
            onClick={() => {
              if (v === "analytics" && !canAnalytics) { setShowPricing(true); return; }
              setView(v);
            }}>
            {v==="saved"?"📌":v==="cooked"?"✅":"📊"} {v.charAt(0).toUpperCase()+v.slice(1)}
            {v==="analytics" && !canAnalytics && <span style={{marginLeft:"4px",fontSize:"10px"}}>🔒</span>}
          </button>
        ))}
      </div>

      {view === "saved" && (
        savedRecipes.length === 0
          ? <EmptyState icon="📌" msg="No saved recipes yet. Cook something!" />
          : <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {savedRecipes.map((r,i) => (
                <div key={i} style={S.savedCard} onClick={() => setExpandedId(expandedId===i?null:i)}>
                  <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                    <span style={{fontSize:"36px"}}>{r.emoji}</span>
                    <div style={{flex:1}}>
                      <p style={{fontWeight:700,color:"#f5ede0",fontFamily:"'Syne',sans-serif"}}>{r.name}</p>
                      <p style={{fontSize:"12px",color:"#907050"}}>{r.prepTime} · {r.costEstimate}</p>
                    </div>
                    <span style={{color:"#ff8c38",fontSize:"18px"}}>{expandedId===i?"▲":"▼"}</span>
                  </div>
                  {expandedId === i && (
                    <div style={{marginTop:"12px",borderTop:"1px solid #2a2010",paddingTop:"12px"}}>
                      <RecipeCard recipe={r} onMarkCooked={()=>{}} onToggleSave={async () => {
                        const updated = savedRecipes.filter((_,j) => j!==i);
                        setSavedRecipes(updated); await saveState("dormchef_saved_recipes", JSON.stringify(updated));
                        notify("Removed from saved","📌");
                      }} isSaved={true} showNoteSection={true} />
                    </div>
                  )}
                </div>
              ))}
            </div>
      )}

      {view === "cooked" && (
        cookedRecipes.length === 0
          ? <EmptyState icon="✅" msg="No cooked recipes yet. Get cooking!" />
          : <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {cookedRecipes.map((r,i) => (
                <div key={i} style={S.savedCard}>
                  <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                    <span style={{fontSize:"36px"}}>{r.emoji}</span>
                    <div style={{flex:1}}>
                      <p style={{fontWeight:700,color:"#f5ede0",fontFamily:"'Syne',sans-serif"}}>{r.name}</p>
                      <p style={{fontSize:"12px",color:"#907050"}}>{new Date(r.cookedAt).toLocaleDateString()} · {r.costEstimate}</p>
                    </div>
                    <span style={{color:"#4caf7d",fontSize:"16px"}}>✓</span>
                  </div>
                </div>
              ))}
            </div>
      )}

      {view === "analytics" && (
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          <div style={S.analyticsGrid}>
            {[
              ["🍳","Meals Cooked", cookedRecipes.length],
              ["💸","Total Spent", `$${totalCost.toFixed(2)}`],
              ["⏱️","Total Time", `${totalTime}m`],
              ["🔥","Total Cals", totalCals > 0 ? `${totalCals}` : "—"],
            ].map(([ic,lb,vl]) => (
              <div key={lb} style={S.analyticsCard}>
                <span style={{fontSize:"28px"}}>{ic}</span>
                <span style={{fontWeight:800,fontSize:"24px",color:"#ffcf5c",fontFamily:"'Syne',sans-serif"}}>{vl}</span>
                <span style={{fontSize:"11px",color:"#706040",textTransform:"uppercase",letterSpacing:"0.05em"}}>{lb}</span>
              </div>
            ))}
          </div>
          {cookedRecipes.length > 0 && (
            <Section title="📈 Most Used Ingredients">
              <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
                {Object.entries(
                  cookedRecipes.flatMap(r => r.ingredients || [])
                    .reduce((acc, ing) => ({...acc, [ing]: (acc[ing]||0)+1}), {})
                ).sort(([,a],[,b]) => b-a).slice(0,10).map(([ing, count]) => (
                  <span key={ing} style={{...S.flavorChip, background:"rgba(255,140,56,0.15)"}}>
                    {ing} <span style={{color:"#ff8c38",fontWeight:700}}>×{count}</span>
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
function ProfileTab({ user, updateUser, savedRecipes, cookedRecipes, pantry, profileEditOpen, setProfileEditOpen, addBadge, notify, BADGES, AVATARS, setShowPricing, PLANS }) {
  const [editUser, setEditUser] = useState({...user});
  const DIET_OPTIONS = ["Vegan","Vegetarian","Keto","Gluten-free","Halal","Kosher","Dairy-free","Nut-free"];
  const ALLERGY_OPTIONS = ["Peanuts","Tree nuts","Dairy","Eggs","Wheat","Soy","Fish","Shellfish"];

  const togglePref = (pref) => {
    const list = editUser.dietPrefs || [];
    setEditUser({...editUser, dietPrefs: list.includes(pref) ? list.filter(p=>p!==pref) : [...list,pref]});
  };
  const toggleAllergy = (allergy) => {
    const list = editUser.allergies || [];
    setEditUser({...editUser, allergies: list.includes(allergy) ? list.filter(a=>a!==allergy) : [...list,allergy]});
  };
  const saveProfile = async () => {
    await updateUser(editUser);
    setProfileEditOpen(false);
    notify("Profile updated!", "✅");
  };

  const xpPct = ((user?.xp || 0) / (user?.xpNext || 100)) * 100;

  return (
    <div style={S.screen}>
      {/* Profile Hero */}
      <div style={S.profileHero}>
        <div style={S.avatarCircle}>
          <span style={{fontSize:"56px"}}>{user?.avatar}</span>
        </div>
        <div style={{textAlign:"center"}}>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"22px",fontWeight:800,color:"#f5ede0"}}>{user?.username}</h2>
          <p style={{fontSize:"12px",color:"#907050"}}>Joined {user?.joinDate}</p>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"8px",justifyContent:"center"}}>
            <span style={S.levelBadge}>⭐ Level {user?.level || 1}</span>
            <span style={{fontSize:"12px",color:"#907050"}}>{user?.xp || 0} / 100 XP</span>
          </div>
          <div style={S.xpBar}>
            <div style={{...S.xpFill, width:`${xpPct}%`}} />
          </div>
          {user?.dietPrefs?.length > 0 && (
            <div style={{display:"flex",gap:"6px",flexWrap:"wrap",justifyContent:"center",marginTop:"8px"}}>
              {user.dietPrefs.map(p => <span key={p} style={S.dietTag}>{p}</span>)}
            </div>
          )}
        </div>
        <button style={S.editProfileBtn} onClick={() => { setEditUser({...user}); setProfileEditOpen(true); }}>
          ✏️ Edit Profile
        </button>
      </div>

      {/* Plan card */}
      {(() => {
        const plan = PLANS[user?.plan || "free"];
        const isPro = user?.plan === "pro";
        const isPlus = user?.plan === "plus";
        return (
          <div style={{...S.planCardProfile, background: isPro ? "linear-gradient(135deg,rgba(255,207,92,0.1),rgba(255,140,56,0.1))" : isPlus ? "linear-gradient(135deg,rgba(255,122,32,0.1),rgba(229,80,0,0.1))" : "#141008"}}>
            <div style={{display:"flex", alignItems:"center", gap:"12px", flex:1}}>
              <span style={{fontSize:"28px"}}>{plan.emoji}</span>
              <div>
                <p style={{fontWeight:700, fontFamily:"'Syne',sans-serif", color: isPro?"#ffcf5c":isPlus?"#ff8c38":"#907050"}}>
                  {plan.name}
                </p>
                <p style={{fontSize:"12px", color:"#706040"}}>
                  {user?.plan === "free" ? "5 scans/month · Basic features" : user?.plan === "plus" ? "Unlimited scans · Analytics · Pantry" : "All features · Priority AI · Macros"}
                </p>
              </div>
            </div>
            {user?.plan !== "pro" && (
              <button style={S.planUpgradeBtn} onClick={() => setShowPricing(true)}>
                {user?.plan === "free" ? "Upgrade ✨" : "Go Pro 👑"}
              </button>
            )}
          </div>
        );
      })()}

      {/* Stats */}
      <div style={S.statsRow2}>
        {[
          ["🍳", cookedRecipes.length, "Cooked"],
          ["📌", savedRecipes.length, "Saved"],
          ["🗄️", pantry.length, "Pantry"],
          ["🏆", user?.badges?.length || 0, "Badges"],
        ].map(([ic,vl,lb]) => (
          <div key={lb} style={S.profileStat}>
            <span style={{fontSize:"20px"}}>{ic}</span>
            <span style={{fontWeight:800,fontSize:"20px",color:"#ffcf5c",fontFamily:"'Syne',sans-serif"}}>{vl}</span>
            <span style={{fontSize:"11px",color:"#706040"}}>{lb}</span>
          </div>
        ))}
      </div>

      {/* Badges */}
      <Section title="🏆 Badges">
        <div style={S.badgeGrid}>
          {BADGES.map(badge => {
            const earned = user?.badges?.includes(badge.id);
            return (
              <div key={badge.id} style={{...S.badgeItem, opacity: earned ? 1 : 0.3}}>
                <span style={{fontSize:"28px"}}>{badge.icon}</span>
                <span style={{fontSize:"10px",color: earned?"#ffcf5c":"#706040",textAlign:"center",lineHeight:1.2}}>{badge.label}</span>
                {earned && <span style={{fontSize:"8px",color:"#4caf7d"}}>Earned!</span>}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Edit Profile Modal */}
      {profileEditOpen && (
        <div style={S.modalOverlay} onClick={e => e.target===e.currentTarget&&setProfileEditOpen(false)}>
          <div style={S.modal}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:"18px",color:"#f5ede0"}}>Edit Profile</h3>
              <button style={S.modalClose} onClick={() => setProfileEditOpen(false)}>×</button>
            </div>

            <p style={S.modalLabel}>Username</p>
            <input style={S.modalInput} value={editUser.username || ""}
              onChange={e => setEditUser({...editUser, username: e.target.value})} />

            <p style={S.modalLabel}>Choose Avatar</p>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"16px"}}>
              {AVATARS.map(av => (
                <button key={av} style={{...S.avatarOption, ...(editUser.avatar===av?S.avatarOptionActive:{})}}
                  onClick={() => setEditUser({...editUser, avatar: av})}>{av}</button>
              ))}
            </div>

            <p style={S.modalLabel}>Dietary Preferences</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"16px"}}>
              {DIET_OPTIONS.map(d => (
                <button key={d} style={{...S.prefChip, ...((editUser.dietPrefs||[]).includes(d)?S.prefChipActive:{})}}
                  onClick={() => togglePref(d)}>{d}</button>
              ))}
            </div>

            <p style={S.modalLabel}>Allergies</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"20px"}}>
              {ALLERGY_OPTIONS.map(a => (
                <button key={a} style={{...S.prefChip, ...((editUser.allergies||[]).includes(a)?S.prefChipRed:{})}}
                  onClick={() => toggleAllergy(a)}>{a}</button>
              ))}
            </div>

            <button style={{...S.analyzeBtn}} onClick={saveProfile}>Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PRICING TAB ─────────────────────────────────────────────────────────────
function PricingTab({ user, onUpgrade, onBack }) {
  const [billing, setBilling] = useState("monthly");
  const [confirmPlan, setConfirmPlan] = useState(null);
  const currentPlan = user?.plan || "free";

  const plans = [PLANS.free, PLANS.plus, PLANS.pro];

  return (
    <div style={S.screen}>
      <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"4px"}}>
        <button style={S.backBtn} onClick={onBack}>← Back</button>
      </div>

      {/* Header */}
      <div style={S.pricingHeader}>
        <div style={S.pricingGlow} />
        <p style={S.pricingEyebrow}>🔥 Level up your kitchen game</p>
        <h2 style={S.pricingTitle}>Simple, Student-Friendly Pricing</h2>
        <p style={S.pricingSubtitle}>Less than a coffee a month. More meals than you can count.</p>

        <div style={S.billingToggle}>
          <button style={{...S.billingBtn, ...(billing==="monthly"?S.billingBtnActive:{})}}
            onClick={() => setBilling("monthly")}>Monthly</button>
          <button style={{...S.billingBtn, ...(billing==="annual"?S.billingBtnActive:{})}}
            onClick={() => setBilling("annual")}>
            Annual <span style={S.saveBadge}>Save 20%</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div style={S.planCards}>
        {plans.map((plan, i) => {
          const isCurrentPlan = currentPlan === plan.id;
          const price = billing === "annual" && plan.price > 0
            ? (plan.price * 0.8).toFixed(2)
            : plan.price;
          const isPopular = plan.id === "plus";
          const isPro = plan.id === "pro";

          return (
            <div key={plan.id} style={{
              ...S.planCard,
              ...(isPopular ? S.planCardPopular : {}),
              ...(isPro ? S.planCardPro : {}),
              ...(isCurrentPlan ? S.planCardCurrent : {}),
            }}>
              {plan.badge && (
                <div style={{...S.planBadge, background: isPro ? "linear-gradient(135deg,#ffcf5c,#ff8c38)" : "linear-gradient(135deg,#ff7a20,#ff5500)"}}>
                  {plan.badge}
                </div>
              )}
              {isCurrentPlan && <div style={S.currentBadge}>✓ Current Plan</div>}

              <div style={S.planEmoji}>{plan.emoji}</div>
              <h3 style={{...S.planName, color: isPro ? "#ffcf5c" : isPopular ? "#ff8c38" : "#907050"}}>
                {plan.name}
              </h3>

              <div style={S.planPriceRow}>
                {plan.price === 0 ? (
                  <span style={S.planPrice}>Free</span>
                ) : (
                  <>
                    <span style={S.planPriceDollar}>$</span>
                    <span style={{...S.planPrice, color: isPro ? "#ffcf5c" : "#ff8c38"}}>{price}</span>
                    <span style={S.planPricePer}>/mo</span>
                  </>
                )}
              </div>
              {billing === "annual" && plan.price > 0 && (
                <p style={S.annualNote}>billed ${(price * 12).toFixed(2)}/year</p>
              )}

              <div style={S.planFeatures}>
                {plan.features.map((f, j) => (
                  <div key={j} style={S.planFeatureRow}>
                    <span style={{color: f.included ? "#4caf7d" : "#3a3020", fontSize:"14px", flexShrink:0}}>
                      {f.included ? "✓" : "✗"}
                    </span>
                    <span style={{fontSize:"13px", color: f.included ? "#d0b890" : "#504030"}}>{f.label}</span>
                  </div>
                ))}
              </div>

              {!isCurrentPlan && plan.id !== "free" && (
                <button
                  style={{
                    ...S.planCta,
                    background: isPro
                      ? "linear-gradient(135deg,#ffcf5c,#ff8c38)"
                      : "linear-gradient(135deg,#ff7a20,#ff5500)",
                    color: isPro ? "#1a1000" : "#fff",
                    boxShadow: isPro ? "0 8px 24px rgba(255,207,92,0.3)" : "0 8px 24px rgba(255,85,0,0.35)",
                  }}
                  onClick={() => setConfirmPlan(plan)}
                >
                  Get {plan.name.replace("DormChef ","")} →
                </button>
              )}
              {isCurrentPlan && (
                <div style={S.planCtaCurrent}>You're on this plan ✓</div>
              )}
              {!isCurrentPlan && plan.id === "free" && currentPlan !== "free" && (
                <button style={{...S.planCta, background:"#1a1610", border:"1px solid #3a3020", color:"#907050"}}
                  onClick={() => onUpgrade("free")}>
                  Downgrade to Free
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Social proof */}
      <div style={S.socialProof}>
        <p style={{textAlign:"center", fontSize:"13px", color:"#706040", marginBottom:"12px"}}>Trusted by students at 200+ campuses</p>
        <div style={{display:"flex", justifyContent:"center", gap:"16px"}}>
          {[["🍳","12,400+","Recipes made"],["💸","$2.10","Avg meal cost"],["⭐","4.9","App rating"]].map(([ic,num,label]) => (
            <div key={label} style={{textAlign:"center"}}>
              <span style={{fontSize:"20px"}}>{ic}</span>
              <p style={{fontWeight:800, fontSize:"18px", color:"#ffcf5c", fontFamily:"'Syne',sans-serif"}}>{num}</p>
              <p style={{fontSize:"10px", color:"#706040"}}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <p style={{textAlign:"center", fontSize:"11px", color:"#503020", paddingBottom:"20px"}}>
        Cancel anytime · Secure payment via Stripe · Student-friendly pricing always
      </p>

      {/* Confirm modal */}
      {confirmPlan && (
        <div style={S.modalOverlay} onClick={e => e.target===e.currentTarget&&setConfirmPlan(null)}>
          <div style={S.modal}>
            <div style={{textAlign:"center", marginBottom:"20px"}}>
              <span style={{fontSize:"48px"}}>{confirmPlan.emoji}</span>
              <h3 style={{fontFamily:"'Syne',sans-serif", fontSize:"20px", color:"#f5ede0", marginTop:"8px"}}>
                Upgrade to {confirmPlan.name}
              </h3>
              <p style={{color:"#907050", fontSize:"14px", marginTop:"4px"}}>
                ${billing==="annual"?(confirmPlan.price*0.8).toFixed(2):confirmPlan.price}/month
                {billing==="annual" ? " · billed annually" : " · cancel anytime"}
              </p>
            </div>
            <div style={{background:"#0f0d0a", borderRadius:"12px", padding:"14px", marginBottom:"20px"}}>
              <p style={{fontSize:"12px", color:"#706040", marginBottom:"10px", textTransform:"uppercase", letterSpacing:"0.05em"}}>
                What you'll unlock:
              </p>
              {confirmPlan.features.filter(f=>f.included).slice(0,5).map((f,i) => (
                <div key={i} style={{display:"flex", gap:"8px", marginBottom:"6px"}}>
                  <span style={{color:"#4caf7d"}}>✓</span>
                  <span style={{fontSize:"13px", color:"#d0b890"}}>{f.label}</span>
                </div>
              ))}
            </div>
            <button style={{...S.analyzeBtn, marginBottom:"10px"}} onClick={() => { onUpgrade(confirmPlan.id); setConfirmPlan(null); }}>
              Confirm Upgrade — ${billing==="annual"?(confirmPlan.price*0.8).toFixed(2):confirmPlan.price}/mo
            </button>
            <button style={{...S.planCtaCurrent, cursor:"pointer"}} onClick={() => setConfirmPlan(null)}>
              Maybe later
            </button>
            <p style={{textAlign:"center", fontSize:"10px", color:"#403020", marginTop:"10px"}}>
              🔒 In production this connects to Stripe. No card charged in demo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── UPGRADE MODAL ────────────────────────────────────────────────────────────
function UpgradeModal({ feature, requiredPlan, onUpgrade, onClose, PLANS }) {
  const plan = PLANS[requiredPlan] || PLANS.plus;
  const featureMessages = {
    scan: { title: "You've used all 5 free scans", sub: "Upgrade for unlimited recipe scans every month.", icon: "📸" },
    pantry: { title: "Pantry is a Plus feature", sub: "Save your staples so every scan auto-includes them.", icon: "🗄️" },
    analytics: { title: "Analytics needs Plus", sub: "Track your cooking costs, calories, and habits.", icon: "📊" },
    mealPlan: { title: "Meal Planner is Pro only", sub: "Get a full AI-powered weekly meal plan.", icon: "📅" },
    macros: { title: "Macro tracking is Pro only", sub: "See calories, protein, carbs, and fat for every meal.", icon: "💪" },
    exportList: { title: "Shopping export is Pro only", sub: "Send your grocery list straight to your phone.", icon: "🛒" },
    exclusiveChallenges: { title: "Exclusive challenges need Pro", sub: "Compete for bigger prizes with Pro-only challenges.", icon: "🏆" },
  };
  const msg = featureMessages[feature] || { title: "Premium feature", sub: "Upgrade to unlock this.", icon: "⭐" };

  return (
    <div style={S.modalOverlay} onClick={e => e.target===e.currentTarget&&onClose()}>
      <div style={{...S.modal, textAlign:"center"}}>
        <button style={{...S.modalClose, position:"absolute", top:"16px", right:"20px"}} onClick={onClose}>×</button>
        <div style={{fontSize:"52px", marginBottom:"12px"}}>{msg.icon}</div>
        <h3 style={{fontFamily:"'Syne',sans-serif", fontSize:"20px", color:"#f5ede0", marginBottom:"8px"}}>
          {msg.title}
        </h3>
        <p style={{fontSize:"14px", color:"#907050", lineHeight:1.6, marginBottom:"20px"}}>{msg.sub}</p>

        <div style={{background:"#0f0d0a", borderRadius:"12px", padding:"14px", marginBottom:"20px", textAlign:"left"}}>
          <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px"}}>
            <span style={{fontSize:"24px"}}>{plan.emoji}</span>
            <div>
              <p style={{fontWeight:700, color:"#ff8c38", fontFamily:"'Syne',sans-serif"}}>{plan.name}</p>
              <p style={{fontSize:"12px", color:"#907050"}}>${plan.price}/month</p>
            </div>
          </div>
          {plan.features.filter(f=>f.included).slice(0,4).map((f,i) => (
            <div key={i} style={{display:"flex", gap:"8px", marginBottom:"5px"}}>
              <span style={{color:"#4caf7d", fontSize:"12px"}}>✓</span>
              <span style={{fontSize:"12px", color:"#c0a080"}}>{f.label}</span>
            </div>
          ))}
        </div>

        <button style={{...S.analyzeBtn, marginBottom:"10px"}} onClick={onUpgrade}>
          Upgrade to {plan.name.replace("DormChef ","")} — ${plan.price}/mo →
        </button>
        <button style={{background:"none", border:"none", color:"#706040", cursor:"pointer", fontSize:"13px", fontFamily:"'DM Sans',sans-serif", padding:"8px"}}
          onClick={onClose}>
          Not now
        </button>
      </div>
    </div>
  );
}

// ─── LOCKED SCREEN ────────────────────────────────────────────────────────────
function LockedScreen({ icon, title, desc, requiredPlan, onUpgrade }) {
  return (
    <div style={{...S.screen, alignItems:"center", justifyContent:"center", minHeight:"60vh", textAlign:"center", gap:"16px"}}>
      <div style={{fontSize:"64px", opacity:0.4}}>{icon}</div>
      <div style={S.lockBadge}>🔒 {requiredPlan === "pro" ? "Pro" : "Plus"} Feature</div>
      <h3 style={{fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:800, color:"#f5ede0"}}>{title}</h3>
      <p style={{fontSize:"14px", color:"#907050", lineHeight:1.7, maxWidth:"280px"}}>{desc}</p>
      <button style={{...S.analyzeBtn, maxWidth:"280px"}} onClick={onUpgrade}>
        Unlock with {requiredPlan === "pro" ? "Pro" : "Plus"} →
      </button>
      <p style={{fontSize:"12px", color:"#503020"}}>From $5.99/month · Cancel anytime</p>
    </div>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={S.section}>
      <h3 style={S.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}
function EmptyState({ icon, msg }) {
  return (
    <div style={{textAlign:"center",padding:"50px 20px",color:"#503020"}}>
      <div style={{fontSize:"48px",marginBottom:"12px"}}>{icon}</div>
      <p style={{fontSize:"14px"}}>{msg}</p>
    </div>
  );
}
function Toast({ msg, icon }) {
  return (
    <div style={S.toast}>
      <span style={{fontSize:"18px"}}>{icon}</span>
      <span style={{fontSize:"14px",color:"#f5ede0"}}>{msg}</span>
    </div>
  );
}
function Orbs() {
  return <>
    <div style={S.orb1}/><div style={S.orb2}/><div style={S.orb3}/>
  </>;
}
function BottomNav({ tab, setTab }) {
  const items = [
    { id:"home", icon:"🍳", label:"Cook" },
    { id:"feed", icon:"🎉", label:"Feed" },
    { id:"pantry", icon:"🗄️", label:"Pantry" },
    { id:"saved", icon:"📌", label:"Saved" },
    { id:"profile", icon:"👤", label:"Profile" },
  ];
  return (
    <div style={S.bottomNav}>
      {items.map(item => (
        <button key={item.id} style={{...S.navItem, ...(tab===item.id?S.navItemActive:{})}}
          onClick={() => setTab(item.id)}>
          <span style={{fontSize:"22px"}}>{item.icon}</span>
          <span style={{fontSize:"10px",marginTop:"2px",fontWeight:tab===item.id?700:400}}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  app: { minHeight:"100vh", background:"#0f0d0a", color:"#f5ede0", fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden", paddingBottom:"80px" },
  grain: { position:"fixed", inset:0, opacity:0.03, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, pointerEvents:"none", zIndex:0 },
  orb1: { position:"fixed", top:"-100px", right:"-80px", width:"360px", height:"360px", borderRadius:"50%", background:"radial-gradient(circle, rgba(255,130,50,0.16), transparent 70%)", pointerEvents:"none" },
  orb2: { position:"fixed", bottom:"-80px", left:"-60px", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle, rgba(255,80,20,0.1), transparent 70%)", pointerEvents:"none" },
  orb3: { position:"fixed", top:"40%", left:"50%", width:"280px", height:"280px", borderRadius:"50%", background:"radial-gradient(circle, rgba(255,200,80,0.05), transparent 70%)", transform:"translateX(-50%)", pointerEvents:"none" },

  splash: { minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px" },
  splashEmoji: { fontSize:"80px", animation:"float 2s ease-in-out infinite" },
  splashLogo: { fontFamily:"'Syne',sans-serif", fontSize:"40px", fontWeight:800, background:"linear-gradient(135deg,#ff8c38,#ffcf5c)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
  splashDots: { display:"flex", gap:"8px" },
  dot: { width:"10px", height:"10px", borderRadius:"50%", background:"#ff7a20", animation:"pulse 0.9s ease-in-out infinite", display:"inline-block" },

  authWrap: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" },
  authCard: { background:"#141008", border:"1px solid #2a2010", borderRadius:"24px", padding:"36px 28px", maxWidth:"360px", width:"100%", textAlign:"center" },
  authEmoji: { fontSize:"60px", marginBottom:"12px", display:"block", animation:"float 3s ease-in-out infinite" },
  authTitle: { fontFamily:"'Syne',sans-serif", fontSize:"32px", fontWeight:800, background:"linear-gradient(135deg,#ff8c38,#ffcf5c)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:"6px" },
  authSub: { fontSize:"14px", color:"#907050", marginBottom:"24px" },
  authBtns: { display:"flex", flexDirection:"column", gap:"12px", marginBottom:"20px" },
  authBtn: { display:"flex", alignItems:"center", gap:"14px", padding:"14px 18px", borderRadius:"12px", border:"2px solid", background:"#1a1610", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:"14px", fontWeight:500, transition:"all 0.2s" },
  authBtnIcon: { fontSize:"20px" },
  authFine: { fontSize:"11px", color:"#503020" },

  screen: { maxWidth:"520px", margin:"0 auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:"16px", animation:"fadeUp 0.3s ease forwards", position:"relative", zIndex:1 },
  cookHeader: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  cookTitle: { fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:800, color:"#f5ede0" },
  cookSub: { fontSize:"13px", color:"#907050", marginTop:"2px" },
  levelPill: { display:"flex", alignItems:"center", gap:"4px", background:"rgba(255,207,92,0.1)", border:"1px solid rgba(255,207,92,0.3)", borderRadius:"999px", padding:"6px 12px", fontSize:"14px", color:"#ffcf5c" },
  pantryPreview: { display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap", padding:"10px 14px", background:"#1a1610", borderRadius:"10px", border:"1px solid #2a2010" },
  pantryPreviewLabel: { fontSize:"12px", color:"#907050" },
  pantryChip: { background:"#2a2010", borderRadius:"999px", padding:"3px 10px", fontSize:"12px", color:"#c0a060" },
  pantryMore: { fontSize:"12px", color:"#ff8c38" },
  actionCards: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" },
  actionCard: { display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", padding:"20px 16px", borderRadius:"16px", border:"none", cursor:"pointer", transition:"transform 0.15s" },
  actionCardOrange: { background:"linear-gradient(135deg,#ff7a20,#ff5500)", color:"#fff", boxShadow:"0 8px 24px rgba(255,85,0,0.35)" },
  actionCardDark: { background:"#1e1a14", color:"#f5ede0", border:"1px solid #3a3020" },
  actionCardEmoji: { fontSize:"40px" },
  featureChips: { display:"flex", flexWrap:"wrap", gap:"8px" },
  featureChip: { background:"#1e1a14", border:"1px solid #3a3020", borderRadius:"999px", padding:"6px 12px", fontSize:"12px", color:"#c0a880" },

  backBtn: { background:"none", border:"none", color:"#ff8c38", cursor:"pointer", fontSize:"14px", fontFamily:"'DM Sans',sans-serif", padding:0 },
  imgPreviewWrap: { width:"100%", borderRadius:"14px", overflow:"hidden", border:"2px solid #2a2010" },
  imgPreview: { width:"100%", display:"block", maxHeight:"280px", objectFit:"cover" },
  imgLabel: { background:"#1a1610", padding:"10px 16px", fontSize:"13px", color:"#c0a880", textAlign:"center" },
  inputTitle: { fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:700, color:"#f5ede0", marginBottom:"6px" },
  inputHint: { fontSize:"13px", color:"#806040", marginBottom:"12px" },
  textarea: { width:"100%", background:"#1a1610", border:"2px solid #3a3020", borderRadius:"12px", color:"#f5ede0", padding:"12px", fontSize:"15px", fontFamily:"'DM Sans',sans-serif", resize:"vertical", outline:"none" },
  pantryUsed: { marginTop:"12px", padding:"10px", background:"#1a1610", borderRadius:"10px", border:"1px solid #2a2010" },
  pantryTag: { background:"#2a2010", borderRadius:"999px", padding:"4px 10px", fontSize:"12px", color:"#c0a060", cursor:"pointer" },
  analyzeBtn: { background:"linear-gradient(135deg,#ff7a20,#ff5500)", color:"#fff", border:"none", borderRadius:"14px", padding:"16px", fontSize:"16px", fontFamily:"'Syne',sans-serif", fontWeight:700, cursor:"pointer", boxShadow:"0 8px 24px rgba(255,85,0,0.35)", width:"100%" },
  analyzingTitle: { fontFamily:"'Syne',sans-serif", fontSize:"26px", fontWeight:800, background:"linear-gradient(135deg,#ff8c38,#ffcf5c)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },

  recipeTabs: { display:"flex", gap:"8px", flexWrap:"wrap" },
  recipeTab: { background:"#1a1610", border:"1px solid #3a3020", borderRadius:"999px", color:"#a08060", padding:"7px 14px", fontSize:"12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  recipeTabActive: { background:"linear-gradient(135deg,#ff7a20,#ff5500)", border:"1px solid transparent", color:"#fff", boxShadow:"0 4px 16px rgba(255,85,0,0.3)" },
  recipeCard: { background:"#141008", border:"1px solid #2a2010", borderRadius:"20px", padding:"20px", display:"flex", flexDirection:"column", gap:"16px" },
  rcHeader: { display:"flex", gap:"14px", alignItems:"flex-start" },
  rcEmoji: { fontSize:"48px", flexShrink:0 },
  rcName: { fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:800, color:"#f5ede0" },
  rcDesc: { fontSize:"13px", color:"#907050", lineHeight:1.5, marginTop:"3px" },
  healthTag: { background:"rgba(76,175,122,0.15)", border:"1px solid rgba(76,175,122,0.3)", borderRadius:"999px", padding:"2px 8px", fontSize:"10px", color:"#4caf7d" },
  dietTag: { background:"rgba(255,207,92,0.12)", border:"1px solid rgba(255,207,92,0.25)", borderRadius:"999px", padding:"2px 8px", fontSize:"10px", color:"#ffcf5c" },
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" },
  statCell: { background:"#1e1a10", border:"1px solid #2e2810", borderRadius:"10px", padding:"10px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" },
  statVal: { fontSize:"12px", fontWeight:700, color:"#ffcf5c" },
  statLbl: { fontSize:"9px", color:"#706040", textTransform:"uppercase", letterSpacing:"0.05em" },
  section: { borderTop:"1px solid #2a2010", paddingTop:"14px" },
  sectionTitle: { fontFamily:"'Syne',sans-serif", fontSize:"14px", fontWeight:700, color:"#ff8c38", marginBottom:"10px", letterSpacing:"0.02em" },
  ingRow: { display:"flex", alignItems:"center", gap:"10px", fontSize:"14px", color:"#d0b890", marginBottom:"5px" },
  check: { color:"#4caf7d", fontSize:"12px" },
  missingRow: { display:"flex", flexDirection:"column", gap:"3px", fontSize:"13px", marginBottom:"8px" },
  deliveryLink: { display:"inline-block", background:"#1e1a10", border:"1px solid #3a3020", borderRadius:"10px", padding:"8px 14px", fontSize:"12px", color:"#ffcf5c", textDecoration:"none", fontWeight:600, marginTop:"4px" },
  stepRow: { display:"flex", gap:"10px", alignItems:"flex-start", marginBottom:"8px" },
  stepNum: { background:"linear-gradient(135deg,#ff7a20,#ff5500)", color:"#fff", borderRadius:"50%", width:"22px", height:"22px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:700, flexShrink:0, marginTop:"1px" },
  tipBox: { background:"rgba(255,207,92,0.07)", border:"1px solid rgba(255,207,92,0.18)", borderRadius:"12px", padding:"12px", display:"flex", gap:"10px" },
  flavorChip: { background:"rgba(255,140,56,0.1)", border:"1px solid rgba(255,140,56,0.25)", borderRadius:"999px", padding:"4px 10px", fontSize:"12px", color:"#ff9050" },
  noteSection: { borderTop:"1px solid #2a2010", paddingTop:"14px" },
  noteToggle: { background:"none", border:"1px solid #3a3020", borderRadius:"8px", color:"#907050", padding:"8px 14px", cursor:"pointer", fontSize:"13px", fontFamily:"'DM Sans',sans-serif" },
  rcActions: { display:"flex", gap:"8px" },
  rcBtn: { flex:1, padding:"10px 8px", borderRadius:"10px", border:"none", cursor:"pointer", fontSize:"13px", fontFamily:"'DM Sans',sans-serif", fontWeight:600 },
  rcBtnGreen: { background:"rgba(76,175,122,0.2)", border:"1px solid rgba(76,175,122,0.4)", color:"#4caf7d" },
  rcBtnOutline: { background:"#1e1a10", border:"1px solid #3a3020", color:"#907050" },
  rcBtnSaved: { background:"rgba(255,207,92,0.15)", border:"1px solid rgba(255,207,92,0.3)", color:"#ffcf5c" },
  rcBtnShare: { background:"rgba(255,0,80,0.1)", border:"1px solid rgba(255,0,80,0.3)", color:"#ff5090" },
  shareTag: { textAlign:"center", fontSize:"12px", color:"#ff8c38", fontWeight:700, padding:"8px", background:"rgba(255,140,56,0.06)", borderRadius:"10px" },

  feedHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"10px" },
  tabTitle: { fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:800, color:"#f5ede0" },
  feedToggle: { display:"flex", gap:"6px" },
  feedToggleBtn: { background:"#1a1610", border:"1px solid #2a2010", borderRadius:"8px", color:"#907050", padding:"7px 10px", cursor:"pointer", fontSize:"12px", fontFamily:"'DM Sans',sans-serif" },
  feedToggleBtnActive: { background:"rgba(255,122,32,0.2)", border:"1px solid rgba(255,122,32,0.4)", color:"#ff8c38" },
  feedPost: { background:"#141008", border:"1px solid #2a2010", borderRadius:"16px", padding:"16px" },
  feedPostHeader: { display:"flex", gap:"10px", alignItems:"center", marginBottom:"10px" },
  userLevelBadge: { background:"rgba(255,207,92,0.15)", borderRadius:"999px", padding:"2px 8px", fontSize:"11px", color:"#ffcf5c", fontWeight:700 },
  feedTag: { background:"rgba(76,175,122,0.1)", border:"1px solid rgba(76,175,122,0.2)", borderRadius:"999px", padding:"2px 8px", fontSize:"10px", color:"#4caf7d" },
  feedActions: { display:"flex", gap:"8px" },
  feedActionBtn: { background:"none", border:"none", cursor:"pointer", fontSize:"13px", color:"#907050", fontFamily:"'DM Sans',sans-serif", padding:"6px 10px", borderRadius:"8px" },
  challengeCard: { background:"#141008", border:"1px solid #2a2010", borderRadius:"14px", padding:"16px" },
  joinBtn: { background:"linear-gradient(135deg,#ff7a20,#ff5500)", border:"none", borderRadius:"8px", color:"#fff", padding:"8px 14px", cursor:"pointer", fontSize:"13px", fontFamily:"'DM Sans',sans-serif", fontWeight:700, flexShrink:0 },
  joinBtnDone: { background:"rgba(76,175,122,0.2)", border:"1px solid rgba(76,175,122,0.4)", color:"#4caf7d" },
  lbHeader: { padding:"8px 0", borderBottom:"1px solid #2a2010", marginBottom:"4px" },
  lbRow: { display:"flex", gap:"12px", alignItems:"center", padding:"10px 12px", borderRadius:"10px", background:"#141008", border:"1px solid #1e1810" },
  lbRowMe: { background:"rgba(255,207,92,0.06)", border:"1px solid rgba(255,207,92,0.2)" },
  lbRank: { fontSize:"20px", width:"28px", textAlign:"center" },

  pantryInputRow: { display:"flex", gap:"8px" },
  pantryInputField: { flex:1, background:"#1a1610", border:"2px solid #3a3020", borderRadius:"10px", color:"#f5ede0", padding:"12px", fontSize:"14px", fontFamily:"'DM Sans',sans-serif", outline:"none" },
  pantryAddBtn: { background:"linear-gradient(135deg,#ff7a20,#ff5500)", border:"none", borderRadius:"10px", color:"#fff", padding:"12px 20px", cursor:"pointer", fontSize:"20px", fontWeight:700 },
  pantryGrid: { display:"flex", flexWrap:"wrap", gap:"8px" },
  pantryItem: { display:"flex", alignItems:"center", gap:"8px", background:"#1e1a10", border:"1px solid #2e2810", borderRadius:"999px", padding:"6px 14px" },
  pantryRemove: { background:"none", border:"none", color:"#ff7070", cursor:"pointer", fontSize:"16px", lineHeight:1, padding:"0 2px" },
  suggestionChip: { background:"none", border:"1px solid #3a3020", borderRadius:"999px", color:"#907050", padding:"5px 12px", cursor:"pointer", fontSize:"12px", fontFamily:"'DM Sans',sans-serif" },

  savedToggle: { display:"flex", gap:"6px" },
  savedToggleBtn: { flex:1, background:"#1a1610", border:"1px solid #2a2010", borderRadius:"10px", color:"#907050", padding:"10px", cursor:"pointer", fontSize:"13px", fontFamily:"'DM Sans',sans-serif" },
  savedToggleBtnActive: { background:"rgba(255,122,32,0.15)", border:"1px solid rgba(255,122,32,0.4)", color:"#ff8c38" },
  savedCard: { background:"#141008", border:"1px solid #2a2010", borderRadius:"14px", padding:"14px", cursor:"pointer" },
  analyticsGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
  analyticsCard: { background:"#141008", border:"1px solid #2a2010", borderRadius:"14px", padding:"16px", display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" },

  profileHero: { background:"#141008", border:"1px solid #2a2010", borderRadius:"20px", padding:"24px", display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" },
  avatarCircle: { width:"80px", height:"80px", borderRadius:"50%", background:"rgba(255,122,32,0.15)", border:"2px solid rgba(255,122,32,0.3)", display:"flex", alignItems:"center", justifyContent:"center" },
  levelBadge: { background:"rgba(255,207,92,0.15)", border:"1px solid rgba(255,207,92,0.3)", borderRadius:"999px", padding:"4px 12px", fontSize:"13px", color:"#ffcf5c", fontWeight:700 },
  xpBar: { height:"6px", background:"#2a2010", borderRadius:"999px", width:"200px", overflow:"hidden", marginTop:"6px" },
  xpFill: { height:"100%", background:"linear-gradient(90deg,#ff7a20,#ffcf5c)", borderRadius:"999px", transition:"width 0.5s ease" },
  editProfileBtn: { background:"none", border:"1px solid #3a3020", borderRadius:"10px", color:"#907050", padding:"8px 18px", cursor:"pointer", fontSize:"13px", fontFamily:"'DM Sans',sans-serif" },
  statsRow2: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" },
  profileStat: { background:"#141008", border:"1px solid #2a2010", borderRadius:"12px", padding:"12px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" },
  badgeGrid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px" },
  badgeItem: { background:"#1a1610", border:"1px solid #2a2010", borderRadius:"12px", padding:"12px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" },

  modalOverlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100, padding:"20px" },
  modal: { background:"#1a1610", border:"1px solid #3a3020", borderRadius:"24px 24px 0 0", padding:"28px 24px", width:"100%", maxWidth:"480px", maxHeight:"85vh", overflowY:"auto" },
  modalClose: { background:"none", border:"none", color:"#907050", fontSize:"24px", cursor:"pointer" },
  modalLabel: { fontSize:"13px", color:"#ff8c38", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:"8px", marginTop:"16px" },
  modalInput: { width:"100%", background:"#141008", border:"2px solid #2a2010", borderRadius:"10px", color:"#f5ede0", padding:"12px", fontSize:"14px", fontFamily:"'DM Sans',sans-serif", outline:"none", marginBottom:"4px" },
  avatarOption: { fontSize:"32px", background:"#141008", border:"2px solid #2a2010", borderRadius:"10px", width:"48px", height:"48px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" },
  avatarOptionActive: { border:"2px solid #ff7a20", background:"rgba(255,122,32,0.15)" },
  prefChip: { background:"#141008", border:"1px solid #2a2010", borderRadius:"999px", color:"#907050", padding:"6px 12px", cursor:"pointer", fontSize:"12px", fontFamily:"'DM Sans',sans-serif" },
  prefChipActive: { background:"rgba(76,175,122,0.15)", border:"1px solid rgba(76,175,122,0.4)", color:"#4caf7d" },
  prefChipRed: { background:"rgba(255,112,112,0.15)", border:"1px solid rgba(255,112,112,0.4)", color:"#ff7070" },

  toast: { position:"fixed", top:"20px", left:"50%", transform:"translateX(-50%)", background:"#1e1a10", border:"1px solid #3a3020", borderRadius:"12px", padding:"12px 20px", display:"flex", alignItems:"center", gap:"10px", zIndex:200, boxShadow:"0 8px 24px rgba(0,0,0,0.5)", animation:"fadeUp 0.3s ease", whiteSpace:"nowrap" },
  bottomNav: { position:"fixed", bottom:0, left:0, right:0, background:"rgba(15,13,10,0.95)", borderTop:"1px solid #2a2010", display:"flex", justifyContent:"space-around", padding:"8px 0", backdropFilter:"blur(20px)", zIndex:50 },
  navItem: { display:"flex", flexDirection:"column", alignItems:"center", background:"none", border:"none", cursor:"pointer", color:"#504030", padding:"6px 12px", borderRadius:"10px", fontFamily:"'DM Sans',sans-serif", minWidth:"52px" },
  navItemActive: { color:"#ff8c38" },

  // Scan banner
  scanBanner: { display:"flex", alignItems:"center", gap:"10px", background:"#1a1610", border:"1px solid #2a2010", borderRadius:"12px", padding:"12px 14px" },
  scanBannerRed: { background:"rgba(255,80,80,0.08)", border:"1px solid rgba(255,80,80,0.2)" },
  scanBannerBtn: { background:"linear-gradient(135deg,#ff7a20,#ff5500)", border:"none", borderRadius:"8px", color:"#fff", padding:"6px 12px", cursor:"pointer", fontSize:"12px", fontWeight:700, fontFamily:"'DM Sans',sans-serif", flexShrink:0 },
  scanMeter: { display:"flex", gap:"4px" },
  scanDot: { width:"8px", height:"8px", borderRadius:"50%" },

  // Pricing tab
  pricingHeader: { position:"relative", background:"#141008", border:"1px solid #2a2010", borderRadius:"20px", padding:"28px 20px", textAlign:"center", overflow:"hidden" },
  pricingGlow: { position:"absolute", top:"-60px", left:"50%", transform:"translateX(-50%)", width:"300px", height:"200px", background:"radial-gradient(ellipse, rgba(255,122,32,0.15), transparent 70%)", pointerEvents:"none" },
  pricingEyebrow: { fontSize:"13px", color:"#ff8c38", fontWeight:600, marginBottom:"8px" },
  pricingTitle: { fontFamily:"'Syne',sans-serif", fontSize:"26px", fontWeight:800, color:"#f5ede0", marginBottom:"8px" },
  pricingSubtitle: { fontSize:"14px", color:"#907050", lineHeight:1.6, marginBottom:"20px" },
  billingToggle: { display:"inline-flex", background:"#0f0d0a", border:"1px solid #2a2010", borderRadius:"10px", padding:"4px" },
  billingBtn: { background:"none", border:"none", borderRadius:"7px", color:"#907050", padding:"8px 16px", cursor:"pointer", fontSize:"13px", fontFamily:"'DM Sans',sans-serif", fontWeight:500, display:"flex", alignItems:"center", gap:"6px" },
  billingBtnActive: { background:"#1e1a10", color:"#f5ede0", fontWeight:700 },
  saveBadge: { background:"rgba(76,175,122,0.2)", border:"1px solid rgba(76,175,122,0.3)", borderRadius:"999px", padding:"2px 6px", fontSize:"10px", color:"#4caf7d" },
  planCards: { display:"flex", flexDirection:"column", gap:"12px" },
  planCard: { background:"#141008", border:"1px solid #2a2010", borderRadius:"18px", padding:"20px", position:"relative", overflow:"hidden" },
  planCardPopular: { border:"1px solid rgba(255,122,32,0.4)", boxShadow:"0 0 30px rgba(255,122,32,0.1)" },
  planCardPro: { border:"1px solid rgba(255,207,92,0.4)", boxShadow:"0 0 30px rgba(255,207,92,0.08)" },
  planCardCurrent: { border:"1px solid rgba(76,175,122,0.4)" },
  planBadge: { position:"absolute", top:"12px", right:"12px", borderRadius:"999px", padding:"4px 10px", fontSize:"10px", color:"#fff", fontWeight:700, letterSpacing:"0.05em" },
  currentBadge: { position:"absolute", top:"12px", right:"12px", background:"rgba(76,175,122,0.2)", border:"1px solid rgba(76,175,122,0.4)", borderRadius:"999px", padding:"4px 10px", fontSize:"10px", color:"#4caf7d", fontWeight:700 },
  planEmoji: { fontSize:"36px", marginBottom:"8px" },
  planName: { fontFamily:"'Syne',sans-serif", fontSize:"18px", fontWeight:800, marginBottom:"10px" },
  planPriceRow: { display:"flex", alignItems:"baseline", gap:"2px", marginBottom:"4px" },
  planPriceDollar: { fontSize:"20px", color:"#907050", fontWeight:700 },
  planPrice: { fontFamily:"'Syne',sans-serif", fontSize:"40px", fontWeight:800, color:"#ff8c38", lineHeight:1 },
  planPricePer: { fontSize:"14px", color:"#706040" },
  annualNote: { fontSize:"11px", color:"#706040", marginBottom:"8px" },
  planFeatures: { display:"flex", flexDirection:"column", gap:"7px", margin:"16px 0" },
  planFeatureRow: { display:"flex", gap:"10px", alignItems:"flex-start" },
  planCta: { width:"100%", padding:"14px", borderRadius:"12px", border:"none", cursor:"pointer", fontSize:"15px", fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:"0.01em" },
  planCtaCurrent: { textAlign:"center", fontSize:"13px", color:"#4caf7d", padding:"10px", display:"block", width:"100%" },
  socialProof: { background:"#141008", border:"1px solid #2a2010", borderRadius:"16px", padding:"20px" },

  // Lock screen
  lockBadge: { background:"rgba(255,122,32,0.15)", border:"1px solid rgba(255,122,32,0.3)", borderRadius:"999px", padding:"6px 16px", fontSize:"13px", color:"#ff8c38", fontWeight:700 },

  // Profile plan card
  planCardProfile: { border:"1px solid #2a2010", borderRadius:"14px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"12px" },
  planUpgradeBtn: { background:"linear-gradient(135deg,#ff7a20,#ff5500)", border:"none", borderRadius:"10px", color:"#fff", padding:"8px 14px", cursor:"pointer", fontSize:"12px", fontWeight:700, fontFamily:"'DM Sans',sans-serif", flexShrink:0 },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  button:hover { opacity: 0.88; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #3a3020; border-radius: 4px; }
  textarea:focus, input:focus { border-color: #ff7a20 !important; }
`;
