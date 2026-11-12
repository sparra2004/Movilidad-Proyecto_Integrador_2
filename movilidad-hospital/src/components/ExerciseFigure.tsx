import { useEffect, useRef, useState, type ReactNode } from "react";

/* ───────────── Utilidades de animación ───────────── */

/** Fase del ciclo (0 a 1). Es la única fuente de verdad: de ella salen el movimiento,
 *  las repeticiones, la respiración y el paso activo. */
export function usePhase(
  cycleSeconds: number,
  playing: boolean,
  resetKey: string,
  onCycle?: () => void,
) {
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  const cb = useRef(onCycle);
  cb.current = onCycle;

  useEffect(() => {
    tRef.current = 0;
    setT(0);
  }, [resetKey]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      let n = tRef.current + dt / cycleSeconds;
      if (n >= 1) {
        n -= 1;
        cb.current?.();
      }
      tRef.current = n;
      setT(n);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cycleSeconds, playing]);

  return t;
}

type P = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
/** Punto desde `o`, longitud `len`, ángulo medido desde "hacia abajo"; positivo = hacia la derecha. */
const at = (o: P, len: number, deg: number): P => [
  o[0] + len * Math.sin(rad(deg)),
  o[1] + len * Math.cos(rad(deg)),
];
/** Punto hacia arriba con inclinación `lean` (positivo = hacia adelante/derecha). */
const up = (o: P, len: number, lean: number): P => [
  o[0] + len * Math.sin(rad(lean)),
  o[1] - len * Math.cos(rad(lean)),
];
const lerp = (a: number, b: number, s: number) => a + (b - a) * s;
const ease = (x: number) => x * x * (3 - 2 * x);

/** Sube, mantiene arriba, baja y descansa un instante. Devuelve 0 → 1 → 0. */
function trap(t: number, upT = 0.4, hold = 0.1, downT = 0.4) {
  if (t < upT) return ease(t / upT);
  if (t < upT + hold) return 1;
  if (t < upT + hold + downT) return 1 - ease((t - upT - hold) / downT);
  return 0;
}

/** Cinemática inversa de 2 huesos. `dir` decide hacia qué lado se dobla la articulación. */
function ik(a: P, target: P, l1: number, l2: number, dir: 1 | -1): { mid: P; end: P } {
  let dx = target[0] - a[0];
  let dy = target[1] - a[1];
  let d = Math.hypot(dx, dy);
  const maxD = l1 + l2 - 0.01;
  if (d > maxD) {
    dx *= maxD / d;
    dy *= maxD / d;
    d = maxD;
  }
  const base = Math.atan2(dy, dx);
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const A = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const ang = base + dir * A;
  return {
    mid: [a[0] + l1 * Math.cos(ang), a[1] + l1 * Math.sin(ang)],
    end: [a[0] + dx, a[1] + dy],
  };
}

/* ───────────── Paleta y medidas ───────────── */

const SHIRT = "var(--color-primary)";
const ACCENT = "var(--color-accent)";
const PANTS = "#475569";
const SHOE = "#1e293b";
const SKIN = "#f0c9a8";
const HAIR = "#b6bfcc";
const FURN = "#cbd5e1";
const FURN_DARK = "#94a3b8";

const L_TH = 63; // muslo
const L_SH = 61; // pierna
const L_UA = 44; // brazo
const L_FA = 40; // antebrazo
const TORSO = 76;

/* ───────────── Muñeco de perfil ───────────── */

type Leg = { knee: P; ankle: P; heel: P; toe: P };
type Arm = { elbow: P; hand: P };
type Pose = {
  hip: P;
  lean: number;
  near: Leg;
  far: Leg;
  nArm: Arm;
  fArm: Arm;
  hlLeg?: boolean | undefined;
  hlArm?: boolean | undefined;
  scene: "chair" | "bed" | "walker";
  cue?: ReactNode;
};

const shoulderOf = (hip: P, lean: number): P => up(hip, 64, lean);

function foot(ankle: P, shankDir: number, f: number) {
  const heel = at(ankle, 7, shankDir);
  return { heel, toe: at(heel, 26, f) };
}

