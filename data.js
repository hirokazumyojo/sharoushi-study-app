// ========================================
// 社労士合格ナビ 2026 - データ定義
// 工藤プロジェクト Swing-by セミナー対応
// ========================================

// 試験情報
const EXAM_INFO = {
    year: 2026,
    examDate: new Date('2026-08-23'),
    passingCriteria: {
        selection: { total: 25, perSubject: 3 },
        multiple: { total: 44, perSubject: 4 }
    }
};

// 学習フェーズ定義（工藤プロジェクトのスケジュールに合わせて調整）
const PHASES = [
    {
        id: 1,
        name: '年金BASIS・ツールボックス期',
        badge: 'Phase 1',
        period: '9月〜12月',
        startMonth: 9,
        endMonth: 12,
        startYear: 2025,
        goal: '年金BASIS完了、ツールボックス編で横断整理と社会保険科目の基礎固め'
    },
    {
        id: 2,
        name: 'スイングバイ期',
        badge: 'Phase 2',
        period: '1月〜4月',
        startMonth: 1,
        endMonth: 4,
        startYear: 2026,
        goal: '労働科目のインプット完了、本論編の全範囲を網羅'
    },
    {
        id: 3,
        name: '直前対策期',
        badge: 'Phase 3',
        period: '5月〜8月',
        startMonth: 5,
        endMonth: 8,
        startYear: 2026,
        goal: '改正法・白書対策、答練・模試で実力確認、弱点克服'
    }
];

// ========================================
// 講義シリーズ定義（工藤プロジェクト2026）
// ========================================
const LECTURE_SERIES = [
    // ===== 年金BASIS =====
    {
        id: 'pension_basis',
        seriesName: '年金BASIS',
        category: 'basis',
        lectures: [
            { id: 'pb1', name: '公的年金の給付と役割及び財政等', count: 4, deliveryDate: '2025-09-01', webStart: '2025-10-06' },
            { id: 'pb2', name: '社会保障制度の意義と沿革', count: 3, deliveryDate: '2025-09-01', webStart: '2025-11-10' }
        ],
        totalLectures: 7,
        order: 1
    },
    // ===== ツールボックス編 =====
    {
        id: 'toolbox',
        seriesName: 'ツールボックス編',
        category: 'toolbox',
        lectures: [
            { id: 'tb1', name: '基本事項の横断', count: 7, deliveryDate: '2025-09-29', webStart: '2025-11-17' },
            { id: 'tb2', name: '健康保険法', count: 5, deliveryDate: '2025-11-04', webStart: '2025-12-08' },
            { id: 'tb3', name: '社会保険一般常識', count: 3, deliveryDate: '2025-11-17', webStart: '2026-01-05' },
            { id: 'tb4', name: '年金コントラスト/メインフレーム/公的年金法', count: 10, deliveryDate: '2025-12-01', webStart: '2026-01-13' }
        ],
        totalLectures: 25,
        order: 2
    },
    // ===== スイングバイ編（本論編） =====
    {
        id: 'swingby',
        seriesName: 'スイングバイ編',
        category: 'swingby',
        lectures: [
            { id: 'sb1', name: '労働に関する一般常識①', count: 1, deliveryDate: '2026-01-19', webStart: '2026-02-24' },
            { id: 'sb2', name: '労働基準法', count: 6, deliveryDate: '2026-01-19', webStart: '2026-03-02' },
            { id: 'sb3', name: '労働に関する一般常識②/Swing-by改正・白書', count: 2, deliveryDate: '2026-01-19', webStart: '2026-03-16' },
            { id: 'sb4', name: '労働者災害補償保険法', count: 5, deliveryDate: '2026-02-16', webStart: '2026-03-23' },
            { id: 'sb5', name: '労働に関する一般常識③', count: 3, deliveryDate: '2026-01-19', webStart: '2026-04-13' },
            { id: 'sb6', name: '雇用保険法', count: 5, deliveryDate: '2026-03-16', webStart: '2026-04-27' },
            { id: 'sb7', name: '労働保険徴収法', count: 3, deliveryDate: '2026-04-06', webStart: '2026-05-11' },
            { id: 'sb8', name: '労働安全衛生法', count: 3, deliveryDate: '2026-04-13', webStart: '2026-06-01' }
        ],
        totalLectures: 28,
        order: 3
    },
    // ===== 直前編 =====
    {
        id: 'final',
        seriesName: '直前編',
        category: 'final',
        lectures: [
            { id: 'fn1', name: '改正法攻略講座', count: 2, deliveryDate: '2026-05-07', webStart: '2026-05-07' },
            { id: 'fn2', name: '実戦答練', count: 7, deliveryDate: null, webStart: null },
            { id: 'fn3', name: '白書・統計攻略講座', count: 2, deliveryDate: '2026-06-01', webStart: '2026-06-01' },
            { id: 'fn4', name: '工藤プロジェクト公開講義', count: 1, deliveryDate: '2026-06-08', webStart: '2026-06-08' },
            { id: 'fn5', name: 'サマリー編', count: 4, deliveryDate: '2026-06-29', webStart: '2026-06-29' },
            { id: 'fn6', name: '全日本社労士公開模試', count: 3, deliveryDate: '2026-05-07', webStart: '2026-05-07' }
        ],
        totalLectures: 19,
        order: 4
    },
    // ===== 実力完成講座OPUS =====
    {
        id: 'opus',
        seriesName: '実力完成講座OPUS',
        category: 'opus',
        lectures: [
            { id: 'op1', name: 'OPUS #1〜#4', count: 4, deliveryDate: '2025-09-29', webStart: '2025-09-29' },
            { id: 'op2', name: 'OPUS #5〜#8', count: 4, deliveryDate: '2025-12-22', webStart: '2025-12-22' },
            { id: 'op3', name: 'OPUS #9〜#10', count: 2, deliveryDate: '2026-04-06', webStart: '2026-04-06' }
        ],
        totalLectures: 10,
        order: 5
    }
];

