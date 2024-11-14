import { 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    sendEmailVerification, 
    sendPasswordResetEmail, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    updatePassword,
    signOut as firebaseSignOut,
    onAuthStateChanged
  } from "firebase/auth";
  
  import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
  import { auth, db } from "./firebase"; // Firebase initialization file with `auth` and `db` exports
  
  // Sign in with Google and prompt for additional user info if user is new
  export const doSigninWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
  
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Check if the user already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);
  
      if (!userSnapshot.exists()) {
        // If the user is new, prompt for additional information
        console.log("New user detected: Additional information required.");
        return { user, needsAdditionalInfo: true };
      } else {
        // User already exists
        console.log("User signed in with Google:", user);
        return { user, needsAdditionalInfo: false };
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };
  
  // Add new user with additional profile info to Firestore
  export const addProfileInfoForGoogleUser = async (user, username, profilePic = "", status = "offline") => {
    try {
      const userRef = doc(db, "users", user.uid);
  
      // Create a new document for the Google user with additional information
      await setDoc(userRef, {
        userId: user.uid,
        username,
        email: user.email,
        profilePic,
        status,
        lastSeen: new Date(),
        contacts: [],
        archiveMessages: [],
        additionalInfo: {
          bio: "",
          birthdate: null,
          phoneNumber: ""
        },
        createdAt: new Date()
      });
  
      console.log("Profile info added for new Google user:", username);
    } catch (error) {
      console.error("Error adding profile info for Google user:", error);
      throw error;
    }
  };
  
  // Sign up a new user with email and password
  export const doSignupWithEmail = async (email, password, username) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
  
      // Set user info in Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        userId: user.uid,
        username,
        email,
        profilePic: "",
        status: "offline",
        lastSeen: new Date(),
        contacts: [],
        archiveMessages: [],
        additionalInfo: {
          bio: "",
          birthdate: null,
          phoneNumber: ""
        },
        createdAt: new Date()
      });
  
      // Send email verification
      await sendEmailVerification(user);
  
      console.log("New user signed up and saved in Firestore:", username);
      return user;
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }
  };
  
  // Sign in existing user with email and password
  export const doSigninWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
  
      console.log("User signed in with email:", user);
      return user;
    } catch (error) {
      console.error("Error signing in with email:", error);
      throw error;
    }
  };
  
  // Sign out the current user
  export const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      console.log("User signed out.");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };
  
  // Send password reset email
  export const sendPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent to:", email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  };
  
  // Update user's last seen status
  export const updateLastSeen = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { lastSeen: new Date() });
      console.log("User last seen updated.");
    } catch (error) {
      console.error("Error updating last seen:", error);
      throw error;
    }
  };
  
  // Update user's password
  export const doUpdatePassword = async (newPassword) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        console.log("Password updated.");
      } else {
        console.error("No user is signed in.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  };
  
  // Observe auth state changes (e.g., user sign-in or sign-out)
  export const observeAuthState = (callback) => {
    onAuthStateChanged(auth, callback);
  };
  