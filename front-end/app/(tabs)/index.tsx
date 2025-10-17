import { router } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import Button from "@/components/button";

export default function HomeScreen() {
  const [name, setName] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const handleSubmit = () => {
    console.log("Submitted", name);
    setShowWelcome(true);
  };
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      
      {/* Styled TouchableOpacity Button */}
      <Button title="Submit" onPress={handleSubmit} />
      
      {showWelcome && (
        <View>
          <Text style={styles.welcomeText}>Welcome {name}</Text>
        </View>
      )}
      
      {/* Secondary Button */}
      <TouchableOpacity 
        style={styles.secondaryButton} 
        onPress={() => router.push("/(tabs)/testing")}
      >
        <Text style={styles.secondaryButtonText}>Go to Testing</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "white",
    fontSize: 16,
  },
  
  secondaryButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 20,
    color: "#333",
    marginTop: 10,
    fontWeight: "500",
  },
});
