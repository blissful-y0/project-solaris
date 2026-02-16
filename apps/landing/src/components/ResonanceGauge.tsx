import { useEffect, useState } from "react";

/**
 * 공명율(Resonance Rate) 모달 전용 비주얼.
 * 3구간 수직 게이지: 80+(앰버), 15-79(다크), ~15(레드 펄스).
 * 80, 15 경계선에 글리치/파열 이펙트.
 */
export default function ResonanceGauge() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 400);
    return () => clearTimeout(t);
  }, []);

  const mono =
    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";

  return (
    <div className="flex flex-col gap-6">
      {/* ── 기원 ── */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary/80 mb-2 font-semibold">
          기원
        </h3>
        <div className="text-text/70 text-sm leading-relaxed space-y-3">
        <p>
          핵전쟁이 끝난 뒤, 인류의 유전자에는 방사선이 남긴 상흔이 새겨졌다.
        </p>
        <p>
          피폭 변이. 모든 인간이 가지고 있지만, 대부분은 평생 침묵한다.
        </p>
        <p>
          공명율은 헬리오스 코어와 정신이 얼마나 깊이 연결되어 있는지를
          나타내는 수치다.
          <br />
          15번째 생일, 하얀 방에서 확정된다. 이후로는 바뀌지 않는다.
        </p>
        <p
          className="font-semibold"
          style={{
            color: "var(--color-primary)",
            textShadow: "0 0 12px rgba(0,212,255,0.3)",
          }}
        >
          이 숫자가 극단에 도달한 자만이, 침묵하던 변이를 깨운다.
        </p>
        </div>
      </div>

      {/* ── 등급 분류 ── */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary/80 mb-3 font-semibold">
          등급 분류
        </h3>
      <div className="flex justify-center py-1">
        <div
          className="relative flex gap-4 items-stretch"
          style={{ height: 320 }}
        >
          {/* 게이지 바 */}
          <div
            className="relative w-12 rounded-sm overflow-hidden"
            style={{ backgroundColor: "rgba(31,41,55,0.5)" }}
          >
            {/* 80+ 구간 — 앰버 글로우 (상단 20%) */}
            <div
              className="absolute top-0 left-0 w-full"
              style={{
                height: "20%",
                background:
                  "linear-gradient(to bottom, #f59e0b, rgba(245,158,11,0.6))",
                boxShadow: animate
                  ? "0 0 15px rgba(245,158,11,0.5), 0 0 30px rgba(245,158,11,0.25), inset 0 0 10px rgba(245,158,11,0.3)"
                  : "none",
                opacity: animate ? 1 : 0,
                transition: "opacity 0.8s ease, box-shadow 0.8s ease",
              }}
            />

            {/* 80 경계선 — 앰버 글리치 */}
            <div
              className="absolute left-0 w-full"
              style={{ top: "20%", height: 3, zIndex: 2 }}
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

            {/* 15-79 구간 — 다크 그레이, 거의 안 보임 */}
            <div
              className="absolute left-0 w-full"
              style={{
                top: "20%",
                height: "65%",
                background:
                  "linear-gradient(to bottom, rgba(31,41,55,0.3), rgba(31,41,55,0.15))",
              }}
            />

            {/* 15 경계선 — 레드 글리치 */}
            <div
              className="absolute left-0 w-full"
              style={{ top: "85%", height: 3, zIndex: 2 }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: "#ef4444",
                  boxShadow: "0 0 8px #ef4444, 0 0 20px rgba(239,68,68,0.5)",
                }}
              />
              {animate && (
                <>
                  <div
                    className="absolute w-full"
                    style={{
                      top: -2,
                      height: 1,
                      backgroundColor: "rgba(239,68,68,0.6)",
                      animation: "gauge-glitch-red-1 2.2s ease-in-out infinite",
                    }}
                  />
                  <div
                    className="absolute w-full"
                    style={{
                      top: 3,
                      height: 1,
                      backgroundColor: "rgba(239,68,68,0.4)",
                      animation: "gauge-glitch-red-2 2.8s ease-in-out infinite",
                    }}
                  />
                </>
              )}
            </div>

            {/* ~15 구간 — 레드 펄스 (하단 15%) */}
            <div
              className="absolute left-0 w-full bottom-0"
              style={{
                height: "15%",
                background:
                  "linear-gradient(to bottom, rgba(239,68,68,0.6), #ef4444)",
                opacity: animate ? 1 : 0,
                transition: "opacity 0.8s ease 0.3s",
                animation: animate
                  ? "gauge-red-pulse 2.5s ease-in-out infinite"
                  : "none",
              }}
            />
          </div>

          {/* 라벨 */}
          <div
            className="relative flex flex-col text-xs"
            style={{ fontFamily: mono, width: 220 }}
          >
            {/* 80+ 라벨 — 상단 */}
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
              <p className="text-text/45 mt-1 text-[0.7rem] leading-snug">
                헬리오스와 공명하며 능력이 깨어난다.
                <br />
                안정적이고 정밀하다. 그러나 시스템 없이는 제어할 수 없다.
              </p>
            </div>

            {/* 80 경계 마커 */}
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
                className="h-px w-6"
                style={{ backgroundColor: "rgba(245,158,11,0.5)" }}
              />
            </div>

            {/* 15-79 라벨 — 중앙 영역 */}
            <div
              className="absolute flex flex-col justify-center"
              style={{
                top: "42%",
                opacity: animate ? 1 : 0,
                transition: "opacity 0.6s ease 1s",
              }}
            >
              <span className="text-text/25 font-bold">15 – 79</span>
              <span className="text-text/20 ml-0 text-[0.65rem]">일반</span>
              <p className="text-text/15 mt-1 text-[0.65rem] leading-snug">
                능력 없음. 변이는 침묵한다.
              </p>
            </div>

            {/* 15 경계 마커 */}
            <div
              className="absolute"
              style={{
                top: "85%",
                transform: "translateY(-50%)",
                opacity: animate ? 1 : 0,
                transition: "opacity 0.6s ease 1.1s",
              }}
            >
              <div
                className="h-px w-6"
                style={{ backgroundColor: "rgba(239,68,68,0.5)" }}
              />
            </div>

            {/* ~15 라벨 — 하단 */}
            <div
              className="absolute"
              style={{
                bottom: 0,
                opacity: animate ? 1 : 0,
                transition: "opacity 0.6s ease 1.2s",
              }}
            >
              <span
                className="font-bold"
                style={{
                  color: "#ef4444",
                  textShadow: "0 0 8px rgba(239,68,68,0.4)",
                }}
              >
                ~15
              </span>
              <span className="text-text/50 ml-2">이탈</span>
              <p className="text-text/45 mt-1 text-[0.7rem] leading-snug">
                감지망에서 사라진다. 선셋 프로토콜. 추방.
                <br />
                돔 밖 방사선이 변이를 깨운다.
                <br />
                거칠고, 불안정하고, 예측 불가능하다.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* ── 의미 ── */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary/80 mb-2 font-semibold">
          의미
        </h3>
        <div className="text-sm leading-relaxed space-y-3">
          <p
            className="font-semibold"
            style={{
              color: "var(--color-primary)",
              textShadow: "0 0 10px rgba(0,212,255,0.3)",
            }}
          >
            같은 변이, 다른 각성.
          </p>
          <div className="text-text/60 space-y-2">
            <p>
              높으면 시스템 위에서 깨어난다. 강력하지만 시스템에 묶인다.
            </p>
            <p>
              낮으면 시스템 밖에서 깨어난다. 불안정하지만 시스템이 잡을 수 없다.
            </p>
            <p className="text-text/40">
              어느 쪽이 더 강한지는 — 싸워봐야 안다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
