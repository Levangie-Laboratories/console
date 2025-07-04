/**
 * @fileoverview SDL (Service Definition Language) preview card component
 * 
 * This component provides:
 * - Collapsible SDL code preview with syntax highlighting
 * - Copy-to-clipboard functionality with visual feedback
 * - SDL validation and deployment readiness checking
 * - Direct deployment integration with callback support
 * - Responsive design with proper code formatting
 * 
 * 
 * @version 2.0.0
 * @since 2024-06-29
 */

"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardFooter, Button } from '@akashnetwork/ui/components';
import { Code, Copy, OpenInWindow, Check, ArrowRight } from 'iconoir-react';
import { cn } from '@akashnetwork/ui/utils';

import type { SDLPreviewCardProps } from './types';

/**
 * SDLPreviewCard Component
 * 
 * Interactive preview card for SDL (Service Definition Language) configurations
 * generated by the Akash AI Agent. Provides validation, copying, and deployment features.
 * 
 * @param sdl - The SDL configuration string to preview
 * @param className - Additional CSS classes for styling customization
 * @param onUseSDL - Callback when user wants to deploy with this SDL
 * 
 * @features
 * - Code preview: Collapsible view showing first 6 lines with expand option
 * - Copy functionality: One-click copy to clipboard with success feedback
 * - SDL validation: Basic validation checking for required SDL structure
 * - Deployment ready: Direct integration with deployment flow when valid
 * - Visual feedback: Success/error states with appropriate styling
 * - Responsive design: Mobile-friendly code display with horizontal scroll
 * - Gradient overlays: Visual indication of collapsed content
 * - Line counting: Shows total lines in collapsed state
 * 
 * @example
 * ```tsx
 * <SDLPreviewCard 
 *   sdl={generatedSDL}
 *   onUseSDL={() => handleDeployment(sdl)}
 * />
 * ```
 */
export const SDLPreviewCard: React.FC<SDLPreviewCardProps> = ({ 
  sdl, 
  className = "",
  onUseSDL 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sdl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy SDL:', error);
    }
  };

  const lines = sdl.split('\n');
  const previewLines = lines.slice(0, 6);
  const hasMoreLines = lines.length > 6;

  // Basic SDL validation for better UX
  const isValidSDL = sdl.includes('services:') && (sdl.includes('deployment:') || sdl.includes('version:'));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className={cn(
        "border-primary/30 bg-gradient-to-br from-primary/5 via-primary/5 to-primary/10 backdrop-blur-sm",
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20">
                <Code className="h-3 w-3 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">SDL Configuration</span>
                {isValidSDL && (
                  <span className="text-xs text-success">✓ Valid SDL detected</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 w-7 p-0 hover:bg-primary/20"
                aria-label="Copy SDL to clipboard"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isCopied ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </motion.div>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="relative">
            <pre className={cn(
              "text-xs rounded-md p-3 overflow-x-auto border transition-all duration-200",
              "bg-background/50 border-border/50",
              "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border"
            )}>
              <code className="text-foreground font-mono">
                {isExpanded ? sdl : previewLines.join('\n')}
                {!isExpanded && hasMoreLines && (
                  <span className="text-muted-foreground">
                    {'\n'}...{' '}
                    <span className="text-xs">
                      ({lines.length - previewLines.length} more lines)
                    </span>
                  </span>
                )}
              </code>
            </pre>
            
            {/* Gradient overlay for collapsed view */}
            {!isExpanded && hasMoreLines && (
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background/50 to-transparent pointer-events-none rounded-b-md" />
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-3 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? 'Collapse' : `Show Full SDL (${lines.length} lines)`}
          </Button>
          
          {onUseSDL && isValidSDL && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="sm"
                onClick={onUseSDL}
                className="text-xs gap-1.5 bg-primary hover:bg-primary/90"
              >
                Deploy with SDL
                <ArrowRight className="h-3 w-3" />
              </Button>
            </motion.div>
          )}
          
          {onUseSDL && !isValidSDL && (
            <div className="text-xs text-muted-foreground">
              SDL validation required
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};