import type { 
  ContentType, 
  EngagementLevel, 
  AdaptationTrigger, 
  EmotionState, 
  BehaviorMetrics,
  ContentItem,
  LearningSession
} from '../types';

export interface AdaptationRule {
  id: string;
  name: string;
  trigger: AdaptationTrigger;
  condition: (context: AdaptationContext) => boolean;
  action: (context: AdaptationContext) => ContentType;
  priority: number;
  description: string;
}

export interface AdaptationContext {
  currentContentType: ContentType;
  engagementLevel: EngagementLevel;
  emotionState?: EmotionState;
  behaviorMetrics?: BehaviorMetrics;
  sessionHistory: LearningSession | null;
  timeInCurrentContent: number;
  adaptationCount: number;
}

export class ContentAdaptationEngine {
  private rules: AdaptationRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Engagement-based adaptation rules
    this.rules.push({
      id: 'low-engagement-text-to-video',
      name: 'Text to Video on Low Engagement',
      trigger: 'engagement',
      condition: (context) => 
        context.engagementLevel === 'low' && 
        context.currentContentType === 'text' &&
        context.timeInCurrentContent > 120, // 2 minutes
      action: () => 'video',
      priority: 8,
      description: 'Switch from text to video when engagement is low'
    });

    this.rules.push({
      id: 'low-engagement-video-to-quiz',
      name: 'Video to Quiz on Low Engagement',
      trigger: 'engagement',
      condition: (context) => 
        context.engagementLevel === 'low' && 
        context.currentContentType === 'video' &&
        context.timeInCurrentContent > 180, // 3 minutes
      action: () => 'quiz',
      priority: 8,
      description: 'Switch from video to interactive quiz when engagement drops'
    });

    this.rules.push({
      id: 'low-engagement-quiz-to-infographic',
      name: 'Quiz to Infographic on Low Engagement',
      trigger: 'engagement',
      condition: (context) => 
        context.engagementLevel === 'low' && 
        context.currentContentType === 'quiz' &&
        context.timeInCurrentContent > 300, // 5 minutes
      action: () => 'infographic',
      priority: 8,
      description: 'Switch to visual infographic when quiz engagement is low'
    });

    this.rules.push({
      id: 'high-engagement-maintain',
      name: 'Maintain Content on High Engagement',
      trigger: 'engagement',
      condition: (context) => 
        context.engagementLevel === 'high' &&
        context.timeInCurrentContent < 600, // Less than 10 minutes
      action: (context) => context.currentContentType,
      priority: 9,
      description: 'Keep current content type when engagement is high'
    });

    // Emotion-based adaptation rules
    this.rules.push({
      id: 'confused-to-infographic',
      name: 'Confusion to Visual Content',
      trigger: 'emotion',
      condition: (context) => 
        context.emotionState?.primary === 'confused' &&
        context.emotionState.confidence > 0.7 &&
        context.currentContentType !== 'infographic',
      action: () => 'infographic',
      priority: 7,
      description: 'Switch to visual content when confusion is detected'
    });

    this.rules.push({
      id: 'bored-to-interactive',
      name: 'Boredom to Interactive Content',
      trigger: 'emotion',
      condition: (context) => 
        context.emotionState?.primary === 'bored' &&
        context.emotionState.confidence > 0.6 &&
        context.currentContentType !== 'quiz',
      action: () => 'quiz',
      priority: 7,
      description: 'Switch to interactive quiz when boredom is detected'
    });

    this.rules.push({
      id: 'frustrated-to-text',
      name: 'Frustration to Simple Text',
      trigger: 'emotion',
      condition: (context) => 
        context.emotionState?.primary === 'frustrated' &&
        context.emotionState.confidence > 0.6 &&
        context.currentContentType !== 'text',
      action: () => 'text',
      priority: 7,
      description: 'Switch to simple text when frustration is detected'
    });

