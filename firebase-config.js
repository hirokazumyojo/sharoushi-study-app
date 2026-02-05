// ========================================
// Firebase 設定・同期管理
// ========================================

// Firebase設定（ユーザーがFirebaseコンソールで取得した値を設定）
const FIREBASE_CONFIG = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

// ========================================
// Firebase同期マネージャー
// ========================================
class FirebaseSyncManager {
    constructor() {
        this.db = null;
        this.auth = null;
        this.user = null;
        this.isInitialized = false;
        this.syncEnabled = false;
        this.lastSyncTime = null;
        this.syncStatus = 'disconnected'; // disconnected, syncing, synced, error
        this.listeners = [];

        // 同期対象のデータキー
        this.syncKeys = [
            'sharoushi_study_records',
            'sharoushi_flashcards',
            'sharoushi_quiz_questions',
            'sharoushi_subject_progress',
            'sharoushi_best_streak',
            'sharoushi_settings'
        ];
    }

    // Firebase初期化
    async initialize() {
        // 設定が空の場合はスキップ
        if (!FIREBASE_CONFIG.apiKey) {
            console.log('Firebase config not set. Cloud sync disabled.');
            return false;
        }

        try {
            // Firebase SDKが読み込まれているか確認
            if (typeof firebase === 'undefined') {
                console.error('Firebase SDK not loaded');
                return false;
            }

            // 既に初期化されているか確認
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }

            this.auth = firebase.auth();
            this.db = firebase.firestore();

            // オフライン永続化を有効化
            await this.db.enablePersistence({ synchronizeTabs: true }).catch(err => {
                if (err.code === 'failed-precondition') {
                    console.warn('Firestore persistence failed: Multiple tabs open');
                } else if (err.code === 'unimplemented') {
                    console.warn('Firestore persistence not available');
                }
            });

            // 認証状態の監視
            this.auth.onAuthStateChanged(user => {
                this.user = user;
                if (user) {
                    this.syncEnabled = true;
                    this.setupRealtimeSync();
                    this.notifyListeners('auth', { user });
                } else {
                    this.syncEnabled = false;
                    this.notifyListeners('auth', { user: null });
                }
            });

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
            return false;
        }
    }

    // Googleでログイン
    async signInWithGoogle() {
        if (!this.auth) {
            throw new Error('Firebase not initialized');
        }

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            return result.user;
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    }

    // ログアウト
    async signOut() {
        if (!this.auth) return;

        try {
            await this.auth.signOut();
            this.user = null;
            this.syncEnabled = false;
            this.syncStatus = 'disconnected';
            this.notifyListeners('signout', {});
        } catch (error) {
            console.error('Sign-out error:', error);
            throw error;
        }
    }

    // リアルタイム同期のセットアップ
    setupRealtimeSync() {
        if (!this.user || !this.db) return;

        const userDoc = this.db.collection('users').doc(this.user.uid);

        // ユーザーデータの変更を監視
        userDoc.onSnapshot(doc => {
            if (doc.exists) {
                const cloudData = doc.data();
                this.mergeCloudData(cloudData);
                this.lastSyncTime = new Date();
                this.syncStatus = 'synced';
                this.notifyListeners('sync', { status: 'synced', data: cloudData });
            }
        }, error => {
            console.error('Realtime sync error:', error);
            this.syncStatus = 'error';
            this.notifyListeners('sync', { status: 'error', error });
        });
    }

    // クラウドからローカルにデータをマージ
    mergeCloudData(cloudData) {
        if (!cloudData || !cloudData.syncData) return;

        const syncData = cloudData.syncData;
        const cloudTimestamp = cloudData.lastModified?.toMillis() || 0;

        this.syncKeys.forEach(key => {
            if (syncData[key]) {
                const localData = localStorage.getItem(key);
                const localTimestamp = parseInt(localStorage.getItem(`${key}_timestamp`) || '0');

                // クラウドの方が新しい場合は上書き
                if (cloudTimestamp > localTimestamp) {
                    localStorage.setItem(key, JSON.stringify(syncData[key]));
                    localStorage.setItem(`${key}_timestamp`, cloudTimestamp.toString());
                }
            }
        });
    }

    // ローカルデータをクラウドに同期
    async syncToCloud() {
        if (!this.user || !this.db) {
            console.log('Cannot sync: not logged in');
            return false;
        }

        this.syncStatus = 'syncing';
        this.notifyListeners('sync', { status: 'syncing' });

        try {
            const syncData = {};
            const now = Date.now();

            this.syncKeys.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    try {
                        syncData[key] = JSON.parse(data);
                        localStorage.setItem(`${key}_timestamp`, now.toString());
                    } catch (e) {
                        console.warn(`Failed to parse ${key}:`, e);
                    }
                }
            });

            const userDoc = this.db.collection('users').doc(this.user.uid);
            await userDoc.set({
                syncData,
                lastModified: firebase.firestore.FieldValue.serverTimestamp(),
                email: this.user.email,
                displayName: this.user.displayName,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            this.lastSyncTime = new Date();
            this.syncStatus = 'synced';
            this.notifyListeners('sync', { status: 'synced' });
            return true;
        } catch (error) {
            console.error('Sync to cloud error:', error);
            this.syncStatus = 'error';
            this.notifyListeners('sync', { status: 'error', error });
            return false;
        }
    }

    // クラウドからデータを取得（手動同期用）
    async syncFromCloud() {
        if (!this.user || !this.db) {
            console.log('Cannot sync: not logged in');
            return false;
        }

        this.syncStatus = 'syncing';
        this.notifyListeners('sync', { status: 'syncing' });

        try {
            const userDoc = await this.db.collection('users').doc(this.user.uid).get();

            if (userDoc.exists) {
                this.mergeCloudData(userDoc.data());
                this.lastSyncTime = new Date();
                this.syncStatus = 'synced';
                this.notifyListeners('sync', { status: 'synced' });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Sync from cloud error:', error);
            this.syncStatus = 'error';
            this.notifyListeners('sync', { status: 'error', error });
            return false;
        }
    }

    // イベントリスナー登録
    addListener(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    // リスナーに通知
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (e) {
                console.error('Listener error:', e);
            }
        });
    }

    // 現在のユーザー情報を取得
    getCurrentUser() {
        return this.user;
    }

    // 同期状態を取得
    getSyncStatus() {
        return {
            isLoggedIn: !!this.user,
            syncEnabled: this.syncEnabled,
            status: this.syncStatus,
            lastSyncTime: this.lastSyncTime,
            user: this.user ? {
                email: this.user.email,
                displayName: this.user.displayName,
                photoURL: this.user.photoURL
            } : null
        };
    }
}

// グローバルインスタンス
const firebaseSync = new FirebaseSyncManager();