// 総講義数の計算
const TOTAL_LECTURES = LECTURE_SERIES.reduce((sum, series) => sum + series.totalLectures, 0); // 89回

// ========================================
// 科目データ（試験科目として管理）
// ========================================
const SUBJECTS = [
    // ===== 社会保険関係 =====
    {
        id: 'health',
        name: '健康保険法',
        shortName: '健保',
        category: 'social',
        categoryLabel: '社会保険',
        relatedLectures: ['tb2'],
        selectionPoints: 5,
        multiplePoints: 10,
        difficulty: 3,
        priority: 'high',
        order: 1,
        description: '医療保険制度の基本、給付内容'
    },
    {
        id: 'pension_np',
        name: '国民年金法',
        shortName: '国年',
        category: 'social',
        categoryLabel: '社会保険',
        relatedLectures: ['pb1', 'pb2', 'tb4'],
        selectionPoints: 5,
        multiplePoints: 10,
        difficulty: 5,
        priority: 'critical',
        order: 2,
        description: '基礎年金、第1号〜第3号被保険者'
    },
    {
        id: 'pension_ep',
        name: '厚生年金保険法',
        shortName: '厚年',
        category: 'social',
        categoryLabel: '社会保険',
        relatedLectures: ['pb1', 'pb2', 'tb4'],
        selectionPoints: 5,
        multiplePoints: 10,
        difficulty: 5,
        priority: 'critical',
        order: 3,
        description: '報酬比例年金、在職老齢年金'
    },
    {
        id: 'social_general',
        name: '社会保険に関する一般常識',
        shortName: '社一',
        category: 'social',
        categoryLabel: '社会保険',
        relatedLectures: ['tb3'],
        selectionPoints: 5,
        multiplePoints: 5,
        difficulty: 4,
        priority: 'high',
        order: 4,
        description: '介護保険法、国民健康保険法、各種統計'
    },
    // ===== 労働関係 =====
    {
        id: 'labor_standard',
        name: '労働基準法',
        shortName: '労基',
        category: 'labor',
        categoryLabel: '労働関係',
        relatedLectures: ['sb2'],
        selectionPoints: 5,
        multiplePoints: 7,
        difficulty: 3,
        priority: 'high',
        order: 5,
        description: '労働契約、賃金、労働時間の基本'
    },
    {
        id: 'labor_safety',
        name: '労働安全衛生法',
        shortName: '安衛',
        category: 'labor',
        categoryLabel: '労働関係',
        relatedLectures: ['sb8'],
        selectionPoints: 0,
        multiplePoints: 3,
        difficulty: 2,
        priority: 'normal',
        order: 6,
        description: '職場の安全衛生管理'
    },
    {
        id: 'workers_comp',
        name: '労働者災害補償保険法',
        shortName: '労災',
        category: 'labor',
        categoryLabel: '労働関係',
        relatedLectures: ['sb4'],
        selectionPoints: 5,
        multiplePoints: 7,
        difficulty: 2,
        priority: 'normal',
        order: 7,
        description: '業務災害・通勤災害の給付'
    },
    {
        id: 'employment',
        name: '雇用保険法',
        shortName: '雇用',
        category: 'labor',
        categoryLabel: '労働関係',
        relatedLectures: ['sb6'],
        selectionPoints: 5,
        multiplePoints: 7,
        difficulty: 2,
        priority: 'normal',
        order: 8,
        description: '失業給付、育児・介護休業給付'
    },
    {
        id: 'collection',
        name: '労働保険徴収法',
        shortName: '徴収',
        category: 'labor',
        categoryLabel: '労働関係',
        relatedLectures: ['sb7'],
        selectionPoints: 0,
        multiplePoints: 6,
        difficulty: 2,
        priority: 'normal',
        order: 9,
        description: '労働保険料の申告・納付'
    },
    {
        id: 'labor_general',
        name: '労働に関する一般常識',
        shortName: '労一',
        category: 'labor',
        categoryLabel: '労働関係',
        relatedLectures: ['sb1', 'sb3', 'sb5'],
        selectionPoints: 5,
        multiplePoints: 5,
        difficulty: 4,
        priority: 'high',
        order: 10,
        description: '労働経済、労働法規、白書・統計'
    }
];