    // Behavior-based adaptation rules
    this.rules.push({
      id: 'low-mouse-activity-to-video',
      name: 'Low Mouse Activity to Video',
      trigger: 'behavior',
      condition: (context) => 
        context.behaviorMetrics?.mouseActivity !== undefined &&
        context.behaviorMetrics.mouseActivity < 0.3 &&
        context.currentContentType === 'text' &&
        context.timeInCurrentContent > 90,
      action: () => 'video',
      priority: 6,
      description: 'Switch to video when mouse activity is low during text reading'
    });

    this.rules.push({
      id: 'high-scroll-speed-to-quiz',
      name: 'Fast Scrolling to Interactive',
      trigger: 'behavior',
      condition: (context) => 
        context.behaviorMetrics?.scrollSpeed !== undefined &&
        context.behaviorMetrics.scrollSpeed > 0.8 &&
        context.currentContentType !== 'quiz' &&
        context.timeInCurrentContent > 60,
      action: () => 'quiz',
      priority: 6,
      description: 'Switch to interactive content when scrolling too fast'
    });

    this.rules.push({
      id: 'low-focus-time-adaptation',
      name: 'Low Focus Time Adaptation',
      trigger: 'behavior',
      condition: (context) => 
        context.behaviorMetrics?.focusTime !== undefined &&
        context.behaviorMetrics.focusTime < 0.4 &&
        context.timeInCurrentContent > 120,
      action: (context) => {
        // Cycle through more engaging content types
        switch (context.currentContentType) {
          case 'text': return 'video';
          case 'video': return 'quiz';
          case 'quiz': return 'infographic';
          case 'infographic': return 'video';
          default: return 'video';
        }
      },
      priority: 6,
      description: 'Adapt content when focus time is consistently low'
    });

    // Time-based adaptation rules
    this.rules.push({
      id: 'long-time-same-content',
      name: 'Long Time Same Content',
      trigger: 'behavior',
      condition: (context) => 
        context.timeInCurrentContent > 900 && // 15 minutes
        context.adaptationCount < 3,
      action: (context) => {
        // Suggest a different content type
        const types: ContentType[] = ['text', 'video', 'quiz', 'infographic'];
        const available = types.filter(type => type !== context.currentContentType);
        return available[Math.floor(Math.random() * available.length)];
      },
      priority: 4,
      description: 'Change content type after extended time in same format'
    });

