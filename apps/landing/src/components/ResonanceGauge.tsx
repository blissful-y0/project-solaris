import { useEffect, useState } from "react";

/**
 * 공명율(Resonance Rate) 모달 전용 비주얼.
 * 수직 게이지 + 80 경계 글리치 이펙트.
 */
export default function ResonanceGauge() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* ── 서브 타이틀 ── */}
      <div className="text-center">
        <p
          className="text-xs uppercase tracking-[0.25em] mb-1"
          style={{
            color: "#6b7280",
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
          }}
        >
          RESONANCE RATE
        </p>
      </div>

      {/* ── 설명 ── */}
      <p className="text-text/70 text-sm leading-relaxed text-center">
        헬리오스 코어와 정신이 얼마나 깊이 연결되어 있는지를 나타내는 수치.
        <br />
        15번째 생일, 하얀 방에서 확정된다. 이후로는 바뀌지 않는다.
      </p>

      <p
        className="text-center text-sm font-semibold"
        style={{ color: "#f59e0b", textShadow: "0 0 12px rgba(245,158,11,0.4)" }}
      >
        80을 넘는 순간, 능력이 깨어난다.
      </p>

      {/* ── 수직 게이지 ── */}
      <div className="flex justify-center">
        <div className="relative flex gap-4 items-stretch" style={{ height: 280 }}>
          {/* 게이지 바 */}
          <div className="relative w-12 rounded-sm overflow-hidden" style={{ backgroundColor: "rgba(31,41,55,0.5)" }}>
            {/* 80+ 구간 — 앰버 글로우 */}
            <div
              className="absolute top-0 left-0 w-full"
              style={{
                height: "20%",
                background: "linear-gradient(to bottom, #f59e0b, rgba(245,158,11,0.6))",
                boxShadow: animate
                  ? "0 0 15px rgba(245,158,11,0.5), 0 0 30px rgba(245,158,11,0.25), inset 0 0 10px rgba(245,158,11,0.3)"
                  : "none",
                opacity: animate ? 1 : 0,
                transition: "opacity 0.8s ease, box-shadow 0.8s ease",
              }}
            />

            {/* 80 경계선 — 글리치/파열 */}
            <div
              className="absolute left-0 w-full"
              style={{
                top: "20%",
                height: 3,
                zIndex: 2,
              }}
            >
              {/* 메인 라인 */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: "#f59e0b",
                  boxShadow: "0 0 8px #f59e0b, 0 0 20px rgba(245,158,11,0.5)",
                }}
              />
              {/* 글리치 레이어 */}
              {animate && (
                <>
                  <div
                    className="absolute w-full"
                    style={{
                      top: -2,
                      height: 1,
                      backgroundColor: "rgba(245,158,11,0.6)",
                      animation: "gauge-glitch-1 2s ease-in-out infinite",
                    }}
                  />
                  <div
                    className="absolute w-full"
                    style={{
                      top: 3,
                      height: 1,
                      backgroundColor: "rgba(220,38,38,0.4)",
                      animation: "gauge-glitch-2 2.5s ease-in-out infinite",
                    }}
                  />
                </>
              )}
            </div>

            {/* 80 미만 구간 — 어둡게 */}
            <div
              className="absolute left-0 w-full"
              style={{
                top: "20%",
                height: "80%",
                background:
                  "linear-gradient(to bottom, rgba(31,41,55,0.3), rgba(31,41,55,0.6))",
              }}
            />
          </div>

          {/* 라벨 */}
          <div
            className="relative flex flex-col justify-between text-xs"
            style={{
              fontFamily:
                "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
              width: 200,
            }}
          >
            {/* 80+ 라벨 */}
            <div
              style={{
                opacity: animate ? 1 : 0,
                transition: "opacity 0.6s ease 0.5s",
              }}
            >
              <span
                className="font-bold"
                style={{
                  color: "#f59e0b",
                  textShadow: "0 0 8px rgba(245,158,11,0.4)",
                }}
              >
                80+
              </span>
              <span className="text-text/50 ml-2">초월</span>
              <p className="text-text/40 mt-1 text-[0.7rem] leading-snug">
                능력 발현. 인간의 영역을 넘어선다.
              </p>
            </div>

            {/* 80 경계 라벨 */}
            <div
              className="absolute"
              style={{
                top: "20%",
                transform: "translateY(-50%)",
                opacity: animate ? 1 : 0,
                transition: "opacity 0.6s ease 0.8s",
              }}
            >
              <div
                className="h-px w-6 mb-1"
                style={{ backgroundColor: "rgba(245,158,11,0.5)" }}
              />
            </div>

            {/* 80 미만 라벨 */}
            <div
              className="flex flex-col justify-center flex-1 pl-0"
              style={{
                paddingTop: "30%",
                opacity: animate ? 1 : 0,
                transition: "opacity 0.6s ease 1s",
              }}
            >
              <span className="text-text/30 font-bold">80 미만</span>
              <p className="text-text/25 mt-1 text-[0.7rem] leading-snug">
                능력이 없다.
                <br />
                평범하게 살거나, 쫓겨난다.
              </p>
            </div>

            {/* 0 라벨 */}
            <div
              style={{
                opacity: animate ? 1 : 0,
                transition: "opacity 0.6s ease 1.2s",
              }}
            >
              <span className="text-text/20 font-bold">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 하단 설명 ── */}
      <div className="text-text/50 text-sm leading-relaxed space-y-3">
        <p>
          공명율이 높을수록 강력하다. 하지만 헬리오스에 깊이 연결된다는 건
          <br />
          그만큼 시스템에 의존한다는 뜻이기도 하다.
        </p>
        <p>
          반대로, 공명율이 극도로 낮은 자들은 감지망에서 사라진다.
          <br />
          시스템이 모르는 존재. 통제할 수 없는 변수.
          <br />
          그들의 능력은 불안정하지만 — 예측 불가능하다.
        </p>
      </div>
    </div>
  );
}
