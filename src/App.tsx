import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

const App = () => {
	const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
		useDropzone();
	const [uploading, setUploading] = useState(false);

	const handleUpload = async () => {
		if (acceptedFiles.length === 0) return;

		const formData = new FormData();
		acceptedFiles.forEach((file) => formData.append("videos", file));

		console.log("formData" + formData);
		try {
			setUploading(true);
			const response = await axios.post(
				import.meta.env.VITE_API_URL + "/api/v1/analyse",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			console.log("Upload successful:", response.data);
		} catch (error) {
			console.error("Upload failed:", error);
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50">
			<Card className="w-96 p-4">
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
				</CardContent>
			</Card>
		</div>
	);
};

export default App;