function seatedLeg(hip: P, shinDir: number): Leg {
  const knee = at(hip, L_TH, 80);
  const ankle = at(knee, L_SH, shinDir);
  return { knee, ankle, ...foot(ankle, shinDir, shinDir + 90) };
}

function shift(l: Leg, dx: number, dy = 0): Leg {
  const m = (p: P): P => [p[0] + dx, p[1] + dy];
  return { knee: m(l.knee), ankle: m(l.ankle), heel: m(l.heel), toe: m(l.toe) };
}

function LimbLine({ a, b, w, color }: { a: P; b: P; w: number; color: string }) {
  return (
    <line
      x1={a[0]}
      y1={a[1]}
      x2={b[0]}
      y2={b[1]}
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
    />
  );
}

function LegShape({
  hip,
  leg,
  hl,
  far,
}: {
  hip: P;
  leg: Leg;
  hl?: boolean | undefined;
  far?: boolean | undefined;
}) {
  const c = hl ? ACCENT : PANTS;
  return (
    <g opacity={far ? 0.55 : 1}>
      <LimbLine a={hip} b={leg.knee} w={23} color={PANTS} />
      <LimbLine a={leg.knee} b={leg.ankle} w={18} color={c} />
      <LimbLine a={leg.heel} b={leg.toe} w={13} color={SHOE} />
    </g>
  );
}

function ArmShape({
  shoulder,
  arm,
  hl,
  far,
}: {
  shoulder: P;
  arm: Arm;
  hl?: boolean | undefined;
  far?: boolean | undefined;
}) {
  return (
    <g opacity={far ? 0.55 : 1}>
      <LimbLine a={shoulder} b={arm.elbow} w={16} color={hl ? ACCENT : SHIRT} />
      <LimbLine a={arm.elbow} b={arm.hand} w={13} color={SKIN} />
      <circle cx={arm.hand[0]} cy={arm.hand[1]} r={7.5} fill={SKIN} />
    </g>
  );
}

function SideHead({ c }: { c: P }) {
  return (
    <g>
      <circle cx={c[0]} cy={c[1]} r={17} fill={SKIN} />
      {/* nariz: indica hacia dónde mira */}
      <circle cx={c[0] + 16} cy={c[1] + 3} r={3.4} fill={SKIN} />
      {/* cabello canoso en la parte de atrás */}
      <path
        d={`M ${c[0] + 8} ${c[1] - 16} A 17 17 0 0 0 ${c[0] - 12} ${c[1] + 11} L ${c[0] - 6} ${c[1] - 2} Z`}
        fill={HAIR}
      />
      <circle cx={c[0] + 8} cy={c[1] - 3} r={1.8} fill="#334155" />
    </g>
  );
}

function SidePerson({ pose }: { pose: Pose }) {
  const { hip, lean } = pose;
  const sh = shoulderOf(hip, lean);
  const neck = up(hip, TORSO, lean);
  const head = up(neck, 24, lean * 0.45);
  return (
    <g>
      <ArmShape shoulder={sh} arm={pose.fArm} far />
      <LegShape hip={hip} leg={pose.far} far />
      <LimbLine a={hip} b={neck} w={36} color={SHIRT} />
      <LimbLine a={neck} b={head} w={11} color={SKIN} />
      <LegShape hip={hip} leg={pose.near} hl={pose.hlLeg} />
      <SideHead c={head} />
      <ArmShape shoulder={sh} arm={pose.nArm} hl={pose.hlArm} />
    </g>
  );
}

/* ───────────── Escenarios ───────────── */

function ChairSide() {
  return (
    <g>
      <line x1="112" y1="118" x2="116" y2="226" stroke={FURN_DARK} strokeWidth="14" strokeLinecap="round" />
      <rect x="108" y="220" width="108" height="15" rx="6" fill={FURN} stroke={FURN_DARK} strokeWidth="2" />
      <line x1="118" y1="235" x2="114" y2="288" stroke={FURN_DARK} strokeWidth="7" strokeLinecap="round" />
      <line x1="204" y1="235" x2="208" y2="288" stroke={FURN_DARK} strokeWidth="7" strokeLinecap="round" />
    </g>
  );
}

