import React, { useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs,
  query, orderBy, serverTimestamp
} from "firebase/firestore";

/*
  DSA QUEST — single-file React application
  ------------------------------------------------------------
  Before running:
  1) Create a Firebase project; enable Authentication > Google and Email/Password.
  2) Create a Cloud Firestore database.
  3) Paste your Firebase web config into firebaseConfig below.
  4) Create the admin Auth user in Firebase Console:
       email: admin@dsa.local
       password: set a strong password (do NOT use the demo password in production)
     Then create /users/{ADMIN_UID} in Firestore with:
       { role: "admin", firstName: "DSA", lastName: "Administrator",
         section: "ADMIN", avatar: "🛡️", profileComplete: true }
     Use the UID shown in Firebase Authentication.
  5) Apply the Firestore rules supplied in the setup instructions.
  6) npm install firebase; npm run dev

  Security note: the admin password is never embedded in this file. The admin
  signs in through Firebase Email/Password. Firestore rules—not this UI—must
  enforce admin access. Never expose a Firebase Admin SDK service-account key.
*/

const firebaseConfig = {
  apiKey: "AIzaSyBuMF5cd4Z6Zbu-_P5JyzTg5UatkkiV7kE",
  authDomain: "dsa-quest-80f72.firebaseapp.com",
  projectId: "dsa-quest-80f72",
  storageBucket: "dsa-quest-80f72.firebasestorage.app",
  messagingSenderId: "356642350418",
  appId: "1:356642350418:web:15b2d482557263364c868b"
};

const firebaseReady = Object.values(firebaseConfig).every(
  (v) => v && !v.startsWith("PASTE_")
);

const app = firebaseReady ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

const AVATARS = ["🧑‍💻", "👩‍💻", "🧙", "🦊", "🐼", "🐯", "🦉", "🐸", "🚀", "🤖"];
const SECTIONS = ["IT201A", "IT201B", "IT201C"];

