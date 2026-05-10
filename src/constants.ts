import { 
  Pencil, 
  AlignLeft, 
  Code2, 
  Languages, 
  Lightbulb, 
  Image as ImageIcon 
} from 'lucide-react';
import { ToolType } from './services/gemini';

export interface ToolDef {
  id: ToolType;
  name: string;
  description: string;
  icon: any;
  color: string;
  systemPrompt: string;
  placeholder: string;
  templates?: { label: string; prompt: string }[];
}

export const TOOLS: ToolDef[] = [
  {
    id: 'writer',
    name: 'AI Copywriter',
    description: 'Draft professional emails, blog posts, or social media captions in seconds.',
    icon: Pencil,
    color: 'bg-blue-500',
    systemPrompt: 'You are an expert copywriter. Your goal is to write high-quality, engaging, and professional content based on user requirements.',
    placeholder: 'e.g., Write a professional email to a client about a project delay...',
    templates: [
      { label: 'Professional Email', prompt: 'Write a professional email regarding...' },
      { label: 'Blog Post', prompt: 'Write a 500-word blog post about...' },
      { label: 'Social Media Caption', prompt: 'Write a catchy Instagram caption for...' }
    ]
  },
  {
    id: 'summarizer',
    name: 'Quick Summarizer',
    description: 'Condense long articles or documents into clear, concise bullet points.',
    icon: AlignLeft,
    color: 'bg-emerald-500',
    systemPrompt: 'You are a master of brevity. Summarize the provided text into clear, actionable bullet points without losing key context.',
    placeholder: 'Paste the long text you want to summarize here...',
    templates: [
      { label: 'Bullet Points', prompt: 'Summarize this in 5 key bullet points: ' },
      { label: 'Executive Summary', prompt: 'Provide a high-level executive summary of: ' },
      { label: 'TL;DR', prompt: 'Write a one-sentence TL;DR for: ' }
    ]
  },
  {
    id: 'coder',
    name: 'Code Assistant',
    description: 'Get help with debugging, refactoring, or generating code snippets.',
    icon: Code2,
    color: 'bg-indigo-500',
    systemPrompt: 'You are a senior full-stack developer. Provide clean, efficient, and well-documented code solutions.',
    placeholder: 'e.g., How do I implement a debounced search in React?',
    templates: [
      { label: 'Debug Code', prompt: 'Find the bug in this code: ' },
      { label: 'Refactor', prompt: 'Refactor this for better performance: ' },
      { label: 'Unit Test', prompt: 'Write unit tests for this function: ' }
    ]
  },
  {
    id: 'translator',
    name: 'Smart Translator',
    description: 'Translate text between languages while maintaining tone and nuance.',
    icon: Languages,
    color: 'bg-orange-500',
    systemPrompt: 'You are a professional translator. Translate the text while preserving the original tone and context.',
    placeholder: 'Enter text to translate and specify the target language...',
    templates: [
      { label: 'Eng to Span', prompt: 'Translate this to Spanish: ' },
      { label: 'Eng to French', prompt: 'Translate this to French: ' },
      { label: 'Eng to German', prompt: 'Translate this to German: ' }
    ]
  },
  {
    id: 'ideator',
    name: 'Idea Spark',
    description: 'Generate creative ideas for projects, startups, or content.',
    icon: Lightbulb,
    color: 'bg-amber-500',
    systemPrompt: 'You are a creative strategist. Generate unconventional and innovative ideas based on the user\'s prompt.',
    placeholder: 'e.g., Give me 5 unique startup ideas for the green tech industry.',
    templates: [
      { label: 'Startup Ideas', prompt: '5 unique startup ideas for...' },
      { label: 'YouTube Topics', prompt: '10 viral video ideas about...' },
      { label: 'Gift Ideas', prompt: 'Creative birthday gift ideas for a...' }
    ]
  },
  {
    id: 'image',
    name: 'Image Creator',
    description: 'Transform your text descriptions into stunning visual artwork.',
    icon: ImageIcon,
    color: 'bg-purple-500',
    systemPrompt: '', // Handled differently
    placeholder: 'e.g., A futuristic city with flying cars and neon lights, digital art style.',
    templates: [
      { label: 'Hyper-Realistic', prompt: 'A hyper-realistic photography of...' },
      { label: 'Cyberpunk', prompt: 'Cyberpunk style city with neon lights...' },
      { label: 'Oil Painting', prompt: 'An impressionist oil painting of...' }
    ]
  }
];