function BedSide() {
  return (
    <g>
      <ellipse cx="70" cy="205" rx="17" ry="50" transform="rotate(-26 70 205)" fill="#e2e8f0" stroke={FURN_DARK} strokeWidth="2" />
      <rect x="36" y="240" width="310" height="22" rx="9" fill={FURN} stroke={FURN_DARK} strokeWidth="2" />
      <line x1="50" y1="262" x2="50" y2="288" stroke={FURN_DARK} strokeWidth="7" strokeLinecap="round" />
      <line x1="332" y1="262" x2="332" y2="288" stroke={FURN_DARK} strokeWidth="7" strokeLinecap="round" />
    </g>
  );
}

function WalkerSide() {
  return (
    <g>
      <line x1="266" y1="136" x2="266" y2="288" stroke={FURN_DARK} strokeWidth="8" strokeLinecap="round" />
      <line x1="250" y1="136" x2="284" y2="136" stroke="#475569" strokeWidth="12" strokeLinecap="round" />
      <line x1="256" y1="287" x2="276" y2="287" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
    </g>
  );
}

/* ───────────── Indicadores de movimiento ───────────── */

function ArcArrow({ c, r, a0, a1 }: { c: P; r: number; a0: number; a1: number }) {
  const n = 14;
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) pts.push(at(c, r, lerp(a0, a1, i / n)));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const e = pts[n]!;
  const sgn = a1 >= a0 ? 1 : -1;
  const dx = sgn * Math.cos(rad(a1));
  const dy = -sgn * Math.sin(rad(a1));
  const px = -dy;
  const py = dx;
  const tri = [
    [e[0] + 9 * dx, e[1] + 9 * dy],
    [e[0] - 4 * dx + 6 * px, e[1] - 4 * dy + 6 * py],
    [e[0] - 4 * dx - 6 * px, e[1] - 4 * dy - 6 * py],
  ]
    .map((p) => p.join(","))
    .join(" ");
  return (
    <g opacity={0.75}>
      <path d={d} fill="none" stroke={ACCENT} strokeWidth="3" strokeDasharray="5 4" strokeLinecap="round" />
      <polygon points={tri} fill={ACCENT} />
    </g>
  );
}

function VArrow({ x, y0, y1, up: isUp = true }: { x: number; y0: number; y1: number; up?: boolean }) {
  const tip = y1;
  const s = isUp ? 1 : -1;
  return (
    <g opacity={0.75}>
      <line x1={x} y1={y0} x2={x} y2={tip + s * 8} stroke={ACCENT} strokeWidth="3" strokeDasharray="5 4" strokeLinecap="round" />
      <polygon points={`${x},${tip} ${x - 7},${tip + s * 12} ${x + 7},${tip + s * 12}`} fill={ACCENT} />
    </g>
  );
}

/* ───────────── Poses de perfil por ejercicio ───────────── */

const SEAT_ANKLE: P = [212, 275];
const SEAT_HIP: P = [158.5, 203.7];
const STAND_ANKLE: P = [196, 275];
const WALKER_HAND: P = [266, 140];

function restingArm(hip: P, lean: number): Arm {
  const sh = shoulderOf(hip, lean);
  const elbow = at(sh, L_UA, 12);
  return { elbow, hand: at(elbow, L_FA, 70) };
}

function standingArms(hip: P, lean: number): { n: Arm; f: Arm } {
  const sh = shoulderOf(hip, lean);
  const n = ik(sh, WALKER_HAND, L_UA, L_FA, 1);
  const f = ik([sh[0] - 5, sh[1] + 1], [WALKER_HAND[0] - 6, WALKER_HAND[1]], L_UA, L_FA, 1);
  return { n: { elbow: n.mid, hand: n.end }, f: { elbow: f.mid, hand: f.end } };
}

