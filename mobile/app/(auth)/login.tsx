import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

const API_URL = "http://localhost:4000/auth"; 

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false); // Toggle Login/Register

  const handleAuth = async () => {
    const endpoint = isRegister ? "/register" : "/login";
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        // 1. Save User to Context
        login(data.user);
        // 2. Go to App
        router.replace("/(tabs)/screener");
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (err) {
      Alert.alert("Error", "Could not connect to server");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={StyleSheet.absoluteFill} />
      
      <View style={styles.box}>
        <Text style={styles.title}>{isRegister ? "Create Account" : "Welcome Back"}</Text>
        
        <TextInput 
          placeholder="Email" 
          placeholderTextColor="#94a3b8" 
          style={styles.input} 
          autoCapitalize="none"
          value={email} onChangeText={setEmail} 
        />
        <TextInput 
          placeholder="Password" 
          placeholderTextColor="#94a3b8" 
          style={styles.input} 
          secureTextEntry 
          value={password} onChangeText={setPassword} 
        />

        <TouchableOpacity onPress={handleAuth} style={styles.btn}>
          <Text style={styles.btnText}>{isRegister ? "Sign Up" : "Log In"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
          <Text style={styles.link}>
            {isRegister ? "Already have an account? Log In" : "New here? Create Account"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  box: { backgroundColor: "#1e293b", padding: 24, borderRadius: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 20, textAlign: "center" },
  input: { backgroundColor: "#334155", color: "white", borderRadius: 8, padding: 14, marginBottom: 12 },
  btn: { backgroundColor: "#3b82f6", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 8 },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  link: { color: "#94a3b8", textAlign: "center", marginTop: 16 }
});