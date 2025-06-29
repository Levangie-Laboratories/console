# Akash Agent Integration Plan

## Overview

This document provides a comprehensive plan for integrating the Akash Agent UI components into the main Akash Console platform. The integration focuses on adding AI-powered deployment assistance while maintaining the console's native design system and user experience.

## Executive Summary

### Integration Goals
- Add AI-powered deployment assistance to the console
- Maintain native console design consistency
- Provide seamless user experience
- Enable natural language SDL generation
- Position as primary deployment option

### Key Components to Integrate
1. **AkashAgentBox** - Compact deployment option button
2. **ChatInterface** - Full AI conversation interface
3. **Supporting Infrastructure** - State management, API integration

---

## 1. Target Integration Points

### Primary Integration: New Deployment Page

**Target File:** `apps/deploy-web/src/components/new-deployment/NewDeploymentContainer.tsx`

**Current Structure:**
```typescript
// Existing deployment flow structure
src/components/new-deployment/
├── NewDeploymentContainer.tsx     # Main orchestrator
├── TemplateList.tsx              # Template selection
├── ManifestEdit.tsx              # SDL editing interface
├── SdlBuilder.tsx                # Visual form builder
└── Stepper.tsx                   # Progress indicator
```

**Integration Point:** Add Akash Agent as the first option in the deployment selection grid, positioned above existing deployment methods.

### Secondary Integration: Global Chat Access

**Target Location:** Global header or floating action button for console-wide access to the Akash Agent.

---

## 2. Component Integration Details

### 2.1 AkashAgentBox Component

**Purpose:** Compact deployment option that opens the AI chat interface

**Target Integration Location:**
```typescript
// File: apps/deploy-web/src/components/new-deployment/NewDeploymentContainer.tsx
// Add as first option in deployment grid

<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
  {/* NEW: Akash Agent Option - Full width, prominent placement */}
  <div className="col-span-4 mb-4">
    <AkashAgentBox onClick={handleAkashAgentClick} />
  </div>
  
  {/* Existing deployment options */}
  <DeploymentOptionCard title="Build & Deploy" ... />
  <DeploymentOptionCard title="Launch Container-VM" ... />
  {/* ... other options */}
</div>
```

**Required Adaptations:**

1. **Design System Integration:**
```typescript
// Replace prototype UI components with console components
import { Card, CardContent } from "@/components/ui/card"  // Remove
import { Card, CardContent } from "@akashnetwork/ui/components"  // Add

// Use console design tokens
className="bg-gradient-to-r from-primary/5 to-secondary/5"  // Replace with console colors
className="bg-gradient-to-r from-akash-red/5 to-akash-orange/5"  // Console brand colors
```

2. **Icon Integration:**
```typescript
// Replace Lucide icons with console icon system
import { Bot } from "lucide-react"  // Remove
import { AkashIcon } from "@akashnetwork/ui/icons"  // Add console icons
```

3. **Styling Consistency:**
```typescript
// Ensure hover effects match console patterns
className="console-hover transition-all duration-200 hover:shadow-md"
// Use console-specific hover classes and animations
```

### 2.2 ChatInterface Component

**Purpose:** Full AI conversation interface for deployment assistance

**Target Integration Location:**
```typescript
// File: apps/deploy-web/src/components/new-deployment/AkashAgentModal.tsx (new file)
// Or integrate into existing modal system

// Use console's existing Dialog/Modal components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@akashnetwork/ui/components"
```

**Required Adaptations:**

1. **State Management Integration:**
```typescript
// Integrate with console's state management (Jotai)
import { useAtom } from 'jotai'
import { sdlAtom, deploymentStateAtom } from '@/store/deployment'

// Connect chat responses to SDL generation
const [sdl, setSdl] = useAtom(sdlAtom)
const handleAIResponse = (generatedSDL: string) => {
  setSdl(generatedSDL)
  // Navigate to SDL editor with pre-filled content
}
```

2. **API Integration:**
```typescript
// Replace mock responses with real AI API calls
const handleSend = async () => {
  const response = await fetch('/api/akash-agent/chat', {
    method: 'POST',
    body: JSON.stringify({ message: input, context: deploymentContext })
  })
  const aiResponse = await response.json()
  // Handle real AI responses
}
```

3. **SDL Integration:**
```typescript
// Add SDL preview and direct deployment capabilities
const handleDeployFromChat = (sdl: string) => {
  setSdl(sdl)
  // Navigate to deployment confirmation step
  router.push('/new-deployment/review')
}
```

---

## 3. File Structure Integration

### 3.1 New Files to Create

```
apps/deploy-web/src/components/akash-agent/
├── AkashAgentBox.tsx              # Deployment option component
├── ChatInterface.tsx              # Main chat interface
├── AkashAgentModal.tsx            # Modal wrapper for chat
├── MessageBubble.tsx              # Individual message component
├── SDLPreview.tsx                 # SDL code preview component
└── index.ts                       # Export barrel
```

### 3.2 Files to Modify

**Primary Integration Points:**