function buildSidePose(id: string, t: number): Pose | null {
  /* 1. Levantarse y sentarse */
  if (id === "sit-to-stand") {
    const s = trap(t, 0.4, 0.12, 0.38);
    const psi = lerp(8, 0, s);
    const thetaT = lerp(80, 0, s);
    const k: P = [SEAT_ANKLE[0] + L_SH * Math.sin(rad(psi)), SEAT_ANKLE[1] - L_SH * Math.cos(rad(psi))];
    const hip: P = [k[0] - L_TH * Math.sin(rad(thetaT)), k[1] - L_TH * Math.cos(rad(thetaT))];
    const lean = 4 + 30 * Math.sin(Math.PI * s);
    const f = foot(SEAT_ANKLE, 0, 90);
    const near: Leg = { knee: k, ankle: SEAT_ANKLE, ...f };
    const sh = shoulderOf(hip, lean);
    const elbow = at(sh, L_UA, 78);
    const arm: Arm = { elbow, hand: at(elbow, L_FA, 84) };
    return {
      hip,
      lean,
      near,
      far: shift(near, -7),
      nArm: arm,
      fArm: { elbow: [elbow[0] - 5, elbow[1] - 1], hand: [arm.hand[0] - 5, arm.hand[1] - 1] },
      scene: "chair",
      cue: <VArrow x={312} y0={250} y1={92} />,
    };
  }

  /* 2. Extensión de rodilla */
  if (id === "knee-extension") {
    const s = trap(t, 0.38, 0.14, 0.38);
    const hip = SEAT_HIP;
    const lean = 3;
    const shinDir = lerp(-8, 72, s);
    const near = seatedLeg(hip, shinDir);
    const far = seatedLeg(hip, -8);
    const arm = restingArm(hip, lean);
    return {
      hip,
      lean,
      near,
      far: shift(far, -6, -2),
      nArm: arm,
      fArm: { elbow: [arm.elbow[0] - 5, arm.elbow[1]], hand: [arm.hand[0] - 5, arm.hand[1]] },
      hlLeg: true,
      scene: "chair",
      cue: <ArcArrow c={seatedLeg(hip, 0).knee} r={72} a0={-4} a1={70} />,
    };
  }

  /* 3. Bombeo de tobillos (acostado/reclinado en cama) */
  if (id === "ankle-pump") {
    const s = 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
    const hip: P = [112, 229];
    const lean = -28;
    const knee = at(hip, L_TH, 91);
    const ankle = at(knee, L_SH, 91);
    const fAng = lerp(212, 135, s);
    const mk = (a: P, k: P): Leg => ({ knee: k, ankle: a, ...foot(a, 91, fAng) });
    const near = mk(ankle, knee);
    const sh = shoulderOf(hip, lean);
    const elbow = at(sh, L_UA, 24);
    const arm: Arm = { elbow, hand: at(elbow, L_FA, 78) };
    return {
      hip,
      lean,
      near,
      far: shift(near, 7, -6),
      nArm: arm,
      fArm: { elbow: [elbow[0] + 4, elbow[1]], hand: [arm.hand[0] + 4, arm.hand[1]] },
      hlLeg: true,
      scene: "bed",
      cue: <ArcArrow c={[ankle[0] + 7, ankle[1]]} r={34} a0={135} a1={212} />,
    };
  }

  /* 4. Marcha con apoyo */
  if (id === "marching-support") {
    const hip: P = [STAND_ANKLE[0], STAND_ANKLE[1] - 123];
    const lean = 6;
    const wave = Math.sin(2 * Math.PI * t);
    const lN = Math.max(0, wave);
    const lF = Math.max(0, -wave);
    const leg = (base: P, l: number): Leg => {
      const target: P = [base[0] + 14 * ease(l), base[1] - 34 * ease(l)];
      const r = ik(hip, target, L_TH, L_SH, -1);
      const shankDir = (Math.atan2(r.end[0] - r.mid[0], r.end[1] - r.mid[1]) * 180) / Math.PI;
      return { knee: r.mid, ankle: r.end, ...foot(r.end, shankDir, 90 - 22 * ease(l)) };
    };
    const arms = standingArms(hip, lean);
    return {
      hip: [hip[0], hip[1]],
      lean,
      near: leg(STAND_ANKLE, lN),
      far: leg([STAND_ANKLE[0] - 7, STAND_ANKLE[1]], lF),
      nArm: arms.n,
      fArm: arms.f,
      hlLeg: true,
      scene: "walker",
    };
  }

  /* 5. Elevación de talones */
  if (id === "heel-rises") {
    const s = trap(t, 0.4, 0.14, 0.36);
    const phi = 38 * s;
    const f = 90 - phi;
    const T: P = [STAND_ANKLE[0] + 26, 282];
    const heel: P = [T[0] - 26 * Math.sin(rad(f)), T[1] - 26 * Math.cos(rad(f))];
    const ankle: P = [heel[0], heel[1] - 7];
    const hip: P = [ankle[0], ankle[1] - 123];
    const knee: P = [ankle[0] + 2.5, ankle[1] - L_SH + 1];
    const lean = 6;
    const near: Leg = { knee, ankle, heel, toe: T };
    const arms = standingArms(hip, lean);
    return {
      hip,
      lean,
      near,
      far: shift(near, -7),
      nArm: arms.n,
      fArm: arms.f,
      hlLeg: true,
      scene: "walker",
      cue: <VArrow x={160} y0={286} y1={236} />,
    };
  }

  /* 7. Flexión de brazos (curl de bíceps) */
  if (id === "bicep-curl") {
    const s = trap(t, 0.4, 0.12, 0.38);
    const hip = SEAT_HIP;
    const lean = 3;
    const sh = shoulderOf(hip, lean);
    const elbow = at(sh, L_UA, 8);
    const hand = at(elbow, L_FA, lerp(20, 150, s));
    const fHand = at([elbow[0] - 6, elbow[1]], L_FA, lerp(20, 150, s));
    return {
      hip,
      lean,
      near: seatedLeg(hip, -8),
      far: shift(seatedLeg(hip, -8), -6, -2),
      nArm: { elbow, hand },
      fArm: { elbow: [elbow[0] - 6, elbow[1]], hand: fHand },
      hlArm: true,
      scene: "chair",
      cue: <ArcArrow c={elbow} r={52} a0={24} a1={146} />,
    };
  }

  return null;
}

