import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, signInAnonymously } from 'firebase/auth';
import { Database, getDatabase } from 'firebase/database';

export interface FirebasePublicConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  appId: string;
  messagingSenderId?: string;
  storageBucket?: string;
}

let configPromise: Promise<FirebasePublicConfig> | undefined;
let app: FirebaseApp | undefined;
let database: Database | undefined;
let auth: Auth | undefined;

const configUrl = `${import.meta.env.BASE_URL}firebase-config.json`;

export const loadFirebaseConfig = (): Promise<FirebasePublicConfig> => {
  configPromise ??= fetch(configUrl, { cache: 'no-store' }).then(async (response) => {
    if (!response.ok) throw new Error('تعذر تحميل إعداد الاتصال بالخدمة.');
    const config = await response.json() as FirebasePublicConfig;
    if (!config.apiKey || !config.databaseURL || !config.projectId || !config.appId ||
      [config.apiKey, config.databaseURL, config.projectId, config.appId].some((value) => value.includes('PASTE_'))) {
      throw new Error('لم يتم إعداد Firebase لهذا التطبيق بعد.');
    }
    return config;
  });
  return configPromise;
};

export const getFirebaseDatabase = async (): Promise<Database> => {
  if (database) return database;
  const config = await loadFirebaseConfig();
  app = getApps().length ? getApp() : initializeApp(config);
  database = getDatabase(app, config.databaseURL);
  return database;
};

export const ensureAnonymousUser = async (): Promise<Auth> => {
  if (!auth) {
    const config = await loadFirebaseConfig();
    app = getApps().length ? getApp() : initializeApp(config);
    auth = getAuth(app);
  }
  if (!auth.currentUser) await signInAnonymously(auth);
  return auth;
};