1. **`apps/deploy-web/src/components/new-deployment/NewDeploymentContainer.tsx`**
   - Add AkashAgentBox to deployment options
   - Add modal state management
   - Handle agent-to-SDL workflow

2. **`apps/deploy-web/src/components/new-deployment/ManifestEdit.tsx`**
   - Add "Generated by AI" indicator for AI-created SDLs
   - Add option to "Ask AI for help" button

3. **`apps/deploy-web/src/store/deployment.ts`** (if using Jotai)
   - Add agent conversation state
   - Add AI-generated SDL tracking

4. **`apps/deploy-web/src/pages/api/akash-agent/`** (new API routes)
   - Chat endpoint for AI conversations
   - SDL generation endpoint
   - Context management

### 3.3 Dependencies to Add

```json
// package.json additions
{
  "dependencies": {
    "framer-motion": "^10.x.x",     // For chat animations
    "@ai-sdk/openai": "^x.x.x",    // AI integration
    "zod": "^3.x.x"                 // Schema validation
  }
}
```

---

## 4. Console Platform Component References

### 4.1 Existing Console Components to Leverage

**UI Components:**
```typescript
// From @akashnetwork/ui/components
import {
  Button,           // Use for send button, action buttons
  Card,            // Use for message bubbles, agent box
  Dialog,          // Use for chat modal
  Input,           // Use for chat input
  Badge,           // Use for status indicators
  Spinner,         // Use for loading states
  Alert,           // Use for error messages
  Tooltip          // Use for help text
} from '@akashnetwork/ui/components'
```

**Layout Components:**
```typescript
// From console layout system
import {
  PageContainer,   // Use for consistent page layout
  Section,         // Use for content sections
  Grid,            // Use for responsive layouts
  Flex             // Use for flexible layouts
} from '@/components/layout'
```

**Deployment-Specific Components:**
```typescript
// From existing deployment flow
import {
  DeploymentCard,      // Reference for consistent card styling
  SDLEditor,           // Integrate with AI-generated SDL
  ProviderSelector,    // Use after AI generates deployment
  DeploymentStepper    // Show progress through AI-assisted flow
} from '@/components/new-deployment'
```

### 4.2 Console Design System Integration

**Color Scheme:**
```css
/* Use console brand colors */
:root {
  --akash-red: #FF414D;
  --akash-orange: #FF8A00;
  --akash-dark: #1A1A1A;
  --akash-gray: #6B7280;
}

/* Apply to agent components */
.akash-agent-primary {
  background: linear-gradient(135deg, var(--akash-red), var(--akash-orange));
}
```

**Typography:**
```css
/* Use console typography system */
.akash-agent-title {
  font-family: var(--font-inter);  /* Console primary font */
  font-weight: 600;
  font-size: 1.125rem;
}
```

**Spacing and Layout:**
```css
/* Use console spacing tokens */
.akash-agent-container {
  padding: var(--spacing-6);  /* Console spacing system */
  gap: var(--spacing-4);
}
```

---

## 5. Implementation Phases

### Phase 1: Core Integration (Week 1-2)

**Objectives:**
- Integrate AkashAgentBox into new deployment page
- Set up basic chat modal functionality
- Implement console design system

**Tasks:**
1. Create `AkashAgentBox` component with console styling
2. Create `AkashAgentModal` wrapper component
3. Integrate into `NewDeploymentContainer`
4. Set up basic state management
5. Implement console design tokens

**Success Criteria:**
- Agent box appears on deployment page
- Clicking opens chat modal
- Modal matches console design
- Basic chat interface functional

### Phase 2: AI Integration (Week 3-4)

**Objectives:**
- Connect to AI backend services
- Implement SDL generation
- Add conversation context management

**Tasks:**
1. Set up AI API endpoints
2. Implement conversation state management
3. Add SDL generation and preview
4. Integrate with existing SDL editor
5. Add error handling and loading states

**Success Criteria:**
- AI responds to user queries
- Generated SDL appears in editor
- Conversation context maintained
- Error states handled gracefully

### Phase 3: Advanced Features (Week 5-6)

**Objectives:**
- Add deployment workflow integration
- Implement advanced chat features
- Add analytics and monitoring

**Tasks:**
1. Direct deployment from chat
2. SDL editing suggestions
3. Conversation history
4. Usage analytics
5. Performance optimization

**Success Criteria:**
- Complete deployment workflow through agent
- Advanced chat features working
- Analytics tracking implemented
- Performance meets standards

### Phase 4: Polish and Launch (Week 7-8)

**Objectives:**
- Final testing and bug fixes
- Documentation and training
- Gradual rollout

**Tasks:**
1. Comprehensive testing
2. User acceptance testing
3. Documentation updates
4. Team training
5. Gradual feature rollout

**Success Criteria:**
- All tests passing
- Documentation complete
- Team trained
- Feature successfully launched

---

## 6. Technical Considerations

### 6.1 Performance Optimization