/* ───────────── Vista frontal (sentado, de frente) ───────────── */

const CX = 190;

function FrontSeated({
  half,
  torsoW,
  headTurn,
  children,
}: {
  half: number;
  torsoW: number;
  headTurn: number;
  children: ReactNode;
}) {
  const hipY = 208;
  const neckY = hipY - TORSO;
  const headY = neckY - 26;
  const th = rad(headTurn);
  const ex = CX + 13 * Math.sin(th);
  const sx = 6 * Math.cos(th);
  void half;
  return (
    <g>
      {/* silla */}
      <rect x="144" y="112" width="92" height="114" rx="15" fill={FURN} stroke={FURN_DARK} strokeWidth="2" />
      <rect x="134" y="224" width="112" height="14" rx="6" fill={FURN} stroke={FURN_DARK} strokeWidth="2" />
      <line x1="144" y1="238" x2="144" y2="288" stroke={FURN_DARK} strokeWidth="7" strokeLinecap="round" />
      <line x1="236" y1="238" x2="236" y2="288" stroke={FURN_DARK} strokeWidth="7" strokeLinecap="round" />
      {/* torso */}
      <line x1={CX} y1={hipY} x2={CX} y2={neckY} stroke={SHIRT} strokeWidth={torsoW} strokeLinecap="round" />
      {/* piernas (de frente, hacia el espectador) */}
      {[-1, 1].map((sg) => (
        <g key={sg}>
          <line x1={CX + sg * 15} y1={216} x2={CX + sg * 24} y2={240} stroke={PANTS} strokeWidth="25" strokeLinecap="round" />
          <line x1={CX + sg * 24} y1={240} x2={CX + sg * 24} y2={274} stroke={PANTS} strokeWidth="19" strokeLinecap="round" />
          <ellipse cx={CX + sg * 25} cy={282} rx="13" ry="6.5" fill={SHOE} />
        </g>
      ))}
      {/* cuello y cabeza */}
      <line x1={CX} y1={neckY} x2={CX} y2={headY} stroke={SKIN} strokeWidth="12" strokeLinecap="round" />
      <circle cx={CX} cy={headY} r={17} fill={SKIN} />
      <path d={`M ${CX - 17} ${headY - 3} A 17 17 0 0 1 ${CX + 17} ${headY - 3} Z`} fill={HAIR} />
      <circle cx={ex - sx} cy={headY + 1} r={1.9} fill="#334155" />
      <circle cx={ex + sx} cy={headY + 1} r={1.9} fill="#334155" />
      {children}
    </g>
  );
}

