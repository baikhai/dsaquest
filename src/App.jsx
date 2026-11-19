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
    "id": "arrays",
    "title": "Arrays",
    "icon": "🧱",
    "color": "#38bdf8",
    "intro": "An array stores a fixed-size sequence of elements of the same data type. Java arrays use zero-based indexing, so the first element is at index 0.",
    "java": "public class ArrayExample {\n    public static void main(String[] args) {\n        int[] scores = {90, 85, 92, 78};\n\n        System.out.println(\"First score: \" + scores[0]);\n        scores[1] = 88;\n        System.out.println(\"Updated second score: \" + scores[1]);\n        System.out.println(\"Number of scores: \" + scores.length);\n    }\n}",
    "facts": [
      "Array indexes begin at 0.",
      "Use the length field to get an array length.",
      "Access by index takes O(1) time.",
      "An array has a fixed length after creation.",
      "A loop can process every array element."
    ],
    "questions": [
      {
        "q": "What is the index of the first element in a Java array?",
        "a": [
          "0",
          "1",
          "-1",
          "The array has no index"
        ],
        "correct": 0,
        "why": "Java arrays use zero-based indexing.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which expression gives the number of elements in int[] values?",
        "a": [
          "values.size()",
          "values.length",
          "values.count()",
          "values.capacity()"
        ],
        "correct": 1,
        "why": "For arrays, length is a field, not a method.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which operation usually takes O(1) time?",
        "a": [
          "Searching an unsorted array",
          "Accessing values[4]",
          "Printing every element",
          "Sorting the array"
        ],
        "correct": 1,
        "why": "An array element can be accessed directly using its index.",
        "type": "Identification / Concept"
      },
      {
        "q": "A program stores the seven days of the week. Which structure is suitable when the number of days is fixed?",
        "a": [
          "Array",
          "Queue only",
          "Stack only",
          "Tree only"
        ],
        "correct": 0,
        "why": "An array is suitable for a fixed-size indexed collection.",
        "type": "Identification / Concept"
      },
      {
        "q": "What happens if code accesses values[5] in an array with length 5?",
        "a": [
          "It returns 0",
          "It returns null",
          "An ArrayIndexOutOfBoundsException occurs",
          "Java automatically expands the array"
        ],
        "correct": 2,
        "why": "Valid indexes range from 0 through length - 1.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is printed? int[] a = {4, 7, 9}; System.out.println(a[1]);",
        "a": [
          "4",
          "7",
          "9",
          "1"
        ],
        "correct": 1,
        "why": "Index 1 refers to the second element, which is 7.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? int[] a = {2, 3, 4}; a[0] = a[2]; System.out.println(a[0]);",
        "a": [
          "2",
          "3",
          "4",
          "0"
        ],
        "correct": 2,
        "why": "The value at index 0 is replaced with the value at index 2 (4).",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is the output? int[] n = {1, 2, 3}; int sum = 0; for (int x : n) sum += x; System.out.println(sum);",
        "a": [
          "3",
          "5",
          "6",
          "123"
        ],
        "correct": 2,
        "why": "The loop adds 1 + 2 + 3, producing 6.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? int[] a = {5, 8, 2, 6}; System.out.println(a.length);",
        "a": [
          "2",
          "3",
          "4",
          "5"
        ],
        "correct": 2,
        "why": "There are four elements in the array.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? int[] a = {10, 20, 30}; System.out.println(a[0] + a[2]);",
        "a": [
          "20",
          "30",
          "40",
          "60"
        ],
        "correct": 2,
        "why": "The expression adds 10 and 30, producing 40.",
        "type": "Java Output Tracing"
      }
    ]
  },
  {
    "id": "arraylist",
    "title": "ArrayList",
    "icon": "📚",
    "color": "#a78bfa",
    "intro": "ArrayList is a resizable implementation of the Java List interface. It stores objects, supports indexed access, and can grow or shrink as elements are added or removed.",
    "java": "import java.util.ArrayList;\n\npublic class ArrayListExample {\n    public static void main(String[] args) {\n        ArrayList<String> names = new ArrayList<>();\n        names.add(\"Ana\");\n        names.add(\"Ben\");\n        names.add(\"Cara\");\n\n        names.remove(1);\n        System.out.println(names.get(1));\n        System.out.println(names.size());\n    }\n}",
    "facts": [
      "ArrayList can grow dynamically.",
      "add() inserts an element.",
      "get(index) retrieves an element.",
      "remove(index) removes an element and shifts later elements.",
      "size() returns the current number of elements."
    ],
    "questions": [
      {
        "q": "Which method adds an element to an ArrayList?",
        "a": [
          "push()",
          "add()",
          "enqueue()",
          "appendItem()"
        ],
        "correct": 1,
        "why": "The add() method inserts an element into an ArrayList.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which method returns the current number of elements?",
        "a": [
          "length",
          "count()",
          "size()",
          "capacity()"
        ],
        "correct": 2,
        "why": "ArrayList uses size() to report the number of stored elements.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which statement about ArrayList is correct?",
        "a": [
          "Its length can never change",
          "It stores only primitive values",
          "It can grow dynamically",
          "It cannot use indexes"
        ],
        "correct": 2,
        "why": "ArrayList expands its internal storage as needed.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which type should be used for an ArrayList of whole-number objects?",
        "a": [
          "ArrayList<int>",
          "ArrayList<Integer>",
          "int ArrayList[]",
          "IntegerList<int>"
        ],
        "correct": 1,
        "why": "Java generics use wrapper types such as Integer, not primitive int.",
        "type": "Identification / Concept"
      },
      {
        "q": "A student list must allow adding and removing names while the program runs. Which is appropriate?",
        "a": [
          "ArrayList<String>",
          "int only",
          "A fixed-size array only",
          "A boolean variable"
        ],
        "correct": 0,
        "why": "ArrayList supports dynamic insertion and removal.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is printed? ArrayList<String> n = new ArrayList<>(); n.add(\"A\"); n.add(\"B\"); System.out.println(n.get(0));",
        "a": [
          "A",
          "B",
          "0",
          "null"
        ],
        "correct": 0,
        "why": "Index 0 contains the first inserted value, A.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? ArrayList<Integer> n = new ArrayList<>(); n.add(4); n.add(6); n.remove(0); System.out.println(n.get(0));",
        "a": [
          "4",
          "6",
          "0",
          "IndexOutOfBoundsException"
        ],
        "correct": 1,
        "why": "Removing index 0 shifts 6 into index 0.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? ArrayList<String> n = new ArrayList<>(); n.add(\"red\"); n.add(\"blue\"); n.add(\"green\"); System.out.println(n.size());",
        "a": [
          "2",
          "3",
          "4",
          "0"
        ],
        "correct": 1,
        "why": "Three elements have been added.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? ArrayList<Integer> x = new ArrayList<>(); x.add(3); x.add(5); x.set(1, 9); System.out.println(x.get(1));",
        "a": [
          "3",
          "5",
          "9",
          "1"
        ],
        "correct": 2,
        "why": "set(1, 9) replaces the value at index 1 with 9.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? ArrayList<Integer> x = new ArrayList<>(); x.add(2); x.add(7); x.add(4); System.out.println(x.get(0) + x.get(2));",
        "a": [
          "6",
          "9",
          "11",
          "13"
        ],
        "correct": 0,
        "why": "The first and third values are 2 and 4; their sum is 6.",
        "type": "Java Output Tracing"
      }
    ]
  },
  {
    "id": "linkedlist",
    "title": "Linked Lists",
    "icon": "🔗",
    "color": "#34d399",
    "intro": "A linked list is a sequence of nodes. Each node stores data and a reference to another node. In a singly linked list, each node points to the next node.",
    "java": "public class LinkedListExample {\n    static class Node {\n        int data;\n        Node next;\n\n        Node(int data) {\n            this.data = data;\n        }\n    }\n\n    public static void main(String[] args) {\n        Node head = new Node(10);\n        head.next = new Node(20);\n        head.next.next = new Node(30);\n\n        Node current = head;\n        while (current != null) {\n            System.out.println(current.data);\n            current = current.next;\n        }\n    }\n}",
    "facts": [
      "A node stores data and link references.",
      "The head references the first node.",
      "The last node in a singly linked list points to null.",
      "Traversal visits nodes one by one.",
      "Insertion at the head is O(1)."
    ],
    "questions": [
      {
        "q": "What does a node in a singly linked list usually contain?",
        "a": [
          "An index only",
          "Data and a next reference",
          "Only a sorting method",
          "A queue and a stack"
        ],
        "correct": 1,
        "why": "A singly linked node stores data and a reference to the next node.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is the name of the reference to the first node?",
        "a": [
          "Root",
          "Head",
          "Tailor",
          "FrontIndex"
        ],
        "correct": 1,
        "why": "The head reference identifies the first node.",
        "type": "Identification / Concept"
      },
      {
        "q": "What does the next reference of the final node usually contain?",
        "a": [
          "The head automatically",
          "0",
          "null",
          "The list size"
        ],
        "correct": 2,
        "why": "The final node points to null to mark the end of the list.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is the usual time complexity of accessing the kth node by position?",
        "a": [
          "O(1)",
          "O(log n)",
          "O(n)",
          "O(n²)"
        ],
        "correct": 2,
        "why": "The list must be traversed from the head to reach a position.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which operation is typically O(1) when a head reference is available?",
        "a": [
          "Accessing the 100th node",
          "Searching for a value",
          "Inserting a node at the head",
          "Sorting all nodes"
        ],
        "correct": 2,
        "why": "Head insertion requires updating only a small number of references.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is printed? Node a = new Node(5); a.next = new Node(8); System.out.println(a.next.data);",
        "a": [
          "5",
          "8",
          "null",
          "13"
        ],
        "correct": 1,
        "why": "a.next refers to the second node, whose data is 8.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? Node h = new Node(3); h.next = new Node(6); h.next.next = new Node(9); System.out.println(h.data + h.next.next.data);",
        "a": [
          "9",
          "12",
          "15",
          "18"
        ],
        "correct": 2,
        "why": "The expression adds the head data 3 and third-node data 9.",
        "type": "Java Output Tracing"
      },
      {
        "q": "How many times does this loop print? Node c = head; while(c != null) { System.out.println(c.data); c = c.next; } where the list has 4 nodes.",
        "a": [
          "3",
          "4",
          "5",
          "It never stops"
        ],
        "correct": 1,
        "why": "The loop visits and prints each of the four nodes once.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? Node h = new Node(7); h.next = new Node(2); h = h.next; System.out.println(h.data);",
        "a": [
          "7",
          "2",
          "null",
          "9"
        ],
        "correct": 1,
        "why": "Moving h to h.next makes it refer to the node containing 2.",
        "type": "Java Output Tracing"
      },
      {
        "q": "A list has nodes 1 → 4 → 6. After setting the second node next to a new node containing 9 whose next is the old third node, what is the sequence?",
        "a": [
          "1 → 4 → 6",
          "1 → 9 → 4 → 6",
          "1 → 4 → 9 → 6",
          "9 → 1 → 4 → 6"
        ],
        "correct": 2,
        "why": "The new node is linked after 4 and before the former third node 6.",
        "type": "Java Output Tracing"
      }
    ]
  },
  {
    "id": "stacks",
    "title": "Stacks",
    "icon": "🥞",
    "color": "#fb923c",
    "intro": "A stack is a linear data structure that follows LIFO (Last In, First Out). The most recently inserted element is the first one removed.",
    "java": "import java.util.ArrayDeque;\nimport java.util.Deque;\n\npublic class StackExample {\n    public static void main(String[] args) {\n        Deque<Integer> stack = new ArrayDeque<>();\n        stack.push(10);\n        stack.push(20);\n        stack.push(30);\n\n        System.out.println(\"Top: \" + stack.peek());\n        System.out.println(\"Removed: \" + stack.pop());\n        System.out.println(\"New top: \" + stack.peek());\n    }\n}",
    "facts": [
      "push() adds an item to the top.",
      "pop() removes and returns the top item.",
      "peek() reads the top without removing it.",
      "A stack follows LIFO.",
      "Undo operations and function calls commonly use stack behavior."
    ],
    "questions": [
      {
        "q": "What principle does a stack follow?",
        "a": [
          "FIFO",
          "LIFO",
          "Random order",
          "Priority order"
        ],
        "correct": 1,
        "why": "LIFO means Last In, First Out.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which operation removes and returns the top item?",
        "a": [
          "peek()",
          "push()",
          "pop()",
          "offer()"
        ],
        "correct": 2,
        "why": "pop() removes the current top element.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which operation reads the top item without removing it?",
        "a": [
          "peek()",
          "pop()",
          "removeBottom()",
          "enqueue()"
        ],
        "correct": 0,
        "why": "peek() returns the top element while leaving the stack unchanged.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which real-world feature is commonly modeled by a stack?",
        "a": [
          "Printer waiting line",
          "Undo history",
          "Customer service queue",
          "Road intersections"
        ],
        "correct": 1,
        "why": "Undo typically reverses the most recent action first.",
        "type": "Identification / Concept"
      },
      {
        "q": "If 4, then 8, then 12 are pushed, which value is removed first?",
        "a": [
          "4",
          "8",
          "12",
          "None"
        ],
        "correct": 2,
        "why": "The last value pushed, 12, is at the top.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is printed? Deque<Integer> s = new ArrayDeque<>(); s.push(4); s.push(9); System.out.println(s.pop());",
        "a": [
          "4",
          "9",
          "13",
          "null"
        ],
        "correct": 1,
        "why": "9 was pushed last, so it is removed first.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? Deque<Integer> s = new ArrayDeque<>(); s.push(2); s.push(5); s.pop(); System.out.println(s.peek());",
        "a": [
          "2",
          "5",
          "null",
          "7"
        ],
        "correct": 0,
        "why": "After removing 5, the top value is 2.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? Deque<Integer> s = new ArrayDeque<>(); s.push(1); s.push(3); System.out.println(s.size());",
        "a": [
          "1",
          "2",
          "3",
          "0"
        ],
        "correct": 1,
        "why": "Two elements are stored in the stack.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? Deque<String> s = new ArrayDeque<>(); s.push(\"A\"); s.push(\"B\"); System.out.println(s.pop() + s.pop());",
        "a": [
          "AB",
          "BA",
          "A",
          "B"
        ],
        "correct": 1,
        "why": "The first pop returns B, followed by A, producing BA.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What remains at the top? Push 6, push 10, pop, then push 14.",
        "a": [
          "6",
          "10",
          "14",
          "The stack is empty"
        ],
        "correct": 2,
        "why": "After pop removes 10, pushing 14 makes 14 the new top.",
        "type": "Java Output Tracing"
      }
    ]
  },
  {
    "id": "queues",
    "title": "Queues",
    "icon": "🚶",
    "color": "#f472b6",
    "intro": "A queue is a linear data structure that follows FIFO (First In, First Out). Elements are added at the rear and removed from the front.",
    "java": "import java.util.ArrayDeque;\nimport java.util.Queue;\n\npublic class QueueExample {\n    public static void main(String[] args) {\n        Queue<String> line = new ArrayDeque<>();\n        line.offer(\"Mia\");\n        line.offer(\"Leo\");\n        line.offer(\"Kai\");\n\n        System.out.println(\"Next: \" + line.peek());\n        System.out.println(\"Served: \" + line.poll());\n        System.out.println(\"Next: \" + line.peek());\n    }\n}",
    "facts": [
      "offer() inserts at the rear.",
      "poll() removes and returns the front item.",
      "peek() reads the front item without removing it.",
      "A queue follows FIFO.",
      "Queues are useful for scheduling and waiting lines."
    ],
    "questions": [
      {
        "q": "What principle does a queue follow?",
        "a": [
          "LIFO",
          "FIFO",
          "Random order",
          "Last priority"
        ],
        "correct": 1,
        "why": "FIFO means First In, First Out.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which method removes and returns the front element?",
        "a": [
          "push()",
          "poll()",
          "peek()",
          "addFirst()"
        ],
        "correct": 1,
        "why": "poll() retrieves and removes the queue head.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which method views the front element without removing it?",
        "a": [
          "peek()",
          "pop()",
          "push()",
          "clear()"
        ],
        "correct": 0,
        "why": "peek() returns the front element but does not remove it.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which real-world process is best represented by a queue?",
        "a": [
          "Undo history",
          "Function call stack",
          "Students waiting for enrollment",
          "Recursive method calls"
        ],
        "correct": 2,
        "why": "The first student who joins the line is served first.",
        "type": "Identification / Concept"
      },
      {
        "q": "If A, B, and C are enqueued in that order, which is dequeued first?",
        "a": [
          "A",
          "B",
          "C",
          "All at once"
        ],
        "correct": 0,
        "why": "FIFO removes the earliest inserted item first.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is printed? Queue<Integer> q = new ArrayDeque<>(); q.offer(3); q.offer(7); System.out.println(q.poll());",
        "a": [
          "3",
          "7",
          "10",
          "null"
        ],
        "correct": 0,
        "why": "3 was inserted first and is at the front.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? Queue<String> q = new ArrayDeque<>(); q.offer(\"A\"); q.offer(\"B\"); q.poll(); System.out.println(q.peek());",
        "a": [
          "A",
          "B",
          "null",
          "AB"
        ],
        "correct": 1,
        "why": "After A is removed, B becomes the front element.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? Queue<Integer> q = new ArrayDeque<>(); q.offer(2); q.offer(4); q.offer(6); System.out.println(q.size());",
        "a": [
          "2",
          "3",
          "4",
          "6"
        ],
        "correct": 1,
        "why": "The queue contains three elements.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? Queue<Integer> q = new ArrayDeque<>(); q.offer(5); q.offer(8); System.out.println(q.poll() + q.poll());",
        "a": [
          "5",
          "8",
          "13",
          "58"
        ],
        "correct": 2,
        "why": "poll() returns 5 then 8; their sum is 13.",
        "type": "Java Output Tracing"
      },
      {
        "q": "After enqueueing 11, 22, 33 and removing one item, what is at the front?",
        "a": [
          "11",
          "22",
          "33",
          "The queue is empty"
        ],
        "correct": 1,
        "why": "Removing 11 leaves 22 at the front.",
        "type": "Java Output Tracing"
      }
    ]
  },
  {
    "id": "recursion",
    "title": "Recursion",
    "icon": "🪞",
    "color": "#facc15",
    "intro": "Recursion occurs when a method calls itself to solve a smaller version of a problem. A base case stops the recursive calls.",
    "java": "public class RecursionExample {\n    static int factorial(int n) {\n        if (n <= 1) {          // base case\n            return 1;\n        }\n        return n * factorial(n - 1);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n}",
    "facts": [
      "A recursive method calls itself.",
      "A base case stops further recursive calls.",
      "Each recursive step should move toward the base case.",
      "Active method calls are stored in the call stack.",
      "Missing base cases may cause StackOverflowError."
    ],
    "questions": [
      {
        "q": "What prevents a recursive method from calling itself forever?",
        "a": [
          "A constructor",
          "A base case",
          "An import statement",
          "A class variable"
        ],
        "correct": 1,
        "why": "The base case returns a result without making another recursive call.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is the name for a method calling itself?",
        "a": [
          "Iteration",
          "Recursion",
          "Compilation",
          "Inheritance"
        ],
        "correct": 1,
        "why": "Recursion is a method-solving technique involving self-calls.",
        "type": "Identification / Concept"
      },
      {
        "q": "Where are active recursive method calls managed?",
        "a": [
          "Queue",
          "Call stack",
          "Hash table",
          "Array index"
        ],
        "correct": 1,
        "why": "Each method call has a stack frame on the call stack.",
        "type": "Identification / Concept"
      },
      {
        "q": "What should a recursive step generally do?",
        "a": [
          "Move toward the base case",
          "Restart with the same input",
          "Remove the base case",
          "Always increase input"
        ],
        "correct": 0,
        "why": "The problem must become smaller or otherwise approach a stopping condition.",
        "type": "Identification / Concept"
      },
      {
        "q": "What can happen when recursion has no reachable base case?",
        "a": [
          "The array resizes",
          "StackOverflowError",
          "The method always returns 0",
          "The program sorts automatically"
        ],
        "correct": 1,
        "why": "Unending recursive calls can exhaust the call stack.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is printed? static int f(int n){ if(n==0)return 0; return n+f(n-1); } System.out.println(f(3));",
        "a": [
          "3",
          "5",
          "6",
          "9"
        ],
        "correct": 2,
        "why": "f(3) = 3 + 2 + 1 + 0 = 6.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? static int f(int n){ if(n<=1)return 1; return n*f(n-1); } System.out.println(f(4));",
        "a": [
          "10",
          "16",
          "24",
          "120"
        ],
        "correct": 2,
        "why": "4 × 3 × 2 × 1 equals 24.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? static void show(int n){ if(n==0)return; System.out.print(n); show(n-1); } show(3);",
        "a": [
          "123",
          "321",
          "0123",
          "333"
        ],
        "correct": 1,
        "why": "The method prints 3, then 2, then 1 before reaching the base case.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? static int doubleIt(int n){ if(n==1)return 1; return 2+doubleIt(n-1); } System.out.println(doubleIt(3));",
        "a": [
          "3",
          "5",
          "6",
          "8"
        ],
        "correct": 1,
        "why": "doubleIt(3) = 2 + 2 + 1 = 5.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? static int count(int n){ if(n==0)return 0; return 1+count(n-1); } System.out.println(count(5));",
        "a": [
          "0",
          "1",
          "4",
          "5"
        ],
        "correct": 3,
        "why": "The method adds 1 once for each of the five recursive levels.",
        "type": "Java Output Tracing"
      }
    ]
  },
  {
    "id": "trees",
    "title": "Trees",
    "icon": "🌳",
    "color": "#4ade80",
    "intro": "A tree is a non-linear hierarchical structure made of nodes and edges. A binary tree allows each node to have at most two children.",
    "java": "public class TreeExample {\n    static class Node {\n        int value;\n        Node left;\n        Node right;\n\n        Node(int value) {\n            this.value = value;\n        }\n    }\n\n    static void inorder(Node node) {\n        if (node == null) return;\n        inorder(node.left);\n        System.out.print(node.value + \" \");\n        inorder(node.right);\n    }\n\n    public static void main(String[] args) {\n        Node root = new Node(8);\n        root.left = new Node(4);\n        root.right = new Node(12);\n        inorder(root);\n    }\n}",
    "facts": [
      "The root is the topmost node.",
      "A leaf has no children.",
      "A parent has one or more child nodes.",
      "A binary tree node has at most two children.",
      "Inorder traversal visits left subtree, node, then right subtree."
    ],
    "questions": [
      {
        "q": "What is the topmost node of a tree called?",
        "a": [
          "Leaf",
          "Root",
          "Edge",
          "Sibling"
        ],
        "correct": 1,
        "why": "The root is the starting node of a tree.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is a leaf node?",
        "a": [
          "A node with no children",
          "A node with two parents",
          "The topmost node only",
          "A connection between nodes"
        ],
        "correct": 0,
        "why": "A leaf has no child nodes.",
        "type": "Identification / Concept"
      },
      {
        "q": "How many children can a binary tree node have at most?",
        "a": [
          "One",
          "Two",
          "Three",
          "Unlimited"
        ],
        "correct": 1,
        "why": "A binary tree node has at most a left and a right child.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which traversal follows Left, Node, Right?",
        "a": [
          "Preorder",
          "Postorder",
          "Inorder",
          "Level order"
        ],
        "correct": 2,
        "why": "Inorder traversal processes the left subtree, current node, then right subtree.",
        "type": "Identification / Concept"
      },
      {
        "q": "In a binary search tree, where are values smaller than a node commonly placed?",
        "a": [
          "Left subtree",
          "Right subtree",
          "Only in leaves",
          "Outside the tree"
        ],
        "correct": 0,
        "why": "BST ordering places smaller values in the left subtree.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is printed by inorder traversal of root 8 with left child 4 and right child 12?",
        "a": [
          "8 4 12",
          "4 8 12",
          "4 12 8",
          "12 8 4"
        ],
        "correct": 1,
        "why": "Inorder visits left (4), root (8), then right (12).",
        "type": "Java Output Tracing"
      },
      {
        "q": "A tree has root 10, left child 5, and right child 15. What does preorder traversal print?",
        "a": [
          "5 10 15",
          "5 15 10",
          "10 5 15",
          "15 10 5"
        ],
        "correct": 2,
        "why": "Preorder visits node first, then left subtree, then right subtree.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? Node root = new Node(7); root.left = new Node(3); System.out.println(root.left.value);",
        "a": [
          "7",
          "3",
          "0",
          "null"
        ],
        "correct": 1,
        "why": "The left child stores the value 3.",
        "type": "Java Output Tracing"
      },
      {
        "q": "In a tree with root 6 and children 2 and 9, how many leaf nodes are there?",
        "a": [
          "1",
          "2",
          "3",
          "0"
        ],
        "correct": 1,
        "why": "Both child nodes have no children, so there are two leaves.",
        "type": "Java Output Tracing"
      },
      {
        "q": "For a BST with root 8, left child 3, and right child 11, where would value 5 be inserted?",
        "a": [
          "As left child of 3",
          "As right child of 3",
          "As left child of 11",
          "As right child of 11"
        ],
        "correct": 1,
        "why": "5 is less than 8, so go left; 5 is greater than 3, so it belongs to the right of 3.",
        "type": "Java Output Tracing"
      }
    ]
  },
  {
    "id": "graphs",
    "title": "Graphs",
    "icon": "🕸️",
    "color": "#60a5fa",
    "intro": "A graph consists of vertices (nodes) and edges (connections). Graphs may be directed or undirected, weighted or unweighted, and are useful for modeling networks.",
    "java": "import java.util.*;\n\npublic class GraphExample {\n    public static void main(String[] args) {\n        Map<Integer, List<Integer>> graph = new HashMap<>();\n        graph.put(1, new ArrayList<>());\n        graph.put(2, new ArrayList<>());\n\n        graph.get(1).add(2); // edge from 1 to 2\n        graph.get(2).add(1); // reverse edge for undirected graph\n\n        System.out.println(graph.get(1));\n        System.out.println(graph.size());\n    }\n}",
    "facts": [
      "Vertices represent entities or locations.",
      "Edges represent relationships or connections.",
      "A directed edge has a direction.",
      "BFS commonly uses a queue.",
      "DFS commonly uses recursion or a stack."
    ],
    "questions": [
      {
        "q": "What represents a connection between two vertices?",
        "a": [
          "Edge",
          "Root",
          "Index",
          "Stack frame"
        ],
        "correct": 0,
        "why": "An edge connects vertices in a graph.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is a vertex in a graph?",
        "a": [
          "A connection",
          "A node or entity",
          "A sorting rule",
          "A loop counter"
        ],
        "correct": 1,
        "why": "Vertices are the nodes or entities in a graph.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which traversal commonly uses a queue?",
        "a": [
          "DFS",
          "BFS",
          "Binary search",
          "Inorder"
        ],
        "correct": 1,
        "why": "BFS explores level by level using a queue.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which traversal explores deeply before backtracking?",
        "a": [
          "BFS",
          "DFS",
          "Linear search",
          "Selection sort"
        ],
        "correct": 1,
        "why": "Depth-first search explores a path deeply before backtracking.",
        "type": "Identification / Concept"
      },
      {
        "q": "A map of cities connected by roads is best represented by a:",
        "a": [
          "Stack",
          "Queue",
          "Graph",
          "Single variable"
        ],
        "correct": 2,
        "why": "Cities can be vertices and roads can be edges.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is printed? Map<Integer,List<Integer>> g = new HashMap<>(); g.put(1,new ArrayList<>()); g.get(1).add(2); System.out.println(g.get(1));",
        "a": [
          "[]",
          "[1]",
          "[2]",
          "null"
        ],
        "correct": 2,
        "why": "The adjacency list for vertex 1 contains neighbor 2.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? Map<Integer,List<Integer>> g = new HashMap<>(); g.put(1,new ArrayList<>()); g.put(2,new ArrayList<>()); System.out.println(g.size());",
        "a": [
          "0",
          "1",
          "2",
          "3"
        ],
        "correct": 2,
        "why": "Two keys (vertices) have been added to the map.",
        "type": "Java Output Tracing"
      },
      {
        "q": "An undirected graph has an edge between A and B. If represented with adjacency lists, which is true?",
        "a": [
          "Only A lists B",
          "Only B lists A",
          "A lists B and B lists A",
          "Neither lists the other"
        ],
        "correct": 2,
        "why": "An undirected connection is represented in both directions in a typical adjacency-list implementation.",
        "type": "Java Output Tracing"
      },
      {
        "q": "BFS starts at A. A is connected to B and C. Which vertices are discovered immediately after processing A?",
        "a": [
          "Only A",
          "B and C",
          "All distant vertices first",
          "No vertices"
        ],
        "correct": 1,
        "why": "BFS visits the immediate neighbors of A before deeper levels.",
        "type": "Java Output Tracing"
      },
      {
        "q": "A DFS traversal visits A, then B, then D before backtracking. What is DFS prioritizing?",
        "a": [
          "The shallowest unvisited vertex",
          "A deep path before exploring alternatives",
          "Alphabetical sorting only",
          "The shortest weighted path always"
        ],
        "correct": 1,
        "why": "DFS follows a path as far as possible before backtracking.",
        "type": "Java Output Tracing"
      }
    ]
  },
  {
    "id": "searching",
    "title": "Searching Algorithms",
    "icon": "🔎",
    "color": "#c084fc",
    "intro": "Searching algorithms locate a target value. Linear search checks items one by one; binary search repeatedly halves a sorted search interval.",
    "java": "public class SearchingExample {\n    static int linearSearch(int[] values, int target) {\n        for (int i = 0; i < values.length; i++) {\n            if (values[i] == target) return i;\n        }\n        return -1;\n    }\n\n    static int binarySearch(int[] values, int target) {\n        int low = 0;\n        int high = values.length - 1;\n        while (low <= high) {\n            int mid = low + (high - low) / 2;\n            if (values[mid] == target) return mid;\n            if (values[mid] < target) low = mid + 1;\n            else high = mid - 1;\n        }\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        int[] data = {2, 4, 6, 8, 10};\n        System.out.println(linearSearch(data, 8));\n        System.out.println(binarySearch(data, 6));\n    }\n}",
    "facts": [
      "Linear search checks elements sequentially.",
      "Binary search requires sorted data.",
      "Linear search worst-case time is O(n).",
      "Binary search time is O(log n).",
      "A return value of -1 often indicates not found."
    ],
    "questions": [
      {
        "q": "What condition is required for binary search?",
        "a": [
          "The data must be sorted",
          "The data must contain strings",
          "The array must have two items",
          "All values must be negative"
        ],
        "correct": 0,
        "why": "Binary search relies on sorted order to discard half of the search range.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is the worst-case time complexity of linear search?",
        "a": [
          "O(1)",
          "O(log n)",
          "O(n)",
          "O(n²)"
        ],
        "correct": 2,
        "why": "Linear search may inspect every element.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is the time complexity of binary search?",
        "a": [
          "O(n)",
          "O(log n)",
          "O(n²)",
          "O(2ⁿ)"
        ],
        "correct": 1,
        "why": "Binary search halves the remaining search interval each step.",
        "type": "Identification / Concept"
      },
      {
        "q": "What does returning -1 commonly indicate in a search method?",
        "a": [
          "The target is at index 1",
          "The target was not found",
          "The array is sorted",
          "The array is empty only"
        ],
        "correct": 1,
        "why": "-1 is a common sentinel value meaning no matching index was found.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which algorithm is suitable for a small unsorted list when simplicity is important?",
        "a": [
          "Binary search without sorting",
          "Linear search",
          "Tree traversal only",
          "Hashing is mandatory"
        ],
        "correct": 1,
        "why": "Linear search works on unsorted data and is straightforward for small collections.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is printed? int[] a={3,6,9}; System.out.println(linearSearch(a,6));",
        "a": [
          "0",
          "1",
          "2",
          "-1"
        ],
        "correct": 1,
        "why": "The value 6 is located at index 1.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? int[] a={2,4,6,8}; System.out.println(binarySearch(a,8));",
        "a": [
          "-1",
          "2",
          "3",
          "4"
        ],
        "correct": 2,
        "why": "The value 8 is at index 3.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? int[] a={1,3,5}; System.out.println(linearSearch(a,4));",
        "a": [
          "0",
          "1",
          "-1",
          "3"
        ],
        "correct": 2,
        "why": "No element equals 4, so the method returns -1.",
        "type": "Java Output Tracing"
      },
      {
        "q": "For sorted array [10, 20, 30, 40, 50], what is the middle value checked first by binary search using mid=(low+high)/2?",
        "a": [
          "10",
          "20",
          "30",
          "40"
        ],
        "correct": 2,
        "why": "low is 0 and high is 4, so mid is 2 and a[2] is 30.",
        "type": "Java Output Tracing"
      },
      {
        "q": "A binary search checks the middle value 25 in [10, 20, 25, 30, 40]. What index is returned?",
        "a": [
          "1",
          "2",
          "3",
          "-1"
        ],
        "correct": 1,
        "why": "The target 25 is at index 2.",
        "type": "Java Output Tracing"
      }
    ]
  },
  {
    "id": "oop",
    "title": "OOP Concepts",
    "icon": "🧩",
    "color": "#f97316",
    "intro": "Object-Oriented Programming (OOP) organizes programs using classes and objects. Core concepts include encapsulation, inheritance, polymorphism, and abstraction.",
    "java": "public class OOPExample {\n    static class Animal {\n        private String name;\n\n        Animal(String name) {\n            this.name = name;\n        }\n\n        public String getName() {\n            return name;\n        }\n\n        public void speak() {\n            System.out.println(\"Animal sound\");\n        }\n    }\n\n    static class Dog extends Animal {\n        Dog(String name) {\n            super(name);\n        }\n\n        @Override\n        public void speak() {\n            System.out.println(getName() + \" says Woof\");\n        }\n    }\n\n    public static void main(String[] args) {\n        Animal pet = new Dog(\"Buddy\");\n        pet.speak();\n    }\n}",
    "facts": [
      "A class is a blueprint; an object is an instance of a class.",
      "Encapsulation protects data through controlled access.",
      "Inheritance allows a class to reuse or extend another class.",
      "Polymorphism allows one reference type to refer to different object types.",
      "Abstraction exposes essential behavior while hiding implementation details."
    ],
    "questions": [
      {
        "q": "What is a class in Java?",
        "a": [
          "A blueprint for creating objects",
          "A running loop",
          "A primitive data type",
          "A package manager"
        ],
        "correct": 0,
        "why": "A class defines the fields and methods that its objects can have.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is an object?",
        "a": [
          "A method parameter only",
          "An instance of a class",
          "A Java keyword for loops",
          "A source file extension"
        ],
        "correct": 1,
        "why": "An object is a concrete instance created from a class.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which OOP principle bundles data and methods while controlling access to internal state?",
        "a": [
          "Inheritance",
          "Encapsulation",
          "Recursion",
          "Iteration"
        ],
        "correct": 1,
        "why": "Encapsulation groups state and behavior and controls access, often using private fields and public methods.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which keyword is used when a Java class inherits from another class?",
        "a": [
          "implements",
          "extends",
          "inherits",
          "superclass"
        ],
        "correct": 1,
        "why": "A class uses extends to inherit from another class.",
        "type": "Identification / Concept"
      },
      {
        "q": "Which concept allows a subclass to provide its own implementation of an inherited method?",
        "a": [
          "Method overriding",
          "Array indexing",
          "Queueing",
          "Variable casting only"
        ],
        "correct": 0,
        "why": "Overriding lets a subclass redefine an inherited method.",
        "type": "Identification / Concept"
      },
      {
        "q": "What is printed? class A { void show(){System.out.print(\"A\");} } class B extends A { void show(){System.out.print(\"B\");} } A x = new B(); x.show();",
        "a": [
          "A",
          "B",
          "AB",
          "Compilation error"
        ],
        "correct": 1,
        "why": "Dynamic method dispatch calls the overridden method of the actual object, B.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? class Person { String name=\"Lee\"; } Person p = new Person(); System.out.println(p.name);",
        "a": [
          "Person",
          "name",
          "Lee",
          "null"
        ],
        "correct": 2,
        "why": "The object field name was initialized to the string Lee.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? class Counter { int value=2; void add(){value+=3;} } Counter c=new Counter(); c.add(); System.out.println(c.value);",
        "a": [
          "2",
          "3",
          "5",
          "6"
        ],
        "correct": 2,
        "why": "add() increases value from 2 to 5.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? class Parent { Parent(){System.out.print(\"P\");} } class Child extends Parent { Child(){System.out.print(\"C\");} } new Child();",
        "a": [
          "C",
          "P",
          "PC",
          "CP"
        ],
        "correct": 2,
        "why": "The parent constructor runs before the child constructor, producing PC.",
        "type": "Java Output Tracing"
      },
      {
        "q": "What is printed? class Box { private int size=4; int getSize(){return size;} } Box b=new Box(); System.out.println(b.getSize()*2);",
        "a": [
          "4",
          "6",
          "8",
          "16"
        ],
        "correct": 2,
        "why": "getSize() returns 4, and 4 multiplied by 2 is 8.",
        "type": "Java Output Tracing"
      }
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
      <div className="panel"><h2>🎯 Knowledge challenge</h2><p className="muted small">Answer all 10 questions. Questions 1–5 focus on identification and concepts; Questions 6–10 require Java output tracing. Each correct answer earns 10 XP; a perfect score earns a 10 XP bonus. Correct answers and explanations appear only after you submit.</p>
        {activeTopic.questions.map((q,i)=><div className="question" key={i}><div className="between"><span className="pill">{i < 5 ? "IDENTIFICATION / CONCEPT" : "OUTPUT TRACING"}</span><span className="small muted">Question {i+1} of 10</span></div><b style={{display:"block",marginTop:10}}>{i+1}. {q.q}</b><div className="answers">{q.a.map((a,j)=><button key={j} disabled={submitted} className={"answer "+(answers[i]===j?"selected ":"")+(submitted&&j===q.correct?"correct":"")+(submitted&&answers[i]===j&&j!==q.correct?"wrong":"")} onClick={()=>setAnswers({...answers,[i]:j})}>{String.fromCharCode(65+j)}. {a}</button>)}</div>{submitted&&<div className="notice success" style={{marginTop:10}}><b>Correct answer: {String.fromCharCode(65+q.correct)}. {q.a[q.correct]}</b><p className="small" style={{margin:"6px 0 0"}}>{q.why}</p></div>}</div>)}
        {!submitted?<button className="btn full" disabled={busy||Object.keys(answers).length!==activeTopic.questions.length} onClick={submitTopic}>Submit challenge · {score}/{activeTopic.questions.length}</button>:<><div className="notice success">Challenge submitted! You scored {score}/{activeTopic.questions.length} · +{score*10+(score===activeTopic.questions.length?10:0)} XP. Correct answers and explanations are now displayed above.</div><button className="btn full" style={{marginTop:12}} onClick={()=>setScreen("home")}>Return to dashboard</button></>}
      </div></div>
      {notice&&<p className="notice" style={{marginTop:12}}>{notice}</p>}
    </div></div>;
  }

  return <div className="app"><style>{styles}</style><div className="shell">
    <header className="topbar"><div className="brand"><span className="brandmark">⚔️</span> DSA QUEST <span className="pill">JAVA EDITION</span></div><div className="row"><span className="hideMobile muted small">{profile?.section}</span><span style={{fontSize:24}}>{profile?.avatar||"🧑‍💻"}</span><button className="btn ghost" onClick={logout}>Sign out</button></div></header>
    <section className="hero"><div className="heroMain"><p className="eyebrow">Your coding adventure starts here</p><h1>Welcome back,<br/><span style={{color:"#a78bfa"}}>{profile?.firstName||"Developer"}.</span></h1><p className="muted">Explore ten core DSA and OOP topics in Java. Learn the concept, study code examples, complete challenges and build your XP.</p><div className="row"><span className="pill">🎓 {profile?.section}</span><span className="pill">⚡ {totalPoints} XP earned</span></div></div>
      <div className="heroStats"><div className="stat"><span className="muted small">TOPICS COMPLETED</span><strong>{completedCount}<span className="muted" style={{fontSize:15}}> / {TOPICS.length}</span></strong><div className="progress"><span style={{width:overallPercent+"%"}}/></div></div><div className="stat"><span className="muted small">TOTAL XP</span><strong>{totalPoints}</strong></div><div className="stat"><span className="muted small">COMPLETION</span><strong>{overallPercent}%</strong></div><div className="stat"><span className="muted small">PLAYER LEVEL</span><strong>{Math.floor(totalPoints/50)+1}</strong></div></div>
    </section>
    <div className="between" style={{margin:"30px 0 15px"}}><div><p className="eyebrow">Learning path</p><h2 style={{margin:0}}>Your DSA missions</h2></div><span className="muted small">10 modules · 100 questions · Java examples</span></div>
    <div className="grid">{TOPICS.map((t,i)=>{const p=progressData[t.id];return <button className="topic" key={t.id} onClick={()=>openTopic(t)} style={{borderTop:"3px solid "+t.color}}><div className="between"><span className="ico">{t.icon}</span><span className="pill">{p?.completed?"✓ COMPLETED":`MISSION ${String(i+1).padStart(2,"0")}`}</span></div><h3>{t.title}</h3><p>{t.intro}</p><div style={{marginTop:14}} className="between"><span className="small muted">{p?`Best: ${p.score}/${p.totalQuestions}`:"Not started"}</span><span className="small" style={{color:t.color,fontWeight:800}}>Open mission →</span></div></button>})}</div>
    <div className="panel" style={{marginTop:20}}><div className="between"><div><p className="eyebrow">Saved learning record</p><h3 style={{margin:"4px 0"}}>Progress is synced to your account</h3><p className="muted small" style={{margin:0}}>Each submitted challenge stores a completion timestamp, attempt count and score.</p></div><span className="pill">☁️ FIRESTORE SYNC</span></div></div>
    {notice&&<p className="notice" style={{marginTop:12}}>{notice}</p>}
  </div></div>;
}