const TOPICS = [
  {
    id: "arrays", title: "Arrays", icon: "🧱", color: "#38bdf8",
    intro: "An array stores a fixed-size sequence of elements of the same type. Elements are accessed by zero-based index.",
    java: "int[] scores = {90, 85, 92};\nSystem.out.println(scores[0]); // 90\nscores[1] = 88;",
    facts: ["Indexing starts at 0.", "Access by index is O(1).", "A Java array has a fixed length after creation."],
    questions: [
      { q: "What is the index of the first element in a Java array?", a: ["0", "1", "-1", "It has no index"], correct: 0, why: "Java arrays use zero-based indexing." },
      { q: "What is the time complexity of accessing arr[i]?", a: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correct: 2, why: "The address is computed directly from the index." },
      { q: "Which property gives the number of elements in an array?", a: ["size()", "length", "count()", "capacity"], correct: 1, why: "Java arrays use the length field, not a method." }
    ]
  },
  {
    id: "arraylist", title: "ArrayList", icon: "📚", color: "#a78bfa",
    intro: "ArrayList is a resizable-array implementation of List. It grows as elements are added.",
    java: "import java.util.ArrayList;\nArrayList<String> names = new ArrayList<>();\nnames.add(\"Ana\");\nnames.add(\"Ben\");\nnames.remove(0);",
    facts: ["add at the end is amortized O(1).", "get(index) is O(1).", "Insertion/removal in the middle is O(n) due to shifting."],
    questions: [
      { q: "Which method adds an item to an ArrayList?", a: ["push()", "add()", "enqueue()", "insertEnd()"], correct: 1, why: "ArrayList uses add() to append or insert elements." },
      { q: "Which statement is true?", a: ["ArrayList has fixed size", "ArrayList cannot store objects", "ArrayList can grow dynamically", "ArrayList is a primitive type"], correct: 2, why: "ArrayList expands its backing array when needed." },
      { q: "What is the usual time complexity of get(index)?", a: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correct: 0, why: "ArrayList supports direct indexed access." }
    ]
  },
  {
    id: "linkedlist", title: "Linked Lists", icon: "🔗", color: "#34d399",
    intro: "A linked list is made of nodes. Each node stores data and a reference to the next node (and sometimes the previous node).",
    java: "class Node {\n  int data;\n  Node next;\n  Node(int data) { this.data = data; }\n}\nNode first = new Node(10);\nfirst.next = new Node(20);",
    facts: ["Singly linked nodes point to the next node.", "Accessing the k-th node is O(n).", "Insertion at the head is O(1)."],
    questions: [
      { q: "What does a node in a singly linked list contain?", a: ["Only an index", "Data and next reference", "A hash code only", "Two arrays"], correct: 1, why: "A node stores its value and a link to the next node." },
      { q: "What is the complexity of accessing the 8th node from the head?", a: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correct: 2, why: "You must traverse nodes sequentially." },
      { q: "Insertion at the head of a linked list is typically:", a: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], correct: 0, why: "Only the head reference and new node link need updating." }
    ]
  },
  {
    id: "stacks", title: "Stacks", icon: "🥞", color: "#fb923c",
    intro: "A stack follows LIFO: Last In, First Out. The most recently added element is removed first.",
    java: "import java.util.ArrayDeque;\nimport java.util.Deque;\nDeque<Integer> stack = new ArrayDeque<>();\nstack.push(10);\nstack.push(20);\nint top = stack.pop(); // 20",
    facts: ["push() adds to the top.", "pop() removes the top.", "peek() reads the top without removing it."],
    questions: [
      { q: "What principle does a stack follow?", a: ["FIFO", "LIFO", "Random access", "Priority first"], correct: 1, why: "Last In, First Out." },
      { q: "Which operation removes the top item?", a: ["peek()", "push()", "pop()", "offer()"], correct: 2, why: "pop() removes and returns the top element." },
      { q: "Which real-world example best models a stack?", a: ["People in a checkout line", "Undo history", "Printer queue", "Road map"], correct: 1, why: "The latest action is commonly undone first." }
    ]
  },
  {
    id: "queues", title: "Queues", icon: "🚶", color: "#f472b6",
    intro: "A queue follows FIFO: First In, First Out. The first item added is the first one removed.",
    java: "import java.util.ArrayDeque;\nimport java.util.Queue;\nQueue<String> line = new ArrayDeque<>();\nline.offer(\"Mia\");\nline.offer(\"Leo\");\nString next = line.poll(); // Mia",
    facts: ["offer() adds at the rear.", "poll() removes from the front.", "peek() inspects the front item."],
    questions: [
      { q: "What principle does a queue follow?", a: ["LIFO", "FIFO", "FILO", "Sorted order"], correct: 1, why: "First In, First Out." },
      { q: "Which operation removes the front element?", a: ["poll()", "push()", "peek()", "addFirst()"], correct: 0, why: "poll() retrieves and removes the queue head." },
      { q: "Which scenario is a queue?", a: ["Browser back stack", "Function call stack", "Students lining up", "Recursive call chain"], correct: 2, why: "The person who arrives first is served first." }
    ]
  },
  {
    id: "recursion", title: "Recursion", icon: "🪞", color: "#facc15",
    intro: "Recursion occurs when a method calls itself. A base case stops the calls; each recursive step should move toward it.",
    java: "static int factorial(int n) {\n  if (n <= 1) return 1; // base case\n  return n * factorial(n - 1);\n}\nSystem.out.println(factorial(5)); // 120",
    facts: ["Every correct recursive solution needs a base case.", "Calls use the call stack.", "Missing or unreachable base cases can cause StackOverflowError."],
    questions: [
      { q: "What prevents infinite recursive calls?", a: ["Loop counter", "Base case", "Array index", "Constructor"], correct: 1, why: "The base case returns without making another recursive call." },
      { q: "What is factorial(4)?", a: ["10", "16", "24", " служ"], correct: 2, why: "4 × 3 × 2 × 1 = 24." },
      { q: "Recursive method calls are tracked using:", a: ["Queue", "Call stack", "Hash table", "Graph edge"], correct: 1, why: "Each active call has a stack frame." }
    ]
  },
  {
    id: "trees", title: "Trees", icon: "🌳", color: "#4ade80",
    intro: "A tree is a hierarchical structure of nodes connected by edges. A binary tree has at most two children per node.",
    java: "class TreeNode {\n  int value;\n  TreeNode left, right;\n  TreeNode(int value) { this.value = value; }\n}\nTreeNode root = new TreeNode(8);\nroot.left = new TreeNode(4);\nroot.right = new TreeNode(12);",
    facts: ["The top node is the root.", "A leaf has no children.", "A binary search tree orders smaller values left and larger values right."],
    questions: [
      { q: "What is the topmost node called?", a: ["Leaf", "Root", "Edge", "Sibling"], correct: 1, why: "The root is the entry point of a tree." },
      { q: "A leaf node has:", a: ["No children", "Exactly two parents", "No data", "Three roots"], correct: 0, why: "A leaf is a node without children." },
      { q: "In a BST, smaller values are commonly placed in the:", a: ["Right subtree", "Left subtree", "Root only", "Parent queue"], correct: 1, why: "BST ordering places smaller keys in the left subtree." }
    ]
  },
  {
    id: "graphs", title: "Graphs", icon: "🕸️", color: "#60a5fa",
    intro: "A graph consists of vertices (nodes) and edges (connections). Graphs can be directed or undirected, weighted or unweighted.",
    java: "import java.util.*;\nMap<Integer, List<Integer>> graph = new HashMap<>();\ngraph.put(1, new ArrayList<>());\ngraph.get(1).add(2); // edge 1 -> 2",
    facts: ["Vertices represent entities.", "Edges represent relationships.", "BFS explores level by level; DFS explores deeply before backtracking."],
    questions: [
      { q: "What represents a connection between vertices?", a: ["Edge", "Root", "Index", "Stack frame"], correct: 0, why: "An edge connects two vertices." },
      { q: "Which traversal commonly uses a queue?", a: ["DFS", "BFS", "Binary search", "Inorder"], correct: 1, why: "BFS uses a queue to visit vertices level by level." },
      { q: "A road network is naturally modeled as a:", a: ["Stack", "Array only", "Graph", "Recursive variable"], correct: 2, why: "Intersections/places are vertices and roads are edges." }
    ]
  },
  {
    id: "searching", title: "Searching Algorithms", icon: "🔎", color: "#c084fc",
    intro: "Searching finds a target in a collection. Linear search checks items one by one; binary search repeatedly halves a sorted search range.",
    java: "static int binarySearch(int[] a, int target) {\n  int low = 0, high = a.length - 1;\n  while (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (a[mid] == target) return mid;\n    if (a[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}",
    facts: ["Linear search is O(n).", "Binary search is O(log n) and requires sorted data.", "A not-found result is often represented by -1."],
    questions: [
      { q: "Which condition is required for binary search?", a: ["The data must be sorted", "The data must be a linked list", "The array must have 2 items", "Values must be negative"], correct: 0, why: "Binary search relies on sorted order to discard half the range." },
      { q: "What is linear search's worst-case time complexity?", a: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correct: 2, why: "It may inspect every element." },
      { q: "What is binary search's time complexity?", a: ["O(n)", "O(log n)", "O(n²)", "O(2ⁿ)"], correct: 1, why: "The remaining search interval is halved each iteration." }
    ]
  }
];

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap');
:root{font-family:Manrope,system-ui,sans-serif;color:#eaf0ff;background:#080d1b;font-synthesis:none}
*{box-sizing:border-box}body{margin:0;min-width:320px;background:radial-gradient(ellipse at 15% 0%,#18274a 0,transparent 42%),#080d1b}
button,input,select{font:inherit}button{cursor:pointer}.app{min-height:100vh}.shell{max-width:1200px;margin:auto;padding:24px}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:26px}.brand{display:flex;align-items:center;gap:12px;font-weight:800;font-size:20px;letter-spacing:-.7px}.brandmark{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#2563eb);font-size:22px;box-shadow:0 8px 28px #4f46e566}
.panel{background:#111a2d;border:1px solid #263653;border-radius:22px;padding:22px;box-shadow:0 18px 50px #0003}.muted{color:#9aabc8}.small{font-size:12px}.eyebrow{color:#8b9dbc;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}
h1,h2,h3,p{margin-top:0}h1{font-size:clamp(30px,5vw,52px);line-height:1.04;letter-spacing:-2px;margin:12px 0}h2{letter-spacing:-.8px}p{line-height:1.65}.btn{border:0;border-radius:12px;padding:12px 17px;font-weight:800;color:white;background:linear-gradient(135deg,#7c3aed,#2563eb);transition:.2s}.btn:hover{filter:brightness(1.12);transform:translateY(-1px)}.btn:disabled{opacity:.45;cursor:not-allowed;transform:none}.btn.secondary{background:#1c2942;border:1px solid #344665;color:#dce7ff}.btn.ghost{background:transparent;border:1px solid #344665;color:#bdcbe2}.btn.danger{background:#9f3347}.btn.full{width:100%}
.input,.select{width:100%;background:#0b1324;border:1px solid #344665;color:#edf3ff;border-radius:11px;padding:12px 13px;outline:none}.input:focus,.select:focus{border-color:#8b5cf6}.field{display:grid;gap:7px;margin:13px 0}.field label{font-size:12px;color:#aebbd1;font-weight:800}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}.topic{border:1px solid #2b3b58;background:linear-gradient(145deg,#17233a,#10192a);border-radius:18px;padding:18px;text-align:left;color:#eff5ff;min-height:172px;transition:.2s}.topic:hover{transform:translateY(-3px);border-color:#8b5cf6}.topic .ico{font-size:28px}.topic h3{margin:12px 0 5px}.topic p{font-size:12px;color:#9aabc8;margin:0}.pill{display:inline-flex;align-items:center;gap:6px;border-radius:99px;background:#243653;color:#c7d5ee;padding:6px 10px;font-size:11px;font-weight:800}
.hero{display:grid;grid-template-columns:1.5fr 1fr;gap:18px;align-items:stretch}.heroMain{padding:34px;background:linear-gradient(130deg,#1b2b4c,#151e35);border:1px solid #304365;border-radius:24px}.heroStats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.stat{background:#111a2d;border:1px solid #293a58;border-radius:17px;padding:18px}.stat strong{display:block;font-size:28px;margin-top:6px}.progress{height:8px;background:#263550;border-radius:99px;overflow:hidden}.progress>span{display:block;height:100%;background:linear-gradient(90deg,#8b5cf6,#38bdf8);border-radius:99px}
.two{display:grid;grid-template-columns:1.2fr .8fr;gap:18px}.code{white-space:pre-wrap;overflow:auto;background:#080f1e;border:1px solid #263653;border-radius:14px;padding:17px;color:#b8e3ff;font:13px/1.7 'DM Mono',monospace}.question{padding:18px;border:1px solid #2b3b58;border-radius:16px;background:#121e33;margin:12px 0}.answers{display:grid;gap:9px;margin-top:14px}.answer{text-align:left;border:1px solid #344665;background:#0d1729;color:#dce7ff;padding:12px;border-radius:11px}.answer.selected{border-color:#8b5cf6;background:#30235a}.answer.correct{border-color:#22c55e;background:#123b32}.answer.wrong{border-color:#ef4444;background:#421f2a}
.tableWrap{overflow:auto}table{width:100%;border-collapse:collapse;min-width:650px}th,td{text-align:left;padding:12px;border-bottom:1px solid #293a58;font-size:13px}th{color:#9aabc8;font-size:11px;text-transform:uppercase;letter-spacing:1px}
.authWrap{min-height:100vh;display:grid;place-items:center;padding:20px}.authCard{width:min(480px,100%);padding:28px}.avatarRow{display:flex;flex-wrap:wrap;gap:8px}.avatar{width:43px;height:43px;border-radius:12px;border:1px solid #344665;background:#0b1324;font-size:22px}.avatar.active{border:2px solid #a78bfa;background:#30235a}
.notice{padding:12px 14px;background:#342a18;border:1px solid #6b5427;color:#f8dca1;border-radius:12px;font-size:13px}.success{background:#10382f;border-color:#1e725c;color:#a7f3d0}.row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.between{display:flex;align-items:center;justify-content:space-between;gap:12px}.spacer{height:18px}.hideMobile{display:block}
@media(max-width:800px){.shell{padding:16px}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hero,.two{grid-template-columns:1fr}.heroMain{padding:24px}.hideMobile{display:none}}
@media(max-width:500px){.grid{grid-template-columns:1fr}.topbar{align-items:flex-start}.panel{padding:17px}.heroStats{grid-template-columns:repeat(2,1fr)}.brand{font-size:17px}}
`;

function fmtDate(value) {
  if (!value) return "Not yet recorded";
  const d = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(d.getTime()) ? "Not yet recorded" : d.toLocaleString();
}

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState("home");
  const [activeTopic, setActiveTopic] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminRows, setAdminRows] = useState([]);
  const [filterSection, setFilterSection] = useState("ALL");
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", section: "IT201A", avatar: AVATARS[0] });

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, async (current) => {
      setUser(current);
      setProfile(null);
      if (!current) { setScreen("home"); return; }
      try {
        const snap = await getDoc(doc(db, "users", current.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setProfileForm({
            firstName: data.firstName || "", lastName: data.lastName || "",
            section: data.section || "IT201A", avatar: data.avatar || AVATARS[0]
          });
          setScreen(data.role === "admin" ? "admin" : data.profileComplete ? "home" : "profile");
        } else {
          setScreen("profile");
          setProfileForm((p) => ({ ...p, firstName: current.displayName?.split(" ")[0] || "", lastName: current.displayName?.split(" ").slice(1).join(" ") || "" }));
        }
      } catch (e) { setNotice(e.message); }
    });
  }, []);

  const isAdmin = profile?.role === "admin";
  const progressData = profile?.progress || {};
  const completedCount = TOPICS.filter(t => progressData[t.id]?.completed).length;
  const totalPoints = TOPICS.reduce((sum, t) => sum + (progressData[t.id]?.points || 0), 0);
  const overallPercent = Math.round(completedCount / TOPICS.length * 100);

  async function googleLogin() {
    if (!auth) return setNotice("Add your Firebase web configuration in this file first.");
    setBusy(true); setNotice("");
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (e) { setNotice(e.message); }
    finally { setBusy(false); }
  }

  async function adminLogin(e) {
    e.preventDefault();
    if (!auth) return setNotice("Add your Firebase web configuration in this file first.");
    const fd = new FormData(e.currentTarget);
    setBusy(true); setNotice("");
    try { await signInWithEmailAndPassword(auth, "admin@dsa.local", String(fd.get("password") || "")); }
    catch (err) { setNotice("Admin sign-in failed. Check the Firebase admin account and password."); }
    finally { setBusy(false); }
  }

  async function saveProfile(e) {
    e.preventDefault();
    if (!user || !db) return;
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) return setNotice("Please enter both first name and last name.");
    setBusy(true); setNotice("");
    try {
      const old = await getDoc(doc(db, "users", user.uid));
      const existing = old.exists() ? old.data() : {};
      const next = {
        ...existing, uid: user.uid, email: user.email || "", firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(), section: profileForm.section, avatar: profileForm.avatar,
        role: existing.role || "student", profileComplete: true,
        createdAt: existing.createdAt || serverTimestamp(), updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, "users", user.uid), next, { merge: true });
      setProfile({ ...next, createdAt: existing.createdAt || new Date() });
      setScreen("home");
    } catch (err) { setNotice(err.message); }
    finally { setBusy(false); }
  }

  function openTopic(topic) {
    setActiveTopic(topic); setAnswers({}); setSubmitted(false); setScreen("lesson");
  }

  async function submitTopic() {
    if (!user || !db || !activeTopic) return;
    const score = activeTopic.questions.reduce((n, q, i) => n + (answers[i] === q.correct ? 1 : 0), 0);
    const points = score * 10 + (score === activeTopic.questions.length ? 10 : 0);
    const previous = progressData[activeTopic.id] || {};
    const progress = {
      ...progressData,
      [activeTopic.id]: {
        completed: true, score, totalQuestions: activeTopic.questions.length,
        points: Math.max(previous.points || 0, points),
        attempts: (previous.attempts || 0) + 1,
        lastAttemptAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }
    };
    setBusy(true); setNotice("");
    try {
      await updateDoc(doc(db, "users", user.uid), { progress, updatedAt: serverTimestamp() });
      setProfile(p => ({ ...p, progress }));
      setSubmitted(true);
    } catch (e) { setNotice("Could not save progress: " + e.message); }
    finally { setBusy(false); }
  }

  async function loadAdminRows() {
    if (!db || !isAdmin) return;
    setBusy(true);
    try {
      const snap = await getDocs(query(collection(db, "users"), orderBy("lastName")));
      setAdminRows(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(x => x.role !== "admin"));
    } catch (e) { setNotice("Unable to load student records. Check Firestore rules: " + e.message); }
    finally { setBusy(false); }
  }

  useEffect(() => { if (screen === "admin" && isAdmin) loadAdminRows(); }, [screen, isAdmin]);

  async function logout() {
    if (auth) await signOut(auth);
    setProfile(null); setUser(null); setScreen("home");
  }

  const visibleRows = useMemo(() => adminRows.filter(r => filterSection === "ALL" || r.section === filterSection), [adminRows, filterSection]);

  if (!firebaseReady) {
    return <div className="authWrap"><style>{styles}</style><div className="panel authCard">
      <div className="brand"><span className="brandmark">⚔️</span> DSA QUEST</div>
      <h1>Connect your Firebase project</h1>
      <p className="muted">This app is a complete React front end, but Google registration and cloud progress saving need your Firebase project settings.</p>
      <div className="notice">Open this file and replace all PASTE_YOUR_… values in <code>firebaseConfig</code>. Then restart the development server.</div>
      <p className="small muted" style={{marginTop:16}}>See the setup guide provided with this file for Authentication, Firestore and security rules.</p>
    </div></div>;
  }

  if (!user) return <div className="authWrap"><style>{styles}</style><div className="panel authCard">
    <div className="brand"><span className="brandmark">⚔️</span> DSA QUEST</div>
    <p className="eyebrow" style={{marginTop:25}}>Java • Data Structures • Algorithms</p>
    <h1>Level up your<br/>DSA skills.</h1>
    <p className="muted">Learn each concept, answer challenges, earn XP and track your journey through the Java DSA world.</p>
    <button className="btn full" onClick={googleLogin} disabled={busy}>🌐 Continue with Google</button>
    <div className="spacer"/>
    <details>
      <summary className="muted" style={{cursor:"pointer",fontSize:13}}>Administrator sign in</summary>
      <form onSubmit={adminLogin}>
        <div className="field"><label>ADMIN PASSWORD</label><input className="input" name="password" type="password" placeholder="Firebase admin password" required /></div>
        <button className="btn secondary full" disabled={busy}>Sign in as administrator</button>
        <p className="small muted">Admin username: <b>admin</b> (account email is admin@dsa.local)</p>
      </form>
    </details>
    {notice && <p className="notice" style={{marginTop:14}}>{notice}</p>}
    <p className="small muted" style={{marginTop:20}}>Your progress is saved to your authenticated account.</p>
  </div></div>;

  if (screen === "profile" && !isAdmin) return <div className="authWrap"><style>{styles}</style><form className="panel authCard" onSubmit={saveProfile}>
    <div className="brand"><span className="brandmark">🧑‍🎓</span> Student profile</div>
    <h2 style={{marginTop:24}}>Set up your player card</h2>
    <p className="muted small">Complete your profile before entering the DSA learning arena.</p>
    <div className="field"><label>FIRST NAME</label><input className="input" value={profileForm.firstName} onChange={e=>setProfileForm({...profileForm,firstName:e.target.value})} required /></div>
    <div className="field"><label>LAST NAME</label><input className="input" value={profileForm.lastName} onChange={e=>setProfileForm({...profileForm,lastName:e.target.value})} required /></div>
    <div className="field"><label>SECTION</label><select className="select" value={profileForm.section} onChange={e=>setProfileForm({...profileForm,section:e.target.value})}>{SECTIONS.map(s=><option key={s}>{s}</option>)}</select></div>
    <div className="field"><label>CHOOSE AVATAR</label><div className="avatarRow">{AVATARS.map(a=><button type="button" key={a} className={"avatar "+(profileForm.avatar===a?"active":"")} onClick={()=>setProfileForm({...profileForm,avatar:a})}>{a}</button>)}</div></div>
    <button className="btn full" disabled={busy}>Save profile and start quest →</button>
    {notice && <p className="notice" style={{marginTop:12}}>{notice}</p>}
  </form></div>;

  if (isAdmin && screen === "admin") return <div className="app"><style>{styles}</style><div className="shell">
    <header className="topbar"><div className="brand"><span className="brandmark">🛡️</span> DSA QUEST <span className="pill">ADMIN</span></div><button className="btn ghost" onClick={logout}>Sign out</button></header>
    <div className="between"><div><p className="eyebrow">Control center</p><h1 style={{fontSize:38}}>Student progress</h1><p className="muted">Monitor profiles, completed topics, quiz scores and recorded timestamps.</p></div><button className="btn secondary" onClick={loadAdminRows}>↻ Refresh data</button></div>
    <div className="heroStats" style={{margin:"20px 0"}}><div className="stat"><span className="muted small">REGISTERED STUDENTS</span><strong>{adminRows.length}</strong></div><div className="stat"><span className="muted small">SECTIONS</span><strong>{new Set(adminRows.map(r=>r.section).filter(Boolean)).size}</strong></div></div>
    <div className="panel"><div className="between"><h2>Student records</h2><select className="select" style={{maxWidth:160}} value={filterSection} onChange={e=>setFilterSection(e.target.value)}><option value="ALL">All sections</option>{SECTIONS.map(s=><option key={s}>{s}</option>)}</select></div>
      <div className="tableWrap"><table><thead><tr><th>Student</th><th>Section</th><th>Topics</th><th>XP</th><th>Last activity</th><th>Email</th></tr></thead><tbody>
      {visibleRows.map(r=>{const prog=r.progress||{};const done=TOPICS.filter(t=>prog[t.id]?.completed).length;const xp=Object.values(prog).reduce((n,v)=>n+(v.points||0),0);const last=Object.values(prog).map(v=>v.lastAttemptAt).filter(Boolean).sort().at(-1);return <tr key={r.id}><td>{r.avatar||"👤"} <b>{r.lastName}, {r.firstName}</b></td><td>{r.section||"—"}</td><td>{done}/{TOPICS.length}</td><td>{xp}</td><td>{fmtDate(last)}</td><td>{r.email||"—"}</td></tr>})}
      {visibleRows.length===0&&<tr><td colSpan="6" className="muted">No student records found.</td></tr>}</tbody></table></div>
    </div>
    {notice&&<p className="notice" style={{marginTop:12}}>{notice}</p>}
  </div></div>;

  if (isAdmin && screen !== "admin") setScreen("admin");

  if (screen === "lesson" && activeTopic) {
    const score = activeTopic.questions.reduce((n,q,i)=>n+(answers[i]===q.correct?1:0),0);
    return <div className="app"><style>{styles}</style><div className="shell">
      <header className="topbar"><div className="brand"><span className="brandmark">⚔️</span> DSA QUEST</div><button className="btn ghost" onClick={()=>setScreen("home")}>← Dashboard</button></header>
      <div className="between"><div><p className="eyebrow">Learning module</p><h1 style={{fontSize:38}}>{activeTopic.icon} {activeTopic.title}</h1></div><span className="pill">JAVA TRACK</span></div>
      <div className="two" style={{marginTop:18}}><div className="panel"><h2>📖 Concept briefing</h2><p>{activeTopic.intro}</p><h3>Key facts</h3><ul className="muted">{activeTopic.facts.map(f=><li key={f} style={{marginBottom:9}}>{f}</li>)}</ul><h3>Java code example</h3><pre className="code">{activeTopic.java}</pre></div>
      <div className="panel"><h2>🎯 Knowledge challenge</h2><p className="muted small">Answer all three questions. Each correct answer earns 10 XP; a perfect score earns a bonus 10 XP.</p>
        {activeTopic.questions.map((q,i)=><div className="question" key={i}><b>{i+1}. {q.q}</b><div className="answers">{q.a.map((a,j)=><button key={j} disabled={submitted} className={"answer "+(answers[i]===j?"selected ":"")+(submitted&&j===q.correct?"correct":"")+(submitted&&answers[i]===j&&j!==q.correct?"wrong":"")} onClick={()=>setAnswers({...answers,[i]:j})}>{String.fromCharCode(65+j)}. {a}</button>)}</div>{submitted&&<p className="small muted" style={{margin:"10px 0 0"}}>{q.why}</p>}</div>)}
        {!submitted?<button className="btn full" disabled={busy||Object.keys(answers).length!==activeTopic.questions.length} onClick={submitTopic}>Submit challenge · {score}/{activeTopic.questions.length}</button>:<><div className="notice success">Challenge saved! You scored {score}/{activeTopic.questions.length} · +{score*10+(score===3?10:0)} XP</div><button className="btn full" style={{marginTop:12}} onClick={()=>setScreen("home")}>Return to dashboard</button></>}
      </div></div>
      {notice&&<p className="notice" style={{marginTop:12}}>{notice}</p>}
    </div></div>;
  }

  return <div className="app"><style>{styles}</style><div className="shell">
    <header className="topbar"><div className="brand"><span className="brandmark">⚔️</span> DSA QUEST <span className="pill">JAVA EDITION</span></div><div className="row"><span className="hideMobile muted small">{profile?.section}</span><span style={{fontSize:24}}>{profile?.avatar||"🧑‍💻"}</span><button className="btn ghost" onClick={logout}>Sign out</button></div></header>
    <section className="hero"><div className="heroMain"><p className="eyebrow">Your coding adventure starts here</p><h1>Welcome back,<br/><span style={{color:"#a78bfa"}}>{profile?.firstName||"Developer"}.</span></h1><p className="muted">Explore nine core DSA topics in Java. Learn the concept, study code examples, complete challenges and build your XP.</p><div className="row"><span className="pill">🎓 {profile?.section}</span><span className="pill">⚡ {totalPoints} XP earned</span></div></div>
      <div className="heroStats"><div className="stat"><span className="muted small">TOPICS COMPLETED</span><strong>{completedCount}<span className="muted" style={{fontSize:15}}> / 9</span></strong><div className="progress"><span style={{width:overallPercent+"%"}}/></div></div><div className="stat"><span className="muted small">TOTAL XP</span><strong>{totalPoints}</strong></div><div className="stat"><span className="muted small">COMPLETION</span><strong>{overallPercent}%</strong></div><div className="stat"><span className="muted small">PLAYER LEVEL</span><strong>{Math.floor(totalPoints/50)+1}</strong></div></div>
    </section>
    <div className="between" style={{margin:"30px 0 15px"}}><div><p className="eyebrow">Learning path</p><h2 style={{margin:0}}>Your DSA missions</h2></div><span className="muted small">9 modules · Java examples</span></div>
    <div className="grid">{TOPICS.map((t,i)=>{const p=progressData[t.id];return <button className="topic" key={t.id} onClick={()=>openTopic(t)} style={{borderTop:"3px solid "+t.color}}><div className="between"><span className="ico">{t.icon}</span><span className="pill">{p?.completed?"✓ COMPLETED":`MISSION ${String(i+1).padStart(2,"0")}`}</span></div><h3>{t.title}</h3><p>{t.intro}</p><div style={{marginTop:14}} className="between"><span className="small muted">{p?`Best: ${p.score}/${p.totalQuestions}`:"Not started"}</span><span className="small" style={{color:t.color,fontWeight:800}}>Open mission →</span></div></button>})}</div>
    <div className="panel" style={{marginTop:20}}><div className="between"><div><p className="eyebrow">Saved learning record</p><h3 style={{margin:"4px 0"}}>Progress is synced to your account</h3><p className="muted small" style={{margin:0}}>Each submitted challenge stores a completion timestamp, attempt count and score.</p></div><span className="pill">☁️ FIRESTORE SYNC</span></div></div>
    {notice&&<p className="notice" style={{marginTop:12}}>{notice}</p>}
  </div></div>;
}
