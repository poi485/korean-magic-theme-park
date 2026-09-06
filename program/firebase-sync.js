// firebase-sync.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, increment, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 선생님의 기존 파이어베이스 접속 정보
const firebaseConfig = {
    apiKey: "AIzaSyDakimsR5994YA2uQnjPEKv8He6hHDdhNs",
    authDomain: "korean-magic-theme-park.firebaseapp.com",
    projectId: "korean-magic-theme-park",
    storageBucket: "korean-magic-theme-park.firebasestorage.app",
    messagingSenderId: "916952311588",
    appId: "1:916952311588:web:7715907c441becb08335b1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. 보석 및 게임 성공 횟수를 클라우드에 저장하는 함수
export async function saveRewardToCloud(studentName, earnedCoins, gameId) {
    if (!studentName) return; // 로그인 안 했으면 중지
    
    const studentRef = doc(db, "students", studentName);
    try {
        await updateDoc(studentRef, {
            coins: increment(earnedCoins),
            [`clearedGames.${gameId}`]: increment(1)
        });
    } catch (error) {
        // 학생 데이터가 처음 생성되는 경우
        await setDoc(studentRef, {
            coins: earnedCoins,
            clearedGames: { [gameId]: 1 },
            weakWords: []
        }, { merge: true });
    }
}

// 2. 취약 낱말(오답 노트)을 클라우드에 누적하는 함수
export async function logWeakWordToCloud(studentName, wordObj) {
    if (!studentName) return;
    
    const studentRef = doc(db, "students", studentName);
    try {
        await updateDoc(studentRef, {
            weakWords: arrayUnion(wordObj) // 중복 없이 배열에 추가
        });
    } catch (error) {
        await setDoc(studentRef, {
            weakWords: [wordObj]
        }, { merge: true });
    }
}

// 3. 학생의 현재 학습 데이터를 불러오는 함수 (대시보드, 꾸미기 용도)
export async function getStudentDataFromCloud(studentName) {
    if (!studentName) return null;
    
    const studentRef = doc(db, "students", studentName);
    const docSnap = await getDoc(studentRef);
    
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return { coins: 0, clearedGames: {}, weakWords: [] };
    }
}