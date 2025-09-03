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

export default function IdCardPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<IdCardResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
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
    setResult(null);
  };

  const processIdCard = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/api/idcard/parse', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        console.error("API error:", response.statusText);
      }
    } catch (error) {
      console.error("Error processing ID card:", error);
    } finally {
      setIsProcessing(false);
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
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ID Card Parser</h1>
        <p className="text-gray-600 mb-4">
          Upload an image of your ID card, driver&apos;s license, or passport to extract structured information using AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload ID Card
              </CardTitle>
              <CardDescription>
                Drag and drop an image or click to select. Supported formats: JPEG, PNG, WebP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
                  <div className="space-y-4">
                    <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">Drop your ID card here</p>
                      <p className="text-gray-500">or click to browse files</p>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {selectedFile && (
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={processIdCard}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
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
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {result ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Extracted Information</CardTitle>
                  <Badge className={getConfidenceColor(result.confidence)}>
                    {Math.round(result.confidence * 100)}% confidence
                  </Badge>
                </div>
                <CardDescription>
                  Parsed from: {result.filename}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(result.parsed_data).map(([key, value]) => {
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
              </CardContent>
            </Card>
          ) : (
            <Card className="h-fit">
              <CardContent className="pt-6">
                <div className="text-center text-gray-500 py-12">
                  <FileImage className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                  <p>Upload and process an ID card to see extracted information here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}