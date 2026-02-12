"use client";

import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-black p-8">
                    <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
                        <p className="text-gray-400 text-sm">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <Button
                            onClick={this.handleReset}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Reload Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