// 講義シリーズのカテゴリラベル
const SERIES_CATEGORIES = {
    basis: { label: '年金BASIS', color: '#805ad5', bgColor: '#e9d8fd' },
    toolbox: { label: 'ツールボックス', color: '#3182ce', bgColor: '#bee3f8' },
    swingby: { label: 'スイングバイ', color: '#dd6b20', bgColor: '#feebc8' },
    final: { label: '直前編', color: '#e53e3e', bgColor: '#fed7d7' },
    opus: { label: 'OPUS', color: '#38a169', bgColor: '#c6f6d5' }
};

// デフォルトの今日のタスク
const DEFAULT_TASKS = [
    { id: 1, title: '講義を1コマ視聴する', time: '60分', completed: false },
    { id: 2, title: 'テキストを読み返す', time: '30分', completed: false },
    { id: 3, title: '確認問題を解く', time: '30分', completed: false }
];

// サンプル暗記カード（過去問ベース）
// 全3,500問は設定画面からflashcards_import.jsonをインポート可能
const SAMPLE_FLASHCARDS = [
    {
        id: 1,
        subjectId: 'labor_standard',
        question: '【平成28年 問01-ア】\n労働基準法第1条は、労働保護法たる労働基準法の基本理念を宣明したものであって、本法各条の解釈にあたり基本観念として常に考慮されなければならない。',
        answer: '正解: 正\n\n本問のとおりである（法1条、昭22.9.13発基17号）。\n法1条は訓示的規定であり、本条違反に対する罰則はない。',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    },
    {
        id: 2,
        subjectId: 'labor_safety',
        question: '【令和2年 問09-Ａ】\n労働安全衛生法は、同居の親族のみを使用する事業又は事務所については適用されない。また、家事使用人についても適用されない。',
        answer: '正解: 正\n\n本問のとおりである(昭47.9.18発基91号)。',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    },
    {
        id: 3,
        subjectId: 'workers_comp',
        question: '【平成30年 問04-オ】\n試みの使用期間中の者にも労災保険法は適用される。',
        answer: '正解: 正\n\n本問のとおりである（法3条、労働基準法9条）。\n労災保険の適用労働者の範囲は、労働基準法9条に準じており、「適用事業に使用される者で、賃金を支払われるもの」とされている。',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    },
    {
        id: 4,
        subjectId: 'employment',
        question: '【令和3年 問01-Ａ】\n雇用保険法における賃金とは、賃金、給料、手当、賞与その他名称のいかんを問わず、労働の対償として事業主が労働者に支払うものをいう。',
        answer: '正解: 正\n\n本問のとおりである（法4条4項）。',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    },
    {
        id: 5,
        subjectId: 'collection',
        question: '【令和4年 問08-Ａ】\n労働保険徴収法における「賃金」とは、賃金、給料、手当、賞与その他名称のいかんを問わず、労働の対償として事業主が労働者に支払うすべてのものをいう。',
        answer: '正解: 正\n\n本問のとおりである（法2条2項）。',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    },
    {
        id: 6,
        subjectId: 'pension_np',
        question: '【令和4年 問01-Ａ】\n国民年金法における「配偶者」には、婚姻の届出をしていないが、事実上婚姻関係と同様の事情にある者を含む。',
        answer: '正解: 正\n\n本問のとおりである（法5条8項）。',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    },
    {
        id: 7,
        subjectId: 'pension_ep',
        question: '【令和4年 問01-Ａ】\n厚生年金保険法において「配偶者」、「夫」及び「妻」には、婚姻の届出をしていないが、事実上婚姻関係と同様の事情にある者を含む。',
        answer: '正解: 正\n\n本問のとおりである（法3条2項）。',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    },
    {
        id: 8,
        subjectId: 'labor_general',
        question: '【令和4年 問05-Ａ】\n労働契約法第1条では、労働契約が合意により成立し、又は変更されるという合意の原則等労働契約に関する基本的事項を定めることにより、合理的な労働条件の決定又は変更が円滑に行われるようにすることを目的としている。',
        answer: '正解: 正\n\n本問のとおりである（労働契約法1条）。',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    },
    {
        id: 9,
        subjectId: 'social_general',
        question: '【令和4年 問06-Ａ】\n介護保険法第1条では、加齢に伴って生ずる心身の変化に起因する疾病等により要介護状態となった者等について、これらの者が尊厳を保持し、その有する能力に応じ自立した日常生活を営むことができるよう、必要な保健医療サービス及び福祉サービスに係る給付を行うことを目的としている。',
        answer: '正解: 正\n\n本問のとおりである（介護保険法1条）。',
        status: 'new',
        correctCount: 0,
        lastReviewed: null
    },
    {
        id: 10,
        subjectId: 'health',
        question: '【令和4年 問01-Ａ】\n健康保険法第1条では、労働者又はその被扶養者の業務災害以外の疾病、負傷若しくは死亡又は出産に関して保険給付を行い、もって国民の生活の安定と福祉の向上に寄与することを目的としている。',
        answer: '正解: 正\n\n本問のとおりである（法1条）。',
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
        relatedSubjects: ['pension_ep'],
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

// 配信終了日
const DELIVERY_END_DATE = new Date('2026-08-31');
