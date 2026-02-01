// ========================================
// 社労士合格ナビ 2026 - データ定義
// ========================================

// 試験情報
const EXAM_INFO = {
    year: 2026,
    // 例年8月第4日曜日（仮）
    examDate: new Date('2026-08-23'),
    passingCriteria: {
        selection: { total: 25, perSubject: 3 },
        multiple: { total: 44, perSubject: 4 }
    }
};

// 学習フェーズ定義
const PHASES = [
    {
        id: 1,
        name: '基礎構築期',
        badge: 'Phase 1',
        period: '2月〜4月',
        startMonth: 2,
        endMonth: 4,
        goal: '講座のインプットを完了し、全科目の基礎を理解'
    },
    {
        id: 2,
        name: '応用発展期',
        badge: 'Phase 2',
        period: '5月〜6月',
        startMonth: 5,
        endMonth: 6,
        goal: '全科目完了 + 過去問演習開始'
    },
    {
        id: 3,
        name: '直前完成期',
        badge: 'Phase 3',
        period: '7月〜8月',
        startMonth: 7,
        endMonth: 8,
        goal: '弱点克服 + 模試で実力確認 + 本番対応力'
    }
];

// 科目データ（工藤プロジェクトのカリキュラム順）
const SUBJECTS = [
    // ===== ツールボックス =====
    {
        id: 'toolbox',
        name: 'ツールボックス編',
        shortName: 'TB',
        category: 'foundation',
        categoryLabel: '基礎',
        lectures: 5,
        selectionPoints: 0,
        multiplePoints: 0,
        difficulty: 1,
        priority: 'foundation',
        order: 1,
        description: '厚生労働白書、社会保障制度の成り立ち'
    },
    // ===== 社会保険関係 =====
    {
        id: 'health',
        name: '健康保険法',
        shortName: '健保',
        category: 'social',
        categoryLabel: '社会保険',
        lectures: 12,
        selectionPoints: 5,
        multiplePoints: 10,
        difficulty: 3,
        priority: 'high',
        order: 2,
        description: '医療保険制度の基本、給付内容'
    },
    {
        id: 'pension',
        name: '年金法（国年・厚年）',
        shortName: '年金',
        category: 'social',
        categoryLabel: '社会保険',
        lectures: 25,
        selectionPoints: 10,
        multiplePoints: 20,
        difficulty: 5,
        priority: 'critical',
        order: 3,
        description: '国民年金・厚生年金を一体学習、最重要科目'
    },
    {
        id: 'social_general',
        name: '社会保険一般常識',
        shortName: '社一',
        category: 'social',
        categoryLabel: '社会保険',
        lectures: 6,
        selectionPoints: 5,
        multiplePoints: 0,
        difficulty: 4,
        priority: 'high',
        order: 9,
        description: '介護保険法、国民健康保険法、統計など'
    },
    // ===== 労働関係 =====
    {
        id: 'labor_standard',
        name: '労働基準法',
        shortName: '労基',
        category: 'labor',
        categoryLabel: '労働関係',
        lectures: 12,
        selectionPoints: 5,
        multiplePoints: 7,
        difficulty: 3,
        priority: 'high',
        order: 4,
        description: '労働契約、賃金、労働時間の基本'
    },
    {
        id: 'labor_safety',
        name: '労働安全衛生法',
        shortName: '安衛',
        category: 'labor',
        categoryLabel: '労働関係',
        lectures: 5,
        selectionPoints: 0,
        multiplePoints: 3,
        difficulty: 2,
        priority: 'normal',
        order: 5,
        description: '職場の安全衛生管理'
    },
    {
        id: 'workers_comp',
        name: '労働者災害補償保険法',
        shortName: '労災',
        category: 'labor',
        categoryLabel: '労働関係',
        lectures: 8,
        selectionPoints: 5,
        multiplePoints: 7,
        difficulty: 2,
        priority: 'normal',
        order: 6,
        description: '業務災害・通勤災害の給付'
    },
    {
        id: 'employment',
        name: '雇用保険法',
        shortName: '雇用',
        category: 'labor',
        categoryLabel: '労働関係',
        lectures: 10,
        selectionPoints: 5,
        multiplePoints: 7,
        difficulty: 2,
        priority: 'normal',
        order: 7,
        description: '失業給付、育児・介護休業給付'
    },
    {
        id: 'collection',
        name: '労働保険徴収法',
        shortName: '徴収',
        category: 'labor',
        categoryLabel: '労働関係',
        lectures: 5,
        selectionPoints: 0,
        multiplePoints: 6,
        difficulty: 2,
        priority: 'normal',
        order: 8,
        description: '労働保険料の申告・納付'
    },
    {
        id: 'labor_general',
        name: '労務管理一般常識',
        shortName: '労一',
        category: 'labor',
        categoryLabel: '労働関係',
        lectures: 7,
        selectionPoints: 5,
        multiplePoints: 5,
        difficulty: 4,
        priority: 'high',
        order: 10,
        description: '労働経済、労働法規、統計など'
    }
];

// デフォルトの今日のタスク
const DEFAULT_TASKS = [
    { id: 1, title: '講義を1コマ視聴する', time: '60分', completed: false },
    { id: 2, title: 'テキストを読み返す', time: '30分', completed: false },
    { id: 3, title: '確認問題を解く', time: '30分', completed: false }
];