    // Adaptation frequency control
    this.rules.push({
      id: 'prevent-excessive-adaptation',
      name: 'Prevent Excessive Adaptation',
      trigger: 'manual',
      condition: (context) => 
        context.adaptationCount > 5 &&
        context.timeInCurrentContent < 60, // Less than 1 minute
      action: (context) => context.currentContentType,
      priority: 10,
      description: 'Prevent too frequent adaptations'
    });
  }

  /**
   * Evaluate adaptation rules and suggest content type change
   */
  public evaluateAdaptation(context: AdaptationContext): {
    shouldAdapt: boolean;
    newContentType: ContentType;
    reason: string;
    rule: AdaptationRule | null;
  } {
    // Sort rules by priority (higher priority first)
    const sortedRules = [...this.rules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      try {
        if (rule.condition(context)) {
          const newContentType = rule.action(context);
          
          // Only suggest adaptation if content type would actually change
          if (newContentType !== context.currentContentType) {
            return {
              shouldAdapt: true,
              newContentType,
              reason: rule.description,
              rule
            };
          }
        }
      } catch (error) {
        console.warn(`Error evaluating adaptation rule ${rule.id}:`, error);
      }
    }

    return {
      shouldAdapt: false,
      newContentType: context.currentContentType,
      reason: 'No adaptation rules triggered',
      rule: null
    };
  }

  /**
   * Add a custom adaptation rule
   */
  public addRule(rule: AdaptationRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove an adaptation rule by ID
   */
  public removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId);
    if (index !== -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get all adaptation rules
   */
  public getRules(): AdaptationRule[] {
    return [...this.rules];
  }

  /**
   * Get rules by trigger type
   */
  public getRulesByTrigger(trigger: AdaptationTrigger): AdaptationRule[] {
    return this.rules.filter(rule => rule.trigger === trigger);
  }

  /**
   * Create content continuity mapping to maintain learning context
   */
  public createContentContinuity(
    fromType: ContentType,
    toType: ContentType,
    currentContent: ContentItem
  ): Partial<ContentItem> {
    const continuityMap: Record<string, Partial<ContentItem>> = {};

    // Text to Video continuity
    if (fromType === 'text' && toType === 'video') {
      continuityMap.textToVideo = {
        title: `Video: ${currentContent.title}`,
        content: {
          url: '/placeholder-video.mp4',
          thumbnail: '/placeholder-thumbnail.jpg',
          duration: 300
        } as any,
        duration: 300
      };
    }

    // Video to Quiz continuity
    if (fromType === 'video' && toType === 'quiz') {
      continuityMap.videoToQuiz = {
        title: `Quiz: ${currentContent.title}`,
        content: {
          questions: [
            {
              id: '1',
              question: `Based on the content about "${currentContent.title}", which statement is most accurate?`,
              options: [
                'Option A - Key concept from content',
                'Option B - Alternative perspective',
                'Option C - Common misconception',
                'Option D - Related but incorrect'
              ],
              correctAnswer: 0
            }
          ],
          timeLimit: 10
        } as any,
        duration: 600
      };
    }

    // Quiz to Infographic continuity
    if (fromType === 'quiz' && toType === 'infographic') {
      continuityMap.quizToInfographic = {
        title: `Visual Guide: ${currentContent.title}`,
        content: {
          title: `Interactive visual representation of ${currentContent.title} concepts`,
          sections: [
            { title: 'Overview', description: 'Visual overview of key concepts' },
            { title: 'Details', description: 'Detailed breakdown of information' },
          ],
        },
        duration: 240
      };
    }

    // Any to Text continuity (simplified version)
    if (toType === 'text') {
      continuityMap.anyToText = {
        title: `Summary: ${currentContent.title}`,
        content: {
          text: `Simplified text version of ${currentContent.title}. This content has been adapted to provide a clearer, more focused learning experience.`,
          readingTime: 8,
        },
        duration: 180
      };
    }

    const key = `${fromType}To${toType.charAt(0).toUpperCase() + toType.slice(1)}`;
    return continuityMap[key] || continuityMap.anyToText || {
      title: currentContent.title,
      content: currentContent.content,
      duration: currentContent.duration
    };
  }

  /**
   * Generate adaptation analytics
   */
  public generateAdaptationAnalytics(session: LearningSession): {
    totalAdaptations: number;
    adaptationsByTrigger: Record<AdaptationTrigger, number>;
    adaptationsByContentType: Record<ContentType, number>;
    averageTimeBeforeAdaptation: number;
    mostEffectiveRule: string | null;
  } {
    const adaptations = session.adaptations;
    const analytics = {
      totalAdaptations: adaptations.length,
      adaptationsByTrigger: {} as Record<AdaptationTrigger, number>,
      adaptationsByContentType: {} as Record<ContentType, number>,
      averageTimeBeforeAdaptation: 0,
      mostEffectiveRule: null as string | null
    };

    if (adaptations.length === 0) {
      return analytics;
    }

    // Count by trigger
    adaptations.forEach(adaptation => {
      analytics.adaptationsByTrigger[adaptation.trigger] = 
        (analytics.adaptationsByTrigger[adaptation.trigger] || 0) + 1;
    });

    // Count by content type (to type)
    adaptations.forEach(adaptation => {
      analytics.adaptationsByContentType[adaptation.toType] = 
        (analytics.adaptationsByContentType[adaptation.toType] || 0) + 1;
    });

    // Calculate average time before adaptation
    if (adaptations.length > 1) {
      const timeDiffs = adaptations.slice(1).map((adaptation, index) => {
        const prevTime = adaptations[index].timestamp.getTime();
        const currentTime = adaptation.timestamp.getTime();
        return (currentTime - prevTime) / 1000; // Convert to seconds
      });
      
      analytics.averageTimeBeforeAdaptation = 
        timeDiffs.reduce((sum, time) => sum + time, 0) / timeDiffs.length;
    }

    return analytics;
  }
}

// Export singleton instance
export const adaptationEngine = new ContentAdaptationEngine();