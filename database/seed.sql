insert into public.policies (id,title,category,agency,short_description,official_url,source_file_name,last_verified_at) values
('youth-rent','청년월세 지원사업','청년','국토교통부','부모와 별도 거주하는 무주택 청년의 월세 부담을 줄이기 위한 지원사업입니다.','https://www.molit.go.kr/USR/NEWS/dtl.jsp?id=95091798','youth-rent.pdf','2026-03-19'),
('employment-support','국민취업지원제도','취업','고용노동부','취업지원서비스와 유형별 생계지원을 함께 제공하는 한국형 실업부조 제도입니다.','https://www.moel.go.kr/policy/policydata/view.do?bbs_seq=20260301325','employment-support.pdf','2026-03-01'),
('housing-benefit','주거급여','주거','국토교통부','주거가 필요한 가구에 임차급여 또는 수선유지급여 등을 지원하는 제도입니다.','https://www.molit.go.kr/USR/policyTarget/m_24066/dtl.jsp?idx=1065','housing-benefit.pdf','2026-01-01')
on conflict (id) do update set
  title=excluded.title,
  category=excluded.category,
  agency=excluded.agency,
  short_description=excluded.short_description,
  official_url=excluded.official_url,
  source_file_name=excluded.source_file_name,
  last_verified_at=excluded.last_verified_at;