**Code Splitting:**
```typescript
// Lazy load chat interface to reduce initial bundle size
const ChatInterface = lazy(() => import('./ChatInterface'))

// Use React.Suspense for loading states
<Suspense fallback={<ChatLoadingSkeleton />}>
  <ChatInterface />
</Suspense>
```

**Memory Management:**
```typescript
// Limit conversation history to prevent memory issues
const MAX_MESSAGES = 50
const [messages, setMessages] = useState<Message[]>([])

// Clean up old messages
const addMessage = (message: Message) => {
  setMessages(prev => {
    const updated = [...prev, message]
    return updated.length > MAX_MESSAGES 
      ? updated.slice(-MAX_MESSAGES) 
      : updated
  })
}
```

### 6.2 Accessibility

**Keyboard Navigation:**
```typescript
// Ensure chat interface is fully keyboard accessible
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeChatModal()
  }
  if (e.key === 'Enter' && e.ctrlKey) {
    sendMessage()
  }
}
```

**Screen Reader Support:**
```typescript
// Add proper ARIA labels and roles
<div 
  role="log" 
  aria-live="polite" 
  aria-label="Chat conversation"
>
  {messages.map(message => (
    <div 
      key={message.id}
      role="article"
      aria-label={`${message.type} message`}
    >
      {message.content}
    </div>
  ))}
</div>
```

### 6.3 Error Handling

**API Error Handling:**
```typescript
const handleAIRequest = async (message: string) => {
  try {
    const response = await aiService.chat(message)
    return response
  } catch (error) {
    if (error instanceof NetworkError) {
      showError('Network connection failed. Please try again.')
    } else if (error instanceof RateLimitError) {
      showError('Too many requests. Please wait a moment.')
    } else {
      showError('Something went wrong. Please try again.')
    }
    throw error
  }
}
```

**Graceful Degradation:**
```typescript
// Provide fallback when AI is unavailable
const AkashAgentBox = ({ onClick }: Props) => {
  const isAIAvailable = useAIStatus()
  
  if (!isAIAvailable) {
    return (
      <Card className="opacity-50">
        <CardContent>
          <span>AI Assistant temporarily unavailable</span>
          <Button onClick={() => router.push('/new-deployment/manual')}>
            Continue with manual deployment
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  return <AkashAgentBoxContent onClick={onClick} />
}
```

---

## 7. Integration Checklist

### Pre-Integration Setup
- [ ] Review console codebase structure
- [ ] Set up development environment
- [ ] Install required dependencies
- [ ] Configure AI service credentials
- [ ] Set up testing framework

### Component Integration
- [ ] Create AkashAgentBox component
- [ ] Create ChatInterface component
- [ ] Create AkashAgentModal wrapper
- [ ] Integrate with NewDeploymentContainer
- [ ] Apply console design system
- [ ] Add proper TypeScript types

### Functionality Integration
- [ ] Set up state management
- [ ] Implement AI API integration
- [ ] Add SDL generation logic
- [ ] Connect to deployment workflow
- [ ] Add error handling
- [ ] Implement loading states

### Testing and Quality Assurance
- [ ] Unit tests for all components
- [ ] Integration tests for AI workflow
- [ ] End-to-end tests for deployment flow
- [ ] Accessibility testing
- [ ] Performance testing
- [ ] Cross-browser testing

### Documentation and Deployment
- [ ] Update component documentation
- [ ] Create user guides
- [ ] Set up monitoring and analytics
- [ ] Configure feature flags
- [ ] Plan gradual rollout strategy

---

## 8. Success Metrics

### User Engagement
- **Agent Usage Rate**: % of deployments that start with Akash Agent
- **Conversation Completion**: % of agent conversations that result in deployment
- **User Satisfaction**: Rating of agent assistance quality
- **Time to Deploy**: Average time from agent conversation to successful deployment

### Technical Performance
- **Response Time**: Average AI response time (<2 seconds target)
- **Error Rate**: % of failed AI requests (<1% target)
- **Conversion Rate**: % of agent-generated SDLs that deploy successfully
- **Page Load Impact**: Bundle size increase (<10% target)

### Business Impact
- **Deployment Success Rate**: % increase in successful deployments
- **User Onboarding**: % improvement in new user deployment completion
- **Support Ticket Reduction**: % decrease in deployment-related support requests
- **Feature Adoption**: % of active users who try the agent feature

---

## 9. Risk Mitigation

### Technical Risks

**Risk**: AI service downtime affects deployment flow
**Mitigation**: Implement graceful degradation with manual deployment fallback

**Risk**: Generated SDL contains errors
**Mitigation**: Add SDL validation and preview before deployment

**Risk**: Performance impact on console
**Mitigation**: Lazy loading, code splitting, and performance monitoring

### User Experience Risks

**Risk**: Users confused by AI interface
**Mitigation**: Clear onboarding, help text, and fallback to familiar UI

**Risk**: AI responses are unhelpful
**Mitigation**: Continuous training, feedback collection, and human fallback

### Business Risks

**Risk**: Low adoption of new feature
**Mitigation**: User research, A/B testing, and iterative improvements

**Risk**: Increased support burden
**Mitigation**: Comprehensive documentation and proactive error handling