// サンプル暗記カード
const SAMPLE_FLASHCARDS = [
    {
        id: 1,
        subjectId: 'employment',
        question: '雇用保険の基本手当の所定給付日数は何日から何日？',
        answer: '被保険者期間と年齢により90日〜360日（特定受給資格者は最大330日）',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    },
    {
        id: 2,
        subjectId: 'pension',
        question: '老齢基礎年金の受給資格期間は？',
        answer: '10年（120月）以上の保険料納付済期間等が必要',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    },
    {
        id: 3,
        subjectId: 'health',
        question: '健康保険の傷病手当金の支給期間は？',
        answer: '支給開始日から通算して1年6か月',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    },
    {
        id: 4,
        subjectId: 'labor_standard',
        question: '労働基準法の法定労働時間は？',
        answer: '1日8時間、1週40時間（特例事業場は44時間）',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    },
    {
        id: 5,
        subjectId: 'workers_comp',
        question: '労災保険の休業補償給付の支給額は？',
        answer: '給付基礎日額の60%（特別支給金20%と合わせて80%）',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    }
];

// 週間目標時間
const WEEKLY_TARGET = 20; // 時間

// 理解度レベル定義
const MASTERY_LEVELS = [
    { level: 1, label: '未着手', color: '#a0aec0', description: '学習開始前' },
    { level: 2, label: '学習中', color: '#ed8936', description: '正答率50%未満' },
    { level: 3, label: '理解済', color: '#48bb78', description: '正答率70%以上' },
    { level: 4, label: '定着', color: '#38a169', description: '正答率90%以上' }
];

// 学習タイプ
const STUDY_TYPES = {
    lecture: '講義視聴',
    textbook: 'テキスト学習',
    exercise: '問題演習',
    review: '復習',
    audio: '音声学習'
};

// 2026年法改正情報（2026年試験対策用）
const LAW_AMENDMENTS_2026 = [
    {
        id: 1,
        category: '労働基準法',
        title: '労働基準法の大改正（約40年ぶり）',
        effectiveDate: '2026年4月（予定）',
        priority: 'critical',
        summary: '約40年ぶりの大規模改正。連続勤務規制、法定休日の明確化、勤務間インターバルの法定化など。',
        details: [
            '「4週4日」の変形週休制の特例が「2週2日」を基本に見直し',
            '14日以上の連続勤務が禁止',
            '法定休日の事前特定義務が企業に課される',
            '勤務間インターバル11時間を法定の原則として提言'
        ],
        relatedSubjects: ['labor_standard'],
        source: 'https://www.mhlw.go.jp/'
    },
    {
        id: 2,
        category: '厚生年金保険法',
        title: '在職老齢年金の支給停止基準額引き上げ',
        effectiveDate: '2026年4月1日',
        priority: 'high',
        summary: '在職老齢年金の支給停止基準額が月50万円から62万円に引き上げ。',
        details: [
            '支給停止基準額：月50万円 → 月62万円',
            '高齢者の就労意欲向上が目的',
            '年金と賃金の合計が基準額を超える場合に年金が減額'
        ],
        relatedSubjects: ['pension'],
        source: 'https://www.mhlw.go.jp/'
    },
    {
        id: 3,
        category: '労働施策総合推進法',
        title: 'カスタマーハラスメント対策の義務化',
        effectiveDate: '2026年（予定）',
        priority: 'high',
        summary: 'カスタマーハラスメント防止措置、就活セクハラ防止措置が企業に義務化。',
        details: [
            'カスタマーハラスメント（カスハラ）防止措置の義務化',
            '就職活動中の学生へのセクハラ防止措置の義務化',
            '相談窓口設置、対応マニュアル整備等が必要'
        ],
        relatedSubjects: ['labor_general'],
        source: 'https://www.mhlw.go.jp/'
    },
    {
        id: 4,
        category: '労働安全衛生法',
        title: '労働安全衛生法・作業環境測定法の改正',
        effectiveDate: '2026年1月1日〜段階施行',
        priority: 'medium',
        summary: '化学物質管理の強化、危険有害性情報通知違反への罰則新設など。',
        details: [
            '危険有害性情報通知違反への罰則新設',
            '営業秘密の代替化学名の限定容認',
            '個人ばく露測定の位置付け明確化',
            '2026年1月、4月、2027年1月、4月と段階施行'
        ],
        relatedSubjects: ['labor_safety'],
        source: 'https://www.mhlw.go.jp/'
    },
    {
        id: 5,
        category: '子ども・子育て支援法',
        title: '子ども・子育て支援金制度の創設',
        effectiveDate: '2026年4月',
        priority: 'medium',
        summary: '少子化対策を目的に、医療保険料に上乗せして徴収する新制度。',
        details: [
            '医療保険料に上乗せして徴収',
            '財源を子育て関連施策に充当',
            '健康保険、国民健康保険等の保険料に影響'
        ],
        relatedSubjects: ['health', 'social_general'],
        source: 'https://www.mhlw.go.jp/'
    },
    {
        id: 6,
        category: '雇用保険法',
        title: '教育訓練給付金の拡充',
        effectiveDate: '2025年10月〜',
        priority: 'medium',
        summary: '専門実践教育訓練給付金の給付率引上げ、教育訓練休暇給付金の新設。',
        details: [
            '専門実践教育訓練給付金：最大70%→80%に引上げ',
            '教育訓練休暇給付金の新設',
            'リスキリング支援の強化'
        ],
        relatedSubjects: ['employment'],
        source: 'https://www.mhlw.go.jp/'
    }
];

// 法改正の重要度ラベル
const AMENDMENT_PRIORITY = {
    critical: { label: '最重要', color: '#e53e3e', bgColor: '#fed7d7' },
    high: { label: '重要', color: '#dd6b20', bgColor: '#feebc8' },
    medium: { label: '注目', color: '#3182ce', bgColor: '#bee3f8' }
};
