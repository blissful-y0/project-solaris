-- Seed data

INSERT INTO civilian_merits (id, name, description, effect) VALUES
  ('merit_001', '전술적 통찰력', '전투 경험과 전략적 사고를 통해 상황을 빠르게 파악합니다.', 'WILL 소모 -10% (전투 시)'),
  ('merit_002', '정신적 회복력', '강한 정신력으로 의지를 빠르게 회복합니다.', 'WILL 회복 +20% (휴식 시)'),
  ('merit_003', '신체 강건함', '강화된 체력으로 더 많은 피해를 견딥니다.', 'HP +20 (최대값)'),
  ('merit_004', '임기응변', '예측 불가능한 상황에서 빠르게 대응합니다.', '첫 턴 행동 우선권 획득'),
  ('merit_005', '전문 장비 숙련', '특수 장비를 효율적으로 사용할 수 있습니다.', '장비 아이템 효과 +30%')
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;