---

## 10. Conclusion

The Akash Agent integration represents a significant enhancement to the console's deployment experience. By following this comprehensive plan, the integration will:

1. **Maintain Design Consistency**: Using console design system and components
2. **Enhance User Experience**: Providing AI-powered deployment assistance
3. **Ensure Technical Quality**: Following best practices for performance and reliability
4. **Enable Gradual Adoption**: Allowing users to choose between AI and manual flows

The phased implementation approach ensures manageable development cycles while maintaining system stability. Success metrics and risk mitigation strategies provide clear guidance for measuring and ensuring the integration's success.

**Next Steps:**
1. Review and approve this integration plan
2. Set up development environment and dependencies
3. Begin Phase 1 implementation
4. Establish regular review checkpoints
5. Plan user testing and feedback collection

This integration will position Akash Console as a leader in AI-powered cloud deployment tools while maintaining the reliability and user experience that users expect.

---

## 11. Detailed UI Component Integration Analysis

*Based on comprehensive codebase analysis conducted January 2025*

### 11.1 Console Component Foundation Assessment

**Analysis Summary:**
After deep examination of the Akash Console codebase, the following key findings support the agent integration:

✅ **No Existing Chat Patterns** - This is a completely new interaction paradigm for the console
✅ **Rich UI Component Library** - All necessary building blocks exist in `packages/ui/components/`
✅ **Clear Integration Point** - `TemplateList.tsx` deployment options grid (lines 102-137)
✅ **Established Patterns** - Consistent state management, form handling, and design system
✅ **Design System Ready** - Native console theming and component APIs

### 11.2 Existing UI Components for Chat Interface

**Core Components from `packages/ui/components/`:**

#### **Modal/Dialog Infrastructure:**
```typescript
// Essential for chat modal
import { 
  Dialog,           // Main chat modal wrapper
  DialogContent,    // Modal content container
  DialogHeader,     // Modal header with title
  Drawer           // Mobile-friendly chat drawer
} from "@akashnetwork/ui/components";
```

#### **Message Display Components:**
```typescript
// Perfect for chat bubbles and containers
import {
  Card,            // Message bubble containers
  CardContent,     // Message content wrapper
  Avatar,          // User/agent profile images
  Badge,           // Status indicators (sent, delivered, error)
  ScrollArea       // Chat message history with custom scrollbars
} from "@akashnetwork/ui/components";
```

#### **Input and Interaction Components:**
```typescript
// Established input patterns
import {
  Textarea,        // Auto-resize chat input (built-in)
  Button,          // Action buttons with 7 variants
  LoadingButton,   // Send button with loading states
  Spinner,         // Loading indicators
  Progress         // Operation progress bars
} from "@akashnetwork/ui/components";
```

#### **Notification System:**
```typescript
// For chat feedback and alerts
import {
  Toast,           // Success/error notifications
  Toaster,         // Toast container management
  Popup            // Confirmations and prompts
} from "@akashnetwork/ui/components";
```

### 11.3 Deployment Workflow Integration Points

**Analysis of `TemplateList.tsx` (Primary Integration Point):**

**Current Structure (lines 102-137):**
```typescript
<div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
  <div className="col-span-3 grid grid-cols-1 gap-4 md:col-span-1">
    {/* Existing deployment options using DeployOptionBox */}
    <DeployOptionBox title="Build & Deploy" ... />
    <DeployOptionBox title="Launch Container-VM" ... />
    <DeployOptionBox title="Run Custom Container" ... />
    <FileButton>Upload your SDL</FileButton>
  </div>
  <Card className="col-span-3">
    {/* Template explorer */}
  </Card>
</div>
```

**Agent Integration Strategy:**
```typescript
// Add Akash Agent as first option
<DeployOptionBox
  title="Akash Agent"
  description="Deploy with AI assistance - describe your app and let the agent generate the SDL"
  topIcons={[
    { light: "/images/ai-bot-light.svg", dark: "/images/ai-bot-dark.svg" },
    { light: "/images/chat-bubble-light.svg", dark: "/images/chat-bubble-dark.svg" }
  ]}
  bottomIcons={[
    "/images/docker-logo.png",
    { light: "/images/kubernetes-light.svg", dark: "/images/kubernetes-dark.svg" }
  ]}
  onClick={handleAkashAgentClick}
  testId="akash-agent-card"
/>
```

### 11.4 Comprehensive Component Architecture

**New Chat Components Structure:**
```
apps/deploy-web/src/components/akash-agent/
├── index.ts                        # Export barrel
├── AkashAgentModal.tsx              # Main modal wrapper (Dialog)
├── ChatInterface.tsx                # Core chat container
├── ChatMessageList.tsx              # Message history (ScrollArea)
├── ChatMessageBubble.tsx            # Individual messages (Card)
├── ChatInput.tsx                    # Input area (Textarea + LoadingButton)
├── TypingIndicator.tsx              # AI thinking animation
├── SDLPreviewCard.tsx               # Generated SDL preview
├── ChatWelcomeScreen.tsx            # Empty state
└── hooks/
    ├── useChatState.ts              # Jotai state management
    ├── useAIAgent.ts                # API integration
    └── useSDLGeneration.ts          # SDL handling
```

