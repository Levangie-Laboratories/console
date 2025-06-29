/**
 * @fileoverview Main modal wrapper for the Akash AI Agent chat interface
 * 
 * This component provides:
 * - Responsive modal sizing (mobile to ultrawide)
 * - Custom compact header with agent branding
 * - Auto-clear chat state on close
 * - Smooth animations and transitions
 * - SDL generation callback handling
 * 
 * 
 * @version 2.0.0
 * @since 2024-06-29
 */

"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Dialog, 
  DialogContent
} from '@akashnetwork/ui/components';
import { User } from 'iconoir-react';
import { useAtom } from 'jotai';

import { ChatInterface } from './ChatInterface';
import { clearChatAtom } from '@src/store/agentStore';
import type { AkashAgentModalProps } from './types';

/**
 * AkashAgentModal Component
 * 
 * Main modal wrapper that houses the complete Akash AI Agent chat interface.
 * Handles modal lifecycle, responsive sizing, and state management.
 * 
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback when modal is closed
 * @param onSDLGenerated - Callback when agent generates SDL for deployment
 * 
 * @features
 * - Responsive sizing: Mobile (95vw, max-2xl) → Desktop (90vw, max-3xl) → Large (max-4xl) → XL (max-5xl)
 * - Custom header: Fixed 40px height with agent branding and close button
 * - Auto-clear: Clears chat history when modal closes (300ms delay for smooth transition)
 * - Flexbox layout: Header + flexible content area
 * - Motion animations: Fade in/out with spring animations
 * 
 * @example
 * ```tsx
 * <AkashAgentModal 
 *   isOpen={showAgent}
 *   onClose={() => setShowAgent(false)}
 *   onSDLGenerated={(sdl, template) => handleSDL(sdl, template)}
 * />
 * ```
 */
export const AkashAgentModal: React.FC<AkashAgentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSDLGenerated 
}) => {
  const [, clearChat] = useAtom(clearChatAtom);

  // Clear chat when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to allow for smooth close animation
      const timer = setTimeout(() => {
        clearChat();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, clearChat]);

  // Handle SDL generation and keep modal open for user to see the result
  const handleSDLGenerated = (sdl: string, template: any) => {
    // Call the parent callback but don't close modal immediately
    // Let user see the SDL preview and choose to continue
    onSDLGenerated(sdl, template);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        hideCloseButton 
        className="max-h-[90vh] w-[95vw] max-w-2xl gap-0 overflow-hidden p-0 sm:h-[85vh] sm:w-[90vw] sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl flex flex-col"
      >
        {/* Custom header with close button */}
        <div className="sticky top-0 z-10 flex flex-row items-center justify-between border-b bg-popover px-3 h-10 flex-shrink-0">
          <div className="flex items-center gap-1">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.1 
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10"
            >
              <User className="h-3 w-3 text-primary" />
            </motion.div>
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent text-base font-medium">
              Akash AI Agent
            </span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none text-lg"
            aria-label="Close dialog"
          >
            ×
          </motion.button>
        </div>

        {/* Chat interface */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="h-full"
          >
            <ChatInterface 
              onSDLGenerated={handleSDLGenerated}
              onClose={onClose}
            />
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};