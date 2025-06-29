/**
 * @fileoverview Animated typing indicator for agent processing states
 * 
 * This component provides:
 * - Rich animated typing indicator with agent branding
 * - Dynamic activity messages that cycle through different phases
 * - Multiple animation layers (pulse rings, bouncing dots, rotating icons)
 * - Progress indication with sliding bar animation
 * - Professional appearance matching console design system
 * 
 * 
 * @version 2.0.0
 * @since 2024-06-29
 */

"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@akashnetwork/ui/components';
import { UserCircle, Cpu } from 'iconoir-react';

/**
 * TypingIndicator Component
 * 
 * Advanced typing indicator that shows when the Akash AI Agent is processing user requests.
 * Features multiple animation layers and dynamic activity messaging for engaging user experience.
 * 
 * @features
 * - Agent avatar: Branded agent icon with pulsing ring animations
 * - Dynamic activities: Cycling through 5 different processing messages every 2 seconds
 * - Bouncing dots: Classic 3-dot typing animation with staggered timing
 * - Rotating CPU icon: Spinning processor icon to indicate active computation
 * - Progress bar: Sliding progress indicator with smooth back-and-forth motion
 * - Gradient styling: Subtle primary color gradient background
 * - Smooth transitions: Enter/exit animations with opacity and transform
 * 
 * @example
 * ```tsx
 * {isAgentTyping && <TypingIndicator />}
 * ```
 */
export const TypingIndicator: React.FC = () => {
  const activities = [
    "Analyzing your requirements...",
    "Generating SDL configuration...",
    "Optimizing resource allocation...",
    "Configuring deployment settings...",
    "Finalizing your solution..."
  ];

  const [currentActivity, setCurrentActivity] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity(prev => (prev + 1) % activities.length);
    }, 2000); // Change activity every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="p-4">
            <div className="flex items-center gap-3">
              {/* Agent avatar with pulse animation */}
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <UserCircle className="h-4 w-4 text-primary" />
                </div>
                
                {/* Pulse rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/20"
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </div>
              
              <div className="flex-1">
                {/* Main status */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 w-1.5 bg-primary rounded-full"
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Akash Agent is working
                  </span>
                </div>
                
                {/* Dynamic activity */}
                <motion.div
                  key={currentActivity}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Cpu className="h-3 w-3" />
                  </motion.div>
                  <span>{activities[currentActivity]}</span>
                </motion.div>
              </div>
              
              {/* Progress indicator */}
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-8 h-1 bg-primary/20 rounded-full overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ x: [-32, 32] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      repeatType: "reverse"
                    }}
                    style={{ width: '50%' }}
                  />
                </motion.div>
                <span className="text-xs text-muted-foreground mt-1">
                  Processing
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};