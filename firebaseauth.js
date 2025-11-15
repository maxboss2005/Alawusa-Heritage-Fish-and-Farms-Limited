// Import the functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
import { 
  getAuth,
  sendPasswordResetEmail, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  fetchSignInMethodsForEmail // ✅ important for duplicate checks
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { 
  getFirestore, 
  setDoc, 
  doc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDuxTHLfwiETTMO6Dx7YMehngZqWLgUlH0",
  authDomain: "alawusa-heritage-website.firebaseapp.com",
  projectId: "alawusa-heritage-website",
  storageBucket: "alawusa-heritage-website.firebasestorage.app",
  messagingSenderId: "857988164081",
  appId: "1:857988164081:web:ccac1200d344a8bd82bc50",
  measurementId: "G-TJQJMVVMZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();

// Utility: Show message
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}


export async function signInWithEmail(email, password, rememberMe) {
  try {
    // Set persistence based on "Remember me" selection
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    throw error;
  }
}

// ---------------- REGISTER ----------------
const signUp = document.getElementById("submitRegister");
signUp.addEventListener("click", async (event) => {
  event.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const name = document.getElementById("registerName").value;

  try {
    // ✅ Step 1: Check if email is already used (any provider)
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods.length > 0) {
      showMessage(
        "This email is already used for an existing account. Please log in instead.",
        "signUpMessage"
      );
      return;
    }

    // ✅ Step 2: Create the new account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Step 3: Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      createdAt: new Date(),
      provider: "email"
    });

    // ✅ Step 4: Send verification email
    await sendEmailVerification(user);
    showMessage("Verification email sent! Can't find email, check spam folder and mark as Not Spam.", "signUpMessage");

    // ✅ Step 5: Sign out until verified
    await signOut(auth);

  } catch (error) {
    const errorCode = error.code;
    if (errorCode === "auth/email-already-in-use") {
      showMessage("Email already in use. Please log in instead.", "signUpMessage");
    } else {
      showMessage("Unable to create user: " + error.message, "signUpMessage");
    }
  }
});

// ---------------- LOGIN ----------------
const signIn = document.getElementById("submitSignIn");
signIn.addEventListener("click", async (event) => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  try {
    // Save email to localStorage for convenience (like Jumia does)
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    // Set persistence based on "Remember me" selection
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      showMessage("Please verify your email before logging in.", "signInMessage");
      await signOut(auth);
      return;
    }

    showMessage("Login successful!", "signInMessage");
    localStorage.setItem("loggedInUserId", user.uid);
    
    // Redirect after a brief delay
    setTimeout(() => {
      window.location.href = "userproducts.html";
    }, 1000);
    
  } catch (error) {
    const errorCode = error.code;
    if (errorCode === "auth/invalid-credential") {
      showMessage("Incorrect Email or Password. Please try again.", "signInMessage");
    } else if (errorCode === "auth/too-many-requests") {
      showMessage("Too many failed attempts. Please try again later.", "signInMessage");
    } else if (errorCode === "auth/invalid-email") {
      showMessage("Invalid email address.", "signInMessage");
    } else {
      showMessage("Login failed. Please try again.", "signInMessage");
    }
  }
});

// ---------------- FORGOT PASSWORD ----------------
const forgotPasswordLink = document.getElementById("forgotPassword");
forgotPasswordLink.addEventListener("click", (event) => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;

  if (!email) {
    showMessage("Please enter your email to reset your password.", "signInMessage");
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      showMessage(
        `Password reset email sent to ${email}. Can't find email, check spam folder and mark as Not Spam.`,
        "signInMessage"
      );
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === "auth/user-not-found") {
        showMessage("No account found with this email.", "signInMessage");
      } else if (errorCode === "auth/invalid-email") {
        showMessage("Invalid email address.", "signInMessage");
      } else {
        showMessage("Error: " + error.message, "signInMessage");
      }
    });
});

// 🔑 Google Auth Provider
const provider = new GoogleAuthProvider();

// --- Google Login (Restricted to Registered Emails) ---
// --- Google Login (Restricted to Registered Emails) ---
document.getElementById("googleLoginBtn").addEventListener("click", async () => {
  try {
    // Check "Remember me" for Google login too
    const rememberMe = document.getElementById("rememberMe").checked;
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // ✅ Check if the Google email exists in Firestore (registered users)
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Email not registered
      await signOut(auth);
      showMessage(
        "Access denied. Only registered Google accounts are allowed to log in.",
        "signInMessage"
      );
      return;
    }

    // Save email for convenience
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', user.email);
    }

    // ✅ Login success
    showMessage(`Welcome back, ${user.displayName}!`, "signInMessage");
    localStorage.setItem("loggedInUserId", user.uid);
    
    setTimeout(() => {
      window.location.href = "userproducts.html";
    }, 1000);

  } catch (error) {
    const errorCode = error.code;
    if (errorCode === "auth/account-exists-with-different-credential") {
      showMessage(
        "An account already exists with this Google email but uses a different sign-in method. Please use email/password login instead.",
        "signInMessage"
      );
    } else {
      showMessage("Error signing in: " + error.message, "signInMessage");
    }
  }
});

// --- Google Register (Block Already Registered Google Accounts) ---
document.getElementById("googleRegisterBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // ✅ Step 1: Check if this email already exists in Firebase Auth
    const methods = await fetchSignInMethodsForEmail(auth, user.email);
    if (methods.includes("google.com") || methods.length > 0) {
      // Already registered with Google or another method
      showMessage(
        "This Google account is already registered. Please log in instead.",
        "signUpMessage"
      );
      await signOut(auth);
      return;
    }

    // ✅ Step 2: Check if already exists in Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      showMessage(
        "This Google account is already registered. Please log in instead.",
        "signUpMessage"
      );
      await signOut(auth);
      return;
    }

    // ✅ Step 3: Register new Google user (only if not found anywhere)
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      createdAt: new Date(),
      provider: "google"
    });

    showMessage(`Welcome ${user.displayName}! Your Google account has been registered.`, "signUpMessage");
    localStorage.setItem("loggedInUserId", user.uid);
    window.location.href = "userproducts.html";

  } catch (error) {
    const errorCode = error.code;
    if (errorCode === "auth/account-exists-with-different-credential") {
      showMessage(
        "This Google email is already linked to another account. Please sign in instead.",
        "signUpMessage"
      );
    } else {
      showMessage("Error signing up: " + error.message, "signUpMessage");
    }
  }
});


// ---------------- LOGOUT ----------------
// Add this function to test the remember me functionality
export async function logout() {
  try {
    await signOut(auth);
    localStorage.removeItem('loggedInUserId');
    // Don't remove rememberedEmail - that's the point of "Remember me"
    showMessage("Logged out successfully.", "signInMessage");
  } catch (error) {
    console.error('Logout error:', error);
  }
}
