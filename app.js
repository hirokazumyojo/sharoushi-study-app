// ========================================
// 社労士合格ナビ 2026 - メインアプリケーション
// ========================================

// ========================================
// 認証管理
// ========================================
class AuthManager {
    constructor() {
        this.AUTH_KEY = 'sharoushi_auth';
        this.SESSION_KEY = 'sharoushi_session';
        // セッション有効期限: 30日
        this.SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;
    }

    // パスワードをハッシュ化（簡易版）
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
    }

    // パスワードが設定済みか確認
    isPasswordSet() {
        return localStorage.getItem(this.AUTH_KEY) !== null;
    }

    // パスワードを設定
    setPassword(password) {
        const hash = this.hashPassword(password);
        localStorage.setItem(this.AUTH_KEY, hash);
        this.createSession();
    }

    // パスワードを検証
    verifyPassword(password) {
        const storedHash = localStorage.getItem(this.AUTH_KEY);
        const inputHash = this.hashPassword(password);
        return storedHash === inputHash;
    }

    // セッションを作成
    createSession() {
        const session = {
            created: Date.now(),
            expires: Date.now() + this.SESSION_DURATION
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }

    // セッションが有効か確認
    isSessionValid() {
        const sessionStr = localStorage.getItem(this.SESSION_KEY);
        if (!sessionStr) return false;

        try {
            const session = JSON.parse(sessionStr);
            return session.expires > Date.now();
        } catch {
            return false;
        }
    }

    // ログアウト
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
    }

    // パスワードを変更
    changePassword(newPassword) {
        this.setPassword(newPassword);
    }
}

// 認証UIの初期化
function initAuth() {
    const auth = new AuthManager();

    const loginScreen = document.getElementById('loginScreen');
    const setupScreen = document.getElementById('setupScreen');
    const app = document.getElementById('app');

    // セッションが有効ならアプリを表示
    if (auth.isSessionValid()) {
        loginScreen.style.display = 'none';
        setupScreen.style.display = 'none';
        app.style.display = 'block';
        return true;
    }

    // パスワード未設定なら設定画面を表示
    if (!auth.isPasswordSet()) {
        loginScreen.style.display = 'none';
        setupScreen.style.display = 'flex';

        document.getElementById('setupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;
            const errorEl = document.getElementById('setupError');

            if (newPass !== confirmPass) {
                errorEl.textContent = 'パスワードが一致しません';
                errorEl.style.display = 'block';
                return;
            }

            if (newPass.length < 4) {
                errorEl.textContent = 'パスワードは4文字以上で設定してください';
                errorEl.style.display = 'block';
                return;
            }

            auth.setPassword(newPass);
            setupScreen.style.display = 'none';
            app.style.display = 'block';
            window.sharoushiApp = new SharoushiApp();
        });

        return false;
    }

    // ログイン画面を表示
    loginScreen.style.display = 'flex';
    setupScreen.style.display = 'none';

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');

        if (auth.verifyPassword(password)) {
            auth.createSession();
            loginScreen.style.display = 'none';
            app.style.display = 'block';
            window.sharoushiApp = new SharoushiApp();
        } else {
            errorEl.style.display = 'block';
            document.getElementById('loginPassword').value = '';
        }
    });

    return false;
}

// ページ読み込み時に認証チェック
document.addEventListener('DOMContentLoaded', () => {
    if (initAuth()) {
        window.sharoushiApp = new SharoushiApp();
    }
});

class SharoushiApp {
    constructor() {
        // ローカルストレージキー
        this.STORAGE_KEYS = {
            studyRecords: 'sharoushi_study_records',
            subjectProgress: 'sharoushi_subject_progress',
            flashcards: 'sharoushi_flashcards',
            audioFiles: 'sharoushi_audio_files',
            tasks: 'sharoushi_tasks',
            settings: 'sharoushi_settings',
            quizQuestions: 'sharoushi_quiz_questions',
            quizHistory: 'sharoushi_quiz_history'
        };

        // 状態
        this.state = {
            currentPage: 'dashboard',
            studyRecords: [],
            subjectProgress: {},
            flashcards: [],
            audioFiles: [],
            tasks: [],
            timer: {
                isRunning: false,
                isPaused: false,
                startTime: null,
                elapsed: 0,
                intervalId: null,
                subject: ''
            },
            audio: {
                currentTrack: null,
                isPlaying: false,
                playbackRate: 1.25
            },
            currentCardIndex: 0,
            isCardFlipped: false
        };

        this.init();
    }

    // ========================================
    // 初期化
    // ========================================
    init() {
        this.loadData();
        this.initQuizState();
        this.initSettings();
        this.bindEvents();
        this.render();
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 60000);

