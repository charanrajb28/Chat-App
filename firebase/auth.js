import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    sendPasswordResetEmail, 
    signOut as firebaseSignOut, 
    onAuthStateChanged 
  } from "firebase/auth";
  import { doc, getDoc, setDoc } from "firebase/firestore";
  import { auth, db } from "./firebase"; // Firebase initialization file with `auth` and `db` export
  
  // Utility function to check if input is an email
  const isEmail = (identifier) => /\S+@\S+\.\S+/.test(identifier);
  
  // Function to login with either email or userId
  export const loginWithEmailOrUserId = async (identifier, password) => {
    try {
      let email;
  
      // Check if the identifier is an email
      if (isEmail(identifier)) {
        email = identifier;
      } else {
        // If it's not an email, assume it's a userId and look up the user's email
        const userRef = doc(db, "users", identifier);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          email = userSnap.data().email; // Retrieve email associated with the userId
        } else {
          throw new Error("User ID not found");
        }
      }
  
      // Attempt to sign in with the located email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };
  
  // Function to register a user with a custom userId provided by the user
  export const registerWithCustomUserId = async (userId, email, password, username) => {
    try {
      // Check if the userId already exists
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        throw new Error("User ID is already in use. Please choose a different ID.");
      }
  
      // Proceed with creating a new user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Save user data in Firestore with the provided userId as the document ID
      await setDoc(userRef, {
        userId,           // Custom userId provided by the user
        username,
        email,
        createdAt: new Date(),
        lastSeen: null,
        profilePic: "",
        status: "offline",
        contacts: [],
        archiveMessages: [],
        additionalInfo: {}
      });
  
      console.log("New user registered with custom userId:", userId);
      return user;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  };
  
  // Function to sign in with Google and prompt for username if user is new
  export const doSigninWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
  
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Check if the user already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);
  
      if (!userSnapshot.exists()) {
        // If the user document does not exist, return a flag to prompt for username
        console.log("New Google user detected: Username is required.");
        return { user, needsUsername: true };
      } else {
        // User already exists
        console.log("User signed in with Google:", user);
        return { user, needsUsername: false };
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };
  
  // Function to add username for a new Google user
  export const addUsernameForGoogleUser = async (user, username) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        userId: user.uid,
        username,
        email: user.email,
        createdAt: new Date(),
        lastSeen: null,
        profilePic: "",
        status: "offline",
        contacts: [],
        archiveMessages: [],
        additionalInfo: {}
      });
  
      console.log("Username added for new Google user:", username);
    } catch (error) {
      console.error("Error adding username for Google user:", error);
      throw error;
    }
  };
  
  // Function to reset password via email
  export const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent to:", email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  };
  
  // Function to sign out the user
  export const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      console.log("User signed out.");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };
  
  // Listener to monitor authentication state changes
  export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
  };
  