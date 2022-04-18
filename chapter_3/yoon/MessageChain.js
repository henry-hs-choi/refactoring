
// 메시지 체인의 예시
managerName = aPerson.department.manager.name

// 위임 숨기기 적용 시
managerName = aPerson.department.managerName // 관리자 객체 숨기기
managerName = aPerson.manager.name // 부서 객체 숨기기
managerName = aPerson.managerName // 부서, 관리자 객체 모두 숨기기