        // リマインダーをスケジュール
        if (this.state.settings.reminderEnabled) {
            this.scheduleReminder();
        }
    }

    loadData() {
        // ローカルストレージからデータを読み込み
        this.state.studyRecords = this.getStorage(this.STORAGE_KEYS.studyRecords) || [];
        this.state.subjectProgress = this.getStorage(this.STORAGE_KEYS.subjectProgress) || this.initSubjectProgress();
        this.state.flashcards = this.getStorage(this.STORAGE_KEYS.flashcards) || [...SAMPLE_FLASHCARDS];
        this.state.audioFiles = this.getStorage(this.STORAGE_KEYS.audioFiles) || [];
        this.state.tasks = this.getStorage(this.STORAGE_KEYS.tasks) || [...DEFAULT_TASKS];
    }

    initSubjectProgress() {
        const progress = {};
        SUBJECTS.forEach(subject => {
            progress[subject.id] = {
                completedLectures: 0,
                masteryLevel: 1,
                correctRate: 0,
                totalStudyMinutes: 0,
                lastStudied: null
            };
        });
        return progress;
    }

    getStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage read error:', e);
            return null;
        }
    }

    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage write error:', e);
        }
    }

    // ========================================
    // イベントバインド
    // ========================================
    bindEvents() {
        // ナビゲーション
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });

        // タイマー
        document.getElementById('timerStart').addEventListener('click', () => this.startTimer());
        document.getElementById('timerPause').addEventListener('click', () => this.pauseTimer());
        document.getElementById('timerStop').addEventListener('click', () => this.stopTimer());

        // 手動記録フォーム
        document.getElementById('manualRecordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveManualRecord();
        });

        // 音声ファイルアップロード
        document.getElementById('uploadAudioBtn').addEventListener('click', () => {
            document.getElementById('audioFileInput').click();
        });
        document.getElementById('audioFileInput').addEventListener('change', (e) => {
            this.handleAudioUpload(e.target.files);
        });

        // 音声プレイヤーコントロール
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('skipBackBtn').addEventListener('click', () => this.skipAudio(-15));
        document.getElementById('skipForwardBtn').addEventListener('click', () => this.skipAudio(15));
        document.getElementById('progressSlider').addEventListener('input', (e) => this.seekAudio(e.target.value));
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setPlaybackRate(parseFloat(e.target.dataset.speed)));
        });

        // オーディオプレイヤーイベント
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.addEventListener('timeupdate', () => this.updateAudioProgress());
        audioPlayer.addEventListener('ended', () => this.onAudioEnded());

        // 暗記カード
        document.getElementById('currentCard').addEventListener('click', () => this.flipCard());
        document.getElementById('cardFlip').addEventListener('click', () => this.flipCard());
        document.getElementById('cardCorrect').addEventListener('click', () => this.markCard(true));
        document.getElementById('cardWrong').addEventListener('click', () => this.markCard(false));
        document.getElementById('addCardForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFlashcard();
        });

        // 科目フィルター
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderSubjects(e.target.dataset.filter);
            });
        });

        // 過去問演習
        document.getElementById('importCsvBtn')?.addEventListener('click', () => {
            document.getElementById('csvFileInput').click();
        });
        document.getElementById('csvFileInput')?.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.importCsvQuestions(e.target.files[0]);
            }
        });
        document.getElementById('startQuizBtn')?.addEventListener('click', () => this.startQuiz());
        document.getElementById('choiceCorrect')?.addEventListener('click', () => this.answerQuestion('正'));
        document.getElementById('choiceWrong')?.addEventListener('click', () => this.answerQuestion('誤'));
        document.getElementById('choiceUnsure')?.addEventListener('click', () => this.answerQuestion('不明'));
        document.getElementById('nextQuestionBtn')?.addEventListener('click', () => this.nextQuestion());
        document.getElementById('retryQuizBtn')?.addEventListener('click', () => {
            document.getElementById('quizSummary').style.display = 'none';
            this.startQuiz();
        });

        // 設定
        document.getElementById('openSettingsBtn')?.addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettingsBtn')?.addEventListener('click', () => this.closeSettings());
        document.getElementById('modalBackdrop')?.addEventListener('click', () => this.closeSettings());
        document.getElementById('testNotificationBtn')?.addEventListener('click', () => this.testNotification());

        // 設定変更時に自動保存
        ['reminderEnabled', 'reminderTime', 'reminderMessage', 'weeklyTargetHours'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.saveSettings());
        });

        // データ管理
        document.getElementById('exportDataBtn')?.addEventListener('click', () => this.exportAllData());
        document.getElementById('importDataBtn')?.addEventListener('click', () => {
            document.getElementById('importDataInput').click();
        });
        document.getElementById('importDataInput')?.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.importAllData(e.target.files[0]);
            }
        });
        document.getElementById('resetDataBtn')?.addEventListener('click', () => this.resetAllData());
    }

    // ========================================
    // ナビゲーション
    // ========================================
    navigateTo(page) {
        this.state.currentPage = page;

        // ナビボタンの状態更新
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === page);
        });

        // ページ表示切替
        document.querySelectorAll('.page').forEach(p => {
            p.classList.toggle('active', p.id === `page-${page}`);
        });

        // ページ固有の更新
        if (page === 'dashboard') {
            this.renderDashboard();
        } else if (page === 'subjects') {
            this.renderSubjects('all');
        } else if (page === 'study') {
            this.renderStudyPage();
        } else if (page === 'audio') {
            this.renderAudioPage();
        } else if (page === 'cards') {
            this.renderCardsPage();
        } else if (page === 'quiz') {
            this.renderQuizPage();
        }
    }

    // ========================================
    // レンダリング
    // ========================================
    render() {
        this.populateSubjectSelects();
        this.renderDashboard();
    }

    updateDateTime() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('ja-JP', options);
    }

    renderDashboard() {
        this.renderCountdown();
        this.renderWeeklyStats();
        this.renderPhase();
        this.renderOverallProgress();
        this.renderRiskList();
        this.renderTodayTasks();
        this.renderAmendments();
    }

    renderAmendments() {
        const container = document.getElementById('amendmentList');
        if (!container) return;

        // 重要度順にソート
        const priorityOrder = { critical: 0, high: 1, medium: 2 };
        const sorted = [...LAW_AMENDMENTS_2026].sort((a, b) =>
            priorityOrder[a.priority] - priorityOrder[b.priority]
        );

        // 上位4件を表示
        container.innerHTML = sorted.slice(0, 4).map(item => {
            const priorityInfo = AMENDMENT_PRIORITY[item.priority];
            return `
                <div class="amendment-item ${item.priority}">
                    <div class="amendment-header">
                        <span class="amendment-category">${item.category}</span>
                        <span class="amendment-priority ${item.priority}">${priorityInfo.label}</span>
                    </div>
                    <div class="amendment-title">${item.title}</div>
                    <div class="amendment-date">施行: ${item.effectiveDate}</div>
                    <div class="amendment-summary">${item.summary}</div>
                </div>
            `;
        }).join('');
    }

    renderCountdown() {
        const today = new Date();
        const examDate = EXAM_INFO.examDate;
        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        document.getElementById('daysRemaining').textContent = diffDays > 0 ? diffDays : 0;
        document.getElementById('examDate').textContent =
            `${examDate.getFullYear()}年${examDate.getMonth() + 1}月${examDate.getDate()}日（予定）`;
    }

    renderWeeklyStats() {
        const weeklyMinutes = this.getWeeklyStudyMinutes();
        const weeklyHours = Math.floor(weeklyMinutes / 60);
        const progress = Math.min((weeklyHours / WEEKLY_TARGET) * 100, 100);

        document.getElementById('weeklyHours').textContent = weeklyHours;
        document.getElementById('weeklyTarget').textContent = WEEKLY_TARGET;
        document.getElementById('weeklyProgress').textContent = `${Math.round(progress)}%`;
        document.getElementById('weeklyProgressBar').style.width = `${progress}%`;
    }

    getWeeklyStudyMinutes() {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        return this.state.studyRecords
            .filter(record => new Date(record.date) >= weekStart)
            .reduce((sum, record) => sum + record.minutes, 0);
    }

    renderPhase() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // 年をまたいだフェーズ判定
        let phase = PHASES[0]; // デフォルト
        for (const p of PHASES) {
            const phaseYear = p.startYear || 2026;
            if (currentYear === phaseYear && currentMonth >= p.startMonth && currentMonth <= p.endMonth) {
                phase = p;
                break;
            } else if (currentYear === 2025 && phaseYear === 2025 && currentMonth >= p.startMonth) {
                phase = p;
            } else if (currentYear === 2026 && phaseYear === 2026 && currentMonth >= p.startMonth && currentMonth <= p.endMonth) {
                phase = p;
                break;
            }
        }

        document.getElementById('currentPhase').textContent = phase.badge;
        document.getElementById('phaseName').textContent = phase.name;
        document.getElementById('phasePeriod').textContent = phase.period;
        document.getElementById('phaseGoal').textContent = phase.goal;
    }

    renderOverallProgress() {
        const totalLectures = SUBJECTS.reduce((sum, s) => sum + s.lectures, 0);
        const completedLectures = Object.values(this.state.subjectProgress)
            .reduce((sum, p) => sum + p.completedLectures, 0);
        const percent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

        document.getElementById('overallPercent').textContent = percent;
        document.getElementById('completedLectures').textContent = `${completedLectures} / ${totalLectures}`;

        const totalMinutes = this.state.studyRecords.reduce((sum, r) => sum + r.minutes, 0);
        const totalHours = Math.floor(totalMinutes / 60);
        document.getElementById('totalStudyTime').textContent = `${totalHours}時間`;

        // 円グラフ更新
        const circle = document.getElementById('progressCircle');
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    renderRiskList() {
        const riskList = document.getElementById('riskList');
        const risks = SUBJECTS
            .filter(s => s.priority !== 'foundation')
            .map(subject => {
                const progress = this.state.subjectProgress[subject.id];
                const rate = progress.correctRate;
                let status = 'safe';
                if (rate < 40) status = 'danger';
                else if (rate < 60) status = 'warning';

                return { subject, rate, status };
            })
            .filter(r => r.status !== 'safe')
            .sort((a, b) => a.rate - b.rate)
            .slice(0, 3);

        if (risks.length === 0) {
            riskList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✅</div>
                    <div class="empty-state-text">現在、足切りリスクのある科目はありません</div>
                </div>
            `;
            return;
        }

        riskList.innerHTML = risks.map(r => `
            <div class="risk-item ${r.status}">
                <div class="risk-indicator"></div>
                <div class="risk-subject">${r.subject.name}</div>
                <div class="risk-score">${r.rate}%</div>
            </div>
        `).join('');
    }

    renderTodayTasks() {
        const taskList = document.getElementById('todayTasks');
        taskList.innerHTML = this.state.tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox">${task.completed ? '✓' : ''}</div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-time">${task.time}</div>
                </div>
            </div>
        `).join('');

        // タスククリックイベント
        taskList.querySelectorAll('.task-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.toggleTask(id);
            });
        });
    }

    toggleTask(id) {
        const task = this.state.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.setStorage(this.STORAGE_KEYS.tasks, this.state.tasks);
            this.renderTodayTasks();
        }
    }

    // ========================================
    // 科目別ページ
    // ========================================
    renderSubjects(filter) {
        const subjectList = document.getElementById('subjectList');
        let subjects = [...SUBJECTS].sort((a, b) => a.order - b.order);

        if (filter === 'labor') {
            subjects = subjects.filter(s => s.category === 'labor');
        } else if (filter === 'social') {
            subjects = subjects.filter(s => s.category === 'social');
        }

        subjectList.innerHTML = subjects.map(subject => {
            const progress = this.state.subjectProgress[subject.id];
            const lectureProgress = subject.lectures > 0
                ? Math.round((progress.completedLectures / subject.lectures) * 100)
                : 0;
            const stars = '★'.repeat(progress.masteryLevel) + '☆'.repeat(4 - progress.masteryLevel);

            return `
                <div class="subject-card" data-id="${subject.id}">
                    <div class="subject-header">
                        <div>
                            <div class="subject-name">${subject.name}</div>
                            <div class="subject-category">${subject.categoryLabel}</div>
                        </div>
                        <div class="subject-level">
                            ${stars.split('').map(s =>
                                `<span class="level-star ${s === '★' ? 'filled' : ''}">${s}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="subject-stats">
                        <div class="subject-stat">
                            <div class="subject-stat-value">${progress.completedLectures}/${subject.lectures}</div>
                            <div class="subject-stat-label">講義</div>
                        </div>
                        <div class="subject-stat">
                            <div class="subject-stat-value">${progress.correctRate}%</div>
                            <div class="subject-stat-label">正答率</div>
                        </div>
                        <div class="subject-stat">
                            <div class="subject-stat-value">${Math.floor(progress.totalStudyMinutes / 60)}h</div>
                            <div class="subject-stat-label">学習時間</div>
                        </div>
                    </div>
                    <div class="subject-progress">
                        <div class="subject-progress-header">
                            <span class="subject-progress-label">講義進捗</span>
                            <span class="subject-progress-value">${lectureProgress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${lectureProgress}%"></div>
                        </div>
                    </div>
                    <div class="subject-actions">
                        <button class="subject-btn primary" onclick="app.incrementLecture('${subject.id}')">
                            講義完了 +1
                        </button>
                        <button class="subject-btn secondary" onclick="app.updateCorrectRate('${subject.id}')">
                            正答率更新
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    incrementLecture(subjectId) {
        const subject = SUBJECTS.find(s => s.id === subjectId);
        const progress = this.state.subjectProgress[subjectId];

        if (progress.completedLectures < subject.lectures) {
            progress.completedLectures++;
            progress.lastStudied = new Date().toISOString();
            this.updateMasteryLevel(subjectId);
            this.setStorage(this.STORAGE_KEYS.subjectProgress, this.state.subjectProgress);
            this.renderSubjects(document.querySelector('.filter-btn.active').dataset.filter);
        }
    }

    updateCorrectRate(subjectId) {
        const rate = prompt('正答率を入力してください（0〜100）:');
        if (rate !== null && !isNaN(rate)) {
            const numRate = Math.max(0, Math.min(100, parseInt(rate)));
            this.state.subjectProgress[subjectId].correctRate = numRate;
            this.updateMasteryLevel(subjectId);
            this.setStorage(this.STORAGE_KEYS.subjectProgress, this.state.subjectProgress);
            this.renderSubjects(document.querySelector('.filter-btn.active').dataset.filter);
        }
    }

    updateMasteryLevel(subjectId) {
        const progress = this.state.subjectProgress[subjectId];
        const subject = SUBJECTS.find(s => s.id === subjectId);
        const lectureProgress = subject.lectures > 0 ? progress.completedLectures / subject.lectures : 0;

        if (progress.correctRate >= 90 && lectureProgress >= 1) {
            progress.masteryLevel = 4;
        } else if (progress.correctRate >= 70 && lectureProgress >= 0.5) {
            progress.masteryLevel = 3;
        } else if (progress.correctRate >= 50 || lectureProgress >= 0.3) {
            progress.masteryLevel = 2;
        } else {
            progress.masteryLevel = 1;
        }
    }

    // ========================================
    // 学習記録ページ
    // ========================================
    renderStudyPage() {
        this.populateSubjectSelects();
        this.renderStudyHistory();
        this.renderWeeklyChart();

        // 日付をデフォルトで今日に
        document.getElementById('recordDate').valueAsDate = new Date();
    }

    populateSubjectSelects() {
        const options = SUBJECTS
            .sort((a, b) => a.order - b.order)
            .map(s => `<option value="${s.id}">${s.name}</option>`)
            .join('');

        const defaultOption = '<option value="">選択してください</option>';

        const selects = [
            'timerSubject',
            'recordSubject',
            'newCardSubject',
            'cardSubjectFilter'
        ];

        selects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                if (id === 'cardSubjectFilter') {
                    select.innerHTML = '<option value="all">すべての科目</option>' + options;
                } else {
                    select.innerHTML = defaultOption + options;
                }
            }
        });
    }

    // タイマー
    startTimer() {
        const subject = document.getElementById('timerSubject').value;
        if (!subject) {
            alert('科目を選択してください');
            return;
        }

        this.state.timer.isRunning = true;
        this.state.timer.subject = subject;
        this.state.timer.startTime = Date.now() - this.state.timer.elapsed;

        this.state.timer.intervalId = setInterval(() => {
            this.state.timer.elapsed = Date.now() - this.state.timer.startTime;
            this.updateTimerDisplay();
        }, 1000);

        document.getElementById('timerStart').disabled = true;
        document.getElementById('timerPause').disabled = false;
        document.getElementById('timerStop').disabled = false;
        document.getElementById('timerSubject').disabled = true;
    }

    pauseTimer() {
        if (this.state.timer.isRunning) {
            clearInterval(this.state.timer.intervalId);
            this.state.timer.isRunning = false;
            this.state.timer.isPaused = true;
            document.getElementById('timerStart').disabled = false;
            document.getElementById('timerPause').disabled = true;
        }
    }

    stopTimer() {
        if (this.state.timer.elapsed > 0) {
            const minutes = Math.floor(this.state.timer.elapsed / 60000);
            if (minutes > 0) {
                this.saveStudyRecord(
                    new Date().toISOString().split('T')[0],
                    this.state.timer.subject,
                    minutes,
                    'lecture'
                );
            }
        }

        clearInterval(this.state.timer.intervalId);
        this.state.timer = {
            isRunning: false,
            isPaused: false,
            startTime: null,
            elapsed: 0,
            intervalId: null,
            subject: ''
        };

        this.updateTimerDisplay();
        document.getElementById('timerStart').disabled = false;
        document.getElementById('timerPause').disabled = true;
        document.getElementById('timerStop').disabled = true;
        document.getElementById('timerSubject').disabled = false;

        this.renderStudyHistory();
        this.renderWeeklyChart();
    }

    updateTimerDisplay() {
        const elapsed = this.state.timer.elapsed;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        document.getElementById('timerDisplay').textContent =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    saveManualRecord() {
        const date = document.getElementById('recordDate').value;
        const subject = document.getElementById('recordSubject').value;
        const minutes = parseInt(document.getElementById('recordMinutes').value);
        const type = document.getElementById('recordType').value;

        if (!date || !subject || !minutes) {
            alert('すべての項目を入力してください');
            return;
        }

        this.saveStudyRecord(date, subject, minutes, type);

        // フォームリセット
        document.getElementById('recordMinutes').value = '';

        this.renderStudyHistory();
        this.renderWeeklyChart();
        this.renderDashboard();

        alert('学習記録を保存しました');
    }

    saveStudyRecord(date, subjectId, minutes, type) {
        const record = {
            id: Date.now(),
            date,
            subjectId,
            minutes,
            type,
            createdAt: new Date().toISOString()
        };

        this.state.studyRecords.push(record);
        this.setStorage(this.STORAGE_KEYS.studyRecords, this.state.studyRecords);

        // 科目の学習時間を更新
        this.state.subjectProgress[subjectId].totalStudyMinutes += minutes;
        this.state.subjectProgress[subjectId].lastStudied = new Date().toISOString();
        this.setStorage(this.STORAGE_KEYS.subjectProgress, this.state.subjectProgress);
    }

    renderStudyHistory() {
        const historyList = document.getElementById('studyHistory');
        const records = [...this.state.studyRecords]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        if (records.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-text">まだ学習記録がありません</div>
                </div>
            `;
            return;
        }

        historyList.innerHTML = records.map(record => {
            const subject = SUBJECTS.find(s => s.id === record.subjectId);
            const date = new Date(record.date);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

            return `
                <div class="history-item">
                    <div class="history-date">${dateStr}</div>
                    <div class="history-subject">${subject ? subject.shortName : '不明'}</div>
                    <div class="history-type">${STUDY_TYPES[record.type] || record.type}</div>
                    <div class="history-time">${record.minutes}分</div>
                </div>
            `;
        }).join('');
    }

    renderWeeklyChart() {
        const chart = document.getElementById('weeklyChart');
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const now = new Date();
        const weekData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const minutes = this.state.studyRecords
                .filter(r => r.date === dateStr)
                .reduce((sum, r) => sum + r.minutes, 0);

            weekData.push({
                day: days[date.getDay()],
                minutes,
                hours: (minutes / 60).toFixed(1)
            });
        }

        const maxMinutes = Math.max(...weekData.map(d => d.minutes), 60);

        chart.innerHTML = weekData.map(d => {
            const height = (d.minutes / maxMinutes) * 100;
            return `
                <div class="chart-bar">
                    <div class="bar-fill" style="height: ${height}px"></div>
                    <div class="bar-value">${d.hours}h</div>
                    <div class="bar-label">${d.day}</div>
                </div>
            `;
        }).join('');
    }

    // ========================================
    // 音声プレイヤー
    // ========================================
    renderAudioPage() {
        this.renderAudioList();
    }

    handleAudioUpload(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('audio/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const audioFile = {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        data: e.target.result,
                        duration: 0,
                        subjectId: null,
                        addedAt: new Date().toISOString()
                    };

                    // 音声の長さを取得
                    const audio = new Audio(e.target.result);
                    audio.onloadedmetadata = () => {
                        audioFile.duration = audio.duration;
                        this.state.audioFiles.push(audioFile);
                        this.setStorage(this.STORAGE_KEYS.audioFiles, this.state.audioFiles);
                        this.renderAudioList();
                    };
                };
                reader.readAsDataURL(file);
            }
        });
    }

    renderAudioList() {
        const audioList = document.getElementById('audioList');

        if (this.state.audioFiles.length === 0) {
            audioList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎵</div>
                    <div class="empty-state-text">音声ファイルがありません</div>
                </div>
            `;
            return;
        }

        audioList.innerHTML = this.state.audioFiles.map(file => {
            const duration = this.formatTime(file.duration);
            const isPlaying = this.state.audio.currentTrack?.id === file.id && this.state.audio.isPlaying;

            return `
                <div class="audio-item ${isPlaying ? 'playing' : ''}" data-id="${file.id}">
                    <div class="audio-icon">${isPlaying ? '▶' : '🎵'}</div>
                    <div class="audio-info">
                        <div class="audio-name">${file.name}</div>
                        <div class="audio-duration">${duration}</div>
                    </div>
                    <button class="audio-delete" onclick="event.stopPropagation(); app.deleteAudio('${file.id}')">✕</button>
                </div>
            `;
        }).join('');

        // 再生イベント
        audioList.querySelectorAll('.audio-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.playAudio(id);
            });
        });
    }

    playAudio(id) {
        const file = this.state.audioFiles.find(f => f.id == id);
        if (!file) return;

        const player = document.getElementById('audioPlayer');
        const playerCard = document.getElementById('playerCard');

        this.state.audio.currentTrack = file;
        player.src = file.data;
        player.playbackRate = this.state.audio.playbackRate;
        player.play();

        this.state.audio.isPlaying = true;
        playerCard.style.display = 'block';

        document.getElementById('trackName').textContent = file.name;
        document.getElementById('playPauseBtn').textContent = '⏸';

        this.renderAudioList();
    }

    togglePlayPause() {
        const player = document.getElementById('audioPlayer');

        if (this.state.audio.isPlaying) {
            player.pause();
            this.state.audio.isPlaying = false;
            document.getElementById('playPauseBtn').textContent = '▶';
        } else {
            player.play();
            this.state.audio.isPlaying = true;
            document.getElementById('playPauseBtn').textContent = '⏸';
        }

        this.renderAudioList();
    }

    skipAudio(seconds) {
        const player = document.getElementById('audioPlayer');
        player.currentTime = Math.max(0, Math.min(player.duration, player.currentTime + seconds));
    }

    seekAudio(value) {
        const player = document.getElementById('audioPlayer');
        player.currentTime = (value / 100) * player.duration;
    }

    setPlaybackRate(rate) {
        const player = document.getElementById('audioPlayer');
        player.playbackRate = rate;
        this.state.audio.playbackRate = rate;

        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.speed) === rate);
        });
    }

    updateAudioProgress() {
        const player = document.getElementById('audioPlayer');
        const progress = (player.currentTime / player.duration) * 100 || 0;

        document.getElementById('progressSlider').value = progress;
        document.getElementById('currentTime').textContent = this.formatTime(player.currentTime);
        document.getElementById('totalTime').textContent = this.formatTime(player.duration);
    }

    onAudioEnded() {
        this.state.audio.isPlaying = false;
        document.getElementById('playPauseBtn').textContent = '▶';
        this.renderAudioList();
    }

    deleteAudio(id) {
        if (confirm('この音声ファイルを削除しますか？')) {
            this.state.audioFiles = this.state.audioFiles.filter(f => f.id != id);
            this.setStorage(this.STORAGE_KEYS.audioFiles, this.state.audioFiles);

            if (this.state.audio.currentTrack?.id == id) {
                document.getElementById('audioPlayer').pause();
                document.getElementById('playerCard').style.display = 'none';
                this.state.audio.currentTrack = null;
                this.state.audio.isPlaying = false;
            }

            this.renderAudioList();
        }
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    // ========================================
    // 暗記カード
    // ========================================
    renderCardsPage() {
        this.populateSubjectSelects();
        this.renderCurrentCard();
    }

    renderCurrentCard() {
        const filteredCards = this.getFilteredCards();

        if (filteredCards.length === 0) {
            document.getElementById('cardSubject').textContent = '';
            document.getElementById('cardQuestion').textContent = 'カードがありません';
            document.getElementById('cardAnswer').textContent = '';
            document.getElementById('cardCurrent').textContent = '0';
            document.getElementById('cardTotal').textContent = '0';
            return;
        }

        const card = filteredCards[this.state.currentCardIndex % filteredCards.length];
        const subject = SUBJECTS.find(s => s.id === card.subjectId);

        document.getElementById('cardSubject').textContent = subject ? subject.name : '';
        document.getElementById('cardQuestion').textContent = card.question;
        document.getElementById('cardAnswer').textContent = card.answer;
        document.getElementById('cardCurrent').textContent = this.state.currentCardIndex + 1;
        document.getElementById('cardTotal').textContent = filteredCards.length;

        // カードをリセット
        const cardElement = document.getElementById('currentCard');
        cardElement.classList.remove('flipped');
        this.state.isCardFlipped = false;
    }

    getFilteredCards() {
        let cards = [...this.state.flashcards];

        const subjectFilter = document.getElementById('cardSubjectFilter')?.value;
        if (subjectFilter && subjectFilter !== 'all') {
            cards = cards.filter(c => c.subjectId === subjectFilter);
        }

        const statusFilter = document.getElementById('cardStatusFilter')?.value;
        if (statusFilter && statusFilter !== 'all') {
            cards = cards.filter(c => c.status === statusFilter);
        }

        return cards;
    }

    flipCard() {
        const cardElement = document.getElementById('currentCard');
        cardElement.classList.toggle('flipped');
        this.state.isCardFlipped = !this.state.isCardFlipped;
    }

    markCard(correct) {
        const filteredCards = this.getFilteredCards();
        if (filteredCards.length === 0) return;

        const card = filteredCards[this.state.currentCardIndex % filteredCards.length];
        const originalCard = this.state.flashcards.find(c => c.id === card.id);

        if (originalCard) {
            if (correct) {
                originalCard.correctCount++;
                if (originalCard.correctCount >= 3) {
                    originalCard.status = 'mastered';
                } else {
                    originalCard.status = 'learning';
                }
            } else {
                originalCard.correctCount = Math.max(0, originalCard.correctCount - 1);
                originalCard.status = 'learning';
            }
            originalCard.lastReviewed = new Date().toISOString();

            this.setStorage(this.STORAGE_KEYS.flashcards, this.state.flashcards);
        }

        // 次のカードへ
        this.state.currentCardIndex++;
        if (this.state.currentCardIndex >= filteredCards.length) {
            this.state.currentCardIndex = 0;
        }
        this.renderCurrentCard();
    }

    addFlashcard() {
        const subjectId = document.getElementById('newCardSubject').value;
        const question = document.getElementById('newCardQuestion').value.trim();
        const answer = document.getElementById('newCardAnswer').value.trim();

        if (!subjectId || !question || !answer) {
            alert('すべての項目を入力してください');
            return;
        }

        const card = {
            id: Date.now(),
            subjectId,
            question,
            answer,
            status: 'new',
            correctCount: 0,
            lastReviewed: null
        };

        this.state.flashcards.push(card);
        this.setStorage(this.STORAGE_KEYS.flashcards, this.state.flashcards);

        // フォームリセット
        document.getElementById('newCardQuestion').value = '';
        document.getElementById('newCardAnswer').value = '';

        this.renderCurrentCard();
        alert('カードを追加しました');
    }

    // ========================================
    // 過去問演習
    // ========================================
    initQuizState() {
        this.state.quizQuestions = this.getStorage(this.STORAGE_KEYS.quizQuestions) || [];
        this.state.quizHistory = this.getStorage(this.STORAGE_KEYS.quizHistory) || [];
        this.state.currentQuiz = {
            questions: [],
            currentIndex: 0,
            answers: [],
            isActive: false
        };
    }

    renderQuizPage() {
        this.initQuizState();
        this.populateQuizSubjectFilter();
        this.updateQuizStats();
        this.renderQuizHistory();
    }

    populateQuizSubjectFilter() {
        const select = document.getElementById('quizSubjectFilter');
        if (!select) return;

        // 問題から科目を取得
        const subjects = [...new Set(this.state.quizQuestions.map(q => q.subject))];
        select.innerHTML = '<option value="all">すべての科目</option>' +
            subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    updateQuizStats() {
        const questions = this.state.quizQuestions;
        document.getElementById('quizTotalCount').textContent = questions.length;

        // 今日復習が必要な問題数
        const today = new Date().toISOString().split('T')[0];
        const dueCount = questions.filter(q => {
            if (!q.nextDue) return true;
            return q.nextDue <= today;
        }).length;
        document.getElementById('quizTodayDue').textContent = dueCount;

        // 全体正答率
        const answered = questions.filter(q => q.timesSeen > 0);
        if (answered.length > 0) {
            const totalCorrect = answered.reduce((sum, q) => sum + (q.correctCount || 0), 0);
            const totalAnswered = answered.reduce((sum, q) => sum + (q.timesSeen || 0), 0);
            const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
            document.getElementById('quizAccuracy').textContent = `${accuracy}%`;
        } else {
            document.getElementById('quizAccuracy').textContent = '-';
        }
    }

    importCsvQuestions(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = this.parseCsvLine(lines[0]);

                const questions = [];
                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;

                    const values = this.parseCsvLine(lines[i]);
                    const row = {};
                    headers.forEach((h, idx) => {
                        row[h] = values[idx] || '';
                    });

                    // CSVフォーマットに合わせてマッピング
                    const question = {
                        id: row.ID || Date.now() + i,
                        subject: row.Subject || '不明',
                        topic: row.Topic || '',
                        question: row.Question || '',
                        correct: row.Correct || '',
                        notes: row.Notes || '',
                        timesSeen: parseInt(row.TimesSeen) || 0,
                        correctCount: parseInt(row.Streak) || 0,
                        lastAnswered: row.LastAnswered || null,
                        nextDue: row.NextDue || null,
                        intervalDays: parseInt(row.IntervalDays) || 1
                    };

                    if (question.question) {
                        questions.push(question);
                    }
                }

                this.state.quizQuestions = questions;
                this.setStorage(this.STORAGE_KEYS.quizQuestions, questions);
                this.updateQuizStats();
                this.populateQuizSubjectFilter();
                alert(`${questions.length}問をインポートしました`);
            } catch (error) {
                console.error('CSV parse error:', error);
                alert('CSVの読み込みに失敗しました');
            }
        };
        reader.readAsText(file);
    }

    parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }

    startQuiz() {
        const subjectFilter = document.getElementById('quizSubjectFilter').value;
        const mode = document.getElementById('quizMode').value;
        const countValue = document.getElementById('quizCount').value;

        let questions = [...this.state.quizQuestions];

        // 科目フィルター
        if (subjectFilter !== 'all') {
            questions = questions.filter(q => q.subject === subjectFilter);
        }

        // モードフィルター
        const today = new Date().toISOString().split('T')[0];
        switch (mode) {
            case 'due':
                questions = questions.filter(q => !q.nextDue || q.nextDue <= today);
                break;
            case 'wrong':
                questions = questions.filter(q => q.timesSeen > 0 && q.correctCount < q.timesSeen);
                break;
            case 'new':
                questions = questions.filter(q => q.timesSeen === 0);
                break;
            case 'random':
            default:
                break;
        }

        // シャッフル
        questions = questions.sort(() => Math.random() - 0.5);

        // 出題数制限
        if (countValue !== 'all') {
            const count = parseInt(countValue);
            questions = questions.slice(0, count);
        }

        if (questions.length === 0) {
            alert('条件に合う問題がありません');
            return;
        }

        this.state.currentQuiz = {
            questions,
            currentIndex: 0,
            answers: [],
            isActive: true
        };

        document.getElementById('quizCard').style.display = 'block';
        document.getElementById('quizSummary').style.display = 'none';
        this.showCurrentQuestion();
    }

    showCurrentQuestion() {
        const quiz = this.state.currentQuiz;
        const question = quiz.questions[quiz.currentIndex];

        document.getElementById('quizProgress').textContent =
            `${quiz.currentIndex + 1} / ${quiz.questions.length}`;
        document.getElementById('quizTopic').textContent = question.topic || '';
        document.getElementById('quizQuestion').textContent = question.question;

        // 選択肢と結果をリセット
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.classList.remove('selected', 'correct', 'wrong');
            btn.disabled = false;
        });
        document.getElementById('quizResult').style.display = 'none';
        document.getElementById('quizChoices').style.display = 'flex';
    }

    answerQuestion(answer) {
        const quiz = this.state.currentQuiz;
        const question = quiz.questions[quiz.currentIndex];
        const isCorrect = (answer === '正' && question.correct === '正') ||
                         (answer === '誤' && question.correct === '誤');

        quiz.answers.push({
            questionId: question.id,
            answer,
            isCorrect
        });

        // 元の問題データを更新
        const originalQ = this.state.quizQuestions.find(q => q.id === question.id);
        if (originalQ) {
            originalQ.timesSeen = (originalQ.timesSeen || 0) + 1;
            if (isCorrect) {
                originalQ.correctCount = (originalQ.correctCount || 0) + 1;
                originalQ.intervalDays = Math.min((originalQ.intervalDays || 1) * 2, 30);
            } else {
                originalQ.intervalDays = 1;
            }
            originalQ.lastAnswered = new Date().toISOString();
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + originalQ.intervalDays);
            originalQ.nextDue = nextDate.toISOString().split('T')[0];

            this.setStorage(this.STORAGE_KEYS.quizQuestions, this.state.quizQuestions);
        }

        // 選択肢の表示更新
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.id === 'choiceCorrect' && question.correct === '正') {
                btn.classList.add('correct');
            } else if (btn.id === 'choiceWrong' && question.correct === '誤') {
                btn.classList.add('correct');
            }
            if ((btn.id === 'choiceCorrect' && answer === '正') ||
                (btn.id === 'choiceWrong' && answer === '誤')) {
                btn.classList.add('selected');
                if (!isCorrect) btn.classList.add('wrong');
            }
        });

        // 結果表示
        document.getElementById('resultIndicator').className = 'result-indicator ' + (isCorrect ? 'correct' : 'wrong');
        document.getElementById('correctAnswer').textContent = `正解: ${question.correct === '正' ? '○ 正しい' : '× 誤り'}`;
        document.getElementById('quizExplanation').textContent = question.notes || '解説はありません';
        document.getElementById('quizResult').style.display = 'block';
    }

    nextQuestion() {
        const quiz = this.state.currentQuiz;
        quiz.currentIndex++;

        if (quiz.currentIndex >= quiz.questions.length) {
            this.showQuizSummary();
        } else {
            this.showCurrentQuestion();
        }
    }

    showQuizSummary() {
        const quiz = this.state.currentQuiz;
        const correct = quiz.answers.filter(a => a.isCorrect).length;
        const wrong = quiz.answers.length - correct;
        const rate = Math.round((correct / quiz.answers.length) * 100);

        document.getElementById('summaryCorrect').textContent = correct;
        document.getElementById('summaryWrong').textContent = wrong;
        document.getElementById('summaryRate').textContent = `${rate}%`;

        document.getElementById('quizCard').style.display = 'none';
        document.getElementById('quizSummary').style.display = 'block';

        // 履歴に追加
        this.state.quizHistory.unshift({
            date: new Date().toISOString(),
            total: quiz.answers.length,
            correct,
            rate
        });
        this.state.quizHistory = this.state.quizHistory.slice(0, 50);
        this.setStorage(this.STORAGE_KEYS.quizHistory, this.state.quizHistory);

        this.updateQuizStats();
        this.renderQuizHistory();
    }

    renderQuizHistory() {
        const container = document.getElementById('quizHistory');
        if (this.state.quizHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-text">まだ演習履歴がありません</div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.state.quizHistory.slice(0, 10).map(h => {
            const date = new Date(h.date);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            return `
                <div class="quiz-history-item">
                    <span class="quiz-history-date">${dateStr}</span>
                    <span>${h.correct}/${h.total}問正解</span>
                    <span class="quiz-history-result">${h.rate}%</span>
                </div>
            `;
        }).join('');
    }

    // ========================================
    // 設定・リマインダー
    // ========================================
    initSettings() {
        this.state.settings = this.getStorage(this.STORAGE_KEYS.settings) || {
            reminderEnabled: false,
            reminderTime: '20:00',
            reminderMessage: '今日の学習を始めましょう！',
            weeklyTarget: 20
        };
    }

    openSettings() {
        this.initSettings();
        const s = this.state.settings;

        document.getElementById('reminderEnabled').checked = s.reminderEnabled;
        document.getElementById('reminderTime').value = s.reminderTime;
        document.getElementById('reminderMessage').value = s.reminderMessage;
        document.getElementById('weeklyTargetHours').value = s.weeklyTarget;

        document.getElementById('settingsModal').style.display = 'flex';
    }

    closeSettings() {
        document.getElementById('settingsModal').style.display = 'none';
    }

    saveSettings() {
        this.state.settings = {
            reminderEnabled: document.getElementById('reminderEnabled').checked,
            reminderTime: document.getElementById('reminderTime').value,
            reminderMessage: document.getElementById('reminderMessage').value,
            weeklyTarget: parseInt(document.getElementById('weeklyTargetHours').value) || 20
        };
        this.setStorage(this.STORAGE_KEYS.settings, this.state.settings);

        if (this.state.settings.reminderEnabled) {
            this.scheduleReminder();
        }
    }

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            alert('このブラウザは通知をサポートしていません');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    async testNotification() {
        const hasPermission = await this.requestNotificationPermission();
        if (hasPermission) {
            new Notification('社労士合格ナビ 2026', {
                body: document.getElementById('reminderMessage').value,
                icon: 'icons/icon-192.svg'
            });
        }
    }

    scheduleReminder() {
        if (!this.state.settings.reminderEnabled) return;

        const [hours, minutes] = this.state.settings.reminderTime.split(':').map(Number);
        const now = new Date();
        const scheduled = new Date();
        scheduled.setHours(hours, minutes, 0, 0);

        if (scheduled <= now) {
            scheduled.setDate(scheduled.getDate() + 1);
        }

        const delay = scheduled - now;

        setTimeout(() => {
            this.showReminder();
            this.scheduleReminder(); // 次の日の通知をスケジュール
        }, delay);
    }

    async showReminder() {
        const hasPermission = await this.requestNotificationPermission();
        if (hasPermission) {
            new Notification('社労士合格ナビ 2026', {
                body: this.state.settings.reminderMessage,
                icon: 'icons/icon-192.svg'
            });
        }
    }

    exportAllData() {
        const data = {
            studyRecords: this.state.studyRecords,
            subjectProgress: this.state.subjectProgress,
            flashcards: this.state.flashcards,
            quizQuestions: this.state.quizQuestions,
            quizHistory: this.state.quizHistory,
            settings: this.state.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sharoushi-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importAllData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.studyRecords) {
                    this.state.studyRecords = data.studyRecords;
                    this.setStorage(this.STORAGE_KEYS.studyRecords, data.studyRecords);
                }
                if (data.subjectProgress) {
                    this.state.subjectProgress = data.subjectProgress;
                    this.setStorage(this.STORAGE_KEYS.subjectProgress, data.subjectProgress);
                }
                if (data.flashcards) {
                    this.state.flashcards = data.flashcards;
                    this.setStorage(this.STORAGE_KEYS.flashcards, data.flashcards);
                }
                if (data.quizQuestions) {
                    this.state.quizQuestions = data.quizQuestions;
                    this.setStorage(this.STORAGE_KEYS.quizQuestions, data.quizQuestions);
                }
                if (data.quizHistory) {
                    this.state.quizHistory = data.quizHistory;
                    this.setStorage(this.STORAGE_KEYS.quizHistory, data.quizHistory);
                }
                if (data.settings) {
                    this.state.settings = data.settings;
                    this.setStorage(this.STORAGE_KEYS.settings, data.settings);
                }

                alert('データをインポートしました');
                location.reload();
            } catch (error) {
                console.error('Import error:', error);
                alert('データのインポートに失敗しました');
            }
        };
        reader.readAsText(file);
    }

    resetAllData() {
        if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
            Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            alert('データをリセットしました');
            location.reload();
        }
    }
}

// 注意: アプリはinitAuth()から起動されます
