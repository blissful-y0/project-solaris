-- Static 공명율 상한을 14로 정렬
-- 앱 검증(0~14)과 DB 제약(기존 <=15) 불일치를 해소한다.

UPDATE public.characters
SET resonance_rate = 14
WHERE faction = 'static'
  AND resonance_rate > 14;

ALTER TABLE public.characters
  DROP CONSTRAINT IF EXISTS characters_resonance_rate_faction_rule,
  ADD CONSTRAINT characters_resonance_rate_faction_rule CHECK (
    (faction = 'bureau' AND resonance_rate >= 80)
    OR (faction = 'static' AND resonance_rate <= 14)
    OR (faction NOT IN ('bureau', 'static'))
  );