function FrontScene({ id, t }: { id: string; t: number }) {
  /* 6. Apertura de pecho y hombros */
  if (id === "shoulder-chest") {
    const s = trap(t, 0.42, 0.14, 0.34);
    const a1 = lerp(20, 88, s);
    const a2 = -125 - 147 * s; // el antebrazo sube y se abre
    const shY = 138;
    const arms = [-1, 1].map((sg) => {
      const sh: P = [CX + sg * 29, shY];
      const el = at(sh, L_UA, sg * a1);
      const ha = at(el, L_FA - 2, sg * a2);
      return (
        <g key={sg}>
          <LimbLine a={sh} b={el} w={17} color={ACCENT} />
          <LimbLine a={el} b={ha} w={14} color={ACCENT} />
          <circle cx={ha[0]} cy={ha[1]} r={7.5} fill={SKIN} />
        </g>
      );
    });
    return (
      <FrontSeated half={29} torsoW={54 + 8 * s} headTurn={0}>
        {arms}
      </FrontSeated>
    );
  }

  /* 8. Giros suaves de tronco y cuello */
  if (id === "trunk-rotation") {
    const theta = 45 * Math.sin(2 * Math.PI * t);
    const c = Math.cos(rad(theta));
    const sn = Math.sin(rad(theta));
    const w = 54 * (0.5 + 0.5 * c);
    const half = 26 * c;
    return (
      <FrontSeated half={half} torsoW={w} headTurn={theta * 1.35}>
        {/* brazos cruzados sobre el pecho */}
        <LimbLine a={[CX - half + 6 * sn, 152]} b={[CX + half + 6 * sn, 152]} w={15} color={ACCENT} />
        <circle cx={CX - half + 6 * sn} cy={152} r={7.5} fill={SKIN} />
        <circle cx={CX + half + 6 * sn} cy={152} r={7.5} fill={SKIN} />
        {/* flechas de giro */}
        <g opacity={0.75}>
          <path d="M 142 98 Q 190 70 238 98" fill="none" stroke={ACCENT} strokeWidth="3" strokeDasharray="5 4" strokeLinecap="round" />
          <polygon points="136,102 150,98 142,88" fill={ACCENT} />
          <polygon points="244,102 230,98 238,88" fill={ACCENT} />
        </g>
      </FrontSeated>
    );
  }
  return null;
}

/* ───────────── Componente público ───────────── */

const VIEWBOX = {
  chair: "70 6 260 292",
  walker: "110 15 220 283",
  bed: "20 105 340 192",
  front: "60 45 260 252",
} as const;

export function ExerciseFigure({ exerciseId, t, label }: { exerciseId: string; t: number; label: string }) {
  const side = buildSidePose(exerciseId, t);
  const vb = side ? VIEWBOX[side.scene] : VIEWBOX.front;
  return (
    <svg
      viewBox={vb}
      role="img"
      aria-label={label}
      className="h-72 w-auto max-w-full select-none sm:h-84"
    >
      <defs>
        <radialGradient id="floorGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="190" cy="291" rx="130" ry="11" fill="url(#floorGrad)" />

      {side ? (
        <g>
          {side.scene === "chair" && <ChairSide />}
          {side.scene === "bed" && <BedSide />}
          {side.scene === "walker" && <WalkerSide />}
          <SidePerson pose={side} />
          {side.cue}
        </g>
      ) : (
        <FrontScene id={exerciseId} t={t} />
      )}
    </svg>
  );
}