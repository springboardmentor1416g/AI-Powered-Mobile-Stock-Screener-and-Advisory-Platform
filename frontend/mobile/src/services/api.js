import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveAuthToken(token) {
  await AsyncStorage.setItem("auth_token", token);
}

export async function getAuthToken() {
  return await AsyncStorage.getItem("auth_token");
}

export async function runScreener(query) {
  const response = await fetch(
    "http://192.168.1.4:8080/screener/run",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to run screener");
  }

  return response.json();
}

export async function getNotifications() {
  const token = await getAuthToken(); // same helper you already use

  const res = await fetch("http://192.168.1.4:8080/api/v1/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return res.json();
}

export async function autoLogin() {
  const res = await fetch("http://192.168.1.4:8080/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "user1@test.com",
      password: "password123",
    }),
  });

  const data = await res.json();

  if (data.token) {
    await saveAuthToken(data.token);
  } else {
    throw new Error("Auto login failed");
  }
}
