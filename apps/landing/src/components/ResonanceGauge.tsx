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
    <div className="flex flex-col gap-5">
      {/* ── 공명율이란 ── */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary/80 mb-2 font-semibold">
          공명율이란
        </h3>
        <p className="text-text/70 text-sm leading-relaxed">
          헬리오스 코어와 정신이 얼마나 깊이 연결되어 있는지를 나타내는 수치.
          15번째 생일, 하얀 방에서 확정된다. 이후로는 바뀌지 않는다.
        </p>
      </div>

      {/* ── 각성 조건 ── */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary/80 mb-2 font-semibold">
          각성 조건
        </h3>
        <p
          className="text-sm font-semibold"
          style={{ color: "#f59e0b", textShadow: "0 0 12px rgba(245,158,11,0.4)" }}
        >
          80을 넘는 순간, 능력이 깨어난다.
        </p>
      </div>

      {/* ── 수직 게이지 (중앙 정렬) ── */}
      <div className="flex justify-center py-2">
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
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: "#f59e0b",
                  boxShadow: "0 0 8px #f59e0b, 0 0 20px rgba(245,158,11,0.5)",
                }}
              />
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

            <div
              className="flex flex-col justify-center flex-1"
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

      {/* ── 의미 ── */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary/80 mb-2 font-semibold">
          의미
        </h3>
        <div className="text-text/70 text-sm leading-relaxed space-y-3">
          <p>
            공명율이 높을수록 강력하다. 하지만 헬리오스에 깊이 연결된다는 건
            그만큼 시스템에 의존한다는 뜻이기도 하다.
          </p>
          <p>
            반대로, 공명율이 극도로 낮은 자들은 감지망에서 사라진다.
            시스템이 모르는 존재. 통제할 수 없는 변수.
            그들의 능력은 불안정하지만 — 예측 불가능하다.
          </p>
        </div>
      </div>
    </div>
  );
}
