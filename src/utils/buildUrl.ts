export function buildRedirectUrl(analysisResults: {}) {
	if (!Array.isArray(analysisResults) || analysisResults.length === 0)
		return null;

	// Flatten all keyword arrays from each object
	const keywords = analysisResults
		.flatMap((result) => result.analysis || [])
		.map((keyword) => keyword.trim().toLowerCase())
		.filter(Boolean); // Remove empty values

	// Encode keywords as a comma-separated, URL-safe string
	const searchParam = encodeURIComponent(keywords.join(","));

	// Build final redirect URL
	const redirectUrl = `/music/?srp_page=1&srp_player_id=hpmplayer&srp_search=${searchParam}`;

	return redirectUrl;
}
