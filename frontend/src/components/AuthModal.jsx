const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  // Target the appropriate auth endpoint based on active mode state
  const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
  const payload = isLogin ? { email, password } : { name, email, password };

  try {
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      // If the backend throws a 401 or 400 error, halt progress and display it
      throw new Error(data.error || "Authentication failed.");
    }

    // 🔐 Success! Securely store the signed token in the browser's local cache
    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({ name: data.name, email: data.email }),
    );

    // Advance the authenticated user directly into the main workspace
    onLoginSuccess();
  } catch (err) {
    // Catch unregistered accounts or password mismatches and paint them onto the card UI
    setError(err.message || "Could not connect to the authentication server.");
  } finally {
    setLoading(false);
  }
};
