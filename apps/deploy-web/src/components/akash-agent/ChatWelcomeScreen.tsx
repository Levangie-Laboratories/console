/**
 * @fileoverview Welcome screen component for the Akash AI Agent chat interface
 * 
 * This component provides the initial welcome experience for users including:
 * - Hero section with animated agent branding
 * - Floating particle animations for visual appeal
 * - Quick deployment type previews
 * - Smooth transitions and entrance animations
 * 
 * 
 * @version 2.0.0
 * @since 2024-06-29
 */

"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@akashnetwork/ui/components';
import { User, Sparks, Code, CodeBrackets, Database, Cloud } from 'iconoir-react';

/**
 * ChatWelcomeScreen Props Interface
 * Props for the welcome screen component
 */
interface ChatWelcomeScreenProps {
  /** Callback when user clicks on a suggestion prompt */
  onSuggestionClick?: (suggestion: string) => void;
}

/**
 * ChatWelcomeScreen Component
 * 
 * Welcome screen displayed when users first open the Akash AI Agent interface.
 * Features a hero section with animated branding and quick deployment suggestions.
 * 
 * @param onSuggestionClick - Callback when user clicks a suggestion
 * 
 * @features
 * - Animated hero section with gradient branding
 * - Floating particle animations around agent icon
 * - Quick deployment type previews (web apps, APIs, databases, etc.)
 * - Staggered entrance animations for smooth experience
 * - Responsive layout for mobile and desktop
 * - Console design system integration
 * 
 * @example
 * ```tsx
 * <ChatWelcomeScreen 
 *   onSuggestionClick={(prompt) => handleUserMessage(prompt)}
 * />
 * ```
 */
export const ChatWelcomeScreen: React.FC<ChatWelcomeScreenProps> = ({ 
  onSuggestionClick 
}) => {
  const suggestions = [
    {
      icon: <CodeBrackets className="w-4 h-4" />,
      title: "Deploy a web application",
      description: "I want to deploy a Next.js app with a PostgreSQL database",
      prompt: "I want to deploy a Next.js application with a PostgreSQL database. The app should be scalable and include environment variables for database connection."
    },
    {
      icon: <Code className="w-4 h-4" />,
      title: "Create an API service", 
      description: "Help me deploy a RESTful API built with Node.js and Express",
      prompt: "Help me deploy a RESTful API built with Node.js and Express. I need it to connect to Redis for caching and expose port 3000."
    },
    {
      icon: <Database className="w-4 h-4" />,
      title: "Database deployment",
      description: "Set up a PostgreSQL database with persistent storage",
      prompt: "I need to deploy a PostgreSQL database with persistent storage and configure it for high availability."
    },
    {
      icon: <Sparks className="w-4 h-4" />,
      title: "AI/ML workload",
      description: "I need to deploy a machine learning model with GPU support",
      prompt: "I need to deploy a machine learning model inference service with GPU support and auto-scaling capabilities."
    },
    {
      icon: <Cloud className="w-4 h-4" />,
      title: "Microservices stack",
      description: "Deploy multiple connected services with load balancing",
      prompt: "Help me deploy a microservices architecture with a frontend, API gateway, user service, and payment service, all connected together."
    }
  ];

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion.prompt);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-3 text-center overflow-y-auto">
      {/* Hero section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-3"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.2, 
            type: "spring", 
            stiffness: 260, 
            damping: 20 
          }}
          className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 rounded-full flex items-center justify-center relative"
        >
          <User className="w-6 h-6 text-primary" />
          
          {/* Floating particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full"
              animate={{
                y: [-10, -20, -10],
                x: [0, 5, 0],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
              style={{
                top: `${20 + i * 10}%`,
                right: `${15 + i * 5}%`
              }}
            />
          ))}
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-semibold tracking-tight mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
        >
          Akash AI Agent
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-muted-foreground max-w-md leading-relaxed"
        >
          Describe your application and I'll help you generate the perfect SDL configuration for deployment on Akash Network.
        </motion.p>
      </motion.div>

      {/* Compact suggestions preview - just a hint */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-center mt-1"
      >
        <div className="flex items-center justify-center gap-1 mb-1">
          <Sparks className="w-3 h-3 text-primary" />
          <p className="text-xs text-muted-foreground">Try asking me about:</p>
        </div>
        <div className="flex flex-wrap justify-center gap-1 max-w-xs">
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="text-xs text-muted-foreground bg-muted/20 px-2 py-0.5 rounded-md"
            >
              {suggestion.title}
            </motion.span>
          ))}
        </div>
      </motion.div>

    </div>
  );
};