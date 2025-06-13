export const loginToWordPress = async (username: string, password: string) => {
	try {
		const response = await fetch(
			`https://${import.meta.env.VITE_WP_SITE}.com/wp-json/jwt-auth/v1/token`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			}
		);
		if (!response.ok) {
			throw new Error("Invalid credentials");
		}
		const data = await response.json(); // ✅ Save JWT to localStorage
		localStorage.setItem("wp_jwt_token", data.token);
		console.log("Logged in as:", data.user_display_name);
		return data;
	} catch (error) {
		console.error("Login failed:", error);
		throw error;
	}
};