### 11.5 State Management Integration (Jotai Patterns)

**Following Console's Established Patterns:**
```typescript
// File: apps/deploy-web/src/store/agentStore.ts
import { atom } from 'jotai';

// Chat state atoms (following sdlStore.ts pattern)
export const chatMessagesAtom = atom<ChatMessage[]>([]);
export const chatInputAtom = atom<string>('');
export const isAgentTypingAtom = atom<boolean>(false);
export const currentConversationAtom = atom<string | null>(null);

// SDL generation state
export const generatedSDLAtom = atom<string | null>(null);
export const agentTemplateAtom = atom<TemplateCreation | null>(null);

// Modal state
export const isAgentModalOpenAtom = atom<boolean>(false);

// Derived atoms
export const hasMessagesAtom = atom((get) => get(chatMessagesAtom).length > 0);
export const canSendMessageAtom = atom((get) => {
  const input = get(chatInputAtom);
  const isTyping = get(isAgentTypingAtom);
  return input.trim().length > 0 && !isTyping;
});
```

### 11.6 Chat Interface Implementation Details

#### **AkashAgentModal - Main Container**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@akashnetwork/ui/components";

interface AkashAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSDLGenerated: (sdl: string, template: TemplateCreation) => void;
}

export const AkashAgentModal = ({ isOpen, onClose, onSDLGenerated }: AkashAgentModalProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl h-[80vh] md:h-[600px] p-0 overflow-hidden">
      <DialogHeader className="px-6 py-4 border-b">
        <DialogTitle className="flex items-center gap-2">
          <AkashAgentIcon className="w-6 h-6" />
          Akash AI Agent
        </DialogTitle>
      </DialogHeader>
      <ChatInterface onSDLGenerated={onSDLGenerated} />
    </DialogContent>
  </Dialog>
);
```

#### **ChatMessageBubble - Message Display**
```typescript
import { Card, CardContent, Avatar, Badge } from "@akashnetwork/ui/components";
import { motion } from 'framer-motion';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  sdl?: string;
}

export const ChatMessageBubble = ({ message }: { message: ChatMessage }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
  >
    {message.type === 'agent' && (
      <Avatar className="w-8 h-8 bg-primary">
        <AkashAgentIcon className="w-5 h-5" />
      </Avatar>
    )}
    
    <Card className={`max-w-[75%] ${
      message.type === 'user' 
        ? 'bg-primary text-primary-foreground' 
        : 'bg-card border-border'
    }`}>
      <CardContent className="p-3">
        <p className="text-sm leading-relaxed">{message.content}</p>
        
        {/* SDL preview integration */}
        {message.sdl && (
          <SDLPreviewCard sdl={message.sdl} className="mt-3" />
        )}
        
        {/* Status indicators */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </span>
          {message.status && (
            <Badge variant="outline" className="text-xs">
              {message.status}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
    
    {message.type === 'user' && (
      <Avatar className="w-8 h-8 bg-secondary">
        <UserIcon className="w-5 h-5" />
      </Avatar>
    )}
  </motion.div>
);
```

#### **ChatInput - Input Interface with Agent Integration**
```typescript
import { Textarea, LoadingButton } from "@akashnetwork/ui/components";
import { Send, Stop } from "iconoir-react";
import { useAtom } from 'jotai';
import { useAkashAgent } from '@/hooks/useAkashAgent';

interface ChatInputProps {
  onStreamingMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onStreamingMessage, disabled }: ChatInputProps) => {
  const [input, setInput] = useAtom(chatInputAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [canSend] = useAtom(canSendMessageAtom);
  const { sendStreamingMessage } = useAkashAgent();

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!canSend || !input.trim() || disabled) return;
    
    const messageToSend = input.trim();
    setInput(''); // Clear input immediately for better UX
    setIsLoading(true);
    
    try {
      await onStreamingMessage(messageToSend);
    } catch (error) {
      // Error is handled in useAkashAgent hook
      console.error('Failed to send message:', error);
      // Restore message on error
      setInput(messageToSend);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    // TODO: Implement agent stop functionality
    setIsLoading(false);
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled 
                ? "Agent is processing..." 
                : "Describe your application or ask for deployment help..."
            }
            className="min-h-[44px] max-h-32 resize-none border-input"
            disabled={disabled || isLoading}
            autoFocus
          />
        </div>
        
        {isLoading ? (
          <LoadingButton
            onClick={handleStop}
            loading={false}
            size="icon"
            className="h-11 w-11 shrink-0"
            variant="destructive"
          >
            <Stop className="h-4 w-4" />
          </LoadingButton>
        ) : (
          <LoadingButton
            onClick={handleSend}
            loading={false}
            disabled={!canSend || !input.trim() || disabled}
            size="icon"
            className="h-11 w-11 shrink-0"
            variant="default"
          >
            <Send className="h-4 w-4" />
          </LoadingButton>
        )}
      </div>
      
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send, 
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Shift + Enter</kbd> for new line
        </span>
        <span className={input.length > 1800 ? 'text-destructive' : ''}>
          {input.length}/2000
        </span>
      </div>
      
      {isLoading && (
        <div className="mt-2 text-xs text-muted-foreground">
          💬 Agent is thinking and working on your request...
        </div>
      )}
    </div>
  );
};
```

### 11.7 Design System Integration

**Console Design Tokens:**
```css
/* Leveraging existing console variables */
:root {
  --primary: 357 100% 63%;           /* Akash red/pink */
  --secondary: 210 40% 98%;          /* Light gray */
  --background: 15 33% 98%;          /* Light background */
  --card: 0 0% 100%;                 /* Card background */
  --border: 214.3 31.8% 91.4%;      /* Border color */
  --muted: 210 40% 96%;              /* Muted backgrounds */
  --muted-foreground: 215.4 16.3% 46.9%; /* Muted text */
}

/* Dark mode variants */
[data-theme="dark"] {
  --background: 20 14.3% 4.1%;       /* Dark background */
  --card: 20 14.3% 4.1%;             /* Dark cards */
  --border: 217.2 32.6% 17.5%;       /* Dark borders */
}
```

**Chat-Specific Styling:**
```css
/* Agent-specific classes */
.akash-agent-bubble {
  background: linear-gradient(135deg, 
    hsl(var(--primary) / 0.05), 
    hsl(var(--secondary) / 0.05)
  );
  border: 1px solid hsl(var(--border));
}

.akash-agent-input {
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  transition: border-color 0.2s ease;
}

.akash-agent-input:focus {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
}
```

### 11.8 Animation Strategy (Framer Motion)

**Message Animations:**
```typescript
// Using existing Framer Motion (already in codebase)
const messageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 }
};

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-2 p-3 text-muted-foreground"
  >
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
    <span className="text-sm">Agent is thinking...</span>
  </motion.div>
);
```

### 11.9 Mobile-First Responsive Design

**Responsive Chat Interface:**
```typescript
// Mobile: Full-screen drawer, Desktop: Modal
export const ResponsiveChatInterface = ({ isOpen, onClose }) => {
  const isMobile = useWindowSize().width < 768;
  
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="h-[90vh] p-0">
          <DrawerHeader className="text-left">
            <DrawerTitle>Akash AI Agent</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px]">
        <ChatInterface />
      </DialogContent>
    </Dialog>
  );
};
```

### 11.10 Integration with Deployment Flow

**SDL Generation to Editor Integration:**
```typescript
// In TemplateList.tsx
const handleAkashAgentClick = () => {
  analyticsService.track("akash_agent_btn_clk", "Amplitude");
  setIsAgentModalOpen(true);
};

// Agent completion handler
const handleAgentSDLGenerated = (sdl: string, template: TemplateCreation) => {
  // Integrate with existing SDL flow
  setEditedManifest(sdl);
  onTemplateSelected({
    title: "AI Generated Deployment",
    code: "ai-agent-generated",
    category: "AI Agent",
    description: "Generated by Akash AI Agent",
    content: sdl
  });
  setSdlEditMode("yaml");
  
  // Close modal and navigate to editor
  setIsAgentModalOpen(false);
  router.push(UrlService.newDeployment({ 
    step: RouteStep.editDeployment,
    source: "agent",
    templateId: "ai-generated"
  }));
};
```

### 11.11 Agent SDK Integration & Communication

**Based on Agent SDK Schema v2.0.0 - HTTP-First Architecture**

#### **SDK Communication Pattern:**
```typescript
// File: apps/deploy-web/src/hooks/useAkashAgent.ts
import { useToast } from "@akashnetwork/ui/components";

interface AgentAction {
  command: 'chat' | 'read_file' | 'modify_file' | 'create_file' | 'run_subprocess' | 'complete';
  parameters: Record<string, any>;
  result?: any;
  timestamp: number;
  sequence_index: number;
  status?: 'pending' | 'completed' | 'error';
}

interface AgentResponse {
  request_id: string;
  status: 'sent' | 'completed' | 'error';
  agent_id: string;
  operation: 'message';
}

export const useAkashAgent = () => {
  const { toast } = useToast();
  
  const sendStreamingMessage = async (
    message: string,
    onAction: (action: AgentAction, count: number) => void,
    timeout: number = 14400
  ): Promise<string> => {
    try {
      // Initialize agent client via API proxy
      const response = await fetch('/api/akash-agent/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          timeout,
          agent_config: {
            agent_id: process.env.NEXT_PUBLIC_AGENT_ID,
            base_url: process.env.NEXT_PUBLIC_AGENT_BASE_URL
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let actionCount = 0;
      let finalResponse = '';
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === 'action') {
              actionCount++;
              onAction(data.action, actionCount);
            } else if (data.type === 'final_response') {
              finalResponse = data.response;
            } else if (data.type === 'error') {
              throw new Error(data.message);
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming data:', parseError);
          }
        }
      }
      
      return finalResponse;
      
    } catch (error) {
      // Handle different error types based on SDK patterns
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the Akash Agent. Please check your connection.",
          variant: "destructive"
        });
      } else if (error.message.includes('timeout')) {
        toast({
          title: "Agent Timeout",
          description: "The agent took too long to respond. Please try again.",
          variant: "destructive"
        });
      } else if (error.message.includes('duplicate request')) {
        toast({
          title: "Duplicate Request",
          description: "Please wait a moment before sending the same message again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Agent Error",
          description: "The AI agent encountered an error. Please try again.",
          variant: "destructive"
        });
      }
      throw error;
    }
  };
  
  const testConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/akash-agent/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.status === 'connected';
    } catch {
      return false;
    }
  };
  
  return { sendStreamingMessage, testConnection };
};
```

#### **Action Handler Implementation:**
```typescript
// File: apps/deploy-web/src/components/akash-agent/ChatInterface.tsx
import { useAkashAgent } from '@/hooks/useAkashAgent';
import { useAtom } from 'jotai';

export const ChatInterface = ({ onSDLGenerated }: ChatInterfaceProps) => {
  const [messages, setMessages] = useAtom(chatMessagesAtom);
  const [isAgentTyping, setIsAgentTyping] = useAtom(isAgentTypingAtom);
  const { sendStreamingMessage } = useAkashAgent();

  const handleStreamingMessage = async (userMessage: string) => {
    // Add user message immediately
    const userMsg: ChatMessage = {
      id: nanoid(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
      status: 'sent'
    };
    setMessages(prev => [...prev, userMsg]);
    setIsAgentTyping(true);

    try {
      // Stream agent response with real-time actions
      const finalResponse = await sendStreamingMessage(
        userMessage,
        handleAgentAction,
        300 // 5 minute timeout
      );

      // Add final agent response
      if (finalResponse) {
        const agentMsg: ChatMessage = {
          id: nanoid(),
          type: 'agent',
          content: finalResponse,
          timestamp: new Date(),
          status: 'completed'
        };
        setMessages(prev => [...prev, agentMsg]);
      }

    } catch (error) {
      // Add error message
      const errorMsg: ChatMessage = {
        id: nanoid(),
        type: 'agent',
        content: "I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        status: 'error'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAgentTyping(false);
    }
  };

  const handleAgentAction = (action: AgentAction, count: number) => {
    console.log(`Action ${count}:`, action);

    // Handle different action types
    switch (action.command) {
      case 'chat':
        // Real-time chat updates
        const chatContent = action.parameters?.message || action.result;
        if (chatContent) {
          const actionMsg: ChatMessage = {
            id: `action-${action.sequence_index}`,
            type: 'agent',
            content: chatContent,
            timestamp: new Date(action.timestamp * 1000),
            status: action.status || 'completed'
          };
          setMessages(prev => [...prev, actionMsg]);
        }
        break;

      case 'create_file':
      case 'modify_file':
        // Show file operations
        const filePath = action.parameters?.file_path;
        if (filePath && filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
          // Potential SDL file - show preview
          const fileContent = action.result;
          if (fileContent) {
            const sdlMsg: ChatMessage = {
              id: `action-${action.sequence_index}`,
              type: 'agent',
              content: `I've ${action.command === 'create_file' ? 'created' : 'updated'} your SDL file:`,
              timestamp: new Date(action.timestamp * 1000),
              sdl: fileContent,
              status: action.status || 'completed'
            };
            setMessages(prev => [...prev, sdlMsg]);
            
            // If this looks like a complete SDL, offer to use it
            if (fileContent.includes('services:') && fileContent.includes('deployment:')) {
              onSDLGenerated?.(fileContent, {
                title: "AI Generated Deployment",
                code: "ai-agent-generated",
                category: "AI Agent",
                description: "Generated by Akash AI Agent",
                content: fileContent
              });
            }
          }
        }
        break;

      case 'read_file':
        // Show file reading activity
        const readFilePath = action.parameters?.file_path;
        if (readFilePath) {
          const readMsg: ChatMessage = {
            id: `action-${action.sequence_index}`,
            type: 'agent',
            content: `📁 Reading file: ${readFilePath}`,
            timestamp: new Date(action.timestamp * 1000),
            status: action.status || 'completed'
          };
          setMessages(prev => [...prev, readMsg]);
        }
        break;

      case 'run_subprocess':
        // Show command execution
        const command = action.parameters?.command;
        if (command) {
          const cmdMsg: ChatMessage = {
            id: `action-${action.sequence_index}`,
            type: 'agent',
            content: `⚡ Running: ${command}`,
            timestamp: new Date(action.timestamp * 1000),
            status: action.status || 'completed'
          };
          setMessages(prev => [...prev, cmdMsg]);
        }
        break;

      case 'complete':
        // Task completion
        setIsAgentTyping(false);
        break;

      default:
        // Generic action display
        const genericMsg: ChatMessage = {
          id: `action-${action.sequence_index}`,
          type: 'agent',
          content: `🔧 ${action.command}: ${action.result || 'Processing...'}`,
          timestamp: new Date(action.timestamp * 1000),
          status: action.status || 'completed'
        };
        setMessages(prev => [...prev, genericMsg]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Welcome screen when no messages */}
      {messages.length === 0 && <ChatWelcomeScreen />}
      
      {/* Message list */}
      <ChatMessageList messages={messages} />
      
      {/* Typing indicator */}
      {isAgentTyping && <TypingIndicator />}
      
      {/* Input area */}
      <ChatInput 
        onStreamingMessage={handleStreamingMessage}
        disabled={isAgentTyping}
      />
    </div>
  );
};
```

#### **API Route Implementation:**
```typescript
// File: apps/deploy-web/src/pages/api/akash-agent/stream.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, timeout = 14400, agent_config } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Set up streaming response
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  try {
    // Initialize Python agent client (via subprocess or HTTP proxy)
    const agentResponse = await fetch(process.env.AGENT_PROXY_URL + '/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        timeout,
        agent_id: agent_config?.agent_id || process.env.AGENT_ID,
        base_url: agent_config?.base_url || process.env.AGENT_BASE_URL
      })
    });

    if (!agentResponse.ok) {
      throw new Error(`Agent proxy error: ${agentResponse.statusText}`);
    }

    // Stream the response back to the client
    const reader = agentResponse.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response stream available');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      res.write(chunk);
    }

  } catch (error) {
    console.error('Agent streaming error:', error);
    res.write(JSON.stringify({
      type: 'error',
      message: error.message || 'Agent communication failed'
    }));
  } finally {
    res.end();
  }
}
```

### 11.12 Accessibility Implementation

**Full A11y Support:**
```typescript
// Screen reader and keyboard navigation
export const ChatInterface = () => (
  <div
    role="application"
    aria-label="Akash AI Agent Chat Interface"
    className="flex flex-col h-full"
  >
    {/* Messages region */}
    <div
      role="log"
      aria-live="polite"
      aria-label="Chat conversation"
      className="flex-1 overflow-hidden"
    >
      <ScrollArea className="h-full px-4">
        {messages.map(message => (
          <div
            key={message.id}
            role="article"
            aria-label={`${message.type} message at ${message.timestamp.toLocaleTimeString()}`}
          >
            <ChatMessageBubble message={message} />
          </div>
        ))}
      </ScrollArea>
    </div>
    
    {/* Input region */}
    <div
      role="form"
      aria-label="Send message to AI agent"
      className="border-t"
    >
      <ChatInput />
    </div>
  </div>
);

// Keyboard shortcuts
const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
  // Cmd/Ctrl + K to open agent
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    setIsAgentModalOpen(true);
  }
  
  // Escape to close
  if (e.key === 'Escape' && isAgentModalOpen) {
    setIsAgentModalOpen(false);
  }
}, [isAgentModalOpen]);
```

### 11.13 Testing Strategy

**Component Testing Approach:**
```typescript
// Following console's .cursor/rules patterns
describe("ChatMessageBubble", () => {
  it("renders user message with correct styling", () => {
    const { message } = setup({ 
      message: { type: 'user', content: 'Hello' } 
    });
    
    expect(screen.queryByText("Hello")).toBeInTheDocument();
    expect(screen.queryByRole("article")).toHaveClass("justify-end");
  });
  
  it("renders agent message with avatar", () => {
    const { message } = setup({ 
      message: { type: 'agent', content: 'Hi there!' } 
    });
    
    expect(screen.queryByText("Hi there!")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeInTheDocument(); // Avatar
  });

  function setup(input: { message: ChatMessage }) {
    render(<ChatMessageBubble message={input.message} />);
    return input;
  }
});
```

### 11.14 Performance Optimization

**Optimization Strategy:**
```typescript
// Lazy loading and code splitting
const AkashAgentModal = lazy(() => import('./AkashAgentModal'));

// Message virtualization for long conversations
const VirtualizedMessageList = ({ messages }: { messages: ChatMessage[] }) => {
  const MAX_VISIBLE_MESSAGES = 50;
  const visibleMessages = useMemo(() => 
    messages.slice(-MAX_VISIBLE_MESSAGES), 
    [messages]
  );
  
  return (
    <div className="space-y-4">
      {visibleMessages.map(message => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
};

// Debounced input handling
const useDebouncedInput = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

---

## Summary

This detailed UI component integration analysis provides a complete blueprint for implementing the Akash Agent chat interface using the console's established patterns and components. The approach ensures:

- **Native Integration** - Uses existing design system and component APIs
- **Consistent Experience** - Follows established UX patterns and state management
- **Performance Optimized** - Lazy loading, virtualization, and efficient rendering
- **Accessible** - Full keyboard navigation and screen reader support
- **Mobile-First** - Responsive design with appropriate mobile patterns
- **Maintainable** - Clear component architecture and testing strategies

The integration leverages the console's robust foundation while introducing this powerful new AI-powered deployment capability in a way that feels completely native to the platform.