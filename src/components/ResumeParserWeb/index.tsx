"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ResumeParser } from '@/lib/parser';

export const ResumeParserWeb = () => {
  const [inputText, setInputText] = useState('');
  const [parsedJson, setParsedJson] = useState('');
  const [error, setError] = useState('');

  const handleParse = () => {
    try {
      const parser = new ResumeParser();
      const result = parser.parse(inputText);
      setParsedJson(JSON.stringify(result, null, 2));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while parsing');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Resume Parser</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Input Resume Text</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-96 p-4 border rounded-lg font-mono text-sm"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your resume text here..."
            />
            <button
              onClick={handleParse}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Generate JSON
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parsed JSON Output</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-500 mb-4">{error}</div>
            ) : null}
            <pre className="w-full h-96 p-4 bg-gray-50 border rounded-lg overflow-auto font-mono text-sm">
              {parsedJson || 'Parsed JSON will appear here...'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeParserWeb;