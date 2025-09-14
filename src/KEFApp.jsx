// KEFApp.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Heart,
  Users,
  BookOpen,
  Award,
  Share2,
  CheckCircle,
  LogIn,
  LogOut,
  User,
  GraduationCap,
  Star,
  ArrowDown,
  Play,
  Calendar,
  MapPin,
  Target,
} from "lucide-react";
import { male1, male2, male3, female1, female2 } from "./assets/assets";

/* ---------------------------
   Config & Helpers
   --------------------------- */
const PUZZLE_CONFIG = {
  tilesPerRow: 6,
  tilesPerColumn: 4,
  tileWidth: 80,
  tileHeight: 80,
  totalPieces: 24,
};

const KEF_COLORS = {
  primary: "#1e40af",
  hope: "#059669",
  urgency: "#dc2626",
  warmth: "#ea580c",
  sunshine: "#f59e0b",
  light: "#f8fafc",
  success: "#10b981",
};

function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ---------------------------
   Main Component
   --------------------------- */
const KEFApp = () => {
  const canvasRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const [hiddenPieces, setHiddenPieces] = useState(
    Array.from({ length: PUZZLE_CONFIG.totalPieces }, (_, i) => i)
  );
  const [pieceOwners, setPieceOwners] = useState({});
  const [totalRaised, setTotalRaised] = useState(847500);
  const [puzzleTabs, setPuzzleTabs] = useState([]);

  const [showCompletion, setShowCompletion] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationAmount, setDonationAmount] = useState(250);

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isTouching, setIsTouching] = useState(false);
  const touchStartRef = useRef(null);
  const touchDeltaRef = useRef(0);

  const [showLogin, setShowLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", name: "" });
  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState({
    "demo@kef.org": { name: "Sarah Mitchell", password: "demo123" },
    "volunteer@kef.org": { name: "Community Volunteer", password: "volunteer123" },
  });

  const studentStories = [
    {
      name: "Grace Wanjiku",
      image:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&h=800&fit=crop&crop=faces&auto=format&q=60",
      story:
        "Growing up in a small village in Central Kenya, Grace longed to study medicine but her family could not afford school fees. KEF provided her with a scholarship, mentorship, and hope. She excelled academically, graduated top of her class, and is now pursuing medicine with the dream of serving rural communities.",
      achievement: "Medical Student",
      location: "Central Kenya",
      bgColor: [KEF_COLORS.hope, KEF_COLORS.primary],
    },
    {
      name: "David Kimani",
      image: male1,
      story:
        "After losing both parents at a young age, David believed his dream of finishing school had ended. KEF stepped in with scholarship aid, mentorship, and emotional support. He not only completed high school but went on to university, and today works as a community officer empowering vulnerable families in Nairobi.",
      achievement: "Community Development Officer",
      location: "Nairobi County",
      bgColor: [KEF_COLORS.primary, KEF_COLORS.warmth],
    },
    {
      name: "Mary Chepkemoi",
      image: female2,
      story:
        "As the daughter of a pastoralist family, Mary faced immense cultural pressure to abandon school. KEF offered her the chance to pursue education with dignity. Through resilience and mentorship, she graduated in engineering and now designs water systems in drought-prone regions, improving lives and inspiring young girls from her community.",
      achievement: "Water Systems Engineer",
      location: "Rift Valley",
      bgColor: [KEF_COLORS.sunshine, KEF_COLORS.hope],
    },
    {
      name: "Joseph Mwangi",
      image: male2,
      story:
        "Growing up in Nairobi’s Kibera slum, Joseph encountered poverty, crime, and limited opportunities. KEF’s scholarship and dedicated mentors gave him structure and hope. Today, he’s a self-taught coder, a software developer building civic tech platforms, and an advocate for digital literacy among youth in underprivileged urban settlements across Kenya.",
      achievement: "Software Developer",
      location: "Nairobi - Kibera",
      bgColor: [KEF_COLORS.warmth, KEF_COLORS.primary],
    },
    {
      name: "Fatuma Hassan",
      image: female2, // if you’d like, we can add female3 for better variety
      story:
        "From a nomadic family in Northern Kenya, Fatuma became the first girl in her community to attend high school thanks to KEF. Despite opposition, she excelled. KEF’s continued support carried her through nursing school. Today she serves as a registered nurse, inspiring other girls to pursue education and healthcare careers.",
      achievement: "Registered Nurse",
      location: "Northern Kenya",
      bgColor: [KEF_COLORS.hope, KEF_COLORS.sunshine],
    },
    {
      name: "Peter Otieno",
      image: male3,
      story:
        "Raised in a fishing village along Lake Victoria, Peter often missed school to help support his family. KEF’s scholarship enabled him to stay in class, where he discovered a passion for environmental science. Today, he works on sustainable fishing initiatives that protect livelihoods while preserving the lake’s ecosystem.",
      achievement: "Environmental Scientist",
      location: "Kisumu County",
      bgColor: [KEF_COLORS.sunshine, KEF_COLORS.primary],
    },

  ];



  const uniqueDonorCount = useMemo(() => {
    const names = Object.values(pieceOwners || {});
    return new Set(names).size;
  }, [pieceOwners]);

  function getUniqueDonors() {
    return uniqueDonorCount;
  }

  /* ---------------------------
     Generate puzzle tabs (matching edges)
     --------------------------- */
  useEffect(() => {
    const cols = PUZZLE_CONFIG.tilesPerRow;
    const rows = PUZZLE_CONFIG.tilesPerColumn;
    const tabs = Array(rows * cols)
      .fill(0)
      .map(() => ({ topTab: 0, rightTab: 0, bottomTab: 0, leftTab: 0 }));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (c < cols - 1) {
          const val = Math.random() > 0.5 ? 1 : -1;
          tabs[idx].rightTab = val;
          tabs[r * cols + (c + 1)].leftTab = -val;
        }
        if (r < rows - 1) {
          const val = Math.random() > 0.5 ? 1 : -1;
          tabs[idx].bottomTab = val;
          tabs[(r + 1) * cols + c].topTab = -val;
        }
      }
    }
    setPuzzleTabs(tabs);
  }, []);

  /* ---------------------------
     createPieceShape - robust jigsaw path (from user's original)
     --------------------------- */
  const createPieceShape = useCallback(
    (ctx, x, y, width, height, topTab, rightTab, bottomTab, leftTab) => {
      const tabSize = width * 0.2;

      ctx.beginPath();
      ctx.moveTo(x, y);

      // Top edge
      if (topTab !== 0) {
        ctx.lineTo(x + width * 0.4, y);
        ctx.bezierCurveTo(
          x + width * 0.35,
          y - topTab * tabSize * 0.25,
          x + width * 0.35,
          y - topTab * tabSize,
          x + width * 0.5,
          y - topTab * tabSize
        );
        ctx.bezierCurveTo(
          x + width * 0.65,
          y - topTab * tabSize,
          x + width * 0.65,
          y - topTab * tabSize * 0.25,
          x + width * 0.6,
          y
        );
        ctx.lineTo(x + width, y);
      } else {
        ctx.lineTo(x + width, y);
      }

      // Right edge
      if (rightTab !== 0) {
        ctx.lineTo(x + width, y + height * 0.4);
        ctx.bezierCurveTo(
          x + width + rightTab * tabSize * 0.25,
          y + height * 0.35,
          x + width + rightTab * tabSize,
          y + height * 0.35,
          x + width + rightTab * tabSize,
          y + height * 0.5
        );
        ctx.bezierCurveTo(
          x + width + rightTab * tabSize,
          y + height * 0.65,
          x + width + rightTab * tabSize * 0.25,
          y + height * 0.65,
          x + width,
          y + height * 0.6
        );
        ctx.lineTo(x + width, y + height);
      } else {
        ctx.lineTo(x + width, y + height);
      }

      // Bottom edge
      if (bottomTab !== 0) {
        ctx.lineTo(x + width * 0.6, y + height);
        ctx.bezierCurveTo(
          x + width * 0.65,
          y + height + bottomTab * tabSize * 0.25,
          x + width * 0.65,
          y + height + bottomTab * tabSize,
          x + width * 0.5,
          y + height + bottomTab * tabSize
        );
        ctx.bezierCurveTo(
          x + width * 0.35,
          y + height + bottomTab * tabSize,
          x + width * 0.35,
          y + height + bottomTab * tabSize * 0.25,
          x + width * 0.4,
          y + height
        );
        ctx.lineTo(x, y + height);
      } else {
        ctx.lineTo(x, y + height);
      }

      // Left edge
      if (leftTab !== 0) {
        ctx.lineTo(x, y + height * 0.6);
        ctx.bezierCurveTo(
          x - leftTab * tabSize * 0.25,
          y + height * 0.65,
          x - leftTab * tabSize,
          y + height * 0.65,
          x - leftTab * tabSize,
          y + height * 0.5
        );
        ctx.bezierCurveTo(
          x - leftTab * tabSize,
          y + height * 0.35,
          x - leftTab * tabSize * 0.25,
          y + height * 0.35,
          x,
          y + height * 0.4
        );
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      ctx.closePath();
    },
    []
  );

  /* ---------------------------
     drawPuzzle - uses createPieceShape for correct geometry
     --------------------------- */
  const drawPuzzle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || puzzleTabs.length === 0) return;
    const ctx = canvas.getContext("2d");

    // responsive sizing based on parent width
    const parent = canvas.parentElement || document.body;
    const styleW = Math.min(parent.clientWidth || 800, 960);
    const styleH = 420;
    const DPR = window.devicePixelRatio || 1;

    canvas.style.width = `${styleW}px`;
    canvas.style.height = `${styleH}px`;
    canvas.width = Math.floor(styleW * DPR);
    canvas.height = Math.floor(styleH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);

    // background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width / DPR, canvas.height / DPR);
    gradient.addColorStop(0, hexToRgba("#f0f9ff", 1));
    gradient.addColorStop(0.5, hexToRgba("#ecfdf5", 1));
    gradient.addColorStop(1, hexToRgba("#fff7ed", 1));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width / DPR, canvas.height / DPR);

    // faint pattern
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = hexToRgba(KEF_COLORS.primary, 1);
    ctx.font = "18px serif";
    for (let i = 0; i < 20; i++) {
      const x = (i * 50) % (canvas.width / DPR);
      const y = 30 + Math.floor(i / 12) * 50;
      ctx.fillText("🎓", x, y);
    }
    ctx.restore();

    const { tileWidth, tileHeight, tilesPerRow } = PUZZLE_CONFIG;
    const startX = 40;
    const startY = 30;

    const colorVariations = [
      [KEF_COLORS.hope, "#047857"],
      [KEF_COLORS.primary, "#1e3a8a"],
      [KEF_COLORS.warmth, "#c2410c"],
      [KEF_COLORS.sunshine, "#d97706"],
    ];

    for (let i = 0; i < PUZZLE_CONFIG.totalPieces; i++) {
      const row = Math.floor(i / tilesPerRow);
      const col = i % tilesPerRow;
      const x = startX + col * tileWidth;
      const y = startY + row * tileHeight;
      const tabs = puzzleTabs[i] || { topTab: 0, rightTab: 0, bottomTab: 0, leftTab: 0 };

      // Hidden placeholder
      if (hiddenPieces.includes(i)) {
        ctx.save();
        createPieceShape(ctx, x, y, tileWidth, tileHeight, 0, 0, 0, 0);
        ctx.fillStyle = "rgba(148,163,184,0.18)";
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText("HELP", x + tileWidth / 2, y + tileHeight / 2 - 6);
        ctx.fillText("NEEDED", x + tileWidth / 2, y + tileHeight / 2 + 12);
        ctx.restore();
        continue;
      }

      // Draw piece: clip to piece shape then paint gradient
      ctx.save();
      createPieceShape(ctx, x, y, tileWidth, tileHeight, tabs.topTab, tabs.rightTab, tabs.bottomTab, tabs.leftTab);
      ctx.clip();

      // piece gradient
      const cs = colorVariations[i % colorVariations.length];
      const pg = ctx.createRadialGradient(
        x + tileWidth / 2,
        y + tileHeight / 2,
        0,
        x + tileWidth / 2,
        y + tileHeight / 2,
        tileWidth
      );
      pg.addColorStop(0, hexToRgba(cs[0], 1));
      pg.addColorStop(0.7, hexToRgba(cs[1], 1));
      pg.addColorStop(1, hexToRgba(cs[1], 1));
      ctx.fillStyle = pg;
      ctx.fillRect(x - 20, y - 20, tileWidth + 40, tileHeight + 40);

      // if owner, show name at top
      const owner = pieceOwners[i];
      if (owner) {
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = "600 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(owner.length > 12 ? owner.substring(0, 10) + "…" : owner, x + tileWidth / 2, y + 12);
      }

      // central number
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "700 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((i + 1).toString(), x + tileWidth / 2, y + tileHeight / 2);

      ctx.restore();

      // Stroke border
      createPieceShape(ctx, x, y, tileWidth, tileHeight, tabs.topTab, tabs.rightTab, tabs.bottomTab, tabs.leftTab);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#374151";
      ctx.stroke();

      // Subtle glow
      ctx.save();
      ctx.shadowColor = hexToRgba(cs[0], 0.2);
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.restore();
    }
  }, [hiddenPieces, pieceOwners, puzzleTabs, createPieceShape]);

  useEffect(() => {
    drawPuzzle();
  }, [drawPuzzle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    resizeObserverRef.current = new ResizeObserver(() => {
      drawPuzzle();
    });
    resizeObserverRef.current.observe(parent);
    return () => {
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
    };
  }, [drawPuzzle]);

  /* ---------------------------
     Unlock pieces (donation)
     --------------------------- */
  const unlockPieces = (count, userName) => {
    if (hiddenPieces.length === 0) return [];
    const piecesToUnlock = Math.min(count, hiddenPieces.length);
    const newHidden = [...hiddenPieces];
    const newOwners = { ...pieceOwners };
    for (let i = 0; i < piecesToUnlock; i++) {
      const pickIndex = Math.floor(Math.random() * newHidden.length);
      const pieceIndex = newHidden.splice(pickIndex, 1)[0];
      newOwners[pieceIndex] = userName;
    }
    setHiddenPieces(newHidden);
    setPieceOwners(newOwners);
    setTotalRaised((p) => p + piecesToUnlock * 250);
    if (newHidden.length === 0) {
      setTimeout(() => setShowCompletion(true), 700);
    }
  };

  const handleDonation = async () => {
    if (!currentUser) {
      alert("Please log in to donate.");
      setShowLogin(true);
      return;
    }
    if (donationAmount < 250) {
      alert("Minimum donation is $250.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const pieces = Math.floor(donationAmount / 250);
      unlockPieces(pieces, currentUser.name);
      setIsProcessing(false);
    }, 1200);
  };

  /* ---------------------------
     Auth
     --------------------------- */
  const handleLogin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const user = users[loginForm.email];
    if (user && user.password === loginForm.password) {
      setCurrentUser({ email: loginForm.email, name: user.name });
      setShowLogin(false);
      setLoginForm({ email: "", password: "", name: "" });
    } else {
      alert("Invalid credentials. Try demo@kef.org / demo123");
    }
  };

  const handleRegister = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (users[loginForm.email]) {
      alert("User already exists");
      return;
    }
    if (loginForm.email && loginForm.password && loginForm.name) {
      setUsers((prev) => ({
        ...prev,
        [loginForm.email]: { name: loginForm.name, password: loginForm.password },
      }));
      setCurrentUser({ email: loginForm.email, name: loginForm.name });
      setShowLogin(false);
      setLoginForm({ email: "", password: "", name: "" });
    } else {
      alert("Please fill all fields");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  /* ---------------------------
     Stories swipe/auto-rotate
     --------------------------- */
  useEffect(() => {
    const t = setInterval(() => {
      if (!isTouching) setCurrentStoryIndex((s) => (s + 1) % studentStories.length);
    }, 5000);
    return () => clearInterval(t);
  }, [isTouching]);

  const handleTouchStart = (e) => {
    setIsTouching(true);
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    touchStartRef.current = x;
    touchDeltaRef.current = 0;
  };
  const handleTouchMove = (e) => {
    if (touchStartRef.current == null) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    touchDeltaRef.current = x - touchStartRef.current;
  };
  const handleTouchEnd = () => {
    setIsTouching(false);
    const delta = touchDeltaRef.current;
    if (Math.abs(delta) > 60) {
      if (delta < 0) {
        setCurrentStoryIndex((s) => Math.min(s + 1, studentStories.length - 1));
      } else {
        setCurrentStoryIndex((s) => Math.max(s - 1, 0));
      }
    }
    touchStartRef.current = null;
    touchDeltaRef.current = 0;
  };

  /* ---------------------------
     Share helper
     --------------------------- */
  const shareSuccess = () => {
    const text = `🎓 I just helped unlock education for Kenyan students through @KenyaEducationFund! Join me in building futures, piece by piece. #EducationMatters`;
    if (navigator.share) {
      navigator.share({ text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text + " " + window.location.href);
      alert("Copied share text to clipboard.");
    }
  };

  /* ---------------------------
     Render
     --------------------------- */
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-white">
                <User />
              </div>
              <div>
                <h3 className="text-xl font-bold">{isRegistering ? "Create account" : "Welcome back"}</h3>
                <p className="text-sm text-gray-600">
                  {isRegistering ? "Join the KEF community." : "Log in to donate and see your name on pieces."}
                </p>
              </div>
            </div>

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-3">
              {isRegistering && (
                <div>
                  <label className="block text-sm font-medium mb-1">Full name</label>
                  <input
                    type="text"
                    value={loginForm.name}
                    onChange={(e) => setLoginForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="you@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="••••••"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-2 rounded-lg font-semibold">
                  {isRegistering ? "Create account" : "Log in"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false);
                    setIsRegistering(false);
                  }}
                  className="flex-1 bg-gray-100 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-3 text-center text-sm">
              <button type="button" onClick={() => setIsRegistering((s) => !s)} className="text-blue-600 font-medium">
                {isRegistering ? "Already have an account? Log in" : "New here? Create account"}
              </button>
            </div>

            {!isRegistering && (
              <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm">
                <strong>Demo:</strong> demo@kef.org / demo123
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 via-emerald-600 to-orange-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src=".../assets/logo.jpg" alt="" />
            <div>
              <div className="font-bold">Kenya Education Fund</div>
              <div className="text-xs text-blue-100">Empowering futures since 2006</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="hidden sm:block text-right">
                  <div className="text-lg">Welcome back</div>
                  <div className="font-medium">{currentUser.name}</div>
                </div>
                <button onClick={handleLogout} className="px-3 py-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30">
                  <LogOut />
                </button>
              </>
            ) : (
              <>
                <div className="text-lg">Login</div>
                <button onClick={() => setShowLogin(true)} className="p-2 rounded-full bg-white text-blue-600 shadow hover:bg-gray-100 transition">
                  <LogIn />
                </button></>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-2 mb-6">
              <Star className="text-yellow-300" />
              <span className="text-xl">Transforming lives since 2006</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
              Every student <span className="text-yellow-300 block">deserves a future</span>
            </h1>

            <p className="text-lg text-gray-700 mb-8 max-w-xl">
              In Kenya's remote communities, poverty can stand between a child and education.
              For just $250 per term you can unlock a student's next milestone and change a life.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById("donation-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold shadow hover:scale-105 transform transition"
              >
                <Heart className="inline-block mr-2" />
                Donate $250
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("stories-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 rounded-lg border bg-red shadow  text-white bg-yellow-400 hover:bg-white hover:text-blue-700 transition"
              >
                <Play className="inline-block mr-2" />
                See Stories
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-white mb-3">
                <GraduationCap />
              </div>
              <h3 className="text-2xl font-bold">Build Their Journey</h3>
              <p className="text-sm text-gray-600">Every piece represents a milestone towards graduation</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="text-sm text-gray-500">Progress</div>
                  <div className="text-xl font-bold">{PUZZLE_CONFIG.totalPieces - hiddenPieces.length}/24</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Raised</div>
                  <div className="text-xl font-bold">${totalRaised.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <div className="text-sm text-red-800 font-medium">
                  🚨 {hiddenPieces.length} milestones remaining
                </div>
                <div className="text-xs text-red-600">${hiddenPieces.length * 250} needed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORIES */}
      <section id="stories-section" className="py-12 bg-gradient-to-br from-blue-50 to-emerald-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold">Meet the lives you're changing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto py-4">These aren't statistics — they're real students with dreams and potential.</p>
          </div>

          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={(e) => handleTouchStart({ touches: [{ clientX: e.clientX }] })}
            onMouseMove={(e) => isTouching && handleTouchMove({ touches: [{ clientX: e.clientX }] })}
            onMouseUp={handleTouchEnd}
            className="relative"
          >
            <div className="flex flex-col gap-8 overflow-hidden">
              {studentStories.map((s, idx) => {
                const active = idx === currentStoryIndex;
                return (
                  <div key={s.name} className={`min-w-full transition-transform duration-500 transform ${active ? "scale-100" : "scale-95 opacity-60"}`} style={{ display: idx === currentStoryIndex ? "block" : "none" }}>
                    <div className="bg-white rounded-2xl shadow-lg p-6 grid md:grid-cols-3 gap-6 items-center">
                      <div className="md:col-span-1 flex items-center justify-center">
                        <div className="w-40 h-40 rounded-full overflow-hidden shadow-md" style={{ backgroundImage: `linear-gradient(135deg, ${s.bgColor[0]}, ${s.bgColor[1]})` }}>
                          <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold">{s.name}</h3>
                          <MapPin className="text-gray-500" />
                          <span className="text-sm text-gray-500">{s.location}</span>
                        </div>
                        <div className="bg-emerald-50 inline-block px-3 py-1 rounded mb-3 text-sm">
                          <strong>{s.achievement}</strong>
                        </div>
                        <p className="text-gray-700 mb-4">{s.story}</p>

                        <div className="flex items-center gap-3">
                          <button onClick={() => setCurrentStoryIndex((i) => Math.max(0, i - 1))} className="px-3 py-2 rounded bg-gray-100">Prev</button>
                          <button onClick={() => setCurrentStoryIndex((i) => Math.min(studentStories.length - 1, i + 1))} className="px-3 py-2 rounded bg-gray-100">Next</button>
                          <div className="ml-auto text-sm text-gray-500">{currentStoryIndex + 1}/{studentStories.length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center gap-2">
              {studentStories.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentStoryIndex(idx)} className={`w-3 h-3 rounded-full ${idx === currentStoryIndex ? "bg-blue-600" : "bg-gray-300"}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PUZZLE */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
              <div className="mb-4">
                <h3 className="text-2xl font-bold">Educational Journey Puzzle</h3>
                <p className="text-gray-600">Each puzzle piece is a milestone – unlock them with your donation.</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <canvas ref={canvasRef} className="w-full rounded-lg border" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded p-3">
                  <div className="text-xl font-bold">{PUZZLE_CONFIG.totalPieces - hiddenPieces.length}</div>
                  <div className="text-sm text-gray-600">Milestones</div>
                </div>
                <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 rounded p-3">
                  <div className="text-xl font-bold">${totalRaised.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Raised</div>
                </div>
                <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded p-3">
                  <div className="text-xl font-bold">{uniqueDonorCount}</div>
                  <div className="text-sm text-gray-600">Donors</div>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-4 rounded-2xl">
                <h4 className="font-semibold">What each piece covers</h4>
                <ul className="mt-2 text-sm">
                  <li>📚 Term school fees</li>
                  <li>👕 Uniforms & supplies</li>
                  <li>📖 Textbooks</li>
                  <li>💡 Life skills & mentoring</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-xl shadow">
                <h4 className="font-semibold mb-2">Your impact</h4>
                <p className="text-sm text-gray-600 mb-3">Every piece you unlock will show your name on that milestone — a permanent marker of your support.</p>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[250, 500, 750, 1000].map((a) => (
                    <button key={a} onClick={() => setDonationAmount(a)} className={`py-2 rounded ${donationAmount === a ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
                      ${a}
                      <div className="text-xs">{Math.floor(a / 250)} piece(s)</div>
                    </button>
                  ))}
                </div>

                <label className="block text-sm mb-1">Custom amount</label>
                <div className="flex gap-2">
                  <input type="number" min="250" step="250" value={donationAmount} onChange={(e) => setDonationAmount(Number(e.target.value))} className="flex-1 px-3 py-2 border rounded" />
                  <button onClick={handleDonation} disabled={isProcessing || hiddenPieces.length === 0} className="px-4 rounded bg-blue-600 text-white disabled:opacity-60">
                    {isProcessing ? "Processing..." : "Donate"}
                  </button>
                </div>

                <div className="text-xs text-gray-500 mt-2">Minimum donation $250. Payments simulated for demo.</div>
              </div>

              <div className="bg-gradient-to-r from-red-100 to-pink-100 p-4 rounded-xl">
                <div className="text-sm text-red-800 font-semibold">Urgent</div>
                <div className="text-lg font-bold">${hiddenPieces.length * 250} needed</div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* DONATION SECTION */}
      <section id="donation-section" className="py-12 bg-gradient-to-br from-red-600 via-orange-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">Transform a life today</h2>
            <p className="text-sm max-w-xl mx-auto">Your donation brings a student closer to graduation. Start with $250.</p>
          </div>

          <div className="bg-white bg-opacity-10 p-6 rounded-2xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Choose your level</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[250, 500, 750, 1000].map((a) => (
                    <button key={a} onClick={() => setDonationAmount(a)} className={`py-3 rounded shadow cursor-pointer hover:scale-103 ${donationAmount === a ? "bg-white text-blue-700" : "bg-white bg-opacity-20 text-gray-500"}`}>
                      ${a} <div className="text-xs">{Math.floor(a / 250)} piece(s)</div>
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="text-sm block mb-1">Custom amount</label>
                  <input type="number" value={donationAmount} onChange={(e) => setDonationAmount(Number(e.target.value))} className="w-full px-5 py-3 rounded shadow-sm border-2 border-gray-700" min="250" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Complete your donation</h3>
                <div className="space-y-10">
                  <button onClick={handleDonation} disabled={!currentUser || donationAmount < 250 || isProcessing} className="w-full py-3 rounded bg-white text-blue-700 disabled:opacity-60 shadow-lg">
                    {isProcessing ? "Processing..." : `Donate $${donationAmount.toLocaleString()} via Stripe`}
                  </button>

                  <button onClick={handleDonation} disabled={!currentUser || donationAmount < 250 || isProcessing} className="w-full py-3 rounded bg-blue-600 text-white disabled:opacity-60">
                    Donate via PayPal
                  </button>
                </div>

                {!currentUser && (
                  <div className="mt-4 bg-white bg-opacity-10 p-3 rounded">
                    <div className="mb-1">You must be logged in to see your name appear on pieces.</div>
                    <button onClick={() => setShowLogin(true)} className=" w-full px-3 py-2 bg-white text-blue-700 shadow cursor-pointer rounded">
                      Log in / Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLETION SCREEN */}
      {showCompletion && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-3xl text-center">
            <CheckCircle className="mx-auto text-emerald-600" />
            <h2 className="text-2xl font-bold mt-3">Asante Sana! Journey Complete</h2>
            <p className="text-gray-700 mt-2">The student's journey is fully funded — thank you for being a part of this story.</p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div>
                <div className="text-sm text-gray-500">Milestones</div>
                <div className="font-bold">{PUZZLE_CONFIG.totalPieces}/24</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Raised</div>
                <div className="font-bold">${totalRaised.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Donors</div>
                <div className="font-bold">{uniqueDonorCount}</div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-center">
              <button onClick={shareSuccess} className="px-4 py-2 bg-emerald-600 text-white rounded">Share</button>
              <button onClick={() => {
                setHiddenPieces(Array.from({ length: PUZZLE_CONFIG.totalPieces }, (_, i) => i));
                setPieceOwners({});
                setTotalRaised(847500);
                setShowCompletion(false);
              }} className="px-4 py-2 rounded border">Fund another student</button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 flex items-center justify-center">
                <GraduationCap className="text-white" />
              </div>
              <div>
                <div className="font-bold">Kenya Education Fund</div>
                <div className="text-sm text-gray-400">Transforming lives through education</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Since 2006, KEF has been breaking the cycle of poverty in Kenya by providing scholarships, life skills training and mentorship to underserved students.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Get involved</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>Become a donor</li>
              <li>Volunteer</li>
              <li>Corporate partnerships</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Learn more</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>Our impact</li>
              <li>Student stories</li>
              <li>Annual reports</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8 text-gray-500 text-sm flex justify-between">
          <div>© {new Date().getFullYear()} Kenya Education Fund</div>
          <div>EIN: 20-8705104</div>
        </div>
      </footer>
    </div>
  );
};

export default KEFApp;
