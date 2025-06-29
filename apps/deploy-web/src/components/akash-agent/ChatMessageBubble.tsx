/**
 * @fileoverview Individual chat message bubble component with rich features
 * 
 * This component provides:
 * - Distinct user/agent message styling
 * - Copy functionality with visual feedback
 * - Status indicators and timestamps
 * - Agent action type indicators with emojis
 * - SDL preview integration
 * - Smooth animations and interactions
 * 
 * 
 * @version 2.0.0
 * @since 2024-06-29
 */

"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Badge } from '@akashnetwork/ui/components';
import { UserCircle, User, Copy, Check } from 'iconoir-react';
import { cn } from '@akashnetwork/ui/utils';

import { SDLPreviewCard } from './SDLPreviewCard';
import type { ChatMessageBubbleProps } from './types';

/**
 * ChatMessageBubble Component
 * 
 * Individual message bubble with rich features for user and agent messages.
 * Provides distinct styling, copy functionality, and SDL preview integration.
 * 
 * @param message - The chat message object to display
 * 
 * @features
 * - Distinct styling: User messages (right-aligned, muted background) vs Agent messages (left-aligned, card background)
 * - Copy functionality: Hover-to-reveal copy button with success feedback
 * - Status indicators: Sending, error, completed states with appropriate colors
 * - Action indicators: Agent actions shown with emoji icons and sequence numbers
 * - SDL preview: Inline SDL preview cards for deployment configurations
 * - Timestamps: Formatted time display with proper accessibility
 * - Animations: Smooth entrance/exit with staggered delays
 * - Accessibility: ARIA labels and semantic HTML structure
 * 
 * @example
 * ```tsx
 * <ChatMessageBubble message={chatMessage} />
 * ```
 */
export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.type === 'user';
  const isAgent = message.type === 'agent';
  
  const handleCopy = async () => {
    if (message.content) {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Animation variants for message entrance
  const messageVariants = {
    initial: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1 
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95 
    }
  };

  // Status indicators following console patterns
  const getStatusIndicator = () => {
    switch (message.status) {
      case 'sending':
        return (
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Sending</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
            <span className="text-xs text-destructive">Failed</span>
          </div>
        );
      case 'completed':
        return isAgent ? (
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-xs text-success">Done</span>
          </div>
        ) : null;
      default:
        return null;
    }
  };

  // Format action-based messages with emoji icons (console style)
  const getActionIcon = () => {
    switch (message.actionType) {
      case 'read_file':
        return '📖';
      case 'create_file':
      case 'modify_file':
        return '📝';
      case 'run_subprocess':
        return '⚡';
      case 'list_directory':
        return '📂';
      case 'search_project':
        return '🔍';
      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ 
        duration: 0.3, 
        ease: "easeOut",
        delay: message.sequenceIndex ? message.sequenceIndex * 0.02 : 0
      }}
      layout
      className={cn(
        "flex gap-3 px-4 py-2",
        isUser ? "justify-end" : "justify-start"
      )}
      role="article"
      aria-label={`${message.type} message at ${message.timestamp.toLocaleTimeString()}`}
    >
      {/* Agent avatar */}
      {isAgent && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
          <UserCircle className="h-4 w-4 text-primary" />
        </div>
      )}
      
      {/* Message content */}
      <div className={cn(
        "flex max-w-[85%] flex-col gap-1",
        isUser ? "items-end" : "items-start"
      )}>
        <Card className={cn(
          "relative group transition-all duration-200 hover:shadow-sm",
          isUser 
            ? "bg-muted border-muted-foreground/20 text-foreground" 
            : "bg-card border-border hover:bg-accent/30",
          message.status === 'error' && "border-destructive/50 bg-destructive/5 text-destructive-foreground"
        )}>
          <CardContent className="p-3">
            {/* Action indicator for agent messages */}
            {isAgent && getActionIcon() && (
              <div className="mb-2 flex items-center gap-2">
                <span className="text-base">{getActionIcon()}</span>
                <span className="text-xs font-medium text-muted-foreground capitalize">
                  {message.actionType?.replace('_', ' ')}
                </span>
                {message.sequenceIndex && (
                  <Badge variant="outline" className="h-4 text-xs px-1.5">
                    #{message.sequenceIndex}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Message text with copy functionality */}
            <div className="relative">
              <p className={cn(
                "text-sm leading-relaxed whitespace-pre-wrap break-words m-0",
                "text-foreground"
              )}>
                {message.content}
              </p>
              
              {/* Copy button - appears on hover */}
              {message.content && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className={cn(
                    "absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                    "flex h-5 w-5 items-center justify-center rounded text-xs",
                    isUser 
                      ? "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30" 
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Copy message"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </motion.button>
              )}
            </div>
            
            {/* SDL preview */}
            {message.sdl && (
              <div className="mt-3">
                <SDLPreviewCard 
                  sdl={message.sdl} 
                  className="border-0 bg-background/80 backdrop-blur-sm" 
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Message metadata - following console style */}
        <div className={cn(
          "flex items-center gap-2 px-1",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <time 
            dateTime={message.timestamp.toISOString()}
            className="text-xs text-muted-foreground"
          >
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </time>
          
          {getStatusIndicator()}
        </div>
      </div>
      
      {/* User avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary mt-1">
          <User className="h-4 w-4 text-secondary-foreground" />
        </div>
      )}
    </motion.div>
  );
};