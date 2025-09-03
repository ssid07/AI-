'use client'

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, FileImage, X, Loader2 } from "lucide-react";

interface IdCardData {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  id_number?: string;
  license_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  issue_date?: string;
  expiration_date?: string;
  gender?: string;
  height?: string;
  weight?: string;
  eye_color?: string;
  document_type?: string;
  issuing_authority?: string;
  confidence: number;
}

interface IdCardResult {
  filename: string;
  parsed_data: IdCardData;
  confidence: number;
}

export default function DataParserPage() {
    // Text parsing state
    const [inputText, setInputText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<{
        confidence: number;
        original_input: string;
        parsed_data: Record<string, unknown>;
    } | null>(null);

    // ID card parsing state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [idCardResult, setIdCardResult] = useState<IdCardResult | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleParseData = async () => {
        if (inputText.trim() && !isProcessing) {
            setIsProcessing(true);
            try {
                console.log("Sending text to parse:", inputText.trim());
                const response = await fetch('http://localhost:8000/api/todos/classify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        input_text: inputText.trim()
                    })
                });
                
                console.log("Response status:", response.status);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Parsed result:", data);
                    setResult(data);
                    setInputText("");
                } else {
                    const errorText = await response.text();
                    console.error("API error:", response.status, errorText);
                    alert(`Error: ${response.status} - ${errorText}`);
                }
            } catch (error) {
                console.error("Error parsing data:", error);
                alert(`Network error: ${error}`);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleParseData();
        }
    };

    // ID card handling functions
    const handleFileSelect = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setIdCardResult(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setIdCardResult(null);
    };

    const processIdCard = async () => {
        if (!selectedFile) return;

        setIsProcessingImage(true);
        try {
            console.log("Processing file:", selectedFile.name, selectedFile.type, selectedFile.size);
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('http://localhost:8000/api/idcard/parse', {
                method: 'POST',
                body: formData,
            });

            console.log("ID card response status:", response.status);
            if (response.ok) {
                const data = await response.json();
                console.log("ID card result:", data);
                setIdCardResult(data);
            } else {
                const errorText = await response.text();
                console.error("ID card API error:", response.status, errorText);
                alert(`ID Card Error: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error("Error processing ID card:", error);
            alert(`ID Card Network Error: ${error}`);
        } finally {
            setIsProcessingImage(false);
        }
    };

    const formatFieldName = (key: string) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence > 0.8) return "bg-green-100 text-green-800";
        if (confidence > 0.6) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">AI Data Parser</h1>
                <p className="text-gray-600 mb-4">
                    Parse unstructured text or upload ID cards to extract structured information using AI.
                </p>
            </div>

            {/* Text Parser Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Text Parser</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Enter Text to Parse</CardTitle>
                        <CardDescription>
                            Enter any unstructured text containing personal information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full items-center space-x-2 mb-4">
                            <input
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Example: Lewis Hamilton lives at 2944 Monaco dr, Manchester, Colorado, USA, 92223. Phone: 893-366-8888"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isProcessing}
                            />
                            <Button 
                                onClick={handleParseData} 
                                disabled={!inputText.trim() || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Parsing...
                                    </>
                                ) : (
                                    'Parse Text'
                                )}
                            </Button>
                        </div>

                        {result && (
                            <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Parsed Data</h3>
                                    <Badge className={getConfidenceColor(result.confidence)}>
                                        {Math.round(result.confidence * 100)}% confidence
                                    </Badge>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-4 italic">
                                    Original: &ldquo;{result.original_input}&rdquo;
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.parsed_data && Object.entries(result.parsed_data).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-gray-700 capitalize">
                                                {key.replace('_', ' ')}:
                                            </span>
                                            <span className="text-gray-900 font-mono text-sm">
                                                {String(value) || "—"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ID Card Parser Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">ID Card Parser</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Upload Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Upload ID Card
                            </CardTitle>
                            <CardDescription>
                                Drag and drop an image or click to select. Supports ID cards, driver&apos;s licenses, and passports.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                    dragOver
                                        ? 'border-blue-500 bg-blue-50'
                                        : selectedFile
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                {previewUrl ? (
                                    <div className="space-y-4">
                                        <div className="relative inline-block">
                                            <Image
                                                src={previewUrl}
                                                alt="ID Card Preview"
                                                width={300}
                                                height={192}
                                                className="max-w-full max-h-48 rounded-lg shadow-md object-contain"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                                                onClick={clearFile}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                                    </div>
                                ) : (
                                    <>
                                        <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="mt-4">
                                            <p className="text-lg font-medium">Drop your ID card here</p>
                                            <p className="text-gray-500 mb-4">or</p>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => document.getElementById('file-upload')?.click()}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Choose File
                                            </Button>
                                        </div>
                                    </>
                                )}

                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                            </div>

                            {selectedFile && (
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        onClick={processIdCard}
                                        disabled={isProcessingImage}
                                        className="flex-1"
                                    >
                                        {isProcessingImage ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Parse ID Card'
                                        )}
                                    </Button>
                                    <Button variant="outline" onClick={clearFile}>
                                        Clear
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Results Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Extracted Information</CardTitle>
                            <CardDescription>
                                ID card data will appear here after processing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {idCardResult ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge className={getConfidenceColor(idCardResult.confidence)}>
                                            {Math.round(idCardResult.confidence * 100)}% confidence
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Parsed from: {idCardResult.filename}
                                    </p>
                                    <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                                        {Object.entries(idCardResult.parsed_data).map(([key, value]) => {
                                            if (key === 'confidence' || !value) return null;
                                            
                                            return (
                                                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <span className="font-medium text-gray-700">
                                                        {formatFieldName(key)}
                                                    </span>
                                                    <span className="text-gray-900 font-mono text-sm">
                                                        {String(value)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-12">
                                    <FileImage className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                                    <p>Upload and process an ID card to see extracted information here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}