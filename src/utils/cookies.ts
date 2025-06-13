// cookieUtils.ts

export type CookieOptions = {
	path?: string;
	domain?: string;
	secure?: boolean;
	httpOnly?: boolean; // Not usable from JS, but kept for clarity
	sameSite?: "Strict" | "Lax" | "None";
	expires?: Date | number | string;
	maxAge?: number;
};

/**
 * Set a cookie
 */
export function setCookie(
	name: string,
	value: string,
	options: CookieOptions = {}
) {
	let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

	if (options.expires) {
		const expires =
			typeof options.expires === "number"
				? new Date(Date.now() + options.expires * 1000)
				: new Date(options.expires);
		cookie += `; Expires=${expires.toUTCString()}`;
	}

	if (options.maxAge !== undefined) {
		cookie += `; Max-Age=${options.maxAge}`;
	}

	if (options.path) {
		cookie += `; Path=${options.path}`;
	}

	if (options.domain) {
		cookie += `; Domain=${options.domain}`;
	}

	if (options.secure) {
		cookie += `; Secure`;
	}

	if (options.sameSite) {
		cookie += `; SameSite=${options.sameSite}`;
	}

	// Note: httpOnly cannot be set via JS — only from the server.

	document.cookie = cookie;
}

/**
 * Get a cookie by name
 */
export function getCookie(name: string): string | null {
	const match = document.cookie.match(
		new RegExp(`(?:^|; )${encodeURIComponent(name)}=([^;]*)`)
	);
	return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, path: string = "/") {
	setCookie(name, "", {
		path,
		expires: new Date(0),
	});
}

// add_action('wp_login', 'set_jwt_cookie_on_login', 10, 2);

// function set_jwt_cookie_on_login($user_login, $user) {
//     $token = JWTAuth::generate_token($user); // depends on your plugin or custom logic

//     setcookie('wp_jwt_token', $token, time() + 3600, '/', '.yourdomain.com', true, false);
// }
