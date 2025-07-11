import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { buildRedirectUrl } from "./utils/buildUrl";

type AnalysisResult = {
	filename: string;
	analysis: string[];
	error?: string;
};

const BASE_URL =
	import.meta.env.VITE_NODE_ENV === "development"
		? import.meta.env.VITE_LOCAL_URL
		: import.meta.env.VITE_API_URL;

const App = () => {
	const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
		useDropzone();
	const [uploading, setUploading] = useState(false);
	const [results, setResults] = useState<AnalysisResult[]>([]);
	const [jwt, setJwt] = useState<string>("");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchJWT = async () => {
			try {
				const res = await fetch(
					`https://${import.meta.env.VITE_WP_SITE}/wp-json/my-auth/v1/token`,
					{
						credentials: "include",
					}
				);
				const data = await res.json();
				if (data.token) {
					setJwt(data.token);
				} else {
					console.warn("No token returned");
					navigate("/my-account");
				}
			} catch (err) {
				console.error("Failed to fetch JWT:", err);
			}
		};

		fetchJWT();
	}, []);

	useEffect(() => {
		if (import.meta.env.VITE_NODE_ENV === "development") {
			console.log(import.meta.env.VITE_TEST_JWT);
			setJwt(import.meta.env.VITE_TEST_JWT);
		}
	}, []);

	useEffect(() => {
		if (results.length >= 1) {
			results.forEach((res) => {
				if (res.error) {
					throw new Error(res.error);
				}
			});
		}
	}, [results]);

	const handleUpload = async () => {
		if (acceptedFiles.length === 0) return;

		const formData = new FormData();
		acceptedFiles.forEach((file) => formData.append("videos", file));

		setUploading(true);
		setResults(
			acceptedFiles.map((file) => ({
				filename: file.name,
				analysis: [],
			}))
		);
		try {
			const response = await fetch(BASE_URL + "/api/v1/analyse", {
				method: "POST",
				body: formData,
				headers: {
					Authorization: jwt ? `Bearer ${jwt}` : "",
				},
				credentials: "include",
			});

			if (!response.body) {
				throw new Error("No response body available.");
			}
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					setUploading(false);
					break;
				}

				buffer += decoder.decode(value ?? new Uint8Array(), { stream: true });

				const lines = buffer.split("\n\n");
				buffer = lines.pop() ?? "";

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const json: AnalysisResult = JSON.parse(line.replace("data: ", ""));

						setResults((prev) =>
							prev.map((r) =>
								r.filename === json.filename
									? {
											...r,
											analysis: Array.isArray(json.analysis)
												? json.analysis
												: JSON.parse(json.analysis),
									  }
									: r
							)
						);
					}
				}
			}
			const redirectUrl = buildRedirectUrl(results);
			navigate(redirectUrl as string);
		} catch (err) {
			console.error("Streaming error:", err);
			setResults((prev) =>
				prev.map((r) => ({
					...r,
					analysis: [],
					error: "Analysis failed. Please try again.",
				}))
			);
		}
	};

	return (
		<div className="background flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
			<Card className="w-full max-w-md">
				<CardContent>
					<div
						{...getRootProps({
							className:
								"border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer",
						})}
					>
						<input {...getInputProps()} />
						{isDragActive ? (
							<p className="text-blue-500">Drop the files here ...</p>
						) : (
							<p className="text-gray-500">
								Drag & drop some files here, or click to select files
							</p>
						)}
					</div>

					{acceptedFiles.length > 0 && (
						<ul className="mt-4 space-y-2">
							{acceptedFiles.map((file, index) => (
								<li key={index} className="text-sm text-gray-700">
									{file.name}
								</li>
							))}
						</ul>
					)}

					<Button
						className="mt-4 w-full"
						onClick={handleUpload}
						disabled={uploading}
					>
						{uploading ? "Uploading..." : "Upload Files"}
					</Button>

					{results.map((result, i) => (
						<div key={i} className="mt-4 p-2 border rounded">
							<p className="font-semibold text-gray-700">{result.filename}</p>

							{result.error ? (
								<p className="text-red-500 text-sm mt-2">{result.error}</p>
							) : result.analysis.length === 0 ? (
								<div className="flex gap-2 mt-2">
									<span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
									<span className="text-sm text-gray-500">Analyzing...</span>
								</div>
							) : (
								<div className="flex flex-wrap gap-2 mt-2">
									{result.analysis.map((keyword, idx) => (
										<span
											key={idx}
											className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
										>
											{keyword}
										</span>
									))}
								</div>
							)}
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
};

export default App;
